<?php
/**
 * Aurox Admin Theme for WHMCS
 * Settings and data helpers.
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

class Settings
{
    const MODULE = 'auroxadmin';
    const VERSION = '3.1.1';
    const DEFAULT_ACCENT = '#6d4aff';
    const COUNTER_TTL = 60; // seconds the sidebar counters are cached per admin session

    /** @var array|null */
    private static $cache = null;

    /**
     * Default values, used when a setting has never been saved.
     */
    public static function defaults()
    {
        return array(
            'brand_name'       => 'WHMCS',
            'logo_url'         => '',
            'accent_color'     => self::DEFAULT_ACCENT,
            'default_mode'     => 'system',
            'density'          => 'comfortable',
            'show_badges'      => 'on',
            'enable_palette'   => 'on',
            'enable_shortcuts' => 'on',
            'enable_tools'     => 'on',
            'enable_table_tools' => 'on',
            'unsaved_guard'    => 'on',
            'enable_tour'      => 'on',
            'dashboard_stats'  => 'on',
            'extra_links'      => '',
            'custom_css'       => '',
        );
    }

    /**
     * All settings, merged over the defaults.
     */
    public static function all()
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $values = self::defaults();

        try {
            $rows = Capsule::table('tbladdonmodules')
                ->where('module', self::MODULE)
                ->pluck('value', 'setting');

            foreach ($rows as $key => $value) {
                if (array_key_exists($key, $values)) {
                    $values[$key] = (string) $value;
                }
            }
        } catch (\Throwable $e) {
            // Database not reachable: fall back to defaults silently.
        }

        return self::$cache = $values;
    }

    public static function get($key)
    {
        $all = self::all();
        return isset($all[$key]) ? $all[$key] : null;
    }

    public static function enabled($key)
    {
        $value = strtolower((string) self::get($key));
        return in_array($value, array('on', '1', 'yes', 'true'), true);
    }

    /**
     * Accent colour as a validated #rrggbb string.
     */
    public static function accent()
    {
        $color = trim((string) self::get('accent_color'));
        if (preg_match('/^#?([0-9a-fA-F]{3})$/', $color, $m)) {
            $c = $m[1];
            $color = '#' . $c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2];
        }
        if (strpos($color, '#') !== 0) {
            $color = '#' . $color;
        }
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            $color = self::DEFAULT_ACCENT;
        }
        return strtolower($color);
    }

    /**
     * Accent colour as "r, g, b" for use inside rgba().
     */
    public static function accentRgb()
    {
        $hex = substr(self::accent(), 1);
        return hexdec(substr($hex, 0, 2)) . ', ' . hexdec(substr($hex, 2, 2)) . ', ' . hexdec(substr($hex, 4, 2));
    }

    public static function choice($key, array $allowed, $fallback)
    {
        $value = strtolower(trim((string) self::get($key)));
        return in_array($value, $allowed, true) ? $value : $fallback;
    }

    /**
     * Logo URL, only if it is a safe http(s) or relative URL.
     */
    public static function logoUrl()
    {
        $url = trim((string) self::get('logo_url'));
        return self::safeUrl($url) ? $url : '';
    }

    /**
     * Parse "Label | URL" lines into sidebar links.
     */
    public static function extraLinks()
    {
        $links = array();
        $lines = preg_split('/\r\n|\r|\n/', (string) self::get('extra_links'));

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '|') === false) {
                continue;
            }
            list($label, $url) = array_map('trim', explode('|', $line, 2));
            if ($label === '' || !self::safeUrl($url)) {
                continue;
            }
            $links[] = array(
                'label'    => mb_substr($label, 0, 60),
                'url'      => $url,
                'external' => (bool) preg_match('#^https?://#i', $url),
            );
            if (count($links) >= 20) {
                break;
            }
        }

        return $links;
    }

    /**
     * Allow http(s) URLs and relative paths only (no javascript:, data:, etc).
     */
    public static function safeUrl($url)
    {
        if ($url === '' || preg_match('/[\s<>"\']/', $url)) {
            return false;
        }
        if (preg_match('#^https?://#i', $url)) {
            return (bool) filter_var($url, FILTER_VALIDATE_URL);
        }
        // Relative: must not contain a scheme.
        return !preg_match('#^[a-z][a-z0-9+.\-]*:#i', $url) && strpos($url, '//') !== 0;
    }

    /**
     * Custom CSS with anything that could close the style tag removed.
     */
    public static function customCss()
    {
        $css = (string) self::get('custom_css');
        // "<" is never needed in CSS and is the only way out of a <style> tag.
        $css = str_replace(array('<', '-->'), '', $css);
        return trim($css);
    }

    /**
     * The logged-in admin, for the sidebar footer.
     */
    public static function admin()
    {
        $adminId = isset($_SESSION['adminid']) ? (int) $_SESSION['adminid'] : 0;
        if ($adminId <= 0) {
            return null;
        }

        try {
            $row = Capsule::table('tbladmins')
                ->where('id', $adminId)
                ->first(array('firstname', 'lastname', 'username'));
        } catch (\Throwable $e) {
            return null;
        }

        if (!$row) {
            return null;
        }

        $name = trim($row->firstname . ' ' . $row->lastname);
        return array(
            'id'   => $adminId,
            'name' => $name !== '' ? $name : $row->username,
        );
    }

    /**
     * Counts shown as badges in the sidebar. Cached briefly per session.
     */
    public static function counters()
    {
        if (!self::enabled('show_badges')) {
            return array();
        }

        $key = 'auroxadmin_counters';
        if (isset($_SESSION[$key]['t'], $_SESSION[$key]['v'])
            && (time() - (int) $_SESSION[$key]['t']) < self::COUNTER_TTL) {
            return $_SESSION[$key]['v'];
        }

        $out = array();
        $today = date('Y-m-d');

        try {
            $out['orders'] = (int) Capsule::table('tblorders')->where('status', 'Pending')->count();
        } catch (\Throwable $e) {
        }

        try {
            $out['unpaid'] = (int) Capsule::table('tblinvoices')->where('status', 'Unpaid')->count();
            $out['overdue'] = (int) Capsule::table('tblinvoices')
                ->where('status', 'Unpaid')
                ->where('duedate', '<', $today)
                ->count();
        } catch (\Throwable $e) {
        }

        try {
            $awaiting = Capsule::table('tblticketstatuses')->where('showawaiting', 1)->pluck('title');
            $awaiting = is_object($awaiting) && method_exists($awaiting, 'all') ? $awaiting->all() : (array) $awaiting;
            if (!empty($awaiting)) {
                $out['tickets'] = (int) Capsule::table('tbltickets')->whereIn('status', $awaiting)->count();
            }
        } catch (\Throwable $e) {
        }

        try {
            $out['cancellations'] = (int) Capsule::table('tblcancelrequests')
                ->join('tblhosting', 'tblhosting.id', '=', 'tblcancelrequests.relid')
                ->whereNotIn('tblhosting.domainstatus', array('Cancelled', 'Terminated'))
                ->count();
        } catch (\Throwable $e) {
        }

        $_SESSION[$key] = array('t' => time(), 'v' => $out);
        return $out;
    }
}
