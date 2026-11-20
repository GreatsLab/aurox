{*
 * Aurox Admin for WHMCS - page header
 * Layout: menu on the left, top bar (search, create, status, help, account),
 * the WHMCS page panel and the page content.
 *
 * Aurox is a standalone admin template. Everything it needs lives in this
 * folder: Aurox's own files are in aurox/, and WHMCS's core admin scripts,
 * styles and page files sit in css/, js/, fonts/ and the other .tpl files.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 *}
<!DOCTYPE html>
<html lang="en" class="aurox ax-tpl ax-docked" data-ax-mode="light" data-ax-density="comfortable">
<head>
    {include file="$template/settings.tpl"}
    <meta charset="{$charset}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="same-origin">
    <meta name="generator" content="Aurox Admin 3.1.0 by Chimnadindu Great Chibueze - https://github.com/GreatsLab/aurox">
    <!-- Aurox Admin for WHMCS · designed and built by Chimnadindu Great Chibueze · https://github.com/GreatsLab/aurox -->
    <title>{$pagetitle} · {if !empty($auroxBrand)}{$auroxBrand|escape}{else}WHMCS{/if}</title>

    <script>
        {* Apply saved theme, density and menu state before anything paints. *}
        (function (d, w) {ldelim}
            var r = d.documentElement, s = null;
            try {ldelim} s = w.localStorage; {rdelim} catch (e) {ldelim}{rdelim}
            function get(k) {ldelim} try {ldelim} return s ? s.getItem('aurox:' + k) : null; {rdelim} catch (e) {ldelim} return null; {rdelim} {rdelim}
            var mode = get('mode') || "{if !empty($auroxMode)}{$auroxMode}{else}system{/if}";
            if (mode === 'system') {ldelim} mode = (w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; {rdelim}
            r.setAttribute('data-ax-mode', mode);
            r.setAttribute('data-ax-density', get('density') || "{if !empty($auroxDensity)}{$auroxDensity}{else}comfortable{/if}");
            if (get('collapsed') === '1') {ldelim} r.classList.add('ax-collapsed'); {rdelim}
            var hex = "{$auroxAccent|escape:'javascript'}".replace('#', '');
            if (/^[0-9a-f]{ldelim}3{rdelim}$/i.test(hex)) {ldelim} hex = hex.replace(/(.)/g, '$1$1'); {rdelim}
            if (/^[0-9a-f]{ldelim}6{rdelim}$/i.test(hex)) {ldelim}
                r.style.setProperty('--ax-accent', '#' + hex);
                r.style.setProperty('--ax-accent-rgb', parseInt(hex.substr(0, 2), 16) + ', ' + parseInt(hex.substr(2, 2), 16) + ', ' + parseInt(hex.substr(4, 2), 16));
            {rdelim}
        {rdelim})(document, window);
    </script>

    {\WHMCS\View\Asset::fontCssInclude('open-sans-family.css')}
    <link href="templates/{$template}/css/all.min.css?v={$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/css/theme.min.css?v={$versionHash}" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome.min.css" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome-solid.min.css" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome-regular.min.css" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome-light.min.css" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome-brands.min.css" rel="stylesheet" />
    <link href="{$WEB_ROOT}/assets/fonts/css/fontawesome-duotone.min.css" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-dark.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-admin.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-template.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-dashboard.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-mobile.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    <link href="templates/{$template}/aurox/css/aurox-pages.css?v=3.1.0-{$versionHash}" rel="stylesheet" />
    {if !empty($auroxCustomCss)}<style id="aurox-custom">{$auroxCustomCss}</style>{/if}

    <script type="text/javascript" src="templates/{$template}/js/vendor.min.js?v={$versionHash}"></script>
    <script type="text/javascript" src="templates/{$template}/js/scripts.min.js?v={$versionHash}"></script>
    <script>
        var datepickerformat = "{$datepickerformat}",
            csrfToken="{$csrfToken}",
            adminBaseRoutePath = "{\WHMCS\Admin\AdminServiceProvider::getAdminRouteBase()}",
            whmcsBaseUrl = "{\WHMCS\Utility\Environment\WebHelper::getBaseUrl()}";

        {if $jquerycode}
            $(document).ready(function(){ldelim}
                {$jquerycode}
            {rdelim});
        {/if}
        {if $jscode}
            {$jscode}
        {/if}

        window.AuroxAdminConfig = {if !empty($auroxConfigJson)}{$auroxConfigJson}{else}{ldelim}"version":"3.1.0","brand":"WHMCS","palette":true,"shortcuts":true,"tools":true,"tableTools":true,"guard":true,"tour":true,"counters":{ldelim}{rdelim}{rdelim}{/if};
        window.AuroxAdminConfig.template = true;
        window.AuroxAdminConfig.adminPath = "{$ADMIN_WEB_ROOT}/";
        window.AuroxAdminConfig.routes = {ldelim}
            services: "{routePath('admin-services-index')}",
            domains: "{routePath('admin-domains-index')}",
            setup: "{routePath('admin-setup-index')}"
        {rdelim};
        if (!window.AuroxAdminConfig.admin) {ldelim} window.AuroxAdminConfig.admin = {ldelim} name: "{$adminFullName|escape:'javascript'}" {rdelim}; {rdelim}
    </script>

    {$headoutput}

</head>
<body class="ax-app{if !empty($filename)} ax-page-{$filename|escape}{/if}{if $pagetitle == $_ADMINLANG.global.hometitle} ax-dashboard{/if}{if empty($sidebar)} no-sidebar{/if}{if !empty($globalAdminWarningMsg)} has-warning-banner{/if}" data-phone-cc-input="{if !empty($phoneNumberInputStyle)}{$phoneNumberInputStyle}{/if}">

    {$headeroutput}

    {include file="$template/nav.tpl"}

    <div class="ax-main">

        <div class="alert alert-warning global-admin-warning">
            <i class="far fa-exclamation-triangle fa-fw"></i>
            {$globalAdminWarningMsg}
        </div>

        <header class="ax-topbar">
            <button type="button" class="ax-tb-btn ax-tb-menu" data-ax-action="drawer" aria-label="Open menu">{include file="$template/aurox/icon.tpl" i="menu"}</button>

            {* Phones: logo and the page you are on *}
            <a class="ax-tb-logo" href="index.php" aria-label="Dashboard">
                {if !empty($auroxLogo)}<img src="{$auroxLogo|escape}" alt="">{else}<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="axgTb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--ax-accent) 78%, #fff)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--ax-accent) 82%, #000)"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#axgTb)"/><path d="M20 46 32 16l12 30M24.5 35h15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 40c6 9 30 12 44-6" fill="none" stroke="#bcd3ff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/><circle cx="54" cy="34" r="3.5" fill="#fff"/></svg>{/if}
            </a>
            <div class="ax-tb-title" id="axTbTitle">{$pagetitle}</div>

            {* WHMCS record search (clients, invoices, tickets, domains...). IDs are used by WHMCS scripts. *}
            <div class="intellisearch" id="intelliSearchForm">
                <form method="post" action="{routePath('admin-search-intellisearch')}">
                    <input type="hidden" id="intelliSearchHideInactive" name="hide_inactive" value="1">
                    <i class="fas fa-search loader"></i>
                    <span class="ax-search-ico" aria-hidden="true">{include file="$template/aurox/icon.tpl" i="search"}</span>
                    <div class="input-group">
                        <input type="text" name="searchterm" class="form-control" id="inputIntelliSearchValue" placeholder="Search clients, invoices, tickets, domains…" autocomplete="off">
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button" id="btnIntelliSearchClose" aria-label="{$_ADMINLANG.global.close}">
                                <i class="far fa-times closer"></i>
                            </button>
                        </span>
                    </div>
                    <input type="hidden" id="intelliSearchExpand" name="more" value="">
                </form>
                <button type="button" class="ax-search-cancel" data-ax-action="search-close">Cancel</button>
            </div>

            <div class="ax-tb-spacer"></div>

            <button type="button" class="ax-tb-btn ax-tb-search" data-ax-action="search" aria-label="Search clients, invoices, tickets and domains">{include file="$template/aurox/icon.tpl" i="search"}</button>
            <button type="button" class="ax-tb-btn ax-tb-theme" data-ax-action="mode" aria-label="Switch light or dark" title="Light / dark  (Ctrl + Shift + L)">{include file="$template/aurox/icon.tpl" i="moon"}</button>

            {if in_array("Add New Client", $admin_perms) || in_array("Add New Order", $admin_perms) || in_array("Create Invoice", $admin_perms) || in_array("Manage Quotes", $admin_perms) || in_array("Open New Ticket", $admin_perms)}
                <div class="dropdown ax-dd ax-dd-new">
                    <button type="button" class="ax-tb-new" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {include file="$template/aurox/icon.tpl" i="plus"}<span>{$_ADMINLANG.addNew.title}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right" id="ax-new-menu">
                        {if in_array("Add New Client", $admin_perms)}
                            <li><a href="clientsadd.php">{include file="$template/aurox/icon.tpl" i="users"} {$_ADMINLANG.addNew.client}</a></li>
                        {/if}
                        {if in_array("Add New Order", $admin_perms)}
                            <li><a href="ordersadd.php">{include file="$template/aurox/icon.tpl" i="cart"} {$_ADMINLANG.addNew.order}</a></li>
                        {/if}
                        {if in_array("Create Invoice", $admin_perms)}
                            <li><a href="{routePath('admin-billing-invoice-new')}" class="open-modal" data-modal-title="{lang key='addNew.invoice'}" {if !empty($anyGatewaysActivated)}data-btn-submit-id="btnCreateInvoice" data-btn-submit-label="{lang key='invoices.create'}"{/if}>{include file="$template/aurox/icon.tpl" i="receipt"} {lang key='addNew.invoice'}</a></li>
                        {/if}
                        {if in_array("Manage Quotes", $admin_perms)}
                            <li><a href="quotes.php?action=manage">{include file="$template/aurox/icon.tpl" i="note"} {$_ADMINLANG.addNew.quote}</a></li>
                        {/if}
                        {if in_array("Open New Ticket", $admin_perms)}
                            <li><a href="supporttickets.php?action=open">{include file="$template/aurox/icon.tpl" i="support"} {$_ADMINLANG.addNew.ticket}</a></li>
                        {/if}
                    </ul>
                </div>
            {/if}

            {if in_array("Automation Status", $admin_perms)}
                <a href="automationstatus.php" class="ax-tb-btn{if !$isNewInstallation && $isCronError} is-hot{elseif !$isNewInstallation && $isCronWarning} is-warn{/if}" title="{$_ADMINLANG.utilities.automationStatus}{if !$isNewInstallation && ($isCronError || $isCronWarning)} – needs attention{/if}" aria-label="{$_ADMINLANG.utilities.automationStatus}">
                    {include file="$template/aurox/icon.tpl" i="cog"}
                    {if !$isNewInstallation && ($isCronError || $isCronWarning)}<span class="ax-dot"></span>{/if}
                </a>
            {/if}

            {if $showUpdateAvailable}
                <a href="update.php" class="ax-tb-btn is-accent" title="{$_ADMINLANG.license.updateavailable}" aria-label="{$_ADMINLANG.license.updateavailable}">
                    {include file="$template/aurox/icon.tpl" i="download"}<span class="ax-dot"></span>
                </a>
            {/if}

            <div class="dropdown ax-dd ax-dd-help">
                <button type="button" class="ax-tb-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="{$_ADMINLANG.help.title}" aria-label="{$_ADMINLANG.help.title}">
                    {include file="$template/aurox/icon.tpl" i="help"}
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li class="dropdown-header">Aurox 3.1.0</li>
                    <li><a href="#" data-ax-action="guide">{include file="$template/aurox/icon.tpl" i="info"} Page guide <kbd>I</kbd></a></li>
                    <li><a href="#" data-ax-action="help">{include file="$template/aurox/icon.tpl" i="keyboard"} Keyboard shortcuts <kbd>?</kbd></a></li>
                    <li><a href="#" data-ax-action="tour">{include file="$template/aurox/icon.tpl" i="compass"} Take the tour</a></li>
                    <li><a href="#" data-ax-action="layout-check">{include file="$template/aurox/icon.tpl" i="layout"} Check page layout</a></li>
                    <li><a href="https://github.com/GreatsLab/aurox" target="_blank" rel="noopener" class="ax-about">{include file="$template/aurox/icon.tpl" i="star"} <span>About Aurox<small>by Chimnadindu Great Chibueze</small></span></a></li>
                    <li><a href="https://whatsapp.com/channel/0029VbE0FCREKyZAE4SW1u3H" target="_blank" rel="noopener" class="ax-about">{include file="$template/aurox/icon.tpl" i="bell"} <span>Aurox on WhatsApp<small>Updates and tips from the author</small></span></a></li>
                    <li role="separator" class="divider"></li>
                    <li class="dropdown-header">WHMCS</li>
                    <li><a href="https://docs.whmcs.com/{$helplink}" target="_blank" rel="noopener">{include file="$template/aurox/icon.tpl" i="external"} {$_ADMINLANG.help.docs}</a></li>
                    <li><a href="systemsupportrequest.php">{include file="$template/aurox/icon.tpl" i="support"} {$_ADMINLANG.help.techSupport}</a></li>
                    <li><a href="https://whmcs.community/?utm_source=InApp&utm_medium=Help_Menu" target="_blank" rel="noopener">{include file="$template/aurox/icon.tpl" i="users"} {$_ADMINLANG.help.forums}</a></li>
                    {if in_array("View What's New", $admin_perms)}
                        <li><a href="javascript:openFeatureHighlights()">{include file="$template/aurox/icon.tpl" i="bell"} {$_ADMINLANG.whatsNew.menuTitle}</a></li>
                    {/if}
                    {if in_array("Main Homepage", $admin_perms)}
                        <li><a href="{routePath('admin-help-license')}">{include file="$template/aurox/icon.tpl" i="shield"} {$_ADMINLANG.help.licenseinfo}</a></li>
                    {/if}
                </ul>
            </div>

            <div class="dropdown ax-dd">
                <button type="button" class="ax-tb-account" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="{$_ADMINLANG.account}">
                    <span class="ax-tb-avatar">{include file="$template/aurox/icon.tpl" i="user"}<img src="https://www.gravatar.com/avatar/{$gravatarHash}?s=64&d=404" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'"></span>
                    <span class="ax-tb-name">{$adminFullName}</span>
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-tb-chev"}
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li><a href="myaccount.php">{include file="$template/aurox/icon.tpl" i="user"} {$_ADMINLANG.global.myaccount}</a></li>
                    <li><a href="#" data-toggle="modal" data-target="#modalMyNotes">{include file="$template/aurox/icon.tpl" i="note"} {$_ADMINLANG.global.mynotes}</a></li>
                    <li><a href="#" data-ax-action="mode">{include file="$template/aurox/icon.tpl" i="moon"} Light / dark</a></li>
                    <li role="separator" class="divider"></li>
                    <li><a href="../" target="_blank" rel="noopener">{include file="$template/aurox/icon.tpl" i="globe"} {$_ADMINLANG.global.clientarea}</a></li>
                    <li role="separator" class="divider"></li>
                    <li><a id="Menu-Account-Logout" href="logout.php">{include file="$template/aurox/icon.tpl" i="logout"} {$_ADMINLANG.global.logout}</a></li>
                </ul>
            </div>
        </header>

        <div class="ax-search-scrim" data-ax-action="search-close"></div>

        {* Phones: bottom tab bar *}
        <nav class="ax-tabbar" aria-label="Quick navigation">
            <a class="ax-tab" href="index.php" data-ax-tab="home">{include file="$template/aurox/icon.tpl" i="home"}<span>Home</span></a>
            {if in_array("List Clients", $admin_perms)}
                <a class="ax-tab" href="clients.php" data-ax-tab="clients">{include file="$template/aurox/icon.tpl" i="users"}<span>Clients</span></a>
            {/if}
            <button type="button" class="ax-tab ax-tab-new" data-ax-action="new-sheet" aria-label="Create something new" aria-haspopup="dialog">
                <span class="ax-tab-plus">{include file="$template/aurox/icon.tpl" i="plus"}</span>
            </button>
            {if in_array("List Support Tickets", $admin_perms)}
                <a class="ax-tab" href="supporttickets.php" data-ax-tab="support">{include file="$template/aurox/icon.tpl" i="support"}<span>Support</span>{if !empty($auroxCounters.tickets)}<em class="ax-tab-badge">{$auroxCounters.tickets}</em>{/if}</a>
            {/if}
            <button type="button" class="ax-tab" data-ax-action="drawer" data-ax-tab="menu" aria-label="Open the full menu">{include file="$template/aurox/icon.tpl" i="menu"}<span>Menu</span>{if !empty($auroxCounters.orders) || !empty($auroxCounters.overdue)}<em class="ax-tab-dot"></em>{/if}</button>
        </nav>

        {* Phones: "New" action sheet *}
        <div class="ax-sheet" id="axNewSheet" aria-hidden="true">
            <div class="ax-sheet-scrim" data-ax-action="new-sheet"></div>
            <div class="ax-sheet-panel" role="dialog" aria-modal="true" aria-label="Create new">
                <div class="ax-sheet-grip"></div>
                <h3 class="ax-sheet-title">Create new</h3>
                <div class="ax-sheet-grid">
                    {if in_array("Add New Client", $admin_perms)}
                        <a class="ax-sheet-item" href="clientsadd.php"><span class="ax-action-ico is-blue">{include file="$template/aurox/icon.tpl" i="users"}</span>{$_ADMINLANG.addNew.client}</a>
                    {/if}
                    {if in_array("Add New Order", $admin_perms)}
                        <a class="ax-sheet-item" href="ordersadd.php"><span class="ax-action-ico is-green">{include file="$template/aurox/icon.tpl" i="cart"}</span>{$_ADMINLANG.addNew.order}</a>
                    {/if}
                    {if in_array("Open New Ticket", $admin_perms)}
                        <a class="ax-sheet-item" href="supporttickets.php?action=open"><span class="ax-action-ico is-purple">{include file="$template/aurox/icon.tpl" i="support"}</span>{$_ADMINLANG.addNew.ticket}</a>
                    {/if}
                    {if in_array("Create Invoice", $admin_perms)}
                        <a class="ax-sheet-item open-modal" href="{routePath('admin-billing-invoice-new')}" data-modal-title="{lang key='addNew.invoice'}" {if !empty($anyGatewaysActivated)}data-btn-submit-id="btnCreateInvoice" data-btn-submit-label="{lang key='invoices.create'}"{/if}><span class="ax-action-ico is-orange">{include file="$template/aurox/icon.tpl" i="receipt"}</span>{lang key='addNew.invoice'}</a>
                    {/if}
                    {if in_array("Manage Quotes", $admin_perms)}
                        <a class="ax-sheet-item" href="quotes.php?action=manage"><span class="ax-action-ico is-cyan">{include file="$template/aurox/icon.tpl" i="note"}</span>{$_ADMINLANG.addNew.quote}</a>
                    {/if}
                    <a class="ax-sheet-item" href="#" data-ax-action="palette"><span class="ax-action-ico is-gray">{include file="$template/aurox/icon.tpl" i="search"}</span>Jump to page</a>
                </div>
                <button type="button" class="ax-sheet-cancel" data-ax-action="new-sheet">Cancel</button>
            </div>
        </div>

        <div class="ax-body-wrap">

            {* WHMCS page panel: shortcuts, filters and record details for the current page. *}
            <div class="sidebar{if $minsidebar} minimized{/if}" id="sidebar">
                <a href="#" class="sidebar-collapse-expand" id="sidebarCollapseExpand">
                    <span>Page panel</span> <i class="fa fa-chevron-down"></i>
                </a>
                <div class="sidebar-collapse">
                    {include file="$template/sidebar.tpl"}
                </div>
            </div>
            <a href="#" class="sidebar-opener{if $minsidebar} minimized{/if}" id="sidebarOpener" title="{$_ADMINLANG.openSidebar}">
                {include file="$template/aurox/icon.tpl" i="panel"}<span>{$_ADMINLANG.openSidebar}</span>
            </a>

            <div class="{$contentAreaClasses}" id="contentarea">
                <div style="float:left;width:100%;">
                    {if !$isCustomHeader}
                        <h1{if $pagetitle == $_ADMINLANG.global.hometitle} class="pull-left ax-home-h1"{/if}>{$pagetitle}</h1>
                    {/if}
                </div>
                <div class="clear"></div>
