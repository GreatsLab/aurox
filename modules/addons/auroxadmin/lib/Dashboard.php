<?php
/**
 * Aurox Admin for WHMCS - live dashboard data
 *
 * Read-only numbers for the Aurox dashboard:
 *  - a priority queue: pending orders (paid ones first) and tickets waiting
 *  - income today / this month with trends and a 30-day chart
 *  - overdue invoices per currency, clients, what needs attention
 *  - latest payments and recent orders
 *
 * Runs only on the dashboard and is cached per admin session for a minute.
 * Every query fails safe: if one can't run, that number shows as zero and
 * the rest of the dashboard still works.
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
    const LIST_SIZE = 6;

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
        $key = 'auroxadmin_dashboard_v31';
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

    /** Capsule returns a Collection on WHMCS 8/9; make it a plain array. */
    private static function rows($result)
    {
        if (is_object($result) && method_exists($result, 'all')) {
            return $result->all();
        }
        return is_array($result) ? $result : array();
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
        $from = date('Y-m-d', strtotime('-29 days', $now));

        // ------------------------------------------------------------------
        // Currencies: totals are shown in the default currency.
        // ------------------------------------------------------------------
        $currencies = array();
        foreach (self::rows(self::safe(function () {
            return Capsule::table('tblcurrencies')->get(array('id', 'code', 'prefix', 'suffix', 'rate', 'default'));
        }, array())) as $c) {
            $currencies[(int) $c->id] = array(
                'code' => (string) $c->code, 'prefix' => (string) $c->prefix, 'suffix' => (string) $c->suffix,
                'rate' => (float) $c->rate > 0 ? (float) $c->rate : 1.0, 'default' => (int) $c->default === 1,
            );
        }
        $default = array('code' => '', 'prefix' => '', 'suffix' => '', 'rate' => 1.0, 'default' => true);
        foreach ($currencies as $c) {
            if ($c['default']) {
                $default = $c;
                break;
            }
        }
        if (!$default['code'] && $currencies) {
            $default = reset($currencies);
        }
        $prefix = $default['prefix'];
        $suffix = $default['suffix'];
        $cur = function ($id) use ($currencies, $default) {
            $id = (int) $id;
            return isset($currencies[$id]) ? $currencies[$id] : $default;
        };

        // ------------------------------------------------------------------
        // Income. WHMCS counts payments (transactions), like its own reports.
        // If no payments were recorded in the last 30 days but invoices were
        // marked paid, the paid invoices are shown instead (and labelled).
        // ------------------------------------------------------------------
        $payDay = self::dailyPayments($from);
        $invDay = array_sum($payDay) > 0 ? array() : self::dailyPaidInvoices($from, $cur);
        $source = (array_sum($payDay) <= 0 && array_sum($invDay) > 0) ? 'invoices' : 'payments';
        $byDay = $source === 'invoices' ? $invDay : $payDay;

        $series = array();
        for ($i = 29; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i days", $now));
            $series[] = array('d' => $d, 'v' => round(isset($byDay[$d]) ? $byDay[$d] : 0, 2));
        }
        $values = array_column($series, 'v');
        $incomeToday = $values[29];
        $incomeYesterday = $values[28];
        $thirty = array_sum($values);

        if ($source === 'invoices') {
            $incomeMonth = self::sumPaidInvoices($monthStart, $today, $cur);
            $incomeLastMonthToDate = self::sumPaidInvoices($lastMonthStart, $lastMonthSameDay, $cur);
        } else {
            $incomeMonth = self::sumPayments($monthStart, $today);
            $incomeLastMonthToDate = self::sumPayments($lastMonthStart, $lastMonthSameDay);
        }

        $todayTrend = $incomeYesterday > 0 ? self::trend($incomeToday, $incomeYesterday) : array('pct' => '', 'dir' => 'flat');
        $monthTrend = $incomeLastMonthToDate > 0 ? self::trend($incomeMonth, $incomeLastMonthToDate) : array('pct' => '', 'dir' => 'flat');
        if ($incomeYesterday > 0) {
            $todayNote = 'vs yesterday';
        } else {
            $todayNote = $incomeToday > 0 ? 'Nothing came in yesterday' : 'No payments yet today';
        }
        if ($incomeLastMonthToDate > 0) {
            $monthNote = 'vs same point last month';
        } else {
            $monthNote = $incomeMonth > 0 ? 'Nothing by this point last month' : 'No payments yet this month';
        }

        // ------------------------------------------------------------------
        // Counts
        // ------------------------------------------------------------------
        $count = function ($table, callable $where) {
            return (int) self::safe(function () use ($table, $where) {
                $q = Capsule::table($table);
                $where($q);
                return $q->count();
            }, 0);
        };

        $awaitingStatuses = self::rows(self::safe(function () {
            return Capsule::table('tblticketstatuses')->where('showawaiting', 1)->pluck('title');
        }, array()));
        if (!$awaitingStatuses) {
            $awaitingStatuses = array('Open', 'Customer-Reply');
        }

        $in30 = date('Y-m-d', strtotime('+30 days', $now));
        $stats = array(
            'ordersPending'   => $count('tblorders', function ($q) { $q->where('status', 'Pending'); }),
            'ordersToday'     => $count('tblorders', function ($q) use ($today) { $q->where('date', '>=', $today . ' 00:00:00'); }),
            'ticketsWaiting'  => $count('tbltickets', function ($q) use ($awaitingStatuses) { $q->whereIn('status', $awaitingStatuses)->where('merged_ticket_id', 0); }),
            'invoicesUnpaid'  => $count('tblinvoices', function ($q) { $q->where('status', 'Unpaid'); }),
            'invoicesOverdue' => $count('tblinvoices', function ($q) use ($today) { $q->where('status', 'Unpaid')->where('duedate', '<', $today); }),
            'clientsActive'   => $count('tblclients', function ($q) { $q->where('status', 'Active'); }),
            'clientsNew'      => $count('tblclients', function ($q) use ($monthStart) { $q->where('datecreated', '>=', $monthStart); }),
            'servicesActive'  => $count('tblhosting', function ($q) { $q->where('domainstatus', 'Active'); }),
            'domainsExpiring' => $count('tbldomains', function ($q) use ($today, $in30) {
                $q->where('status', 'Active')->where('expirydate', '>=', $today)->where('expirydate', '<=', $in30);
            }),
            'domainsPending'  => $count('tbldomains', function ($q) { $q->whereIn('status', array('Pending', 'Pending Registration', 'Pending Transfer')); }),
            'moduleQueue'     => $count('tblmodulequeue', function ($q) { $q->where('completed', 0); }),
            'cancellations'   => (int) self::safe(function () {
                return Capsule::table('tblcancelrequests')
                    ->join('tblhosting', 'tblhosting.id', '=', 'tblcancelrequests.relid')
                    ->whereNotIn('tblhosting.domainstatus', array('Cancelled', 'Terminated'))
                    ->count();
            }, 0),
        );
        // Older WHMCS versions have no merged_ticket_id column: count without it.
        if ($stats['ticketsWaiting'] === 0) {
            $stats['ticketsWaiting'] = $count('tbltickets', function ($q) use ($awaitingStatuses) { $q->whereIn('status', $awaitingStatuses); });
        }

        // Overdue: amount still owed, per currency (exact, nothing converted).
        $overdueParts = array();
        foreach (self::rows(self::safe(function () use ($today) {
            return Capsule::table('tblinvoices as i')
                ->join('tblclients as c', 'c.id', '=', 'i.userid')
                ->where('i.status', 'Unpaid')->where('i.duedate', '<', $today)
                ->groupBy('c.currency')
                ->selectRaw('c.currency AS cur, SUM(i.total - COALESCE((SELECT SUM(t.amountin - t.amountout) FROM tbltransactions t WHERE t.invoiceid = i.id), 0)) AS owed')
                ->get();
        }, array())) as $row) {
            $c = $cur($row->cur);
            if ((float) $row->owed > 0) {
                $overdueParts[] = array('v' => (float) $row->owed / $c['rate'], 't' => self::money((float) $row->owed, $c['prefix'], $c['suffix'], $c['code']));
            }
        }
        usort($overdueParts, function ($a, $b) { return $b['v'] <=> $a['v']; });
        $overdueText = implode(' + ', array_column($overdueParts, 't'));

        // ------------------------------------------------------------------
        // Priority: pending orders (paid first) and tickets waiting
        // ------------------------------------------------------------------
        $gatewayNames = array();
        foreach (self::rows(self::safe(function () {
            return Capsule::table('tblpaymentgateways')->where('setting', 'name')->get(array('gateway', 'value'));
        }, array())) as $g) {
            $gatewayNames[(string) $g->gateway] = (string) $g->value;
        }

        $pending = self::rows(self::safe(function () {
            return Capsule::table('tblorders as o')
                ->leftJoin('tblclients as c', 'c.id', '=', 'o.userid')
                ->leftJoin('tblinvoices as i', 'i.id', '=', 'o.invoiceid')
                ->where('o.status', 'Pending')
                ->orderBy('o.id', 'desc')->limit(30)
                ->get(array('o.id', 'o.ordernum', 'o.date', 'o.amount', 'o.userid', 'o.paymentmethod', 'o.invoiceid',
                    'i.status as invoicestatus', 'c.firstname', 'c.lastname', 'c.companyname', 'c.currency'));
        }, array()));
        $items = self::orderItems(array_map(function ($o) { return (int) $o->id; }, $pending));
        $pendingOrders = array();
        $paidPending = 0;
        foreach ($pending as $o) {
            $name = self::clientName($o->firstname, $o->lastname, $o->companyname);
            $c = $cur($o->currency);
            $inv = (string) $o->invoicestatus;
            $paid = ($inv === 'Paid');
            if ($paid) {
                $paidPending++;
            }
            if ((int) $o->invoiceid === 0 || (float) $o->amount <= 0) {
                $pay = array('t' => 'No payment due', 'tone' => 'gray');
            } elseif ($paid) {
                $pay = array('t' => 'Paid', 'tone' => 'green');
            } elseif ($inv === 'Cancelled') {
                $pay = array('t' => 'Invoice cancelled', 'tone' => 'gray');
            } else {
                $pay = array('t' => 'Unpaid', 'tone' => 'orange');
            }
            $gw = (string) $o->paymentmethod;
            $pendingOrders[] = array(
                'id'       => (int) $o->id,
                'num'      => (string) $o->ordernum,
                'client'   => $name !== '' ? $name : 'Client #' . (int) $o->userid,
                'initials' => self::initials($name),
                'userid'   => (int) $o->userid,
                'amount'   => self::money((float) $o->amount, $c['prefix'], $c['suffix'], $c['code']),
                'items'    => isset($items[(int) $o->id]) ? $items[(int) $o->id] : '',
                'gateway'  => isset($gatewayNames[$gw]) ? $gatewayNames[$gw] : ucfirst($gw),
                'pay'      => $pay['t'],
                'paytone'  => $pay['tone'],
                'paid'     => $paid,
                'ago'      => self::ago(strtotime((string) $o->date), $now),
                'ts'       => strtotime((string) $o->date),
            );
        }
        // Paid orders are waiting on you, so they go first; newest first after that.
        usort($pendingOrders, function ($a, $b) {
            if ($a['paid'] !== $b['paid']) {
                return $a['paid'] ? -1 : 1;
            }
            return $b['ts'] <=> $a['ts'];
        });
        $pendingOrders = array_slice($pendingOrders, 0, self::LIST_SIZE);

        $departments = array();
        foreach (self::rows(self::safe(function () {
            return Capsule::table('tblticketdepartments')->get(array('id', 'name'));
        }, array())) as $d) {
            $departments[(int) $d->id] = (string) $d->name;
        }
        $tickets = self::rows(self::safe(function () use ($awaitingStatuses) {
            return Capsule::table('tbltickets as t')
                ->leftJoin('tblclients as c', 'c.id', '=', 't.userid')
                ->whereIn('t.status', $awaitingStatuses)
                ->orderBy('t.lastreply', 'asc')->limit(self::LIST_SIZE)
                ->get(array('t.id', 't.tid', 't.did', 't.title', 't.lastreply', 't.urgency', 't.status', 't.name',
                    'c.firstname', 'c.lastname', 'c.companyname'));
        }, array()));
        $waitingTickets = array();
        foreach ($tickets as $t) {
            $who = self::clientName($t->firstname, $t->lastname, $t->companyname);
            $ts = strtotime((string) $t->lastreply);
            $waited = $ts ? $now - $ts : 0;
            $u = strtolower((string) $t->urgency);
            $waitingTickets[] = array(
                'id'      => (int) $t->id,
                'tid'     => (string) $t->tid,
                'title'   => mb_substr((string) $t->title, 0, 90),
                'who'     => $who !== '' ? $who : (string) $t->name,
                'dept'    => isset($departments[(int) $t->did]) ? $departments[(int) $t->did] : '',
                'urgency' => (string) $t->urgency,
                'utone'   => $u === 'high' ? 'red' : ($u === 'medium' ? 'orange' : 'gray'),
                'status'  => (string) $t->status,
                'ago'     => self::ago($ts, $now),
                'wait'    => $waited >= 86400 ? 'red' : ($waited >= 4 * 3600 ? 'orange' : 'green'),
                'late'    => $waited >= 4 * 3600,
            );
        }

        // ------------------------------------------------------------------
        // Latest payments (or recently paid invoices) and recent orders
        // ------------------------------------------------------------------
        $payments = array();
        if ($source === 'payments') {
            $paymentsTitle = 'Latest payments';
            foreach (self::rows(self::safe(function () {
                return Capsule::table('tbltransactions as t')
                    ->leftJoin('tblclients as c', 'c.id', '=', 't.userid')
                    ->where('t.amountin', '>', 0)
                    ->orderBy('t.date', 'desc')->orderBy('t.id', 'desc')->limit(self::LIST_SIZE)
                    ->get(array('t.id', 't.userid', 't.currency', 't.gateway', 't.date', 't.amountin', 't.invoiceid',
                        'c.firstname', 'c.lastname', 'c.companyname', 'c.currency as clientcurrency'));
            }, array())) as $p) {
                $name = self::clientName($p->firstname, $p->lastname, $p->companyname);
                $c = $cur((int) $p->currency > 0 ? $p->currency : $p->clientcurrency);
                $gw = (string) $p->gateway;
                $payments[] = array(
                    'client'   => $name !== '' ? $name : 'Payment',
                    'initials' => self::initials($name),
                    'userid'   => (int) $p->userid,
                    'amount'   => self::money((float) $p->amountin, $c['prefix'], $c['suffix'], $c['code']),
                    'meta'     => trim((isset($gatewayNames[$gw]) ? $gatewayNames[$gw] : ucfirst($gw)) . ((int) $p->invoiceid ? ' · Invoice #' . (int) $p->invoiceid : ''), ' ·'),
                    'url'      => (int) $p->invoiceid ? 'invoices.php?action=edit&id=' . (int) $p->invoiceid : 'transactions.php',
                    'ago'      => self::ago(strtotime((string) $p->date), $now),
                );
            }
        } else {
            $paymentsTitle = 'Recently paid invoices';
            foreach (self::rows(self::safe(function () {
                return Capsule::table('tblinvoices as i')
                    ->leftJoin('tblclients as c', 'c.id', '=', 'i.userid')
                    ->where('i.status', 'Paid')
                    ->orderBy('i.datepaid', 'desc')->limit(self::LIST_SIZE)
                    ->get(array('i.id', 'i.userid', 'i.total', 'i.datepaid', 'i.paymentmethod',
                        'c.firstname', 'c.lastname', 'c.companyname', 'c.currency'));
            }, array())) as $p) {
                $name = self::clientName($p->firstname, $p->lastname, $p->companyname);
                $c = $cur($p->currency);
                $gw = (string) $p->paymentmethod;
                $payments[] = array(
                    'client'   => $name !== '' ? $name : 'Invoice #' . (int) $p->id,
                    'initials' => self::initials($name),
                    'userid'   => (int) $p->userid,
                    'amount'   => self::money((float) $p->total, $c['prefix'], $c['suffix'], $c['code']),
                    'meta'     => 'Invoice #' . (int) $p->id . ($gw !== '' ? ' · ' . (isset($gatewayNames[$gw]) ? $gatewayNames[$gw] : ucfirst($gw)) : ''),
                    'url'      => 'invoices.php?action=edit&id=' . (int) $p->id,
                    'ago'      => self::ago(strtotime((string) $p->datepaid), $now),
                );
            }
        }

        $recentOrders = array();
        foreach (self::rows(self::safe(function () {
            return Capsule::table('tblorders as o')
                ->leftJoin('tblclients as c', 'c.id', '=', 'o.userid')
                ->orderBy('o.id', 'desc')->limit(self::LIST_SIZE)
                ->get(array('o.id', 'o.ordernum', 'o.date', 'o.status', 'o.amount', 'o.userid',
                    'c.firstname', 'c.lastname', 'c.companyname', 'c.currency'));
        }, array())) as $o) {
            $name = self::clientName($o->firstname, $o->lastname, $o->companyname);
            $c = $cur($o->currency);
            $recentOrders[] = array(
                'id'       => (int) $o->id,
                'num'      => (string) $o->ordernum,
                'client'   => $name,
                'initials' => self::initials($name),
                'userid'   => (int) $o->userid,
                'amount'   => self::money((float) $o->amount, $c['prefix'], $c['suffix'], $c['code']),
                'status'   => (string) $o->status,
                'tone'     => self::statusTone((string) $o->status),
                'ago'      => self::ago(strtotime((string) $o->date), $now),
            );
        }

        $multi = count($currencies) > 1;
        return array(
            'ok'       => true,
            'currency' => array('prefix' => $prefix, 'suffix' => $suffix, 'code' => $default['code'], 'multi' => $multi),
            'income'   => array(
                'source'     => $source,
                'sourceNote' => $source === 'invoices' ? 'From invoices marked paid. No payments were recorded in the last 30 days.' : '',
                'today'      => self::money($incomeToday, $prefix, $suffix, $default['code']),
                'todayTrend' => $todayTrend,
                'todayNote'  => $todayNote,
                'month'      => self::money($incomeMonth, $prefix, $suffix, $default['code']),
                'monthTrend' => $monthTrend,
                'monthNote'  => $monthNote,
                'thirty'     => self::money($thirty, $prefix, $suffix, $default['code']),
                'spark'      => max(array_slice($values, -14)) > 0 ? self::sparkPath(array_slice($values, -14)) : '',
                'seriesJson' => json_encode($series, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT),
                'hasData'    => $thirty > 0,
                'converted'  => $multi ? 'All currencies shown in ' . ($default['code'] ?: 'your default currency') . '.' : '',
            ),
            'stats'          => $stats,
            'ordersPaidPending' => $paidPending,
            'overdueAmount'  => $overdueText,
            'attention'      => $stats['ordersPending'] + $stats['ticketsWaiting'] + $stats['invoicesOverdue'] + $stats['cancellations'] + $stats['moduleQueue'],
            'attentionOther' => $stats['invoicesOverdue'] + $stats['cancellations'] + $stats['moduleQueue'] + $stats['domainsPending'],
            'pendingOrders'  => $pendingOrders,
            'waitingTickets' => $waitingTickets,
            'payments'       => $payments,
            'paymentsTitle'  => $paymentsTitle,
            'recentOrders'   => $recentOrders,
            'generated'      => date('H:i', $now),
        );
    }

    /** Net payments per day, converted to the default currency. */
    private static function dailyPayments($from)
    {
        $out = array();
        foreach (self::rows(self::safe(function () use ($from) {
            return Capsule::table('tbltransactions')
                ->selectRaw('DATE(`date`) AS d, SUM((amountin - fees - amountout) / IF(rate > 0, rate, 1)) AS v')
                ->where('date', '>=', $from . ' 00:00:00')
                ->groupBy(Capsule::raw('DATE(`date`)'))
                ->get();
        }, array())) as $row) {
            $out[(string) $row->d] = (float) $row->v;
        }
        return $out;
    }

    private static function sumPayments($start, $end)
    {
        return (float) self::safe(function () use ($start, $end) {
            return Capsule::table('tbltransactions')
                ->where('date', '>=', $start . ' 00:00:00')
                ->where('date', '<=', $end . ' 23:59:59')
                ->selectRaw('SUM((amountin - fees - amountout) / IF(rate > 0, rate, 1)) AS v')
                ->value('v');
        }, 0);
    }

    /** Totals of invoices marked paid per day, converted with each client's currency rate. */
    private static function dailyPaidInvoices($from, callable $cur)
    {
        $out = array();
        foreach (self::rows(self::safe(function () use ($from) {
            return Capsule::table('tblinvoices as i')
                ->join('tblclients as c', 'c.id', '=', 'i.userid')
                ->where('i.status', 'Paid')
                ->where('i.datepaid', '>=', $from . ' 00:00:00')
                ->selectRaw('DATE(i.datepaid) AS d, c.currency AS cur, SUM(i.total) AS v')
                ->groupBy(Capsule::raw('DATE(i.datepaid)'), 'c.currency')
                ->get();
        }, array())) as $row) {
            $c = $cur($row->cur);
            $d = (string) $row->d;
            $out[$d] = (isset($out[$d]) ? $out[$d] : 0) + (float) $row->v / $c['rate'];
        }
        return $out;
    }

    private static function sumPaidInvoices($start, $end, callable $cur)
    {
        $sum = 0.0;
        foreach (self::rows(self::safe(function () use ($start, $end) {
            return Capsule::table('tblinvoices as i')
                ->join('tblclients as c', 'c.id', '=', 'i.userid')
                ->where('i.status', 'Paid')
                ->where('i.datepaid', '>=', $start . ' 00:00:00')
                ->where('i.datepaid', '<=', $end . ' 23:59:59')
                ->selectRaw('c.currency AS cur, SUM(i.total) AS v')
                ->groupBy('c.currency')
                ->get();
        }, array())) as $row) {
            $c = $cur($row->cur);
            $sum += (float) $row->v / $c['rate'];
        }
        return $sum;
    }

    /** "Business Hosting · example.com +1 more" for each order id. */
    private static function orderItems(array $orderIds)
    {
        $orderIds = array_values(array_filter(array_unique($orderIds)));
        if (!$orderIds) {
            return array();
        }
        $lines = array();
        foreach (self::rows(self::safe(function () use ($orderIds) {
            return Capsule::table('tblhosting as h')
                ->leftJoin('tblproducts as p', 'p.id', '=', 'h.packageid')
                ->whereIn('h.orderid', $orderIds)
                ->get(array('h.orderid', 'h.domain', 'p.name'));
        }, array())) as $s) {
            $label = trim((string) $s->name);
            if ((string) $s->domain !== '') {
                $label .= ($label !== '' ? ' · ' : '') . (string) $s->domain;
            }
            $lines[(int) $s->orderid][] = $label !== '' ? $label : 'Service';
        }
        foreach (self::rows(self::safe(function () use ($orderIds) {
            return Capsule::table('tbldomains')
                ->whereIn('orderid', $orderIds)
                ->get(array('orderid', 'domain', 'type'));
        }, array())) as $d) {
            $type = strtolower((string) $d->type) === 'transfer' ? 'Domain transfer' : 'Domain registration';
            $lines[(int) $d->orderid][] = $type . ' · ' . (string) $d->domain;
        }
        $out = array();
        foreach ($lines as $id => $list) {
            $text = mb_substr($list[0], 0, 70);
            if (count($list) > 1) {
                $text .= ' +' . (count($list) - 1) . ' more';
            }
            $out[$id] = $text;
        }
        return $out;
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

    /** Compact money: ₦1.42M, ₦245,000, $15.88. Falls back to the currency code. */
    public static function money($amount, $prefix, $suffix, $code = '')
    {
        $abs = abs($amount);
        if ($abs >= 1000000) {
            $text = number_format($amount / 1000000, $abs >= 10000000 ? 1 : 2) . 'M';
        } else {
            $text = number_format($amount, $abs >= 1000 ? 0 : 2);
        }
        if ($prefix !== '') {
            return $prefix . $text;
        }
        $tail = trim($suffix) !== '' ? trim($suffix) : (string) $code;
        return trim($text . ' ' . $tail);
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
        foreach (array_values($values) as $i => $v) {
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
