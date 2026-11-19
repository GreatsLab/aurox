<?php
/**
 * Aurox Admin for WHMCS - live dashboard data
 *
 * Read-only numbers for the Aurox dashboard: income with trends, what needs
 * attention, recent orders and tickets waiting for a reply. Runs only on the
 * dashboard, and is cached per admin session for a minute.
 *
 * @author  Chimnadindu Great Chibueze <https://github.com/GreatsLab>
 * @link    https://github.com/GreatsLab/aurox
 * @license MIT
 */

namespace AuroxAdmin;

use WHMCS\Database\Capsule;

if (!defined('WHMCS')) {
    die('This file cannot be accessed directly');
}

class Dashboard
{
    const TTL = 60;

    /** Is the current request the admin dashboard? */
    public static function isDashboard(array $vars)
    {
        if (isset($vars['filename'])) {
            return $vars['filename'] === 'index' && empty($_GET['rp']);
        }
        $script = isset($_SERVER['SCRIPT_NAME']) ? basename((string) $_SERVER['SCRIPT_NAME']) : '';
        return $script === 'index.php' && empty($_GET['rp']);
    }

    public static function data()
    {
        $key = 'auroxadmin_dashboard';
        if (isset($_SESSION[$key]['t'], $_SESSION[$key]['v']) && (time() - (int) $_SESSION[$key]['t']) < self::TTL) {
            return $_SESSION[$key]['v'];
        }
        $data = self::build();
        $_SESSION[$key] = array('t' => time(), 'v' => $data);
        return $data;
    }

    private static function safe(callable $fn, $fallback = null)
    {
        try {
            return $fn();
        } catch (\Throwable $e) {
            return $fallback;
        }
    }

    private static function build()
    {
        $now = time();
        $today = date('Y-m-d', $now);
        $monthStart = date('Y-m-01', $now);
        $dayOfMonth = (int) date('j', $now);
        $lastMonthStart = date('Y-m-01', strtotime('first day of last month', $now));
        $lastMonthDays = (int) date('t', strtotime($lastMonthStart));
        $lastMonthSameDay = date('Y-m-d', strtotime($lastMonthStart . ' +' . (min($dayOfMonth, $lastMonthDays) - 1) . ' days'));

        // Currency: amounts are shown in the default currency.
        $currency = self::safe(function () {
            return Capsule::table('tblcurrencies')->where('default', 1)->first(array('prefix', 'suffix', 'code'));
        });
        $currencyCount = (int) self::safe(function () {
            return Capsule::table('tblcurrencies')->count();
        }, 1);
        $prefix = $currency ? (string) $currency->prefix : '';
        $suffix = $currency ? (string) $currency->suffix : '';

        // Income per day for the last 30 days, converted to the default currency.
        $from = date('Y-m-d', strtotime('-29 days', $now));
        $byDay = array();
        $rows = self::safe(function () use ($from) {
            return Capsule::table('tbltransactions')
                ->selectRaw('DATE(`date`) AS d, SUM((amountin - fees - amountout) / IF(rate > 0, rate, 1)) AS v')
                ->where('date', '>=', $from . ' 00:00:00')
                ->groupBy('d')
                ->get();
        }, array());
        foreach ($rows as $row) {
            $byDay[(string) $row->d] = (float) $row->v;
        }
        $series = array();
        for ($i = 29; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i days", $now));
            $series[] = array('d' => $d, 'v' => round(isset($byDay[$d]) ? $byDay[$d] : 0, 2));
        }
        $incomeToday = end($series)['v'];
        $incomeYesterday = $series[28]['v'];

        $sumBetween = function ($start, $end) {
            return (float) self::safe(function () use ($start, $end) {
                return Capsule::table('tbltransactions')
                    ->where('date', '>=', $start . ' 00:00:00')
                    ->where('date', '<=', $end . ' 23:59:59')
                    ->selectRaw('SUM((amountin - fees - amountout) / IF(rate > 0, rate, 1)) AS v')
                    ->value('v');
            }, 0);
        };
        $incomeMonth = $sumBetween($monthStart, $today);
        $incomeLastMonthToDate = $sumBetween($lastMonthStart, $lastMonthSameDay);

        $count = function ($table, callable $where) {
            return (int) self::safe(function () use ($table, $where) {
                $q = Capsule::table($table);
                $where($q);
                return $q->count();
            }, 0);
        };

        $awaitingStatuses = self::safe(function () {
            $s = Capsule::table('tblticketstatuses')->where('showawaiting', 1)->pluck('title');
            return is_object($s) && method_exists($s, 'all') ? $s->all() : (array) $s;
        }, array());

        $stats = array(
            'ordersPending'   => $count('tblorders', function ($q) { $q->where('status', 'Pending'); }),
            'ordersToday'     => $count('tblorders', function ($q) use ($today) { $q->where('date', '>=', $today . ' 00:00:00'); }),
            'ticketsWaiting'  => $awaitingStatuses ? $count('tbltickets', function ($q) use ($awaitingStatuses) { $q->whereIn('status', $awaitingStatuses); }) : 0,
            'invoicesUnpaid'  => $count('tblinvoices', function ($q) { $q->where('status', 'Unpaid'); }),
            'invoicesOverdue' => $count('tblinvoices', function ($q) use ($today) { $q->where('status', 'Unpaid')->where('duedate', '<', $today); }),
            'clientsActive'   => $count('tblclients', function ($q) { $q->where('status', 'Active'); }),
            'clientsNew'      => $count('tblclients', function ($q) use ($monthStart) { $q->where('datecreated', '>=', $monthStart); }),
            'servicesActive'  => $count('tblhosting', function ($q) { $q->where('domainstatus', 'Active'); }),
            'domainsExpiring' => $count('tbldomains', function ($q) use ($today, $now) {
                $q->where('status', 'Active')->where('expirydate', '>=', $today)->where('expirydate', '<=', date('Y-m-d', strtotime('+30 days', $now)));
            }),
            'moduleQueue'     => $count('tblmodulequeue', function ($q) { $q->where('completed', 0); }),
            'cancellations'   => (int) self::safe(function () {
                return Capsule::table('tblcancelrequests')
                    ->join('tblhosting', 'tblhosting.id', '=', 'tblcancelrequests.relid')
                    ->whereNotIn('tblhosting.domainstatus', array('Cancelled', 'Terminated'))
                    ->count();
            }, 0),
        );

        // Overdue amount is only meaningful with a single currency.
        $overdueAmount = null;
        if ($currencyCount <= 1) {
            $overdueAmount = (float) self::safe(function () use ($today) {
                return Capsule::table('tblinvoices')
                    ->where('status', 'Unpaid')->where('duedate', '<', $today)
                    ->sum('total');
            }, 0);
        }

        $recentOrders = array();
        $orders = self::safe(function () {
            return Capsule::table('tblorders as o')
                ->leftJoin('tblclients as c', 'c.id', '=', 'o.userid')
                ->leftJoin('tblcurrencies as cu', 'cu.id', '=', 'c.currency')
                ->orderBy('o.id', 'desc')->limit(6)
                ->get(array('o.id', 'o.ordernum', 'o.date', 'o.status', 'o.amount', 'o.userid',
                    'c.firstname', 'c.lastname', 'c.companyname', 'cu.prefix', 'cu.suffix'));
        }, array());
        foreach ($orders as $o) {
            $recentOrders[] = array(
                'id'     => (int) $o->id,
                'num'    => (string) $o->ordernum,
                'client' => self::clientName($o->firstname, $o->lastname, $o->companyname),
                'initials' => self::initials(self::clientName($o->firstname, $o->lastname, $o->companyname)),
                'userid' => (int) $o->userid,
                'amount' => self::money((float) $o->amount, (string) $o->prefix, (string) $o->suffix),
                'status' => (string) $o->status,
                'tone'   => self::statusTone((string) $o->status),
                'ago'    => self::ago(strtotime((string) $o->date), $now),
            );
        }

        $waitingTickets = array();
        if ($awaitingStatuses) {
            $tickets = self::safe(function () use ($awaitingStatuses) {
                return Capsule::table('tbltickets as t')
                    ->leftJoin('tblclients as c', 'c.id', '=', 't.userid')
                    ->whereIn('t.status', $awaitingStatuses)
                    ->orderBy('t.lastreply', 'asc')->limit(6)
                    ->get(array('t.id', 't.tid', 't.title', 't.lastreply', 't.urgency', 't.status', 't.name',
                        'c.firstname', 'c.lastname', 'c.companyname'));
            }, array());
            foreach ($tickets as $t) {
                $who = self::clientName($t->firstname, $t->lastname, $t->companyname);
                $waitingTickets[] = array(
                    'id'      => (int) $t->id,
                    'tid'     => (string) $t->tid,
                    'title'   => mb_substr((string) $t->title, 0, 80),
                    'who'     => $who !== '' ? $who : (string) $t->name,
                    'urgency' => (string) $t->urgency,
                    'utone'   => strtolower((string) $t->urgency) === 'high' ? 'red' : (strtolower((string) $t->urgency) === 'medium' ? 'orange' : 'gray'),
                    'status'  => (string) $t->status,
                    'ago'     => self::ago(strtotime((string) $t->lastreply), $now),
                    'late'    => (strtotime((string) $t->lastreply) < $now - 4 * 3600),
                );
            }
        }

        $max = 0;
        foreach ($series as $p) {
            $max = max($max, $p['v']);
        }

        return array(
            'ok'       => true,
            'currency' => array('prefix' => $prefix, 'suffix' => $suffix, 'multi' => $currencyCount > 1),
            'income'   => array(
                'today'          => self::money($incomeToday, $prefix, $suffix),
                'todayTrend'     => self::trend($incomeToday, $incomeYesterday),
                'month'          => self::money($incomeMonth, $prefix, $suffix),
                'monthTrend'     => self::trend($incomeMonth, $incomeLastMonthToDate),
                'thirty'         => self::money(array_sum(array_column($series, 'v')), $prefix, $suffix),
                'spark'          => self::sparkPath(array_slice(array_column($series, 'v'), -14)),
                'seriesJson'     => json_encode($series, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT),
                'hasData'        => $max > 0,
            ),
            'stats'         => $stats,
            'overdueAmount' => $overdueAmount === null ? '' : self::money($overdueAmount, $prefix, $suffix),
            'attention'     => $stats['ordersPending'] + $stats['ticketsWaiting'] + $stats['invoicesOverdue'] + $stats['cancellations'] + $stats['moduleQueue'],
            'recentOrders'  => $recentOrders,
            'waitingTickets' => $waitingTickets,
            'generated'     => date('H:i', $now),
        );
    }

    private static function initials($name)
    {
        $parts = preg_split('/\s+/', trim((string) $name));
        $out = '';
        foreach (array_slice($parts, 0, 2) as $p) {
            $out .= mb_strtoupper(mb_substr($p, 0, 1));
        }
        return $out !== '' ? $out : '?';
    }

    private static function clientName($first, $last, $company)
    {
        $name = trim((string) $first . ' ' . (string) $last);
        if ($name === '' && $company) {
            $name = (string) $company;
        }
        return mb_substr($name, 0, 60);
    }

    public static function money($amount, $prefix, $suffix)
    {
        $abs = abs($amount);
        if ($abs >= 1000000) {
            $text = number_format($amount / 1000000, $abs >= 10000000 ? 1 : 2) . 'M';
        } else {
            $text = number_format($amount, $abs >= 1000 ? 0 : 2);
        }
        return trim($prefix . $text . ($suffix !== '' && $prefix === '' ? ' ' . $suffix : ''));
    }

    /** Percentage change, with a direction for colouring. */
    public static function trend($now, $before)
    {
        if ($before <= 0) {
            return array('pct' => $now > 0 ? 'new' : '', 'dir' => $now > 0 ? 'up' : 'flat');
        }
        $pct = ($now - $before) / $before * 100;
        return array(
            'pct' => ($pct > 0 ? '+' : '') . number_format($pct, abs($pct) < 10 ? 1 : 0) . '%',
            'dir' => abs($pct) < 0.5 ? 'flat' : ($pct > 0 ? 'up' : 'down'),
        );
    }

    /** SVG path for a small sparkline in a 100 x 32 box. */
    public static function sparkPath(array $values)
    {
        $n = count($values);
        if ($n < 2) {
            return '';
        }
        $max = max($values);
        $min = min(0, min($values));
        $range = ($max - $min) ?: 1;
        $pts = array();
        foreach ($values as $i => $v) {
            $x = round($i / ($n - 1) * 100, 2);
            $y = round(30 - (($v - $min) / $range) * 26, 2);
            $pts[] = $x . ',' . $y;
        }
        return 'M' . implode(' L', $pts);
    }

    public static function statusTone($status)
    {
        $s = strtolower($status);
        if (in_array($s, array('active', 'paid', 'completed'), true)) {
            return 'green';
        }
        if (in_array($s, array('pending', 'unpaid'), true)) {
            return 'orange';
        }
        if (in_array($s, array('fraud', 'cancelled', 'terminated', 'overdue'), true)) {
            return 'red';
        }
        return 'blue';
    }

    public static function ago($ts, $now)
    {
        if (!$ts) {
            return '';
        }
        $s = max(0, $now - $ts);
        if ($s < 60) {
            return 'just now';
        }
        if ($s < 3600) {
            return floor($s / 60) . 'm ago';
        }
        if ($s < 86400) {
            return floor($s / 3600) . 'h ago';
        }
        if ($s < 86400 * 30) {
            return floor($s / 86400) . 'd ago';
        }
        return date('j M', $ts);
    }
}
