{*
 * Aurox Admin for WHMCS - dashboard
 * A greeting, quick actions and your WHMCS widgets in clean cards.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 *}
<div class="ax-home">

    <section class="ax-home-hero">
        <div class="ax-home-hello">
            <span class="ax-home-kicker" id="axHomeDate"></span>
            <h2><span id="axHomeGreeting">Welcome back</span>, {$adminFullName|escape}</h2>
            <p>Here is what needs your attention today. Press <kbd class="ax-kbd-mod">Ctrl K</kbd> to jump anywhere.</p>
            {if !empty($licenseinfo.currentversion)}
                <p class="ax-home-sys">WHMCS {$licenseinfo.currentversion}{if !empty($licenseinfo.registeredname)} · Registered to {$licenseinfo.registeredname}{/if}{if $licenseinfo.updateavailable} · <a href="update.php">{$_ADMINLANG.license.updateavailable}</a>{/if}</p>
            {/if}
        </div>

        <div class="ax-home-tools">
            <div id="widgetSettingsDropdown" class="btn-group widget-settings ax-home-customise">
                <button type="button" class="ax-btn" id="widgetSettings" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {include file="$template/aurox/icon.tpl" i="grid"}<span>Customise</span>
                </button>
                <ul id="widgetSettingsDropdownMenu" class="dropdown-menu dropdown-menu-right pull-right" aria-labelledby="widgetSettings">
                    <li><h4>{lang key='home.configureWidgetDisplayTitle'}</h4></li>
                    {foreach $widgets as $widget}
                        <li{if !in_array($widget->getId(), $hiddenWidgets)} class="active"{/if}>
                            <label class="checkbox-inline">
                                <input type="checkbox" class="display-widget"{if !in_array($widget->getId(), $hiddenWidgets)} checked="checked"{/if} data-widget="{$widget->getId()}" value="1">
                                {$widget->getTitle()}
                            </label>
                        </li>
                    {/foreach}
                </ul>
            </div>
        </div>
    </section>

    <nav class="ax-quick" aria-label="Quick actions">
        {if in_array("Add New Client", $admin_perms)}
            <a class="ax-quick-item" href="clientsadd.php">
                <span class="ax-quick-ico is-blue">{include file="$template/aurox/icon.tpl" i="users"}</span>
                <span><b>{$_ADMINLANG.clients.addnew}</b><small>Create a customer account</small></span>
            </a>
        {/if}
        {if in_array("Add New Order", $admin_perms)}
            <a class="ax-quick-item" href="ordersadd.php">
                <span class="ax-quick-ico is-green">{include file="$template/aurox/icon.tpl" i="cart"}</span>
                <span><b>{$_ADMINLANG.orders.addnew}</b><small>Place an order for a client</small></span>
            </a>
        {/if}
        {if in_array("Open New Ticket", $admin_perms)}
            <a class="ax-quick-item" href="supporttickets.php?action=open">
                <span class="ax-quick-ico is-purple">{include file="$template/aurox/icon.tpl" i="support"}</span>
                <span><b>{$_ADMINLANG.support.opennewticket}</b><small>Start a support conversation</small></span>
            </a>
        {/if}
        {if in_array("List Invoices", $admin_perms)}
            <a class="ax-quick-item" href="invoices.php?status=Overdue">
                <span class="ax-quick-ico is-red">{include file="$template/aurox/icon.tpl" i="receipt"}</span>
                <span><b>{$_ADMINLANG.status.overdue} {$_ADMINLANG.invoices.title}</b><small>Follow up on late payments</small></span>
            </a>
        {/if}
        <a class="ax-quick-item" href="#" data-toggle="modal" data-target="#modalGenerateInvoices">
            <span class="ax-quick-ico is-orange">{include file="$template/aurox/icon.tpl" i="refresh"}</span>
            <span><b>{$_ADMINLANG.invoices.geninvoices}</b><small>Create invoices that are due now</small></span>
        </a>
        <a class="ax-quick-item" href="#" data-toggle="modal" data-target="#modalCreditCardCapture">
            <span class="ax-quick-ico is-cyan">{include file="$template/aurox/icon.tpl" i="receipt"}</span>
            <span><b>{$_ADMINLANG.invoices.attemptcccaptures}</b><small>Charge saved cards for due invoices</small></span>
        </a>
        {include file="$template/quicklinks.tpl"}
    </nav>

    {$infobox}

    {foreach from=$addons_html item=addon_html}
        <div class="addon-html-output-container">
            {$addon_html}
        </div>
    {/foreach}

    {$homepagePromotionCarousel}

    {$mixPanelBanner}

    <div class="ax-home-static">
        {foreach $staticWidgets as $widget}
            <div id="panel{$widget->getId()}" class="dashboard-panel-static-item dashboard-panel-item-columns-{$widget->getColumnSize()}{if in_array($widget->getId(), $hiddenWidgets)} hidden{/if}">
                {if $widget->showWrapper()}
                <div class="panel panel-default widget-{$widget->getId()|strtolower}" data-widget="{$widget->getId()}">
                    <div class="panel-heading">
                        <div class="widget-tools">
                            <a href="#" class="widget-refresh" title="Refresh"><i class="fas fa-sync"></i></a>
                            <a href="#" class="widget-minimise" title="Minimise"><i class="fas fa-chevron-up"></i></a>
                            <a href="#" class="widget-hide" title="Hide"><i class="fas fa-times"></i></a>
                        </div>
                        <h3 class="panel-title">{$widget->getTitle()}</h3>
                    </div>
                    <div class="panel-body">
                {/if}
                {$widget->render()}
                {if $widget->showWrapper()}
                    </div>
                </div>
                {/if}
            </div>
        {/foreach}
    </div>

    <div class="home-widgets-container" data-masonry='{ "itemSelector": ".dashboard-panel-item", "columnWidth": ".dashboard-panel-sizer", "percentPosition": "true" }'>
        <div class="dashboard-panel-sizer"></div>
        {foreach $sortableWidgets as $widget}
            <div id="panel{$widget->getId()}" data-widget="{$widget->getId()}" class="dashboard-panel-item dashboard-panel-item-columns-{$widget->getColumnSize()}{if in_array($widget->getId(), $hiddenWidgets)} hidden{/if}">
                {if $widget->showWrapper()}
                    <div class="panel panel-default widget-{$widget->getId()|strtolower}" data-widget="{$widget->getId()}">
                        <div class="panel-heading">
                            <div class="widget-tools">
                                <a href="#" class="widget-refresh" title="Refresh"><i class="fas fa-sync"></i></a>
                                <a href="#" class="widget-minimise" title="Minimise"><i class="fas fa-chevron-up"></i></a>
                                <a href="#" class="widget-hide" title="Hide"><i class="fas fa-times"></i></a>
                            </div>
                            <h3 class="panel-title">{$widget->getTitle()}</h3>
                        </div>
                        <div class="panel-body">
                {/if}
                {$widget->render()}
                {if $widget->showWrapper()}
                        </div>
                    </div>
                {/if}
            </div>
        {/foreach}
    </div>

    {$generateInvoices}
    {$creditCardCapture}
</div>

<script>
    (function () {ldelim}
        var now = new Date(), h = now.getHours();
        var g = document.getElementById('axHomeGreeting'), d = document.getElementById('axHomeDate');
        if (g) {ldelim} g.textContent = h < 12 ? 'Good morning' : (h < 17 ? 'Good afternoon' : 'Good evening'); {rdelim}
        if (d) {ldelim} d.textContent = now.toLocaleDateString(undefined, {ldelim} weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' {rdelim}); {rdelim}
    {rdelim})();
</script>
