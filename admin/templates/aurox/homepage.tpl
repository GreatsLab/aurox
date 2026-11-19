{*
 * Aurox Admin for WHMCS - dashboard
 *
 * With the Aurox Admin addon active, the top of the dashboard shows live
 * numbers: income with trends and a chart, what needs attention, tickets
 * waiting and recent orders. Each block only shows to admins whose role
 * allows it. WHMCS's own widgets follow underneath.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 *}
{if in_array("View Income Totals", $admin_perms)}{assign var="axIncome" value=true}{else}{assign var="axIncome" value=false}{/if}
{if in_array("View Orders", $admin_perms)}{assign var="axOrders" value=true}{else}{assign var="axOrders" value=false}{/if}
{if in_array("List Support Tickets", $admin_perms)}{assign var="axTickets" value=true}{else}{assign var="axTickets" value=false}{/if}
{if in_array("List Invoices", $admin_perms)}{assign var="axInvoices" value=true}{else}{assign var="axInvoices" value=false}{/if}
{if in_array("List Clients", $admin_perms)}{assign var="axClients" value=true}{else}{assign var="axClients" value=false}{/if}

<div class="ax-home{if !empty($auroxDash.ok)} ax-has-live{/if}">

    {* ---------------------------------------------------------------- *}
    <section class="ax-hero">
        <div class="ax-hero-text">
            <span class="ax-hero-kicker" id="axHomeDate">&nbsp;</span>
            <h2 class="ax-hero-title"><span id="axHomeGreeting">Welcome back</span>, <span class="ax-hero-name">{$adminFullName|escape}</span></h2>
            <p class="ax-hero-sub">
                {if !empty($auroxDash.ok)}
                    {if $auroxDash.attention > 0}
                        <b>{$auroxDash.attention}</b> {if $auroxDash.attention == 1}thing needs{else}things need{/if} your attention today.
                    {else}
                        You're all caught up. Nothing needs your attention right now.
                    {/if}
                {else}
                    Here's your WHMCS at a glance.
                {/if}
                <span class="ax-hero-meta">
                    {if !empty($licenseinfo.currentversion)}WHMCS {$licenseinfo.currentversion}{/if}{if !empty($auroxDash.generated)} · updated {$auroxDash.generated}{/if}
                </span>
            </p>
        </div>
        <div class="ax-hero-tools">
            <div id="widgetSettingsDropdown" class="btn-group widget-settings ax-home-customise">
                <button type="button" class="ax-btn" id="widgetSettings" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Choose which WHMCS widgets to show">
                    {include file="$template/aurox/icon.tpl" i="sliders"}<span>Customise</span>
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

    {* Quick actions: one row of chips, scrolls sideways on phones *}
    <nav class="ax-chips-row" aria-label="Quick actions">
        {if in_array("Add New Client", $admin_perms)}
            <a class="ax-action" href="clientsadd.php"><span class="ax-action-ico is-blue">{include file="$template/aurox/icon.tpl" i="users"}</span>{$_ADMINLANG.addNew.client}</a>
        {/if}
        {if in_array("Add New Order", $admin_perms)}
            <a class="ax-action" href="ordersadd.php"><span class="ax-action-ico is-green">{include file="$template/aurox/icon.tpl" i="cart"}</span>{$_ADMINLANG.addNew.order}</a>
        {/if}
        {if in_array("Open New Ticket", $admin_perms)}
            <a class="ax-action" href="supporttickets.php?action=open"><span class="ax-action-ico is-purple">{include file="$template/aurox/icon.tpl" i="support"}</span>{$_ADMINLANG.addNew.ticket}</a>
        {/if}
        {if in_array("Create Invoice", $admin_perms)}
            <a class="ax-action open-modal" href="{routePath('admin-billing-invoice-new')}" data-modal-title="{lang key='addNew.invoice'}" {if !empty($anyGatewaysActivated)}data-btn-submit-id="btnCreateInvoice" data-btn-submit-label="{lang key='invoices.create'}"{/if}><span class="ax-action-ico is-orange">{include file="$template/aurox/icon.tpl" i="receipt"}</span>{lang key='addNew.invoice'}</a>
        {/if}
        <a class="ax-action" href="#" data-toggle="modal" data-target="#modalGenerateInvoices"><span class="ax-action-ico is-cyan">{include file="$template/aurox/icon.tpl" i="refresh"}</span>{$_ADMINLANG.invoices.geninvoices}</a>
        <a class="ax-action" href="#" data-toggle="modal" data-target="#modalCreditCardCapture"><span class="ax-action-ico is-red">{include file="$template/aurox/icon.tpl" i="shield"}</span>{$_ADMINLANG.invoices.attemptcccaptures}</a>
        {include file="$template/quicklinks.tpl"}
    </nav>

    {$infobox}

    {foreach from=$addons_html item=addon_html}
        <div class="addon-html-output-container">{$addon_html}</div>
    {/foreach}

    {$homepagePromotionCarousel}
    {$mixPanelBanner}

    {if !empty($auroxDash.ok)}
        {* ---------------------------------------------------------------- *}
        {* Live overview (Aurox Admin addon)                                  *}
        {* ---------------------------------------------------------------- *}
        <section class="ax-kpis" aria-label="Key numbers">
            {if $axIncome}
                <a class="ax-kpi" href="transactions.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="chart"} Income today</span>
                    <span class="ax-kpi-value">{$auroxDash.income.today|escape}</span>
                    <span class="ax-kpi-foot">
                        {if $auroxDash.income.todayTrend.pct}<span class="ax-trend is-{$auroxDash.income.todayTrend.dir}">{$auroxDash.income.todayTrend.pct}</span> vs yesterday{else}No payments yesterday{/if}
                    </span>
                    {if $auroxDash.income.spark}
                        <svg class="ax-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path d="{$auroxDash.income.spark}"/></svg>
                    {/if}
                </a>
                <a class="ax-kpi" href="reports.php?report=income_forecast">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="receipt"} This month</span>
                    <span class="ax-kpi-value">{$auroxDash.income.month|escape}</span>
                    <span class="ax-kpi-foot">
                        {if $auroxDash.income.monthTrend.pct}<span class="ax-trend is-{$auroxDash.income.monthTrend.dir}">{$auroxDash.income.monthTrend.pct}</span> vs same point last month{else}First month of income{/if}
                    </span>
                </a>
            {/if}
            {if $axOrders}
                <a class="ax-kpi{if $auroxDash.stats.ordersPending > 0} is-alert-orange{/if}" href="orders.php?status=Pending">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="cart"} Pending orders</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.ordersPending}</span>
                    <span class="ax-kpi-foot">{$auroxDash.stats.ordersToday} new today</span>
                </a>
            {/if}
            {if $axTickets}
                <a class="ax-kpi{if $auroxDash.stats.ticketsWaiting > 0} is-alert-blue{/if}" href="supporttickets.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="support"} Tickets waiting</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.ticketsWaiting}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.stats.ticketsWaiting > 0}Waiting for a reply{else}Inbox zero{/if}</span>
                </a>
            {/if}
            {if $axInvoices}
                <a class="ax-kpi{if $auroxDash.stats.invoicesOverdue > 0} is-alert-red{/if}" href="invoices.php?status=Overdue">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="bell"} Overdue invoices</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.invoicesOverdue}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.overdueAmount}{$auroxDash.overdueAmount|escape} outstanding{else}{$auroxDash.stats.invoicesUnpaid} unpaid in total{/if}</span>
                </a>
            {/if}
            {if $axClients}
                <a class="ax-kpi" href="clients.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="users"} Active clients</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.clientsActive}</span>
                    <span class="ax-kpi-foot"><span class="ax-trend is-up">+{$auroxDash.stats.clientsNew}</span> this month · {$auroxDash.stats.servicesActive} services</span>
                </a>
            {/if}
        </section>

        <section class="ax-dash-grid">
            {if $axIncome}
                <div class="ax-card ax-card-chart">
                    <div class="ax-card-head">
                        <div>
                            <h3 class="ax-card-title">Revenue</h3>
                            <p class="ax-card-sub"><b id="axRevTotal">{$auroxDash.income.thirty|escape}</b> <span id="axRevLabel">in the last 30 days</span></p>
                        </div>
                        <div class="ax-seg" role="tablist" aria-label="Chart range">
                            <button type="button" class="ax-seg-btn" data-days="7">7D</button>
                            <button type="button" class="ax-seg-btn" data-days="14">14D</button>
                            <button type="button" class="ax-seg-btn is-on" data-days="30">30D</button>
                        </div>
                    </div>
                    <div class="ax-chart" id="axRevenueChart" data-prefix="{$auroxDash.currency.prefix|escape}" data-suffix="{$auroxDash.currency.suffix|escape}" role="img" aria-label="Income per day for the last 30 days"></div>
                    <script type="application/json" id="axRevenueData">{$auroxDash.income.seriesJson}</script>
                    {if !$auroxDash.income.hasData}<p class="ax-card-empty">No payments in the last 30 days yet. They'll show up here.</p>{/if}
                </div>
            {/if}

            <div class="ax-card ax-card-attention">
                <div class="ax-card-head"><h3 class="ax-card-title">Needs attention</h3>{if $auroxDash.attention > 0}<span class="ax-count-pill">{$auroxDash.attention}</span>{/if}</div>
                <ul class="ax-todo">
                    {if $axOrders}
                        <li><a href="orders.php?status=Pending" class="{if $auroxDash.stats.ordersPending > 0}is-on{/if}"><span class="ax-todo-ico is-orange">{include file="$template/aurox/icon.tpl" i="cart"}</span><span class="ax-todo-text">Pending orders<small>Accept, check for fraud or cancel</small></span><b>{$auroxDash.stats.ordersPending}</b></a></li>
                    {/if}
                    {if $axTickets}
                        <li><a href="supporttickets.php" class="{if $auroxDash.stats.ticketsWaiting > 0}is-on{/if}"><span class="ax-todo-ico is-blue">{include file="$template/aurox/icon.tpl" i="support"}</span><span class="ax-todo-text">Tickets waiting<small>Customers waiting for a reply</small></span><b>{$auroxDash.stats.ticketsWaiting}</b></a></li>
                    {/if}
                    {if $axInvoices}
                        <li><a href="invoices.php?status=Overdue" class="{if $auroxDash.stats.invoicesOverdue > 0}is-on{/if}"><span class="ax-todo-ico is-red">{include file="$template/aurox/icon.tpl" i="receipt"}</span><span class="ax-todo-text">Overdue invoices<small>{if $auroxDash.overdueAmount}{$auroxDash.overdueAmount|escape} to collect{else}Past their due date{/if}</small></span><b>{$auroxDash.stats.invoicesOverdue}</b></a></li>
                    {/if}
                    {if in_array("View Cancellation Requests", $admin_perms)}
                        <li><a href="cancelrequests.php" class="{if $auroxDash.stats.cancellations > 0}is-on{/if}"><span class="ax-todo-ico is-purple">{include file="$template/aurox/icon.tpl" i="x"}</span><span class="ax-todo-text">Cancellation requests<small>A chance to keep the customer</small></span><b>{$auroxDash.stats.cancellations}</b></a></li>
                    {/if}
                    {if in_array("View Module Queue", $admin_perms)}
                        <li><a href="modulequeue.php" class="{if $auroxDash.stats.moduleQueue > 0}is-on{/if}"><span class="ax-todo-ico is-red">{include file="$template/aurox/icon.tpl" i="server"}</span><span class="ax-todo-text">Failed module actions<small>Server tasks that need a retry</small></span><b>{$auroxDash.stats.moduleQueue}</b></a></li>
                    {/if}
                    {if in_array("List Domains", $admin_perms)}
                        <li><a href="{routePath('admin-domains-index')}" class="{if $auroxDash.stats.domainsExpiring > 0}is-on{/if}"><span class="ax-todo-ico is-cyan">{include file="$template/aurox/icon.tpl" i="globe"}</span><span class="ax-todo-text">Domains expiring soon<small>In the next 30 days</small></span><b>{$auroxDash.stats.domainsExpiring}</b></a></li>
                    {/if}
                </ul>
            </div>

            {if $axTickets}
                <div class="ax-card">
                    <div class="ax-card-head"><h3 class="ax-card-title">Tickets waiting</h3><a class="ax-card-link" href="supporttickets.php">View all</a></div>
                    {if $auroxDash.waitingTickets}
                        <ul class="ax-list">
                            {foreach $auroxDash.waitingTickets as $t}
                                <li>
                                    <a href="supporttickets.php?action=view&amp;id={$t.id}">
                                        <span class="ax-prio is-{$t.utone}" title="{$t.urgency|escape} priority"></span>
                                        <span class="ax-list-main">
                                            <b>{$t.title|escape}</b>
                                            <small>#{$t.tid|escape} · {$t.who|escape}</small>
                                        </span>
                                        <span class="ax-list-side">
                                            <span class="ax-age{if $t.late} is-late{/if}">{$t.ago}</span>
                                            <span class="ax-pill">{$t.status|escape}</span>
                                        </span>
                                    </a>
                                </li>
                            {/foreach}
                        </ul>
                    {else}
                        <div class="ax-empty-state">{include file="$template/aurox/icon.tpl" i="support"}<b>No tickets waiting</b><span>Every customer has a reply. Nice work.</span></div>
                    {/if}
                </div>
            {/if}

            {if $axOrders}
                <div class="ax-card">
                    <div class="ax-card-head"><h3 class="ax-card-title">Recent orders</h3><a class="ax-card-link" href="orders.php">View all</a></div>
                    {if $auroxDash.recentOrders}
                        <ul class="ax-list">
                            {foreach $auroxDash.recentOrders as $o}
                                <li>
                                    <a href="orders.php?action=view&amp;id={$o.id}">
                                        <span class="ax-initials">{$o.initials|escape}</span>
                                        <span class="ax-list-main">
                                            <b>{if $o.client}{$o.client|escape}{else}Order #{$o.id}{/if}</b>
                                            <small>#{$o.num|escape} · {$o.ago}</small>
                                        </span>
                                        <span class="ax-list-side">
                                            <span class="ax-amount">{$o.amount|escape}</span>
                                            <span class="ax-pill is-{$o.tone}">{$o.status|escape}</span>
                                        </span>
                                    </a>
                                </li>
                            {/foreach}
                        </ul>
                    {else}
                        <div class="ax-empty-state">{include file="$template/aurox/icon.tpl" i="cart"}<b>No orders yet</b><span>New orders will appear here.</span></div>
                    {/if}
                </div>
            {/if}
        </section>
    {else}
        <div class="ax-tipcard">
            {include file="$template/aurox/icon.tpl" i="zap"}
            <div><b>Want a live dashboard?</b> Activate the <em>Aurox Admin</em> addon (Configuration › System Settings › Addon Modules) to see income charts, what needs attention, tickets waiting and recent orders right here.</div>
        </div>
    {/if}

    {* ---------------------------------------------------------------- *}
    {* WHMCS widgets                                                      *}
    {* ---------------------------------------------------------------- *}
    <div class="ax-section-head">
        <h3>{if !empty($auroxDash.ok)}More from WHMCS{else}Overview{/if}</h3>
        <span>Refresh, shrink or hide these widgets. Use Customise to choose which ones show.</span>
    </div>

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
        if (g) {ldelim} g.textContent = h < 5 ? 'Working late' : (h < 12 ? 'Good morning' : (h < 17 ? 'Good afternoon' : 'Good evening')); {rdelim}
        if (d) {ldelim} d.textContent = now.toLocaleDateString(undefined, {ldelim} weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' {rdelim}); {rdelim}
    {rdelim})();
</script>
