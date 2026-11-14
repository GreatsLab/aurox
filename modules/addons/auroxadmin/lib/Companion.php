<?php
/**
 * Aurox Admin for WHMCS - companion addon
 * Hands settings and live counters to the Aurox template, and switches
 * admins between Aurox and Blend.
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

class Companion
{
    const TEMPLATE = 'aurox';

    /**
     * Variables for the Aurox template (AdminAreaPage hook).
     * The template falls back to settings.tpl when these are missing.
     */
    public static function templateVars()
    {
        $config = array(
            'version'    => Settings::VERSION,
            'brand'      => self::brand(),
            'logo'       => Settings::logoUrl(),
            'palette'    => Settings::enabled('enable_palette'),
            'shortcuts'  => Settings::enabled('enable_shortcuts'),
            'tools'      => Settings::enabled('enable_tools'),
            'tableTools' => Settings::enabled('enable_table_tools'),
            'guard'      => Settings::enabled('unsaved_guard'),
            'tour'       => Settings::enabled('enable_tour'),
            'extraLinks' => Settings::extraLinks(),
            'counters'   => (object) Settings::counters(),
            'admin'      => Settings::admin(),
        );

        return array(
            'auroxBrand'      => self::brand(),
            'auroxLogo'       => Settings::logoUrl(),
            'auroxAccent'     => Settings::accent(),
            'auroxMode'       => Settings::choice('default_mode', array('system', 'light', 'dark'), 'system'),
            'auroxDensity'    => Settings::choice('density', array('comfortable', 'compact'), 'comfortable'),
            'auroxCustomCss'  => Settings::customCss(),
            'auroxCounters'   => Settings::counters(),
            'auroxConfigJson' => json_encode(
                $config,
                JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES
            ),
        );
    }

    private static function brand()
    {
        $brand = trim((string) Settings::get('brand_name'));
        return mb_substr($brand !== '' ? $brand : 'WHMCS', 0, 40);
    }

    /**
     * Filesystem path of the admin folder (works with a renamed admin folder).
     */
    public static function adminDir()
    {
        $script = isset($_SERVER['SCRIPT_FILENAME']) ? (string) $_SERVER['SCRIPT_FILENAME'] : '';
        $dir = $script !== '' ? dirname($script) : '';
        if ($dir === '' || !is_dir($dir . '/templates')) {
            $root = defined('ROOTDIR') ? ROOTDIR : dirname(__DIR__, 4);
            $dir = $root . '/admin';
        }
        return rtrim(str_replace('\\', '/', $dir), '/');
    }

    /**
     * Is the Aurox template uploaded, complete, and is Blend still there?
     */
    public static function templateStatus()
    {
        $templates = self::adminDir() . '/templates';
        $aurox = $templates . '/' . self::TEMPLATE;
        $required = array('header.tpl', 'footer.tpl', 'nav.tpl', 'settings.tpl', 'aurox/icon.tpl',
            'aurox/css/aurox-admin.css', 'aurox/css/aurox-template.css', 'aurox/js/aurox-admin.js', 'aurox/js/aurox-tools.js');
        $missing = array();
        foreach ($required as $file) {
            if (!is_file($aurox . '/' . $file)) {
                $missing[] = $file;
            }
        }
        return array(
            'installed' => is_dir($aurox) && empty($missing),
            'missing'   => is_dir($aurox) ? $missing : $required,
            'blend'     => is_file($templates . '/blend/header.tpl') && is_file($templates . '/blend/js/scripts.min.js'),
            'path'      => $aurox,
        );
    }

    public static function canSwitch()
    {
        try {
            return Capsule::schema()->hasColumn('tbladmins', 'template');
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function currentAdminId()
    {
        return isset($_SESSION['adminid']) ? (int) $_SESSION['adminid'] : 0;
    }

    public static function isFullAdmin()
    {
        try {
            return (int) Capsule::table('tbladmins')->where('id', self::currentAdminId())->value('roleid') === 1;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function templateOf($adminId)
    {
        try {
            return (string) Capsule::table('tbladmins')->where('id', (int) $adminId)->value('template');
        } catch (\Throwable $e) {
            return '';
        }
    }

    public static function countUsing($template)
    {
        try {
            return (int) Capsule::table('tbladmins')->where('template', $template)->where('disabled', 0)->count();
        } catch (\Throwable $e) {
            try {
                return (int) Capsule::table('tbladmins')->where('template', $template)->count();
            } catch (\Throwable $e2) {
                return 0;
            }
        }
    }

    /**
     * Set the admin template for one admin (or everyone). Only switches to
     * Aurox when the template is fully uploaded, so nobody gets locked out.
     *
     * @return int number of admins changed
     */
    public static function switchTemplate($template, $everyone = false)
    {
        if (!in_array($template, array(self::TEMPLATE, 'blend'), true) || !self::canSwitch()) {
            return 0;
        }
        $status = self::templateStatus();
        if ($template === self::TEMPLATE && (!$status['installed'] || !$status['blend'])) {
            return 0;
        }
        $query = Capsule::table('tbladmins');
        if (!$everyone) {
            $query->where('id', self::currentAdminId());
        }
        return (int) $query->update(array('template' => $template));
    }

    /* ----- form safety: a per-session token for the addon page buttons ----- */

    public static function nonce()
    {
        if (empty($_SESSION['auroxadmin_nonce'])) {
            $_SESSION['auroxadmin_nonce'] = bin2hex(random_bytes(16));
        }
        return $_SESSION['auroxadmin_nonce'];
    }

    public static function checkNonce($value)
    {
        return is_string($value) && !empty($_SESSION['auroxadmin_nonce'])
            && hash_equals($_SESSION['auroxadmin_nonce'], $value);
    }
}
