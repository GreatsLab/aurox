/*!
 * Aurox Admin Theme for WHMCS
 * Sidebar navigation, command palette, keyboard shortcuts, pins, recents
 * and light/dark switching for the WHMCS admin area.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 */
(function (window, document) {
  'use strict';

  var root = document.documentElement;
  if (window.AuroxUI || root.getAttribute('data-aurox') === 'off' || !root.classList.contains('aurox')) {
    return;
  }

  var CFG = window.AuroxAdminConfig || {};
  if (window.console && console.info) {
    console.info('%cAurox Admin ' + (CFG.version || '') + '%c by Chimnadindu Great Chibueze · https://github.com/GreatsLab/aurox', 'font-weight:700;color:#2f6bff', 'color:inherit');
  }
  var EXTRA_COMMANDS = [];   // functions returning palette items (used by aurox-tools.js)
  var KEY_ACTIONS = {};      // single-key shortcuts added by extensions
  var EXTRA_SHORTCUTS = [];  // rows added to the ? help window
  var ADMIN = CFG.adminPath || guessAdminPath();
  var FRAMED = root.classList.contains('ax-framed');
  var COUNTS = CFG.counters || {};
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var MOD = isMac ? '⌘' : 'Ctrl';

  /* ---------------------------------------------------------------- */
  /* Storage                                                           */
  /* ---------------------------------------------------------------- */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem('aurox:' + key);
        if (raw === null) { return fallback; }
        try { return JSON.parse(raw); } catch (e) { return raw; }
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem('aurox:' + key, typeof value === 'string' ? value : JSON.stringify(value)); } catch (e) {}
    },
    del: function (key) {
      try { window.localStorage.removeItem('aurox:' + key); } catch (e) {}
    }
  };

  /* ---------------------------------------------------------------- */
  /* Icons (24px stroke icons, drawn for this theme)                   */
  /* ---------------------------------------------------------------- */
  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7.5H6.3"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    support: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 4 4M14.4 14.4l4 4M18.4 5.6l-4 4M9.6 14.4l-4 4"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V7M16 16v-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    collapse: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
    expand: '<path d="m13 17 5-5-5-5M6 17l5-5-5-5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17.5 10h.01M7 14h10"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    hash: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.9M12 17h.01"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkcircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    wallet: '<path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H6a2 2 0 0 0 0 4h13a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6"/><path d="M16 14h.01"/>',
    login: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="m9 17 5-5-5-5M14 12H4"/>',
    userplus: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M19 8v6M16 11h6"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
    merge: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10M6 9c0 3 3 3 6 3h4"/>',
    upload: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    phone: '<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.3M8.2 13.2l7.6 4.3"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    arrowright: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevdown: '<path d="m6 9 6 6 6-6"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    bin: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14 21l-4-7-7-4z"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'
  };

  var MARK = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="axg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--ax-accent) 78%, #fff)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--ax-accent) 82%, #000)"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#axg)"/><path d="M20 46 32 16l12 30M24.5 35h15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 40c6 9 30 12 44-6" fill="none" stroke="#bcd3ff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/><circle cx="54" cy="34" r="3.5" fill="#fff"/></svg>';

  /* Every icon carries the ax-svg class and a size, so it can never blow up
     to full width (even if a stylesheet hasn't loaded yet). */
  function icon(name, cls) {
    var span = document.createElement('span');
    span.innerHTML = '<svg class="ax-svg' + (cls ? ' ' + cls : '') + '" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.link) + '</svg>';
    return span.firstChild;
  }

  /* Replace the icon inside a button (works for server-rendered markup too). */
  function swapIcon(btn, name) {
    var old = btn.querySelector('svg');
    var fresh = icon(name);
    if (old && old.parentNode) {
      if (old.getAttribute('class')) { fresh.setAttribute('class', old.getAttribute('class')); }
      old.parentNode.replaceChild(fresh, old);
    } else { btn.insertBefore(fresh, btn.firstChild); }
    return fresh;
  }

  /* Tiny element builder. Text is always set with textContent (no HTML injection). */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) { return; }
        if (k === 'text') { node.textContent = v; }
        else if (k === 'class') { node.className = v; }
        else if (k.indexOf('on') === 0) { node.addEventListener(k.slice(2), v); }
        else { node.setAttribute(k, v === true ? '' : v); }
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) { return; }
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ---------------------------------------------------------------- */
  /* Navigation map (standard WHMCS 8 admin URLs)                      */
  /* ---------------------------------------------------------------- */
  var NAV = [
    { section: 'Workspace', items: [
      { label: 'Dashboard', icon: 'home', url: 'index.php', keys: 'g d', words: 'home overview' },
      { label: 'Clients', icon: 'users', url: 'clients.php', keys: 'g c', also: /^clients/, children: [
        { label: 'All clients', url: 'clients.php' },
        { label: 'Add new client', url: 'clientsadd.php', keys: 'n c', words: 'create customer' },
        { label: 'Products / services', url: 'clientshostinglist.php', keys: 'g s', words: 'hosting accounts vps' },
        { label: 'Domains', url: 'clientsdomainlist.php', words: 'domain names' },
        { label: 'Service addons', url: 'clientsaddonslist.php' },
        { label: 'Cancellation requests', url: 'cancelrequests.php', badge: 'cancellations', tone: 'warn' }
      ] },
      { label: 'Orders', icon: 'cart', url: 'orders.php', keys: 'g o', also: /^orders/, badge: 'orders', tone: 'warn', children: [
        { label: 'All orders', url: 'orders.php' },
        { label: 'Pending orders', url: 'orders.php?status=Pending', badge: 'orders', tone: 'warn' },
        { label: 'Add new order', url: 'ordersadd.php', keys: 'n o', words: 'create' }
      ] },
      { label: 'Billing', icon: 'receipt', url: 'invoices.php', keys: 'g i', also: /^(invoices|transactions|quotes|billableitems|gatewaylog|offlineccprocessing)/, badge: 'overdue', tone: 'hot', children: [
        { label: 'Invoices', url: 'invoices.php' },
        { label: 'Unpaid invoices', url: 'invoices.php?status=Unpaid', badge: 'unpaid' },
        { label: 'Overdue invoices', url: 'invoices.php?status=Overdue', badge: 'overdue', tone: 'hot' },
        { label: 'Transactions', url: 'transactions.php', words: 'payments' },
        { label: 'Quotes', url: 'quotes.php', words: 'estimates' },
        { label: 'Billable items', url: 'billableitems.php' },
        { label: 'Gateway log', url: 'gatewaylog.php', words: 'payment errors callbacks' }
      ] },
      { label: 'Support', icon: 'support', url: 'supporttickets.php', keys: 'g t', also: /^(support|networkissues)/, badge: 'tickets', tone: 'accent', children: [
        { label: 'Tickets', url: 'supporttickets.php', badge: 'tickets', tone: 'accent' },
        { label: 'Open new ticket', url: 'supporttickets.php?action=open', keys: 'n t', words: 'create' },
        { label: 'Predefined replies', url: 'supportticketpredefinedreplies.php', words: 'canned' },
        { label: 'Announcements', url: 'supportannouncements.php', words: 'news' },
        { label: 'Knowledgebase', url: 'supportkb.php', words: 'kb articles help' },
        { label: 'Downloads', url: 'supportdownloads.php' },
        { label: 'Network issues', url: 'networkissues.php', words: 'status outage' }
      ] }
    ] },
    { section: 'Insights', items: [
      { label: 'Reports', icon: 'chart', url: 'reports.php', keys: 'g r', also: /^reports/, words: 'statistics income' },
      { label: 'Utilities', icon: 'grid', url: 'systemactivitylog.php', also: /^(system|utilities|calendar|todolist|whois|automationstatus|logs)/, children: [
        { label: 'Calendar', url: 'calendar.php' },
        { label: 'To-do list', url: 'todolist.php', words: 'tasks' },
        { label: 'WHOIS lookup', url: 'whois.php', words: 'domain' },
        { label: 'Activity log', url: 'systemactivitylog.php', words: 'logs history' },
        { label: 'Automation status', url: 'automationstatus.php', words: 'cron' },
        { label: 'System health', url: 'systemhealthandupdates.php', words: 'updates' }
      ] }
    ] },
    { section: 'Configure', items: [
      { label: 'Addons', icon: 'box', url: 'addonmodules.php', also: /^addonmodules/, words: 'modules extensions' },
      { label: 'Setup', icon: 'sliders', url: 'configgeneral.php', keys: 'g ,', also: /^config/, words: 'settings configuration', children: [
        { label: 'General settings', url: 'configgeneral.php', words: 'company name system' },
        { label: 'Apps & integrations', url: 'index.php?rp=/admin/apps', words: 'marketplace' },
        { label: 'Products / services', url: 'configproducts.php', words: 'packages plans' },
        { label: 'Product addons', url: 'configaddons.php' },
        { label: 'Domain pricing', url: 'configdomains.php', words: 'tld' },
        { label: 'Domain registrars', url: 'configregistrars.php' },
        { label: 'Servers', url: 'configservers.php', words: 'cpanel plesk directadmin' },
        { label: 'Payment gateways', url: 'configgateways.php', words: 'paypal stripe flutterwave' },
        { label: 'Currencies', url: 'configcurrencies.php' },
        { label: 'Tax configuration', url: 'configtax.php', words: 'vat' },
        { label: 'Promotions', url: 'configpromotions.php', words: 'coupons discounts' },
        { label: 'Email templates', url: 'configemailtemplates.php', words: 'mail' },
        { label: 'Ticket departments', url: 'configticketdepartments.php' },
        { label: 'Automation settings', url: 'configautomation.php', words: 'cron' },
        { label: 'Administrators', url: 'configadmins.php', words: 'staff users' },
        { label: 'Administrator roles', url: 'configadminroles.php', words: 'permissions' },
        { label: 'Addon modules', url: 'configaddonmods.php', words: 'activate' },
        { label: 'Client groups', url: 'configclientgroups.php' },
        { label: 'Custom client fields', url: 'configcustomfields.php' },
        { label: 'Fraud protection', url: 'configfraud.php' }
      ] }
    ] }
  ];

  var QUICK = [
    { label: 'New client', url: 'clientsadd.php', keys: 'n c', icon: 'plus' },
    { label: 'New order', url: 'ordersadd.php', keys: 'n o', icon: 'plus' },
    { label: 'Open a new ticket', url: 'supporttickets.php?action=open', keys: 'n t', icon: 'plus' },
    { label: 'New quote', url: 'quotes.php?action=manage', icon: 'plus' },
    { label: 'New announcement', url: 'supportannouncements.php?action=manage', icon: 'plus' }
  ];

  var JUMPS = [
    { key: 'c', words: ['c', 'client', 'clients', 'customer', 'user'], label: 'Client', url: 'clientssummary.php?userid=' },
    { key: 'i', words: ['i', 'inv', 'invoice', 'invoices'], label: 'Invoice', url: 'invoices.php?action=edit&id=' },
    { key: 'o', words: ['o', 'order', 'orders'], label: 'Order', url: 'orders.php?action=view&id=' },
    { key: 't', words: ['t', 'ticket', 'tickets'], label: 'Ticket (internal ID)', url: 'supporttickets.php?action=view&id=' },
    { key: 's', words: ['s', 'service', 'services', 'hosting'], label: 'Service', url: 'clientsservices.php?id=' },
    { key: 'd', words: ['d', 'domain', 'domains'], label: 'Domain', url: 'clientsdomains.php?id=' }
  ];

  /* ---------------------------------------------------------------- */
  /* URL helpers                                                       */
  /* ---------------------------------------------------------------- */
  function guessAdminPath() {
    var p = window.location.pathname;
    return p.slice(0, p.lastIndexOf('/') + 1);
  }

  function resolve(url) {
    if (/^(https?:)?\/\//i.test(url) || url.charAt(0) === '/') { return url; }
    return ADMIN + url;
  }

  function parse(url) {
    var a = document.createElement('a');
    a.href = resolve(url);
    var file = a.pathname.replace(/\/+$/, '');
    var page = file.slice(file.lastIndexOf('/') + 1) || 'index.php';
    var params = {};
    a.search.replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) { return; }
      var bits = pair.split('=');
      try { params[decodeURIComponent(bits[0])] = decodeURIComponent((bits[1] || '').replace(/\+/g, ' ')); } catch (e) {}
    });
    return { page: page.toLowerCase(), params: params };
  }

  var HERE = parse(CFG.demoUrl || window.location.href); // demoUrl is only used by docs/preview.html

  /* How well a nav URL matches the page we are on (0 = no match). */
  function matchScore(url) {
    var target = parse(url);
    if (target.page !== HERE.page) { return 0; }
    var keys = Object.keys(target.params);
    if (!keys.length) {
      // index.php with ?rp=... is a different page from the dashboard.
      return HERE.params.rp ? 0 : 5;
    }
    for (var i = 0; i < keys.length; i++) {
      if ((HERE.params[keys[i]] || '').toLowerCase() !== target.params[keys[i]].toLowerCase()) { return 0; }
    }
    return 10 + keys.length;
  }

  function currentUrl() {
    return window.location.pathname + window.location.search;
  }

  function pageTitle() {
    var h1 = document.querySelector('#contentarea h1, .contentarea h1, .content h1, h1');
    var t = h1 ? (h1.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (!t || t.length > 70) {
      t = (document.title || '').replace(/\s*[-|–]\s*WHMCS.*$/i, '').replace(/^WHMCS\s*[-|–]\s*/i, '').trim();
    }
    return t || 'Untitled page';
  }

  function go(url, newTab) {
    var target = resolve(url);
    if (newTab) { window.open(target, '_blank', 'noopener'); }
    else { window.location.href = target; }
  }

  /* ---------------------------------------------------------------- */
  /* Theme preferences                                                 */
  /* ---------------------------------------------------------------- */
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function effectiveMode(pref) {
    if (pref === 'system') { return media && media.matches ? 'dark' : 'light'; }
    return pref === 'dark' ? 'dark' : 'light';
  }
  function setMode(pref) {
    store.set('mode', pref);
    root.setAttribute('data-ax-mode', effectiveMode(pref));
    refreshModeButtons();
    toast(pref === 'system' ? 'Theme follows your device' : (pref === 'dark' ? 'Dark theme on' : 'Light theme on'));
  }
  function toggleMode() {
    setMode(root.getAttribute('data-ax-mode') === 'dark' ? 'light' : 'dark');
  }
  if (media && media.addEventListener) {
    media.addEventListener('change', function () {
      if ((store.get('mode', null) || 'system') === 'system') { root.setAttribute('data-ax-mode', effectiveMode('system')); refreshModeButtons(); }
    });
  }

  function setDensity(value) {
    store.set('density', value);
    root.setAttribute('data-ax-density', value);
    toast(value === 'compact' ? 'Compact density' : 'Comfortable density');
  }

  function toggleCollapsed() {
    var on = !root.classList.contains('ax-collapsed');
    root.classList.toggle('ax-collapsed', on);
    store.set('collapsed', on ? '1' : '0');
    var btn = document.querySelector('#ax-sidebar [data-ax-action="collapse"]');
    if (btn) {
      swapIcon(btn, on ? 'expand' : 'collapse');
      btn.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
      btn.setAttribute('title', on ? 'Expand sidebar  [' : 'Collapse sidebar  [');
    }
  }

  function turnOff() {
    store.set('off', '1');
    toast('Switching to the stock look… add ?aurox=on to a URL to come back');
    setTimeout(function () { window.location.reload(); }, 900);
  }

  function resetAll() {
    ['pins', 'recent', 'mode', 'density', 'collapsed', 'open'].forEach(store.del);
    toast('Your Aurox preferences were reset');
    setTimeout(function () { window.location.reload(); }, 700);
  }

  /* ---------------------------------------------------------------- */
  /* Pins and recents                                                  */
  /* ---------------------------------------------------------------- */
  function pins() { var p = store.get('pins', []); return Array.isArray(p) ? p : []; }
  function isPinned(url) { return pins().some(function (p) { return p.u === url; }); }

  function togglePin() {
    var url = currentUrl();
    var list = pins();
    if (isPinned(url)) {
      list = list.filter(function (p) { return p.u !== url; });
      toast('Unpinned');
    } else {
      list.unshift({ t: pageTitle(), u: url });
      list = list.slice(0, 12);
      toast('Pinned to your sidebar');
    }
    store.set('pins', list);
    renderPins();
  }

  function removePin(url) {
    store.set('pins', pins().filter(function (p) { return p.u !== url; }));
    renderPins();
  }

  function trackRecent() {
    if (FRAMED || /logout\.php$/i.test(window.location.pathname)) { return; }
    var url = currentUrl();
    var list = store.get('recent', []);
    if (!Array.isArray(list)) { list = []; }
    list = list.filter(function (r) { return r.u !== url; });
    list.unshift({ t: pageTitle(), u: url, at: Date.now() });
    store.set('recent', list.slice(0, 10));
  }

  /* ---------------------------------------------------------------- */
  /* Sidebar                                                           */
  /* ---------------------------------------------------------------- */
  var sidebar, pinsBox, tipEl;

  function badgeFor(item) {
    if (!item.badge) { return null; }
    var n = parseInt(COUNTS[item.badge], 10);
    if (!n) { return null; }
    return h('span', { class: 'ax-badge' + (item.tone ? ' is-' + item.tone : ''), text: n > 999 ? '999+' : String(n), title: n + ' ' + item.label.toLowerCase() });
  }

  function findActive() {
    var best = { score: 0, item: null, parent: null };
    NAV.forEach(function (sec) {
      sec.items.forEach(function (item) {
        var s = matchScore(item.url);
        if (s > best.score) { best = { score: s, item: item, parent: null }; }
        (item.children || []).forEach(function (child) {
          var cs = matchScore(child.url);
          if (cs > best.score || (cs && cs === best.score && !best.parent)) { best = { score: cs, item: child, parent: item }; }
        });
      });
    });
    if (!best.item) {
      // Fall back to the section a page belongs to (e.g. clientssummary.php -> Clients).
      NAV.forEach(function (sec) {
        sec.items.forEach(function (item) {
          if (!best.item && item.also && item.also.test(HERE.page)) { best = { score: 1, item: item, parent: null }; }
        });
      });
    }
    return best;
  }

  function buildSidebar() {
    var server = document.getElementById('ax-sidebar');
    if (server && server.hasAttribute('data-ax-server')) { hydrateSidebar(server); }
    else { buildClientSidebar(); }
    wireSidebar();
  }

  /* Template mode: WHMCS already rendered the menu (permission-aware). Bring it to life. */
  function hydrateSidebar(sb) {
    sidebar = sb;
    pinsBox = sb.querySelector('.ax-pins');

    // Drop groups the admin has no permission for (nothing inside them).
    Array.prototype.forEach.call(sb.querySelectorAll('.ax-sub'), function (sub) {
      if (!sub.querySelector('a')) { var it = sub.parentNode; if (it && it.parentNode) { it.parentNode.removeChild(it); } }
    });
    Array.prototype.forEach.call(sb.querySelectorAll('.ax-nav > .ax-group'), function (g) {
      if (!g.classList.contains('ax-pins') && !g.querySelector('.ax-item')) { g.parentNode.removeChild(g); }
    });

    // Highlight the page we are on.
    var best = { score: 0, a: null };
    Array.prototype.forEach.call(sb.querySelectorAll('.ax-nav a.ax-link[href]'), function (a) {
      if (a.closest('.ax-pins')) { return; }
      var sc = matchScore(a.getAttribute('href'));
      if (sc > best.score) { best = { score: sc, a: a }; }
    });
    var activeItem = best.a ? best.a.closest('.ax-item') : null;
    if (best.a) { best.a.setAttribute('aria-current', 'page'); }
    if (!activeItem) {
      Array.prototype.forEach.call(sb.querySelectorAll('.ax-item[data-ax-also]'), function (it) {
        if (activeItem) { return; }
        try { if (new RegExp(it.getAttribute('data-ax-also'), 'i').test(HERE.page)) { activeItem = it; } } catch (e) {}
      });
    }
    if (activeItem) {
      activeItem.classList.add('is-active');
      if (activeItem.querySelector(':scope > .ax-sub')) { activeItem.classList.add('is-open'); }
      var p = activeItem.parentNode ? activeItem.parentNode.closest('.ax-item') : null;
      while (p) { p.classList.add('is-active', 'is-open'); p = p.parentNode ? p.parentNode.closest('.ax-item') : null; }
    }

    // Restore groups the admin left open, and make group headers toggle.
    var openGroups = store.get('open', []);
    if (!Array.isArray(openGroups)) { openGroups = []; }
    Array.prototype.forEach.call(sb.querySelectorAll('.ax-item[data-ax-key]'), function (li) {
      var key = li.getAttribute('data-ax-key');
      var btn = li.querySelector(':scope > [data-ax-toggle]');
      if (!btn) { return; }
      if (openGroups.indexOf(key) !== -1) { li.classList.add('is-open'); }
      btn.setAttribute('aria-expanded', li.classList.contains('is-open') ? 'true' : 'false');
      btn.addEventListener('click', function () {
        if (root.classList.contains('ax-collapsed') && window.innerWidth >= 992) {
          var first = li.querySelector('.ax-sub a.ax-link');
          if (first) { window.location.href = first.href; }
          return;
        }
        var nowOpen = li.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        var saved = store.get('open', []);
        if (!Array.isArray(saved)) { saved = []; }
        saved = saved.filter(function (x) { return x !== key; });
        if (nowOpen) { saved.push(key); }
        store.set('open', saved);
      });
    });

    // Show the right shortcut key for this computer.
    var kbd = sb.querySelector('.ax-kbd-mod');
    if (kbd) { kbd.textContent = MOD + ' K'; }
    if (CFG.palette === false) { var sbtn = sb.querySelector('.ax-search'); if (sbtn) { sbtn.parentNode.removeChild(sbtn); } }
    if (CFG.shortcuts === false) { var hb = sb.querySelector('.ax-foot [data-ax-action="help"]'); if (hb) { hb.parentNode.removeChild(hb); } }

    // Your own links from the companion addon settings.
    var extra = Array.isArray(CFG.extraLinks) ? CFG.extraLinks : [];
    if (extra.length) {
      addSidebarGroup('Links', extra.map(function (l) {
        return { label: l.label, url: l.url, external: l.external, icon: l.external ? 'external' : 'link' };
      }));
    }
  }

  function buildClientSidebar() {
    var active = findActive();
    var openGroups = store.get('open', []);
    if (!Array.isArray(openGroups)) { openGroups = []; }

    var nav = h('nav', { class: 'ax-nav', 'aria-label': 'Admin navigation' });

    // Pinned
    pinsBox = h('div', { class: 'ax-group ax-pins' });
    nav.appendChild(pinsBox);

    NAV.forEach(function (sec) {
      var group = h('div', { class: 'ax-group' }, [h('div', { class: 'ax-section-title', text: sec.section })]);
      sec.items.forEach(function (item) {
        var isActiveParent = active.parent === item || (active.item === item);
        var li = h('div', { class: 'ax-item' + (isActiveParent ? ' is-active' : '') });
        var hasKids = item.children && item.children.length;
        var link;
        if (hasKids) {
          var open = isActiveParent || openGroups.indexOf(item.label) !== -1;
          if (open) { li.classList.add('is-open'); }
          link = h('button', { type: 'button', class: 'ax-link', 'aria-expanded': open ? 'true' : 'false', 'data-tip': item.label }, [
            icon(item.icon), h('span', { class: 'ax-label', text: item.label }), badgeFor(item), icon('chev', 'ax-chev')
          ]);
          link.addEventListener('click', function () {
            if (root.classList.contains('ax-collapsed') && window.innerWidth >= 992) { go(item.url); return; }
            var nowOpen = li.classList.toggle('is-open');
            link.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
            var saved = store.get('open', []);
            if (!Array.isArray(saved)) { saved = []; }
            saved = saved.filter(function (x) { return x !== item.label; });
            if (nowOpen) { saved.push(item.label); }
            store.set('open', saved);
          });
          li.appendChild(link);
          var sub = h('div', { class: 'ax-sub' });
          item.children.forEach(function (child) {
            sub.appendChild(h('div', { class: 'ax-item' + (active.item === child ? ' is-active' : '') }, [
              h('a', { class: 'ax-link', href: resolve(child.url), 'aria-current': active.item === child ? 'page' : null }, [
                h('span', { class: 'ax-label', text: child.label }), badgeFor(child)
              ])
            ]));
          });
          li.appendChild(sub);
        } else {
          li.appendChild(h('a', { class: 'ax-link', href: resolve(item.url), 'data-tip': item.label, 'aria-current': active.item === item ? 'page' : null }, [
            icon(item.icon), h('span', { class: 'ax-label', text: item.label }), badgeFor(item)
          ]));
        }
        group.appendChild(li);
      });
      nav.appendChild(group);
    });

    // Extra links from settings
    var extra = Array.isArray(CFG.extraLinks) ? CFG.extraLinks : [];
    if (extra.length) {
      var eg = h('div', { class: 'ax-group' }, [h('div', { class: 'ax-section-title', text: 'Links' })]);
      extra.forEach(function (l) {
        eg.appendChild(h('div', { class: 'ax-item' + (matchScore(l.url) ? ' is-active' : '') }, [
          h('a', { class: 'ax-link', href: resolve(l.url), target: l.external ? '_blank' : null, rel: l.external ? 'noopener' : null, 'data-tip': l.label }, [
            icon(l.external ? 'external' : 'link'), h('span', { class: 'ax-label', text: l.label })
          ])
        ]));
      });
      nav.appendChild(eg);
    }

    // Brand
    var logo = h('span', { class: 'ax-brand-logo' });
    if (CFG.logo) { logo.appendChild(h('img', { src: CFG.logo, alt: '' })); } else { logo.innerHTML = MARK; }
    var pinBtn = h('button', { type: 'button', class: 'ax-icon-btn', 'data-ax-action': 'pin' }, [icon('star')]);
    var brand = h('div', { class: 'ax-brand' }, [
      h('a', { href: resolve('index.php'), class: 'ax-brand-logo-link', 'aria-label': 'Dashboard' }, [logo]),
      h('span', { class: 'ax-brand-text' }, [
        h('span', { class: 'ax-brand-name', text: CFG.brand || 'WHMCS' }),
        h('span', { class: 'ax-brand-sub', text: 'Admin' })
      ]),
      pinBtn
    ]);

    var search = null;
    if (CFG.palette !== false) {
      search = h('button', { type: 'button', class: 'ax-search', 'data-ax-action': 'palette', 'data-tip': 'Search  ' + MOD + '+K' }, [
        icon('search'), h('span', { text: 'Jump to…' }), h('kbd', { text: MOD + ' K' })
      ]);
    }

    // Footer
    var me = CFG.admin || null;
    var initials = me && me.name ? me.name.split(/\s+/).map(function (p) { return p.charAt(0); }).join('').slice(0, 2).toUpperCase() : 'A';
    var collapsed = root.classList.contains('ax-collapsed');
    var foot = h('div', { class: 'ax-foot' }, [
      h('a', { class: 'ax-avatar', href: resolve('myaccount.php'), title: 'My account', text: initials }),
      h('div', { class: 'ax-me' }, [
        h('b', { text: me && me.name ? me.name : 'Administrator' }),
        h('span', { class: 'ax-me-links' }, [h('a', { href: resolve('myaccount.php'), text: 'My account' }), h('a', { href: resolve('logout.php'), text: 'Log out' })])
      ]),
      h('button', { type: 'button', class: 'ax-icon-btn', 'data-ax-action': 'mode', 'aria-label': 'Switch light or dark', title: 'Light / dark  ' + MOD + '+Shift+L' }, [icon('moon')]),
      CFG.shortcuts !== false ? h('button', { type: 'button', class: 'ax-icon-btn', 'data-ax-action': 'help', 'aria-label': 'Keyboard shortcuts', title: 'Keyboard shortcuts  ?' }, [icon('keyboard')]) : null,
      h('button', { type: 'button', class: 'ax-icon-btn', 'data-ax-action': 'collapse', 'aria-label': collapsed ? 'Expand sidebar' : 'Collapse sidebar', title: (collapsed ? 'Expand' : 'Collapse') + ' sidebar  [' }, [icon(collapsed ? 'expand' : 'collapse')])
    ]);

    sidebar = h('aside', { id: 'ax-sidebar', 'aria-label': 'Aurox navigation' }, [brand, search, nav, foot]);
    document.body.insertBefore(sidebar, document.body.firstChild);
  }

  function wireSidebar() {
    document.body.appendChild(h('div', { id: 'ax-scrim', onclick: closeDrawer }));
    document.body.appendChild(h('button', { id: 'ax-toggle', type: 'button', 'aria-label': 'Open navigation', onclick: openDrawer }, [icon('menu')]));

    renderPins();
    refreshModeButtons();

    // Keep the active link in view.
    var act = sidebar.querySelector('.ax-sub .is-active, .ax-item.is-active');
    if (act && act.scrollIntoView) { try { act.scrollIntoView({ block: 'nearest' }); } catch (e) {} }

    // Close the drawer after navigating on small screens.
    sidebar.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a.ax-link') : null;
      if (a) { closeDrawer(); }
    });

    // Tooltips for the collapsed icon rail.
    sidebar.addEventListener('mouseover', function (e) {
      if (!root.classList.contains('ax-collapsed') || window.innerWidth < 992) { return; }
      var t = e.target.closest ? e.target.closest('[data-tip]') : null;
      if (!t) { return; }
      showTip(t, t.getAttribute('data-tip'));
    });
    sidebar.addEventListener('mouseout', hideTip);
  }

  /* Add a section of buttons/links to the sidebar (used by extensions). */
  function addSidebarGroup(title, items, cls) {
    if (!sidebar) { return null; }
    var nav = sidebar.querySelector('.ax-nav');
    var group = h('div', { class: 'ax-group' + (cls ? ' ' + cls : '') }, [h('div', { class: 'ax-section-title', text: title })]);
    items.forEach(function (it) {
      var inner = [icon(it.icon), h('span', { class: 'ax-label', text: it.label }), it.badge ? h('span', { class: 'ax-badge is-accent', text: String(it.badge) }) : null];
      var node = it.url
        ? h('a', { class: 'ax-link', href: resolve(it.url), 'data-tip': it.tip || it.label, title: it.hint || null, target: it.external ? '_blank' : null, rel: it.external ? 'noopener' : null }, inner)
        : h('button', { type: 'button', class: 'ax-link', 'data-tip': it.tip || it.label, title: it.hint || null, 'data-ax-action': it.action || null, onclick: it.onClick || null }, inner);
      group.appendChild(h('div', { class: 'ax-item', id: it.id || null }, [node]));
    });
    nav.appendChild(group);
    return group;
  }

  function renderPins() {
    if (!pinsBox) { return; }
    pinsBox.textContent = '';
    var list = pins();
    var here = currentUrl();
    pinsBox.appendChild(h('div', { class: 'ax-section-title', text: 'Pinned' }));
    if (!list.length) {
      pinsBox.appendChild(h('div', { class: 'ax-empty', text: 'Tap the star at the top to pin the page you are on.' }));
    }
    list.forEach(function (p) {
      pinsBox.appendChild(h('div', { class: 'ax-item' + (p.u === here ? ' is-active' : '') }, [
        h('a', { class: 'ax-link', href: p.u, 'data-tip': p.t }, [icon('star'), h('span', { class: 'ax-label', text: p.t })]),
        h('button', { type: 'button', class: 'ax-pin-remove', 'aria-label': 'Unpin ' + p.t, onclick: function () { removePin(p.u); } }, [icon('x')])
      ]));
    });
    var star = sidebar && sidebar.querySelector('[data-ax-action="pin"]');
    if (star) {
      var on = isPinned(here);
      star.classList.toggle('is-on', on);
      star.setAttribute('aria-label', on ? 'Unpin this page' : 'Pin this page');
      star.setAttribute('title', on ? 'Unpin this page' : 'Pin this page');
      var svg = star.querySelector('svg');
      if (svg) { svg.setAttribute('fill', on ? 'currentColor' : 'none'); }
    }
  }

  function refreshModeButtons() {
    var dark = root.getAttribute('data-ax-mode') === 'dark';
    var nodes = document.querySelectorAll('#ax-sidebar [data-ax-action="mode"], .ax-tb-theme');
    for (var i = 0; i < nodes.length; i++) {
      swapIcon(nodes[i], dark ? 'sun' : 'moon');
    }
  }

  function openDrawer() { root.classList.add('ax-open'); }
  function closeDrawer() { root.classList.remove('ax-open'); }

  function showTip(target, text) {
    if (!text) { return; }
    if (!tipEl) { tipEl = h('div', { class: 'ax-tip', role: 'tooltip' }); document.body.appendChild(tipEl); }
    tipEl.textContent = text;
    var r = target.getBoundingClientRect();
    tipEl.style.display = 'block';
    tipEl.style.left = (r.right + 10) + 'px';
    tipEl.style.top = (r.top + r.height / 2 - tipEl.offsetHeight / 2) + 'px';
  }
  function hideTip() { if (tipEl) { tipEl.style.display = 'none'; } }

  /* ---------------------------------------------------------------- */
  /* Toast                                                             */
  /* ---------------------------------------------------------------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = h('div', { class: 'ax-toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  /* ---------------------------------------------------------------- */
  /* Command palette                                                   */
  /* ---------------------------------------------------------------- */
  var pal = null;

  function collectItems() {
    var items = [];
    pins().forEach(function (p) { items.push({ group: 'Pinned', title: p.t, hint: 'Pinned page', icon: 'star', url: p.u }); });
    var recent = store.get('recent', []);
    (Array.isArray(recent) ? recent : []).forEach(function (r) {
      if (r.u !== currentUrl()) { items.push({ group: 'Recent', title: r.t, hint: 'Visited ' + ago(r.at), icon: 'clock', url: r.u }); }
    });
    var newMenu = document.querySelectorAll('#ax-new-menu a[href]');
    if (newMenu.length) {
      Array.prototype.forEach.call(newMenu, function (a) {
        if (a.classList.contains('open-modal')) { return; }
        items.push({ group: 'Create', title: a.textContent.replace(/\s+/g, ' ').trim(), icon: 'plus', url: a.getAttribute('href') });
      });
    } else {
      QUICK.forEach(function (q) { items.push({ group: 'Create', title: q.label, icon: q.icon, url: q.url, keys: q.keys }); });
    }
    if (sidebar && sidebar.hasAttribute('data-ax-server')) {
      Array.prototype.forEach.call(sidebar.querySelectorAll('.ax-nav > .ax-group:not(.ax-pins):not(.ax-tools-group) a.ax-link[href]'), function (a) {
        var label = (a.querySelector('.ax-label') || a).textContent.replace(/\s+/g, ' ').trim();
        var sub = a.closest('.ax-sub');
        var parentLink = sub ? sub.parentNode.querySelector('.ax-link') : null;
        var parentLabel = parentLink ? (parentLink.querySelector('.ax-label') || parentLink).textContent.trim() : '';
        var section = a.closest('.ax-group').querySelector('.ax-section-title');
        // A filtered view ("Paid") is named after the page it filters ("Invoices").
        var item = a.closest('.ax-item'), pageLabel = '';
        if (item && item.classList.contains('is-child')) {
          for (var prev = item.previousElementSibling; prev; prev = prev.previousElementSibling) {
            if (prev.classList.contains('ax-item') && !prev.classList.contains('is-child')) {
              var pl = prev.querySelector('.ax-label'); if (pl) { pageLabel = pl.textContent.replace(/\s+/g, ' ').trim(); }
              break;
            }
          }
        }
        items.push({
          group: 'Go to', title: label, top: !sub,
          hint: pageLabel || parentLabel || (section ? section.textContent.trim() : ''),
          icon: (parentLink || a).getAttribute('data-ax-icon') || 'link',
          url: a.getAttribute('href'), words: (a.getAttribute('data-ax-words') || '') + ' ' + parentLabel + ' ' + pageLabel
        });
      });
    } else NAV.forEach(function (sec) {
      sec.items.forEach(function (item) {
        items.push({ group: 'Go to', title: item.label, hint: sec.section, icon: item.icon, url: item.url, keys: item.keys, words: item.words, top: true });
        (item.children || []).forEach(function (child) {
          if (child.url === item.url && child.label.indexOf('All') === 0) { return; }
          items.push({ group: 'Go to', title: child.label, hint: item.label, icon: item.icon, url: child.url, keys: child.keys, words: child.words });
        });
      });
    });
    (Array.isArray(CFG.extraLinks) ? CFG.extraLinks : []).forEach(function (l) {
      items.push({ group: 'Links', title: l.label, hint: l.url, icon: l.external ? 'external' : 'link', url: l.url, external: l.external });
    });
    var dark = root.getAttribute('data-ax-mode') === 'dark';
    items.push(
      { group: 'Settings', title: dark ? 'Switch to light theme' : 'Switch to dark theme', icon: dark ? 'sun' : 'moon', run: toggleMode, words: 'dark light mode night', keys: MOD + ' ⇧ L' },
      { group: 'Settings', title: 'Theme: follow my device', icon: 'zap', run: function () { setMode('system'); }, words: 'system auto' },
      { group: 'Settings', title: root.getAttribute('data-ax-density') === 'compact' ? 'Comfortable density' : 'Compact density (more rows)', icon: 'layers', run: function () { setDensity(root.getAttribute('data-ax-density') === 'compact' ? 'comfortable' : 'compact'); }, words: 'density spacing rows' },
      { group: 'Settings', title: isPinned(currentUrl()) ? 'Unpin this page' : 'Pin this page', icon: 'star', run: togglePin, words: 'favourite favorite bookmark' },
      { group: 'Settings', title: 'Collapse / expand sidebar', icon: 'collapse', run: toggleCollapsed, keys: '[' },
      { group: 'Settings', title: 'Keyboard shortcuts', icon: 'keyboard', run: openHelp, keys: '?' },
      { group: 'Settings', title: 'Aurox theme options', icon: 'sliders', url: 'addonmodules.php?module=auroxadmin', words: 'aurox' },
      CFG.template
        ? { group: 'Settings', title: 'Switch back to Blend', hint: 'Opens the Aurox Admin addon page', icon: 'power', url: 'addonmodules.php?module=auroxadmin', words: 'disable off blend default stock' }
        : { group: 'Settings', title: 'Use the stock WHMCS look (for me)', icon: 'power', run: turnOff, words: 'disable off blend default' },
      { group: 'Account', title: 'My account', icon: 'user', url: 'myaccount.php', words: 'profile password 2fa' },
      { group: 'Account', title: 'Log out', icon: 'logout', url: 'logout.php', words: 'sign out' }
    );
    EXTRA_COMMANDS.forEach(function (fn) {
      try { items = items.concat(fn() || []); } catch (e) {}
    });
    return items;
  }

  function ago(ts) {
    var s = Math.max(1, Math.round((Date.now() - (ts || Date.now())) / 1000));
    if (s < 60) { return 'just now'; }
    if (s < 3600) { return Math.round(s / 60) + ' min ago'; }
    if (s < 86400) { return Math.round(s / 3600) + ' h ago'; }
    return Math.round(s / 86400) + ' d ago';
  }

  /* Fuzzy match: returns { score, hits } or null. */
  function fuzzy(query, text) {
    var q = query.toLowerCase(), t = text.toLowerCase();
    if (!q) { return { score: 0, hits: [] }; }
    var direct = t.indexOf(q);
    if (direct !== -1) {
      var hits = [];
      for (var k = 0; k < q.length; k++) { hits.push(direct + k); }
      var atWord = direct === 0 || /\W/.test(t.charAt(direct - 1));
      return { score: 100 - direct + (atWord ? 40 : 0) + q.length * 2, hits: hits };
    }
    var ti = 0, score = 0, prev = -2, out = [];
    for (var i = 0; i < q.length; i++) {
      var c = q.charAt(i);
      if (c === ' ') { continue; }
      var found = t.indexOf(c, ti);
      if (found === -1) { return null; }
      score += found === prev + 1 ? 6 : 1;
      if (found === 0 || /\W/.test(t.charAt(found - 1))) { score += 5; }
      out.push(found); prev = found; ti = found + 1;
    }
    return { score: score - t.length * 0.05, hits: out };
  }

  function jumpItems(query) {
    var q = query.trim().toLowerCase();
    var m = q.match(/^([a-z]+)?\s*#?\s*(\d{1,10})$/);
    if (!m) { return []; }
    var word = m[1] || '', id = m[2], out = [];
    JUMPS.forEach(function (j) {
      if (!word || j.words.indexOf(word) !== -1) {
        out.push({ group: 'Open by ID', title: j.label + ' #' + id, hint: resolve(j.url + id), icon: 'hash', url: j.url + id, exact: true });
      }
    });
    return out;
  }

  function searchBox() {
    var sel = [
      '#intelliSearchForm input[type="text"]', '#inputIntelliSearchValue', 'input[name="intellisearchval"]',
      '.intellisearch input', 'input[name="searchterm"]', 'form[action*="search"] input[type="text"]',
      '.navbar input[type="search"]', '.navbar input[type="text"]'
    ];
    for (var i = 0; i < sel.length; i++) {
      var node = null;
      try { node = document.querySelector(sel[i]); } catch (e) {}
      if (node && !(sidebar && sidebar.contains(node)) && !(pal && pal.box.contains(node))) { return node; }
    }
    var all = document.querySelectorAll('input[placeholder]');
    for (var n = 0; n < all.length; n++) {
      if (/search/i.test(all[n].getAttribute('placeholder')) && !(pal && pal.box.contains(all[n])) && !(sidebar && sidebar.contains(all[n]))) { return all[n]; }
    }
    return null;
  }

  function sendToSearch(text) {
    var box = searchBox();
    if (!box) { toast('No WHMCS search box on this page'); return; }
    box.focus();
    box.value = text;
    ['input', 'keyup', 'change'].forEach(function (type) {
      var ev;
      try { ev = new Event(type, { bubbles: true }); } catch (e) { ev = document.createEvent('Event'); ev.initEvent(type, true, true); }
      box.dispatchEvent(ev);
    });
  }

  function buildPalette() {
    var input = h('input', { class: 'ax-pal-input', type: 'text', placeholder: 'Search pages, or type c 42, i 1050, t 301…', 'aria-label': 'Command palette', autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'ax-pal-list' });
    var list = h('div', { class: 'ax-pal-list', id: 'ax-pal-list', role: 'listbox' });
    var dialog = h('div', { class: 'ax-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Jump to' }, [
      h('div', { class: 'ax-pal-head' }, [icon('search'), input, h('kbd', { class: 'ax-kbd', text: 'Esc' })]),
      list,
      h('div', { class: 'ax-pal-foot' }, [
        h('span', null, [h('kbd', { text: '↑↓' }), 'navigate']),
        h('span', null, [h('kbd', { text: '↵' }), 'open']),
        h('span', null, [h('kbd', { text: MOD + ' ↵' }), 'new tab']),
        h('span', null, [h('kbd', { text: 'esc' }), 'close'])
      ])
    ]);
    var box = h('div', { class: 'ax-overlay', id: 'ax-palette' }, [dialog]);
    box.addEventListener('mousedown', function (e) { if (e.target === box) { closePalette(); } });
    document.body.appendChild(box);

    pal = { box: box, input: input, list: list, items: [], shown: [], sel: 0, lastFocus: null };

    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(pal.sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(pal.sel - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); runItem(pal.shown[pal.sel], e.ctrlKey || e.metaKey); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      else if (e.key === 'Tab') { e.preventDefault(); select(pal.sel + (e.shiftKey ? -1 : 1)); }
    });
  }

  function openPalette(prefill) {
    if (CFG.palette === false) { return; }
    closeSheet();
    if (!pal) { buildPalette(); }
    closeHelp();
    pal.lastFocus = document.activeElement;
    pal.items = collectItems();
    pal.input.value = prefill || '';
    pal.box.classList.add('is-open');
    renderResults();
    pal.input.focus();
    setTimeout(function () { if (document.activeElement !== pal.input) { pal.input.focus(); } }, 30);
  }

  function closePalette() {
    if (!pal || !pal.box.classList.contains('is-open')) { return; }
    pal.box.classList.remove('is-open');
    if (pal.lastFocus && pal.lastFocus.focus) { try { pal.lastFocus.focus(); } catch (e) {} }
  }

  function renderResults() {
    var q = pal.input.value.trim();
    var shown = [];
    if (!q) {
      var perGroup = {};
      pal.items.forEach(function (it) {
        var limit = it.group === 'Go to' ? 99 : (it.group === 'Settings' || it.group === 'Account' ? 0 : 5);
        perGroup[it.group] = (perGroup[it.group] || 0) + 1;
        if (perGroup[it.group] <= limit && !(it.group === 'Go to' && !it.top)) {
          shown.push({ item: it, hits: [] });
        }
      });
    } else {
      jumpItems(q).forEach(function (j) { shown.push({ item: j, hits: [], score: 1000 }); });
      pal.items.forEach(function (it) {
        var m = fuzzy(q, it.title);
        var w = null;
        if (!m || m.score < 20) {
          w = fuzzy(q, (it.hint || '') + ' ' + (it.words || ''));
          if (w && w.score > 40) { w = { score: w.score / 2, hits: [] }; } else { w = null; }
        }
        var best = m && (!w || m.score >= w.score) ? m : w;
        if (best) {
          var bonus = it.group === 'Pinned' ? 8 : it.group === 'Recent' ? 4 : 0;
          shown.push({ item: it, hits: best.hits, score: best.score + bonus });
        }
      });
      shown.sort(function (a, b) { return b.score - a.score; });
      shown = shown.slice(0, 40);
      shown.push({ item: { group: 'Search', title: 'Search WHMCS for “' + q + '”', hint: 'Sends your text to the WHMCS search box', icon: 'search', run: function () { sendToSearch(q); } }, hits: [] });
    }

    pal.shown = shown.map(function (s) { return s.item; });
    pal.list.textContent = '';
    if (!shown.length) {
      pal.list.appendChild(h('div', { class: 'ax-pal-empty', text: 'Nothing matches. Try another word.' }));
      return;
    }

    var lastGroup = null;
    shown.forEach(function (s, idx) {
      var it = s.item;
      var groupName = q ? (it.group === 'Open by ID' || it.group === 'Search' ? it.group : 'Results') : it.group;
      if (groupName !== lastGroup) {
        pal.list.appendChild(h('div', { class: 'ax-pal-group', text: groupName }));
        lastGroup = groupName;
      }
      var title = h('span', { class: 'ax-pal-title' });
      highlight(title, it.title, s.hits);
      var row = h('div', { class: 'ax-pal-item', role: 'option', id: 'ax-opt-' + idx, 'data-idx': String(idx) }, [
        icon(it.icon || 'link'),
        h('span', { class: 'ax-pal-text' }, [title, it.hint ? h('span', { class: 'ax-pal-hint', text: it.hint }) : null]),
        it.keys ? h('kbd', { text: it.keys.toUpperCase() }) : null
      ]);
      row.addEventListener('mousemove', function () { if (pal.sel !== idx) { select(idx, true); } });
      row.addEventListener('click', function (e) { runItem(it, e.ctrlKey || e.metaKey); });
      pal.list.appendChild(row);
    });
    select(0);
  }

  function highlight(node, text, hits) {
    if (!hits || !hits.length) { node.textContent = text; return; }
    var set = {};
    hits.forEach(function (i) { set[i] = true; });
    var buf = '', inMark = false;
    function flush() {
      if (!buf) { return; }
      node.appendChild(inMark ? h('mark', { text: buf }) : document.createTextNode(buf));
      buf = '';
    }
    for (var i = 0; i < text.length; i++) {
      var hit = !!set[i];
      if (hit !== inMark) { flush(); inMark = hit; }
      buf += text.charAt(i);
    }
    flush();
  }

  function select(i, fromMouse) {
    var rows = pal.list.querySelectorAll('.ax-pal-item');
    if (!rows.length) { return; }
    pal.sel = (i + rows.length) % rows.length;
    for (var r = 0; r < rows.length; r++) { rows[r].classList.toggle('is-sel', r === pal.sel); }
    pal.input.setAttribute('aria-activedescendant', rows[pal.sel].id);
    if (!fromMouse) { rows[pal.sel].scrollIntoView({ block: 'nearest' }); }
  }

  function runItem(it, newTab) {
    if (!it) { return; }
    closePalette();
    if (it.run) { it.run(); return; }
    if (it.url) { go(it.url, newTab || it.external); }
  }

  /* ---------------------------------------------------------------- */
  /* Keyboard shortcuts and help                                       */
  /* ---------------------------------------------------------------- */
  var SHORTCUTS = [
    [MOD + ' K', 'Command palette'], ['/', 'Command palette'], ['?', 'This help'],
    ['G  D', 'Dashboard'], ['G  C', 'Clients'], ['G  O', 'Orders'], ['G  I', 'Invoices'],
    ['G  T', 'Support tickets'], ['G  S', 'Products / services'], ['G  R', 'Reports'], ['G  ,', 'Setup'],
    ['N  C', 'New client'], ['N  O', 'New order'], ['N  T', 'New ticket'],
    ['[', 'Collapse sidebar'], [MOD + ' ⇧ L', 'Light / dark'], ['Esc', 'Close any Aurox window']
  ];
  var SEQ = {
    g: { d: 'index.php', c: 'clients.php', o: 'orders.php', i: 'invoices.php', t: 'supporttickets.php', s: (CFG.routes && CFG.routes.services) || 'clientshostinglist.php', r: 'reports.php', ',': (CFG.routes && CFG.routes.setup) || 'configgeneral.php' },
    n: { c: 'clientsadd.php', o: 'ordersadd.php', t: 'supporttickets.php?action=open' }
  };
  var helpBox = null;

  function openHelp() {
    closePalette();
    if (!helpBox) {
      var body = h('div', { class: 'ax-help-body' });
      SHORTCUTS.concat(EXTRA_SHORTCUTS).forEach(function (s) {
        body.appendChild(h('div', { class: 'ax-help-row' }, [h('span', { text: s[1] }), h('kbd', { text: s[0] })]));
      });
      helpBox = h('div', { class: 'ax-overlay', id: 'ax-help' }, [
        h('div', { class: 'ax-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Keyboard shortcuts' }, [
          h('div', { class: 'ax-help-head' }, [
            h('h3', { text: 'Keyboard shortcuts' }),
            h('button', { type: 'button', class: 'ax-icon-btn', 'aria-label': 'Close', onclick: closeHelp }, [icon('x')])
          ]),
          body,
          h('div', { class: 'ax-help-credit' }, [
            'Aurox Admin v' + (CFG.version || '') + ', made by ',
            h('a', { href: 'https://github.com/GreatsLab', target: '_blank', rel: 'noopener', text: 'Chimnadindu Great Chibueze' })
          ])
        ])
      ]);
      helpBox.addEventListener('mousedown', function (e) { if (e.target === helpBox) { closeHelp(); } });
      document.body.appendChild(helpBox);
    }
    helpBox.classList.add('is-open');
  }
  function closeHelp() { if (helpBox) { helpBox.classList.remove('is-open'); } }

  function typing(target) {
    if (!target) { return false; }
    var tag = (target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  var ACTIONS = {};
  var pending = null, pendingTimer = null;
  document.addEventListener('keydown', function (e) {
    var mod = e.ctrlKey || e.metaKey;
    var key = (e.key || '').toLowerCase();

    if (mod && !e.shiftKey && !e.altKey && key === 'k' && CFG.palette !== false) {
      e.preventDefault();
      if (pal && pal.box.classList.contains('is-open')) { closePalette(); } else { openPalette(); }
      return;
    }
    if (mod && e.shiftKey && key === 'l') { e.preventDefault(); toggleMode(); return; }
    if (key === 'escape') {
      if (root.classList.contains('ax-sheet-open')) { closeSheet(); return; }
      if (root.classList.contains('ax-search-open')) { closeSearch(); return; }
      if (helpBox && helpBox.classList.contains('is-open')) { closeHelp(); return; }
      if (root.classList.contains('ax-open')) { closeDrawer(); return; }
    }
    if (CFG.shortcuts === false || mod || e.altKey || typing(e.target)) { return; }
    if (pal && pal.box.classList.contains('is-open')) { return; }

    if (pending) {
      var dest = SEQ[pending] && SEQ[pending][key];
      pending = null;
      clearTimeout(pendingTimer);
      if (dest) { e.preventDefault(); go(dest); }
      return;
    }
    if (key === 'g' || key === 'n') {
      pending = key;
      pendingTimer = setTimeout(function () { pending = null; }, 1200);
      return;
    }
    if (e.key === '?') { e.preventDefault(); openHelp(); return; }
    if (e.key === '/' && CFG.palette !== false) { e.preventDefault(); openPalette(); return; }
    if (e.key === '[' && !FRAMED) { e.preventDefault(); toggleCollapsed(); return; }
    if (KEY_ACTIONS[e.key]) { e.preventDefault(); KEY_ACTIONS[e.key](); }
  });

  /* ---------------------------------------------------------------- */
  /* Buttons anywhere with data-ax-action (sidebar and module page)    */
  /* ---------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-ax-action]') : null;
    if (!btn) { return; }
    var a = btn.getAttribute('data-ax-action');
    var actions = ACTIONS;
    var builtIn = {
      palette: function () { openPalette(); },
      help: openHelp,
      pin: togglePin,
      mode: toggleMode,
      collapse: toggleCollapsed,
      drawer: function () { root.classList.contains('ax-open') ? closeDrawer() : openDrawer(); },
      reset: resetAll,
      off: turnOff,
      'mode-light': function () { setMode('light'); },
      'mode-dark': function () { setMode('dark'); },
      'mode-system': function () { setMode('system'); },
      'density-comfortable': function () { setDensity('comfortable'); },
      'density-compact': function () { setDensity('compact'); },
      search: openSearch,
      'search-close': closeSearch,
      'new-sheet': toggleSheet
    };
    if (a !== 'new-sheet' && btn.closest && btn.closest('.ax-sheet')) { closeSheet(); }
    Object.keys(builtIn).forEach(function (k) { if (!actions[k]) { actions[k] = builtIn[k]; } });
    if (actions[a]) { e.preventDefault(); actions[a](); }
  });

  /* ---------------------------------------------------------------- */
  /* Extras                                                            */
  /* ---------------------------------------------------------------- */
  function hideConfigured() {
    if (!CFG.hideSelector) { return; }
    try {
      var nodes = document.querySelectorAll(CFG.hideSelector);
      for (var i = 0; i < nodes.length; i++) {
        if (!sidebar || !sidebar.contains(nodes[i])) { nodes[i].style.setProperty('display', 'none', 'important'); }
      }
    } catch (e) {
      if (window.console) { console.warn('[Aurox] "Hide elements" selector is not valid:', CFG.hideSelector); }
    }
  }

  function backToTop() {
    var btn = h('button', { id: 'ax-top', type: 'button', 'aria-label': 'Back to top', onclick: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); } }, [icon('up')]);
    document.body.appendChild(btn);
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () { btn.classList.toggle('is-on', window.scrollY > 600); ticking = false; });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /* Phones: search, create sheet, tab bar                             */
  /* ---------------------------------------------------------------- */
  function openSearch() {
    root.classList.add('ax-search-open');
    var input = document.getElementById('inputIntelliSearchValue');
    if (input) { setTimeout(function () { input.focus(); }, 30); }
  }
  function closeSearch() {
    root.classList.remove('ax-search-open');
    var input = document.getElementById('inputIntelliSearchValue');
    if (input) { input.blur(); }
    var closeBtn = document.getElementById('btnIntelliSearchClose');
    if (closeBtn && document.querySelector('.intellisearch.active')) { try { closeBtn.click(); } catch (e) {} }
  }
  function toggleSheet() { root.classList.contains('ax-sheet-open') ? closeSheet() : openSheet(); }
  function openSheet() {
    var sheet = document.getElementById('axNewSheet');
    if (!sheet) { return; }
    closeDrawer();
    root.classList.add('ax-sheet-open');
    sheet.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() {
    var sheet = document.getElementById('axNewSheet');
    root.classList.remove('ax-sheet-open');
    if (sheet) { sheet.setAttribute('aria-hidden', 'true'); }
  }
  function markTab() {
    var tab = 'menu';
    if (HERE.page === 'index.php' && !HERE.params.rp) { tab = 'home'; }
    else if (/^(clients|users)/.test(HERE.page) || /^\/admin\/(users|services|domains|addons)/.test(HERE.params.rp || '')) { tab = 'clients'; }
    else if (/^(support|networkissues)/.test(HERE.page)) { tab = 'support'; }
    var el = document.querySelector('.ax-tabbar [data-ax-tab="' + tab + '"]') || document.querySelector('.ax-tabbar [data-ax-tab="menu"]');
    if (el) { el.classList.add('is-on'); el.setAttribute('aria-current', 'page'); }
  }

  /* ---------------------------------------------------------------- */
  /* Breadcrumbs above the page title                                  */
  /* ---------------------------------------------------------------- */
  function breadcrumbs() {
    if (!sidebar || document.querySelector('.ax-crumbs') || document.body.classList.contains('ax-dashboard')) { return; }
    var area = document.getElementById('contentarea');
    if (!area) { return; }
    var active = sidebar.querySelector('.ax-nav a.ax-link[aria-current="page"]') ||
      sidebar.querySelector('.ax-nav > .ax-group:not(.ax-pins) .ax-item.is-active > .ax-link');
    if (!active) { return; }
    var parts = [];
    var section = active.closest('.ax-group') && active.closest('.ax-group').querySelector('.ax-section-title');
    if (section) { parts.push({ t: section.textContent.trim() }); }
    var sub = active.closest('.ax-sub');
    if (sub) {
      var parent = sub.parentNode.querySelector('.ax-link');
      var first = sub.querySelector('a.ax-link');
      parts.push({ t: (parent.querySelector('.ax-label') || parent).textContent.trim(), u: first ? first.getAttribute('href') : null });
    }
    if (active.tagName === 'A') { parts.push({ t: (active.querySelector('.ax-label') || active).textContent.trim(), u: active.getAttribute('href'), here: true }); }
    if (parts.length < 2) { return; }
    var nav = h('nav', { class: 'ax-crumbs', 'aria-label': 'You are here' });
    parts.forEach(function (p, i) {
      if (i) { nav.appendChild(icon('chev')); }
      if (p.here) { nav.appendChild(h('span', { 'aria-current': 'page', text: p.t })); }
      else if (p.u) { nav.appendChild(h('a', { href: p.u, text: p.t })); }
      else { nav.appendChild(h('span', { text: p.t })); }
    });
    area.insertBefore(nav, area.firstChild);
  }

  /* ---------------------------------------------------------------- */
  /* Boot                                                              */
  /* ---------------------------------------------------------------- */
  function boot() {
    if (!document.body) { return; }
    if (!FRAMED) {
      buildSidebar();
      backToTop();
      trackRecent();
    }
    hideConfigured();
    if (!FRAMED) { markTab(); breadcrumbs(); progressBar(); recentInDrawer(); swipeToClose(); }
  }

  /* ---------------------------------------------------------------- */
  /* A thin loading bar while the next page loads (helps on slow data) */
  /* ---------------------------------------------------------------- */
  function progressBar() {
    var bar = h('div', { id: 'ax-progress', 'aria-hidden': 'true' });
    document.body.appendChild(bar);
    var timer = null, giveUp = null, w = 0;
    function start() {
      clearInterval(timer); clearTimeout(giveUp);
      w = 12; bar.style.width = w + '%'; bar.classList.add('is-on');
      timer = setInterval(function () { w += (88 - w) * 0.08; bar.style.width = w.toFixed(1) + '%'; }, 120);
      giveUp = setTimeout(stop, 12000); // the page stayed (download, cancelled leave prompt...)
    }
    function stop() { clearInterval(timer); clearTimeout(giveUp); bar.classList.remove('is-on'); bar.style.width = '0'; }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target && a.target !== '_self' || a.hasAttribute('download') || a.hasAttribute('data-toggle') || a.classList.contains('open-modal')) { return; }
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(javascript|mailto|tel|sms):/i.test(href)) { return; }
      var url; try { url = new URL(a.href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) { return; }
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) { return; }
      start();
    });
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (e.defaultPrevented || !f || (f.target && f.target !== '_self')) { return; }
      setTimeout(function () { if (!e.defaultPrevented) { start(); } }, 0);
    });
    window.addEventListener('pageshow', stop);
  }

  /* ---------------------------------------------------------------- */
  /* Phones: recent pages at the top of the menu                       */
  /* ---------------------------------------------------------------- */
  function recentInDrawer() {
    if (!sidebar) { return; }
    var here = currentUrl();
    var list = store.get('recent', []);
    if (!Array.isArray(list)) { return; }
    list = list.filter(function (r) { return r && r.u && r.t && r.u !== here; }).slice(0, 6);
    if (!list.length) { return; }
    var box = h('div', { class: 'ax-recent', 'aria-label': 'Recent pages' }, [h('div', { class: 'ax-recent-title' }, [icon('history'), h('span', { text: 'Recent' })])]);
    var row = h('div', { class: 'ax-recent-row' });
    list.forEach(function (r) { row.appendChild(h('a', { class: 'ax-recent-chip', href: resolve(r.u), title: r.t, text: r.t })); });
    box.appendChild(row);
    var anchor = sidebar.querySelector('.ax-quickgrid') || sidebar.querySelector('.ax-search');
    if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(box, anchor.nextSibling); }
  }

  /* ---------------------------------------------------------------- */
  /* Phones: swipe the menu left / the create sheet down to close them  */
  /* ---------------------------------------------------------------- */
  function swipe(el, axis, done, when) {
    if (!el || !('ontouchstart' in window)) { return; }
    var x0 = null, y0 = null, d = 0, lock = null;
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || (when && !when())) { x0 = null; return; }
      if (axis === 'y' && el.scrollTop > 0) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; d = 0; lock = null; el.style.transition = 'none';
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (x0 === null) { return; }
      var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      if (!lock) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { return; } lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; }
      if (lock !== axis) { return; }
      d = axis === 'x' ? Math.min(0, dx) : Math.max(0, dy);
      el.style.transform = axis === 'x' ? 'translateX(' + d + 'px)' : 'translateY(' + d + 'px)';
    }, { passive: true });
    el.addEventListener('touchend', function () {
      if (x0 === null) { return; }
      el.style.transition = ''; el.style.transform = '';
      if (Math.abs(d) > 80) { done(); }
      x0 = null;
    });
  }
  function swipeToClose() {
    swipe(sidebar, 'x', closeDrawer, function () { return root.classList.contains('ax-open'); });
    var panel = document.querySelector('#axNewSheet .ax-sheet-panel');
    swipe(panel, 'y', closeSheet, function () { return root.classList.contains('ax-sheet-open'); });
  }

  window.AuroxUI = {
    version: CFG.version || '3.1.1',
    open: openPalette,
    close: closePalette,
    help: openHelp,
    setMode: setMode,
    toggleMode: toggleMode,
    setDensity: setDensity,
    toggleSidebar: toggleCollapsed,
    pin: togglePin,
    reset: resetAll,
    off: turnOff,
    nav: NAV,
    // Internals for aurox-tools.js and your own extensions.
    _: {
      h: h, icon: icon, ICONS: ICONS, store: store, toast: toast, resolve: resolve, go: go,
      CFG: CFG, NAV: NAV, HERE: HERE, FRAMED: FRAMED, MOD: MOD, pageTitle: pageTitle,
      sidebar: function () { return sidebar; },
      addSidebarGroup: addSidebarGroup,
      commands: EXTRA_COMMANDS, keys: KEY_ACTIONS, shortcuts: EXTRA_SHORTCUTS, actions: ACTIONS,
      closeOverlays: function () { closePalette(); closeHelp(); closeDrawer(); },
      openDrawer: openDrawer
    }
  };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
  // Boot is synchronous, so extensions loaded after this file can rely on the sidebar.
})(window, document);
