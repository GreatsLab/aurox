{*
 * Aurox Admin for WHMCS - main navigation
 * One sidebar, grouped by job. Every link respects the admin's role
 * permissions, exactly like the stock menu.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 *}
<aside id="ax-sidebar" data-ax-server="1" aria-label="Main navigation">

    <div class="ax-brand">
        <a href="index.php" class="ax-brand-logo" aria-label="{$_ADMINLANG.home.title}">
            {if !empty($auroxLogo)}
                <img src="{$auroxLogo|escape}" alt="">
            {else}
                <svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="axg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--ax-accent) 78%, #fff)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--ax-accent) 82%, #000)"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#axg)"/><path d="M20 46 32 16l12 30M24.5 35h15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 40c6 9 30 12 44-6" fill="none" stroke="#bcd3ff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/><circle cx="54" cy="34" r="3.5" fill="#fff"/></svg>
            {/if}
        </a>
        <span class="ax-brand-text">
            <span class="ax-brand-name">{if !empty($auroxBrand)}{$auroxBrand|escape}{else}WHMCS{/if}</span>
            <span class="ax-brand-sub">Admin</span>
        </span>
        <button type="button" class="ax-icon-btn" data-ax-action="pin" aria-label="Pin this page" title="Pin this page">{include file="$template/aurox/icon.tpl" i="star"}</button>
        <button type="button" class="ax-icon-btn ax-drawer-close" data-ax-action="drawer" aria-label="Close menu">{include file="$template/aurox/icon.tpl" i="x"}</button>
    </div>

    <button type="button" class="ax-search" data-ax-action="palette" data-tip="Jump to a page">
        {include file="$template/aurox/icon.tpl" i="search"}
        <span>Jump to page…</span>
        <kbd class="ax-kbd-mod">Ctrl K</kbd>
    </button>

    {* Phones: one-tap shortcuts at the top of the menu (permission-aware) *}
    <div class="ax-quickgrid" aria-label="Shortcuts">
        {if in_array("View Orders", $admin_perms)}<a class="ax-qg" href="orders.php?status=Pending">{include file="$template/aurox/icon.tpl" i="cart"}<span>Orders</span>{if !empty($auroxCounters.orders)}<em>{$auroxCounters.orders}</em>{/if}</a>{/if}
        {if in_array("List Invoices", $admin_perms)}<a class="ax-qg" href="invoices.php">{include file="$template/aurox/icon.tpl" i="receipt"}<span>Invoices</span>{if !empty($auroxCounters.overdue)}<em>{$auroxCounters.overdue}</em>{/if}</a>{/if}
        {if in_array("List Support Tickets", $admin_perms)}<a class="ax-qg" href="supporttickets.php">{include file="$template/aurox/icon.tpl" i="support"}<span>Tickets</span>{if !empty($auroxCounters.tickets)}<em>{$auroxCounters.tickets}</em>{/if}</a>{/if}
        {if in_array("List Services", $admin_perms)}<a class="ax-qg" href="{routePath('admin-services-index')}">{include file="$template/aurox/icon.tpl" i="server"}<span>Services</span></a>{/if}
        {if in_array("List Domains", $admin_perms)}<a class="ax-qg" href="{routePath('admin-domains-index')}">{include file="$template/aurox/icon.tpl" i="globe"}<span>Domains</span></a>{/if}
        {if in_array("List Transactions", $admin_perms)}<a class="ax-qg" href="transactions.php">{include file="$template/aurox/icon.tpl" i="coins"}<span>Payments</span></a>{/if}
    </div>

    <nav class="ax-nav">

        <div class="ax-group ax-pins"></div>

        {* ------------------------------------------------------------ *}
        <div class="ax-group">
            <div class="ax-section-title">Workspace</div>

            <div class="ax-item">
                <a class="ax-link" href="index.php" data-tip="{$_ADMINLANG.home.title}" data-ax-icon="home" data-ax-words="home dashboard overview">
                    {include file="$template/aurox/icon.tpl" i="home"}<span class="ax-label">Dashboard</span>
                </a>
            </div>

            <div class="ax-item" data-ax-key="clients" data-ax-also="^(clients|affiliates|cancelrequests|users|services|domains|addons)">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.clients.title}" data-ax-icon="users">
                    {include file="$template/aurox/icon.tpl" i="users"}<span class="ax-label">{$_ADMINLANG.clients.title}</span>
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if in_array("List Clients", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="clients.php" data-ax-words="customers search"><span class="ax-label">{$_ADMINLANG.clients.viewsearch}</span></a></div>
                    {/if}
                    {if in_array("Add New Client", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="clientsadd.php" data-ax-words="create customer"><span class="ax-label">{$_ADMINLANG.clients.addnew}</span></a></div>
                    {/if}
                    {if in_array("List Users", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-user-list')}" data-ax-words="logins accounts"><span class="ax-label">{lang key='user.manageUsers'}</span></a></div>
                    {/if}
                    {if in_array("List Services", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-services-index')}" data-ax-words="hosting vps products"><span class="ax-label">{$_ADMINLANG.services.title}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="{routePath('admin-services-shared')}" data-ax-words="shared hosting cpanel"><span class="ax-label">{$_ADMINLANG.services.listhosting}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="{routePath('admin-services-reseller')}" data-ax-words="reseller"><span class="ax-label">{$_ADMINLANG.services.listreseller}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="{routePath('admin-services-server')}" data-ax-words="vps dedicated servers"><span class="ax-label">{$_ADMINLANG.services.listservers}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="{routePath('admin-services-other')}" data-ax-words="other services"><span class="ax-label">{$_ADMINLANG.services.listother}</span></a></div>
                    {/if}
                    {if in_array("List Addons", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-addons-index')}"><span class="ax-label">{$_ADMINLANG.services.listaddons}</span></a></div>
                    {/if}
                    {if in_array("List Domains", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-domains-index')}" data-ax-words="domain names"><span class="ax-label">{$_ADMINLANG.services.listdomains}</span></a></div>
                    {/if}
                    {if in_array("View Cancellation Requests", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="cancelrequests.php" data-ax-words="cancel"><span class="ax-label">{$_ADMINLANG.clients.cancelrequests}</span>{if !empty($auroxCounters.cancellations)}<span class="ax-badge is-warn">{$auroxCounters.cancellations}</span>{/if}</a></div>
                    {/if}
                    {if in_array("Manage Affiliates", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="affiliates.php" data-ax-words="referrals commission"><span class="ax-label">{$_ADMINLANG.affiliates.manage}</span></a></div>
                    {/if}
                </div>
            </div>

            <div class="ax-item" data-ax-key="orders" data-ax-also="^orders">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.orders.title}" data-ax-icon="cart">
                    {include file="$template/aurox/icon.tpl" i="cart"}<span class="ax-label">{$_ADMINLANG.orders.title}</span>
                    {if !empty($auroxCounters.orders)}<span class="ax-badge is-warn" title="Pending orders">{$auroxCounters.orders}</span>{/if}
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if in_array("View Orders", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="orders.php"><span class="ax-label">{$_ADMINLANG.orders.listall}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="orders.php?status=Pending" data-ax-words="new waiting accept"><span class="ax-label">{$_ADMINLANG.orders.listpending}</span>{if !empty($auroxCounters.orders)}<span class="ax-badge is-warn">{$auroxCounters.orders}</span>{/if}</a></div>
                        <div class="ax-item"><a class="ax-link" href="orders.php?status=Active"><span class="ax-label">{$_ADMINLANG.orders.listactive}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="orders.php?status=Fraud"><span class="ax-label">{$_ADMINLANG.orders.listfraud}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="orders.php?status=Cancelled"><span class="ax-label">{$_ADMINLANG.orders.listcancelled}</span></a></div>
                    {/if}
                    {if in_array("Add New Order", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="ordersadd.php" data-ax-words="create"><span class="ax-label">{$_ADMINLANG.orders.addnew}</span></a></div>
                    {/if}
                </div>
            </div>

            <div class="ax-item" data-ax-key="billing" data-ax-also="^(invoices|transactions|quotes|billableitems|gatewaylog|offlineccprocessing|disputes)">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.billing.title}" data-ax-icon="receipt">
                    {include file="$template/aurox/icon.tpl" i="receipt"}<span class="ax-label">{$_ADMINLANG.billing.title}</span>
                    {if !empty($auroxCounters.overdue)}<span class="ax-badge is-hot" title="Overdue invoices">{$auroxCounters.overdue}</span>{/if}
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if in_array("List Invoices", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="invoices.php"><span class="ax-label">{$_ADMINLANG.invoices.title}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Unpaid"><span class="ax-label">{$_ADMINLANG.status.unpaid}</span>{if !empty($auroxCounters.unpaid)}<span class="ax-badge">{$auroxCounters.unpaid}</span>{/if}</a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Overdue"><span class="ax-label">{$_ADMINLANG.status.overdue}</span>{if !empty($auroxCounters.overdue)}<span class="ax-badge is-hot">{$auroxCounters.overdue}</span>{/if}</a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Paid"><span class="ax-label">{$_ADMINLANG.status.paid}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Draft"><span class="ax-label">{$_ADMINLANG.status.draft}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Cancelled"><span class="ax-label">{$_ADMINLANG.status.cancelled}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Refunded"><span class="ax-label">{$_ADMINLANG.status.refunded}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Collections"><span class="ax-label">{$_ADMINLANG.status.collections}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="invoices.php?status=Payment%20Pending"><span class="ax-label">{$_ADMINLANG.status.paymentpending}</span></a></div>
                    {/if}
                    {if in_array("List Transactions", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="transactions.php" data-ax-words="payments"><span class="ax-label">{$_ADMINLANG.billing.transactionslist}</span></a></div>
                    {/if}
                    {if in_array("Manage Quotes", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="quotes.php" data-ax-words="estimates"><span class="ax-label">{$_ADMINLANG.quotes.title}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="quotes.php?validity=Valid"><span class="ax-label">{$_ADMINLANG.status.valid}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="quotes.php?validity=Expired"><span class="ax-label">{$_ADMINLANG.status.expired}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="quotes.php?action=manage" data-ax-words="new quote estimate"><span class="ax-label">{$_ADMINLANG.quotes.createnew}</span></a></div>
                    {/if}
                    {if in_array("View Billable Items", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="billableitems.php"><span class="ax-label">{$_ADMINLANG.billableitems.title}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="billableitems.php?status=Uninvoiced"><span class="ax-label">{$_ADMINLANG.billableitems.uninvoiced}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="billableitems.php?status=Recurring"><span class="ax-label">{$_ADMINLANG.billableitems.recurring}</span></a></div>
                        {if in_array("Manage Billable Items", $admin_perms)}<div class="ax-item is-child"><a class="ax-link" href="billableitems.php?action=manage" data-ax-words="new billable item"><span class="ax-label">{$_ADMINLANG.billableitems.addnew}</span></a></div>{/if}
                    {/if}
                    {if in_array("List Disputes", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-billing-disputes-index')}" data-ax-words="chargebacks"><span class="ax-label">{$_ADMINLANG.disputes.title}</span></a></div>
                    {/if}
                    {if in_array("Offline Credit Card Processing", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="offlineccprocessing.php"><span class="ax-label">{$_ADMINLANG.billing.offlinecc}</span></a></div>
                    {/if}
                    {if in_array("View Gateway Log", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="gatewaylog.php" data-ax-words="payment errors callbacks"><span class="ax-label">{$_ADMINLANG.billing.gatewaylog}</span></a></div>
                    {/if}
                </div>
            </div>

            <div class="ax-item" data-ax-key="support" data-ax-also="^(support|networkissues)">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.support.title}" data-ax-icon="support">
                    {include file="$template/aurox/icon.tpl" i="support"}<span class="ax-label">{$_ADMINLANG.support.title}</span>
                    {if !empty($auroxCounters.tickets)}<span class="ax-badge is-accent" title="Tickets awaiting reply">{$auroxCounters.tickets}</span>{/if}
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if in_array("List Support Tickets", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supporttickets.php" data-ax-words="awaiting reply queue"><span class="ax-label">{$_ADMINLANG.support.supporttickets}</span>{if !empty($auroxCounters.tickets)}<span class="ax-badge is-accent">{$auroxCounters.tickets}</span>{/if}</a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="supporttickets.php?view=flagged"><span class="ax-label">{$_ADMINLANG.support.flagged}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="supporttickets.php?view=active"><span class="ax-label">{$_ADMINLANG.support.allactive}</span></a></div>
                        {foreach $menuticketstatuses as $axTicketStatus}<div class="ax-item is-child"><a class="ax-link" href="supporttickets.php?view={$axTicketStatus|escape:'url'}"><span class="ax-label">{$axTicketStatus|escape}</span></a></div>{/foreach}
                    {/if}
                    {if in_array("Open New Ticket", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supporttickets.php?action=open" data-ax-words="create new ticket"><span class="ax-label">{$_ADMINLANG.support.opennewticket}</span></a></div>
                    {/if}
                    {if in_array("Support Center Overview", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supportcenter.php"><span class="ax-label">{$_ADMINLANG.support.supportoverview}</span></a></div>
                    {/if}
                    {if in_array("Manage Predefined Replies", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supportticketpredefinedreplies.php" data-ax-words="canned"><span class="ax-label">{$_ADMINLANG.support.predefreplies}</span></a></div>
                    {/if}
                    {if in_array("Manage Knowledgebase", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supportkb.php" data-ax-words="kb articles help"><span class="ax-label">{$_ADMINLANG.support.knowledgebase}</span></a></div>
                    {/if}
                    {if in_array("Manage Announcements", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supportannouncements.php" data-ax-words="news"><span class="ax-label">{$_ADMINLANG.support.announcements}</span></a></div>
                    {/if}
                    {if in_array("Manage Downloads", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="supportdownloads.php"><span class="ax-label">{$_ADMINLANG.support.downloads}</span></a></div>
                    {/if}
                    {if in_array("Manage Network Issues", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="networkissues.php" data-ax-words="status outage"><span class="ax-label">{$_ADMINLANG.networkissues.title}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="networkissues.php?view=scheduled" data-ax-words="maintenance"><span class="ax-label">{$_ADMINLANG.networkissues.scheduled}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="networkissues.php?view=resolved"><span class="ax-label">{$_ADMINLANG.networkissues.resolved}</span></a></div>
                        <div class="ax-item is-child"><a class="ax-link" href="networkissues.php?action=manage" data-ax-words="new outage"><span class="ax-label">{$_ADMINLANG.networkissues.addnew}</span></a></div>
                    {/if}
                </div>
            </div>
        </div>

        {* ------------------------------------------------------------ *}
        <div class="ax-group">
            <div class="ax-section-title">Insights &amp; tools</div>

            {if in_array("View Reports", $admin_perms)}
                <div class="ax-item" data-ax-key="reports" data-ax-also="^reports">
                    <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.reports.title}" data-ax-icon="chart">
                        {include file="$template/aurox/icon.tpl" i="chart"}<span class="ax-label">{$_ADMINLANG.reports.title}</span>
                        {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                    </button>
                    <div class="ax-sub">
                        <div class="ax-item"><a class="ax-link" href="reports.php"><span class="ax-label">All reports</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=daily_performance"><span class="ax-label">Daily performance</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=income_forecast"><span class="ax-label">Income forecast</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=annual_income_report"><span class="ax-label">Annual income</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=new_customers"><span class="ax-label">New customers</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=ticket_feedback_scores"><span class="ax-label">Ticket feedback</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="reports.php?report=pdf_batch"><span class="ax-label">Batch invoice PDFs</span></a></div>
                    </div>
                </div>
            {/if}

            <div class="ax-item" data-ax-key="utilities" data-ax-also="^(utilities|calendar|todolist|whois|automationstatus|modulequeue|systemdatabase|systemcleanup|systemphpinfo|systemintegrationcode|update|whmcsconnect|sitejet|phpcompat)">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.utilities.title}" data-ax-icon="grid">
                    {include file="$template/aurox/icon.tpl" i="grid"}<span class="ax-label">{$_ADMINLANG.utilities.title}</span>
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if in_array("WHMCSConnect", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="whmcsconnect.php" data-ax-words="connect remote installations"><span class="ax-label">{$_ADMINLANG.whmcsConnect.whmcsConnectName}</span></a></div>
                    {/if}
                    {if in_array('Apps and Integrations', $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-utilities-sitejet-builder-index')}" data-ax-words="website builder sitejet"><span class="ax-label">{$_ADMINLANG.utilities.sitejetBuilder.title}</span></a></div>
                    {/if}
                    {if in_array("Calendar", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="calendar.php"><span class="ax-label">{$_ADMINLANG.utilities.calendar}</span></a></div>
                    {/if}
                    {if in_array("To-Do List", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="todolist.php" data-ax-words="tasks"><span class="ax-label">{$_ADMINLANG.utilities.todolist}</span></a></div>
                    {/if}
                    {if in_array("WHOIS Lookups", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="whois.php" data-ax-words="domain lookup"><span class="ax-label">{$_ADMINLANG.utilities.whois}</span></a></div>
                    {/if}
                    {if in_array("Domain Resolver Checker", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="utilitiesresolvercheck.php" data-ax-words="dns"><span class="ax-label">{$_ADMINLANG.utilities.domainresolver}</span></a></div>
                    {/if}
                    {if in_array("Mass Mail", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-utilities-tools-email-campaigns')}" data-ax-words="newsletter mass mail"><span class="ax-label">{lang key='utilities.emailCampaigns.title'}</span></a></div>
                    {/if}
                    {if in_array("Email Marketer", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="utilitiesemailmarketer.php"><span class="ax-label">{$_ADMINLANG.utilities.emailmarketer}</span></a></div>
                    {/if}
                    {if in_array("Link Tracking", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="utilitieslinktracking.php"><span class="ax-label">{$_ADMINLANG.utilities.linktracking}</span></a></div>
                    {/if}
                    {if in_array("Configure Domain Pricing", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-utilities-tools-tld-import-step-one')}" data-ax-words="tld sync"><span class="ax-label">{$_ADMINLANG.utilities.tldImport}</span></a></div>
                    {/if}
                    {if in_array("View Integration Code", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="systemintegrationcode.php"><span class="ax-label">{$_ADMINLANG.utilities.integrationcode}</span></a></div>
                    {/if}
                    {if in_array("Automation Status", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="automationstatus.php" data-ax-words="cron"><span class="ax-label">{$_ADMINLANG.utilities.automationStatus}</span></a></div>
                    {/if}
                    {if in_array("View Module Queue", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="modulequeue.php" data-ax-words="failed"><span class="ax-label">{$_ADMINLANG.utilities.moduleQueue}</span></a></div>
                    {/if}
                    {if in_array("Database Status", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="systemdatabase.php"><span class="ax-label">{$_ADMINLANG.utilities.dbstatus}</span></a></div>
                    {/if}
                    {if in_array("System Cleanup Operations", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="systemcleanup.php"><span class="ax-label">{$_ADMINLANG.utilities.syscleanup}</span></a></div>
                    {/if}
                    {if in_array("View PHP Info", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="systemphpinfo.php"><span class="ax-label">{$_ADMINLANG.utilities.phpinfo}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-utilities-system-phpcompat')}" data-ax-words="php version compatibility"><span class="ax-label">{$_ADMINLANG.utilities.phpcompat}</span></a></div>
                    {/if}
                    {if in_array("Update WHMCS", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="update.php" data-ax-words="upgrade"><span class="ax-label">{$_ADMINLANG.update.title}</span></a></div>
                    {/if}
                </div>
            </div>

            {if in_array("View Activity Log", $admin_perms) || in_array("View Admin Log", $admin_perms) || in_array("View Module Debug Log", $admin_perms) || in_array("View Email Message Log", $admin_perms) || in_array("View Ticket Mail Import Log", $admin_perms) || in_array("View WHOIS Lookup Log", $admin_perms)}
                <div class="ax-item" data-ax-key="logs" data-ax-also="^(system(activity|admin|email|whois)log|logs)">
                    <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.utilities.logs}" data-ax-icon="list">
                        {include file="$template/aurox/icon.tpl" i="list"}<span class="ax-label">{$_ADMINLANG.utilities.logs}</span>
                        {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                    </button>
                    <div class="ax-sub">
                        {if in_array("View Activity Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="systemactivitylog.php" data-ax-words="history errors"><span class="ax-label">{$_ADMINLANG.utilities.activitylog}</span></a></div>
                        {/if}
                        {if in_array("View Admin Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="systemadminlog.php" data-ax-words="staff logins"><span class="ax-label">{$_ADMINLANG.utilities.adminlog}</span></a></div>
                        {/if}
                        {if in_array("View Module Debug Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="{routePath('admin-logs-module-log')}" data-ax-words="debug api"><span class="ax-label">{$_ADMINLANG.utilities.modulelog}</span></a></div>
                        {/if}
                        {if in_array("View Email Message Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="systememaillog.php" data-ax-words="sent mail"><span class="ax-label">{$_ADMINLANG.utilities.emaillog}</span></a></div>
                        {/if}
                        {if in_array("View Ticket Mail Import Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="{routePath('admin-logs-mail-import-log')}" data-ax-words="piping"><span class="ax-label">{$_ADMINLANG.utilities.ticketmaillog}</span></a></div>
                        {/if}
                        {if in_array("View WHOIS Lookup Log", $admin_perms)}
                            <div class="ax-item"><a class="ax-link" href="systemwhoislog.php"><span class="ax-label">{$_ADMINLANG.utilities.whoislog}</span></a></div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>

        {* ------------------------------------------------------------ *}
        <div class="ax-group">
            <div class="ax-section-title">Configure</div>

            <div class="ax-item" data-ax-key="addons" data-ax-also="^addonmodules">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.utilities.addonmodules}" data-ax-icon="box">
                    {include file="$template/aurox/icon.tpl" i="box"}<span class="ax-label">{$_ADMINLANG.utilities.addonmodules}</span>
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {foreach from=$addon_modules key=module item=displayname}
                        <div class="ax-item"><a class="ax-link" href="addonmodules.php?module={$module}"><span class="ax-label">{$displayname}</span></a></div>
                    {foreachelse}
                        <div class="ax-item"><a class="ax-link" href="https://marketplace.whmcs.com" target="_blank" rel="noopener" data-ax-words="buy modules"><span class="ax-label">Visit WHMCS Marketplace</span></a></div>
                    {/foreach}
                    <div class="ax-item"><a class="ax-link" href="{routePath('admin-apps-index')}" data-ax-words="marketplace integrations"><span class="ax-label">{$_ADMINLANG.setup.appsAndIntegrations}</span></a></div>
                </div>
            </div>

            <div class="ax-item" data-ax-key="setup" data-ax-also="^(config|setup|systemhealthandupdates|marketconnect|apps)">
                <button type="button" class="ax-link" data-ax-toggle="1" aria-expanded="false" data-tip="{$_ADMINLANG.setup.config}" data-ax-icon="sliders">
                    {include file="$template/aurox/icon.tpl" i="sliders"}<span class="ax-label">{$_ADMINLANG.setup.config}</span>
                    {include file="$template/aurox/icon.tpl" i="chev" c="ax-chev"}
                </button>
                <div class="ax-sub">
                    {if $hasSetupMenuAccess}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-setup-index')}" data-ax-words="all settings"><span class="ax-label">System settings</span></a></div>
                    {/if}
                    {if in_array("Configure General Settings", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="configgeneral.php" data-ax-words="company name localisation"><span class="ax-label">{$_ADMINLANG.setup.general}</span></a></div>
                    {/if}
                    {if $hasSetupMenuAccess}
                        <div class="ax-item"><a class="ax-link" href="configproducts.php" data-ax-words="packages plans"><span class="ax-label">{$_ADMINLANG.setup.products}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configdomains.php" data-ax-words="tld"><span class="ax-label">{$_ADMINLANG.setup.domainpricing}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configservers.php" data-ax-words="cpanel plesk directadmin"><span class="ax-label">{$_ADMINLANG.setup.servers}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configgateways.php" data-ax-words="payments flutterwave paypal stripe"><span class="ax-label">{$_ADMINLANG.setup.gateways}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-setup-payments-tax-index')}" data-ax-words="vat"><span class="ax-label">{$_ADMINLANG.setup.tax}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configpromotions.php" data-ax-words="coupons discounts"><span class="ax-label">{$_ADMINLANG.setup.promos}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configemailtemplates.php" data-ax-words="mail"><span class="ax-label">{$_ADMINLANG.setup.emailtpls}</span></a></div>
                        <div class="ax-item"><a class="ax-link" href="configaddonmods.php" data-ax-words="activate modules"><span class="ax-label">{$_ADMINLANG.setup.addonmodules}</span></a></div>
                    {/if}
                    <div class="ax-item"><a class="ax-link" href="{routePath('admin-apps-index')}"><span class="ax-label">{$_ADMINLANG.setup.appsAndIntegrations}</span></a></div>
                    {if in_array("Configure Administrators", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="configadmins.php" data-ax-words="staff users"><span class="ax-label">{$_ADMINLANG.setup.admins}</span></a></div>
                    {/if}
                    {if in_array("Health and Updates", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="systemhealthandupdates.php" data-ax-words="status update"><span class="ax-label">System health</span></a></div>
                    {/if}
                    {if in_array("Configure General Settings", $admin_perms)}
                        <div class="ax-item"><a class="ax-link" href="{routePath('admin-getting-started-index')}" data-ax-words="wizard"><span class="ax-label">Setup wizard</span></a></div>
                    {/if}
                </div>
            </div>
        </div>
        {* ------------------------------------------------------------ *}
        <div class="ax-group ax-your-links">
            <div class="ax-section-title">Your links</div>
            {include file="$template/menulinks.tpl"}
        </div>
    </nav>

    <div class="ax-foot">
        <a class="ax-avatar" href="myaccount.php" title="{$_ADMINLANG.global.myaccount}">
            {include file="$template/aurox/icon.tpl" i="user"}
            <img src="https://www.gravatar.com/avatar/{$gravatarHash}?s=64&d=404" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">
        </a>
        <div class="ax-me">
            <b>{$adminFullName}</b>
            <span class="ax-me-links"><a href="myaccount.php">{$_ADMINLANG.global.myaccount}</a><a href="logout.php">{$_ADMINLANG.global.logout}</a></span>
        </div>
        <button type="button" class="ax-icon-btn" data-ax-action="mode" aria-label="Switch light or dark" title="Light / dark">{include file="$template/aurox/icon.tpl" i="moon"}</button>
        <button type="button" class="ax-icon-btn" data-ax-action="help" aria-label="Keyboard shortcuts" title="Keyboard shortcuts  ?">{include file="$template/aurox/icon.tpl" i="keyboard"}</button>
        <button type="button" class="ax-icon-btn" data-ax-action="collapse" aria-label="Collapse menu" title="Collapse menu  [">{include file="$template/aurox/icon.tpl" i="collapse"}</button>
    </div>
</aside>
