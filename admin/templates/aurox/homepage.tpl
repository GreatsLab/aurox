{*
 * Aurox Admin for WHMCS - dashboard
 *
 * With the Aurox Admin addon active, the dashboard opens with what's
 * waiting on you (pending orders and tickets waiting), then live numbers:
 * income with trends and a chart, what else needs attention, latest
 * payments and recent orders. Each block only shows to admins whose role
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
        {* Priority: what's waiting on you right now                          *}
        {* ---------------------------------------------------------------- *}
        {if $axOrders || $axTickets}
            <section class="ax-priority{if !($axOrders && $axTickets)} is-single{/if}" aria-label="Needs you now">
                {if $axOrders}
                    <div class="ax-prio-card is-orders{if !$auroxDash.pendingOrders} is-clear{/if}">
                        <div class="ax-prio-head">
                            <span class="ax-prio-ico">{include file="$template/aurox/icon.tpl" i="cart"}</span>
                            <div class="ax-prio-title">
                                <h3>Pending orders</h3>
                                <p>
                                    {if $auroxDash.stats.ordersPending > 0}
                                        {if $auroxDash.ordersPaidPending > 0}<b>{$auroxDash.ordersPaidPending} paid</b> and waiting for you to accept{else}Waiting for you to review{/if}
                                    {else}
                                        All caught up
                                    {/if}
                                </p>
                            </div>
                            <a class="ax-prio-count" href="orders.php?status=Pending" aria-label="{$auroxDash.stats.ordersPending} pending orders">{$auroxDash.stats.ordersPending}</a>
                        </div>
                        {if $auroxDash.pendingOrders}
                            <ul class="ax-prio-list">
                                {foreach $auroxDash.pendingOrders as $o}
                                    <li>
                                        <a href="orders.php?action=view&amp;id={$o.id}">
                                            <span class="ax-initials">{$o.initials|escape}</span>
                                            <span class="ax-list-main">
                                                <b>{$o.client|escape}</b>
                                                {if $o.items}<small class="ax-list-what">{$o.items|escape}</small>{/if}
                                                <small>#{$o.num|escape}{if $o.gateway} · {$o.gateway|escape}{/if} · {$o.ago}</small>
                                            </span>
                                            <span class="ax-list-side">
                                                <span class="ax-amount">{$o.amount|escape}</span>
                                                <span class="ax-pill is-{$o.paytone}">{$o.pay|escape}</span>
                                            </span>
                                        </a>
                                    </li>
                                {/foreach}
                            </ul>
                            <a class="ax-prio-foot" href="orders.php?status=Pending"><span>Review all pending orders</span>{include file="$template/aurox/icon.tpl" i="arrowright"}</a>
                        {else}
                            <div class="ax-prio-empty">{include file="$template/aurox/icon.tpl" i="checkcircle"}<span>No pending orders. New ones show up here first.</span></div>
                        {/if}
                    </div>
                {/if}
                {if $axTickets}
                    <div class="ax-prio-card is-tickets{if !$auroxDash.waitingTickets} is-clear{/if}">
                        <div class="ax-prio-head">
                            <span class="ax-prio-ico">{include file="$template/aurox/icon.tpl" i="support"}</span>
                            <div class="ax-prio-title">
                                <h3>Tickets waiting</h3>
                                <p>{if $auroxDash.stats.ticketsWaiting > 0}Customers waiting for a reply, oldest first{else}Every customer has a reply{/if}</p>
                            </div>
                            <a class="ax-prio-count" href="supporttickets.php" aria-label="{$auroxDash.stats.ticketsWaiting} tickets waiting">{$auroxDash.stats.ticketsWaiting}</a>
                        </div>
                        {if $auroxDash.waitingTickets}
                            <ul class="ax-prio-list">
                                {foreach $auroxDash.waitingTickets as $t}
                                    <li>
                                        <a href="supporttickets.php?action=view&amp;id={$t.id}">
                                            <span class="ax-prio-dot is-{$t.utone}" title="{$t.urgency|escape} priority"></span>
                                            <span class="ax-list-main">
                                                <b>{$t.title|escape}</b>
                                                <small>#{$t.tid|escape} · {$t.who|escape}{if $t.dept} · {$t.dept|escape}{/if}</small>
                                            </span>
                                            <span class="ax-list-side">
                                                <span class="ax-wait is-{$t.wait}">{include file="$template/aurox/icon.tpl" i="clock"}{$t.ago}</span>
                                                <span class="ax-pill">{$t.status|escape}</span>
                                            </span>
                                        </a>
                                    </li>
                                {/foreach}
                            </ul>
                            <a class="ax-prio-foot" href="supporttickets.php"><span>Open the ticket queue</span>{include file="$template/aurox/icon.tpl" i="arrowright"}</a>
                        {else}
                            <div class="ax-prio-empty">{include file="$template/aurox/icon.tpl" i="checkcircle"}<span>No tickets waiting. Nice work.</span></div>
                        {/if}
                    </div>
                {/if}
            </section>
        {/if}

        {* ---------------------------------------------------------------- *}
        {* Key numbers                                                        *}
        {* ---------------------------------------------------------------- *}
        <section class="ax-kpis" aria-label="Key numbers">
            {if $axIncome}
                <a class="ax-kpi" href="transactions.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="chart"} Income today</span>
                    <span class="ax-kpi-value">{$auroxDash.income.today|escape}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.income.todayTrend.pct}<span class="ax-trend is-{$auroxDash.income.todayTrend.dir}">{$auroxDash.income.todayTrend.pct}</span> {/if}{$auroxDash.income.todayNote|escape}</span>
                    {if $auroxDash.income.spark}
                        <svg class="ax-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path d="{$auroxDash.income.spark}"/></svg>
                    {/if}
                </a>
                <a class="ax-kpi" href="transactions.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="wallet"} This month</span>
                    <span class="ax-kpi-value">{$auroxDash.income.month|escape}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.income.monthTrend.pct}<span class="ax-trend is-{$auroxDash.income.monthTrend.dir}">{$auroxDash.income.monthTrend.pct}</span> {/if}{$auroxDash.income.monthNote|escape}</span>
                </a>
            {/if}
            {if $axInvoices}
                <a class="ax-kpi{if $auroxDash.stats.invoicesOverdue > 0} is-alert-red{/if}" href="invoices.php?status=Overdue">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="bell"} Overdue invoices</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.invoicesOverdue}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.overdueAmount}{$auroxDash.overdueAmount|escape} still owed{else}{$auroxDash.stats.invoicesUnpaid} unpaid in total{/if}</span>
                </a>
            {/if}
            {if $axClients}
                <a class="ax-kpi" href="clients.php">
                    <span class="ax-kpi-label">{include file="$template/aurox/icon.tpl" i="users"} Active clients</span>
                    <span class="ax-kpi-value">{$auroxDash.stats.clientsActive}</span>
                    <span class="ax-kpi-foot">{if $auroxDash.stats.clientsNew > 0}<span class="ax-trend is-up">+{$auroxDash.stats.clientsNew}</span> this month · {/if}{$auroxDash.stats.servicesActive} active services</span>
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
                    <div class="ax-chart{if !$auroxDash.income.hasData} is-empty{/if}" id="axRevenueChart" data-prefix="{$auroxDash.currency.prefix|escape}" data-suffix="{$auroxDash.currency.suffix|escape}" role="img" aria-label="Income per day for the last 30 days"></div>
                    <script type="application/json" id="axRevenueData">{$auroxDash.income.seriesJson}</script>
                    {if !$auroxDash.income.hasData}<p class="ax-card-empty">No payments in the last 30 days yet. They'll show up here.</p>{/if}
                    {if $auroxDash.income.sourceNote || $auroxDash.income.converted}<p class="ax-card-note">{include file="$template/aurox/icon.tpl" i="info"}<span>{$auroxDash.income.sourceNote|escape} {$auroxDash.income.converted|escape}</span></p>{/if}
                </div>
            {/if}

            <div class="ax-card ax-card-attention">
                <div class="ax-card-head"><h3 class="ax-card-title">Also needs attention</h3>{if $auroxDash.attentionOther > 0}<span class="ax-count-pill">{$auroxDash.attentionOther}</span>{/if}</div>
                <ul class="ax-todo">
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
                        <li><a href="{routePath('admin-domains-index')}" class="{if $auroxDash.stats.domainsPending > 0}is-on{/if}"><span class="ax-todo-ico is-orange">{include file="$template/aurox/icon.tpl" i="globe"}</span><span class="ax-todo-text">Domains pending<small>Registrations and transfers to complete</small></span><b>{$auroxDash.stats.domainsPending}</b></a></li>
                        <li><a href="{routePath('admin-domains-index')}" class="{if $auroxDash.stats.domainsExpiring > 0}is-on{/if}"><span class="ax-todo-ico is-cyan">{include file="$template/aurox/icon.tpl" i="calendar"}</span><span class="ax-todo-text">Domains expiring soon<small>In the next 30 days</small></span><b>{$auroxDash.stats.domainsExpiring}</b></a></li>
                    {/if}
                </ul>
            </div>

            {if $axIncome}
                <div class="ax-card ax-card-half">
                    <div class="ax-card-head"><h3 class="ax-card-title">{$auroxDash.paymentsTitle|escape}</h3><a class="ax-card-link" href="{if $auroxDash.income.source == 'invoices'}invoices.php?status=Paid{else}transactions.php{/if}">View all</a></div>
                    {if $auroxDash.payments}
                        <ul class="ax-list">
                            {foreach $auroxDash.payments as $p}
                                <li>
                                    <a href="{$p.url|escape}">
                                        <span class="ax-initials is-green">{$p.initials|escape}</span>
                                        <span class="ax-list-main">
                                            <b>{$p.client|escape}</b>
                                            <small>{$p.meta|escape}</small>
                                        </span>
                                        <span class="ax-list-side">
                                            <span class="ax-amount is-in">{$p.amount|escape}</span>
                                            <span class="ax-age">{$p.ago}</span>
                                        </span>
                                    </a>
                                </li>
                            {/foreach}
                        </ul>
                    {else}
                        <div class="ax-empty-state">{include file="$template/aurox/icon.tpl" i="wallet"}<b>No payments yet</b><span>Payments will appear here as they come in.</span></div>
                    {/if}
                </div>
            {/if}

            {if $axOrders}
                <div class="ax-card ax-card-half">
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
            <div><b>Want a live dashboard?</b> Activate the <em>Aurox Admin</em> addon (Configuration › System Settings › Addon Modules) to see pending orders and waiting tickets first, income charts, what needs attention and recent orders right here.</div>
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
