<?php
/**
 * Aurox Admin for WHMCS - companion addon hooks
 *
 * Gives the Aurox admin template your settings and the live counters
 * (pending orders, overdue invoices, tickets awaiting reply...). The
 * template works without this addon; it just won't show the counters.
 *
 * @author  Chimnadindu Great Chibueze <https://github.com/GreatsLab>
 * @link    https://github.com/GreatsLab/aurox
 * @license MIT
 */

if (!defined('WHMCS')) {
    die('This file cannot be accessed directly');
}

require_once __DIR__ . '/lib/Settings.php';
require_once __DIR__ . '/lib/Companion.php';

add_hook('AdminAreaPage', 1, function ($vars) {
    try {
        return \AuroxAdmin\Companion::templateVars();
    } catch (\Throwable $e) {
        return array();
    }
});
