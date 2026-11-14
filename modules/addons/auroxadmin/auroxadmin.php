<?php
/**
 * Aurox Admin for WHMCS - optional companion addon
 *
 * The Aurox admin template (admin/templates/aurox) works on its own. This
 * addon adds a settings screen, live counters in the menu, and one-click
 * switching of admins between Aurox and Blend.
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

use AuroxAdmin\Companion;
use AuroxAdmin\Settings;

function auroxadmin_config()
{
    return array(
        'name'        => 'Aurox Admin',
        'description' => 'Companion for the Aurox admin template: settings, live menu counters and one-click switching between Aurox and Blend. By Chimnadindu Great Chibueze (github.com/GreatsLab).',
        'author'      => 'Chimnadindu Great Chibueze',
        'language'    => 'english',
        'version'     => Settings::VERSION,
        'fields'      => array(
            'brand_name' => array(
                'FriendlyName' => 'Brand name',
                'Type'         => 'text',
                'Size'         => '30',
                'Default'      => 'WHMCS',
                'Description'  => 'Shown at the top of the menu.',
            ),
            'logo_url' => array(
                'FriendlyName' => 'Logo URL',
                'Type'         => 'text',
                'Size'         => '60',
                'Default'      => '',
                'Description'  => 'Square logo (SVG or PNG, 64px+). Leave blank for the built-in mark.',
            ),
            'accent_color' => array(
                'FriendlyName' => 'Accent colour',
                'Type'         => 'text',
                'Size'         => '10',
                'Default'      => '#2f6bff',
                'Description'  => 'Hex colour for buttons, links and highlights, e.g. #2f6bff.',
            ),
            'default_mode' => array(
                'FriendlyName' => 'Default theme',
                'Type'         => 'dropdown',
                'Options'      => array('system' => 'Follow device setting', 'light' => 'Light', 'dark' => 'Dark'),
                'Default'      => 'system',
                'Description'  => 'Each admin can still switch for themselves.',
            ),
            'density' => array(
                'FriendlyName' => 'Default spacing',
                'Type'         => 'dropdown',
                'Options'      => array('comfortable' => 'Comfortable', 'compact' => 'Compact (more rows on screen)'),
                'Default'      => 'comfortable',
            ),
            'show_badges' => array(
                'FriendlyName' => 'Live counters',
                'Type'         => 'yesno',
                'Default'      => 'yes',
                'Description'  => 'Pending orders, overdue/unpaid invoices, tickets awaiting reply and cancellation requests in the menu.',
            ),
            'enable_palette' => array(
                'FriendlyName' => 'Jump to page (Ctrl/Cmd + K)',
                'Type'         => 'yesno',
                'Default'      => 'yes',
            ),
            'enable_shortcuts' => array(
                'FriendlyName' => 'Keyboard shortcuts',
                'Type'         => 'yesno',
                'Default'      => 'yes',
                'Description'  => 'Press ? in the admin area to see them.',
            ),
            'enable_tools' => array(
                'FriendlyName' => 'Help & tools',
                'Type'         => 'yesno',
                'Default'      => 'yes',
                'Description'  => 'Page guide, Toolbox, Snippets and Page notes.',
            ),
            'enable_table_tools' => array(
                'FriendlyName' => 'Table tools',
                'Type'         => 'yesno',
                'Default'      => 'yes',
                'Description'  => 'Filter, copy and CSV download above long tables.',
            ),
            'unsaved_guard' => array(
                'FriendlyName' => 'Unsaved changes warning',
                'Type'         => 'yesno',
                'Default'      => 'yes',
            ),
            'enable_tour' => array(
                'FriendlyName' => 'Welcome tour',
                'Type'         => 'yesno',
                'Default'      => 'yes',
            ),
            'extra_links' => array(
                'FriendlyName' => 'Extra menu links',
                'Type'         => 'textarea',
                'Rows'         => '4',
                'Cols'         => '60',
                'Default'      => '',
                'Description'  => 'One per line as: Label | URL',
            ),
            'custom_css' => array(
                'FriendlyName' => 'Custom CSS',
                'Type'         => 'textarea',
                'Rows'         => '6',
                'Cols'         => '60',
                'Default'      => '',
                'Description'  => 'Loaded after the theme. Start rules with html.aurox to win over the defaults.',
            ),
        ),
    );
}

function auroxadmin_activate()
{
    return array(
        'status'      => 'success',
        'description' => 'Aurox Admin companion is active. Open Addons > Aurox Admin to switch admins to the Aurox template.',
    );
}

function auroxadmin_deactivate()
{
    return array('status' => 'success', 'description' => 'Aurox Admin companion deactivated. The Aurox template keeps working, without live counters.');
}

function auroxadmin_output($vars)
{
    $e = function ($s) {
        return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
    };
    $link = isset($vars['modulelink']) ? $vars['modulelink'] : 'addonmodules.php?module=auroxadmin';

    // Handle the switch buttons.
    $notice = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['aurox_action'])) {
        if (!Companion::checkNonce(isset($_POST['aurox_nonce']) ? $_POST['aurox_nonce'] : '')) {
            $notice = '<div class="alert alert-danger">That form expired. Please try again.</div>';
        } else {
            $action = (string) $_POST['aurox_action'];
            $everyone = $action === 'aurox-all' || $action === 'blend-all';
            if ($everyone && !Companion::isFullAdmin()) {
                $notice = '<div class="alert alert-danger">Only Full Administrators can switch everyone.</div>';
            } else {
                $template = strpos($action, 'aurox') === 0 ? 'aurox' : 'blend';
                $n = Companion::switchTemplate($template, $everyone);
                $notice = $n
                    ? '<div class="alert alert-success">Done. ' . $e($n) . ($n === 1 ? ' admin now uses ' : ' admins now use ') . ($template === 'aurox' ? 'Aurox' : 'Blend') . '. <a href="' . $e($link) . '">Reload the page</a> to see it.</div>'
                    : '<div class="alert alert-warning">Nothing changed. Check the status card below.</div>';
            }
        }
    }

    $status = Companion::templateStatus();
    $mine = Companion::templateOf(Companion::currentAdminId());
    $canSwitch = Companion::canSwitch();
    $nonce = Companion::nonce();

    $shortcuts = array(
        array('Ctrl / ⌘ + K', 'Jump to any page'), array('?', 'All keyboard shortcuts'),
        array('G then D / C / O / I / T', 'Dashboard / Clients / Orders / Invoices / Tickets'),
        array('N then C / O / T', 'New client / order / ticket'),
        array('I / B / S / M', 'Page guide / Toolbox / Snippets / Page notes'),
        array('[', 'Shrink or expand the menu'), array('Ctrl / ⌘ + Shift + L', 'Light / dark'),
    );

    echo '<div class="ax-module">';
    echo '<div class="ax-module-hero"><div><h2>Aurox Admin <span class="ax-pill">v' . $e(Settings::VERSION) . '</span></h2>';
    echo '<p>A modern, easy-to-navigate WHMCS admin. This page lets you switch admins to Aurox and change your own preferences.</p></div>';
    echo '<a class="btn btn-default" href="configaddonmods.php#auroxadmin">Settings</a></div>';
    echo $notice;

    echo '<div class="ax-module-grid">';

    // Status and switching
    echo '<div class="ax-card"><h3>Template status</h3><ul class="ax-list">';
    echo '<li>Aurox template: ' . ($status['installed'] ? '<b style="color:#12a150">uploaded and complete</b>' : '<b style="color:#e0364b">not found or incomplete</b>') . '</li>';
    if (!$status['installed']) {
        echo '<li>Upload the <code>aurox</code> folder to <code>' . $e($status['path']) . '</code>.';
        if (!empty($status['missing'])) {
            echo ' Missing: <code>' . $e(implode(', ', array_slice($status['missing'], 0, 5))) . '</code>';
        }
        echo '</li>';
    }
    if (!$status['core']) {
        echo '<li><b style="color:#e0364b">WHMCS core files missing.</b> Copy the <code>blend</code> folder to <code>aurox</code> first, then upload the Aurox files over it. See the install guide.</li>';
    }
    echo '<li>You are using: <b>' . $e($mine !== '' ? $mine : 'unknown') . '</b></li>';
    echo '<li>Admins on Aurox: <b>' . $e(Companion::countUsing('aurox')) . '</b></li>';
    echo '</ul>';
    if ($canSwitch) {
        $ready = $status['installed'];
        $form = function ($action, $label, $class, $disabled) use ($e, $nonce, $link) {
            return '<form method="post" action="' . $e($link) . '" style="display:inline-block;margin:0 6px 6px 0">'
                . '<input type="hidden" name="aurox_nonce" value="' . $e($nonce) . '">'
                . '<input type="hidden" name="aurox_action" value="' . $e($action) . '">'
                . '<button type="submit" class="btn ' . $class . '"' . ($disabled ? ' disabled' : '') . '>' . $e($label) . '</button></form>';
        };
        echo '<div class="ax-btn-row">';
        echo $form('aurox-me', 'Use Aurox for me', 'btn-primary', !$ready);
        echo $form('blend-me', 'Switch me back to Blend', 'btn-default', false);
        echo '</div>';
        if (Companion::isFullAdmin()) {
            echo '<div class="ax-btn-row">';
            echo $form('aurox-all', 'Use Aurox for everyone', 'btn-default', !$ready);
            echo $form('blend-all', 'Everyone back to Blend', 'btn-default', false);
            echo '</div>';
        }
    } else {
        echo '<p class="ax-muted">Switch templates under Configuration › Administrators › Edit › Template.</p>';
    }
    echo '</div>';

    // Personal preferences
    echo '<div class="ax-card"><h3>Your preferences</h3><p class="ax-muted">Saved in this browser, just for you.</p>';
    echo '<div class="ax-btn-row"><button type="button" class="btn btn-default" data-ax-action="mode-light">Light</button>';
    echo '<button type="button" class="btn btn-default" data-ax-action="mode-dark">Dark</button>';
    echo '<button type="button" class="btn btn-default" data-ax-action="mode-system">Follow device</button></div>';
    echo '<div class="ax-btn-row"><button type="button" class="btn btn-default" data-ax-action="density-comfortable">Comfortable</button>';
    echo '<button type="button" class="btn btn-default" data-ax-action="density-compact">Compact</button></div>';
    echo '<div class="ax-btn-row"><button type="button" class="btn btn-primary" data-ax-action="tour">Take the tour</button>';
    echo '<button type="button" class="btn btn-default" data-ax-action="reset">Reset pins, recents &amp; preferences</button></div>';
    echo '</div>';

    // Shortcuts
    echo '<div class="ax-card"><h3>Keyboard shortcuts</h3><table class="ax-keys">';
    foreach ($shortcuts as $row) {
        echo '<tr><td><kbd>' . $e($row[0]) . '</kbd></td><td>' . $e($row[1]) . '</td></tr>';
    }
    echo '</table></div>';

    echo '</div>';
    echo '<p class="ax-credit">Aurox Admin v' . $e(Settings::VERSION) . ' · Designed and built by '
        . '<a href="https://github.com/GreatsLab" target="_blank" rel="noopener">Chimnadindu Great Chibueze</a>'
        . ' · <a href="https://github.com/GreatsLab/aurox" target="_blank" rel="noopener">Updates on GitHub</a></p>';
    echo '</div>';
}
