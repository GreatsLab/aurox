/*!
 * Aurox Admin for WHMCS - Help & Tools
 * Toolbox, snippets, notes, page guide, guided tour, table tools and the
 * unsaved-changes guard.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 */
(function (window, document) {
  'use strict';

  var UI = window.AuroxUI;
  if (!UI || !UI._) { return; }

  var _ = UI._, h = _.h, icon = _.icon, store = _.store, toast = _.toast, CFG = _.CFG;

  /* Extra icons used by the tools */
  var more = {
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14.5 8.5l2 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    calculator: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
    note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h6"/>',
    message: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    toolbox: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18M10 12v2h4v-2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
    insert: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M4 18h16"/>'
  };
  Object.keys(more).forEach(function (k) { _.ICONS[k] = more[k]; });

  /* ---------------------------------------------------------------- */
  /* Small helpers                                                     */
  /* ---------------------------------------------------------------- */
  function btn(label, onClick, kind, iconName) {
    return h('button', { type: 'button', class: 'ax-btn' + (kind ? ' ax-btn-' + kind : ''), onclick: onClick }, [iconName ? icon(iconName) : null, label]);
  }
  function inp(attrs) {
    var a = { class: 'ax-input', 'data-ax-ignore': '1' };
    Object.keys(attrs || {}).forEach(function (k) { a[k] = attrs[k]; });
    return h(a.rows ? 'textarea' : 'input', a);
  }
  function sel(options, value) {
    var s = h('select', { class: 'ax-input', 'data-ax-ignore': '1' });
    options.forEach(function (o) {
      var opt = h('option', { value: o[0], text: o[1] });
      if (o[0] === value) { opt.selected = true; }
      s.appendChild(opt);
    });
    return s;
  }
  function field(label, control, hint) {
    return h('label', { class: 'ax-field' }, [h('span', { class: 'ax-field-label', text: label }), control, hint ? h('span', { class: 'ax-field-hint', text: hint }) : null]);
  }
  function row(children) { return h('div', { class: 'ax-row' }, children); }
  function out(text) { return h('div', { class: 'ax-out', text: text || '' }); }
  function intro(text) { return h('p', { class: 'ax-intro', text: text }); }
  function num(v) { var n = parseFloat(String(v).replace(/,/g, '')); return isFinite(n) ? n : 0; }
  function money(n) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nice(d) { return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
  function onAll(nodes, fn) { nodes.forEach(function (n) { n.addEventListener('input', fn); n.addEventListener('change', fn); }); }

  function copyText(text) {
    function fallback() {
      var t = h('textarea', { style: 'position:fixed;left:-9999px;top:0' });
      t.value = text;
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Copy failed: select and copy by hand'); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, fallback);
    } else { fallback(); }
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  function randomInt(max) {
    var buf = new Uint32Array(1), limit = Math.floor(4294967296 / max) * max;
    do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  /* Key for "this page": the file plus the IDs that identify a record. */
  function pageKey() {
    var p = _.HERE.page, keep = ['userid', 'id', 'action', 'module', 'rp', 'status'], parts = [];
    keep.forEach(function (k) { if (_.HERE.params[k]) { parts.push(k + '=' + _.HERE.params[k]); } });
    return p + (parts.length ? '?' + parts.join('&') : '');
  }

  /* Remember the last text box the admin used, so snippets can go into it. */
  var lastField = null;
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t || !t.tagName) { return; }
    var tag = t.tagName.toLowerCase();
    var ok = tag === 'textarea' || (tag === 'input' && /^(text|search|email|url)?$/i.test(t.type || 'text'));
    if (ok && !t.closest('#ax-panel, .ax-overlay, #ax-sidebar, [data-ax-ignore]')) { lastField = t; }
  });

  /* ---------------------------------------------------------------- */
  /* Side panel                                                        */
  /* ---------------------------------------------------------------- */
  var panel, panelTitle, panelBody, panelIcon, panelOpenId = null;

  function buildPanel() {
    panelTitle = h('h3', { class: 'ax-panel-title' });
    panelIcon = h('span', { class: 'ax-panel-icon' });
    panelBody = h('div', { class: 'ax-panel-body' });
    panel = h('aside', { id: 'ax-panel', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'Aurox panel', 'data-ax-ignore': '1' }, [
      h('div', { class: 'ax-panel-head' }, [
        panelIcon, panelTitle,
        h('button', { type: 'button', class: 'ax-icon-btn ax-panel-close', 'aria-label': 'Close panel', title: 'Close  Esc', onclick: closePanel }, [icon('x')])
      ]),
      panelBody
    ]);
    document.body.appendChild(panel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open') && !document.querySelector('.ax-overlay.is-open')) { closePanel(); }
    });
  }

  function openPanel(id, title, iconName, build) {
    if (!panel) { buildPanel(); }
    if (panelOpenId === id && panel.classList.contains('is-open')) { closePanel(); return; }
    _.closeOverlays();
    panelOpenId = id;
    panelTitle.textContent = title;
    panelIcon.textContent = '';
    panelIcon.appendChild(icon(iconName));
    panelBody.textContent = '';
    panelBody.appendChild(build());
    panel.classList.add('is-open');
    document.documentElement.classList.add('ax-panel-open');
    var first = panelBody.querySelector('input, textarea, select, button');
    if (first && window.innerWidth > 700) { setTimeout(function () { first.focus(); }, 30); }
  }

  function closePanel() {
    if (!panel) { return; }
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('ax-panel-open');
    panelOpenId = null;
  }

  /* ---------------------------------------------------------------- */
  /* Toolbox                                                           */
  /* ---------------------------------------------------------------- */
  var TOOLS = [
    { id: 'password', label: 'Password', icon: 'key', build: toolPassword, words: 'generate random secure' },
    { id: 'dates', label: 'Dates', icon: 'calendar', build: toolDates, words: 'due date add days between renew' },
    { id: 'pricing', label: 'Pricing', icon: 'calculator', build: toolPricing, words: 'billing cycle tax vat discount prorata pro-rata annual' },
    { id: 'data', label: 'Data size', icon: 'database', build: toolData, words: 'gb mb tb bandwidth transfer speed mbps' },
    { id: 'time', label: 'Timestamp', icon: 'clock', build: toolTimestamp, words: 'unix epoch log time' },
    { id: 'encode', label: 'Encode', icon: 'code', build: toolEncode, words: 'base64 url html json decode format' }
  ];

  function openToolbox(toolId) {
    var current = toolId || store.get('tool', 'password');
    if (!TOOLS.some(function (t) { return t.id === current; })) { current = 'password'; }
    if (panelOpenId === 'toolbox' && toolId) { panelOpenId = null; }
    openPanel('toolbox', 'Toolbox', 'toolbox', function () {
      var wrap = h('div');
      var tabs = h('div', { class: 'ax-chips', role: 'tablist' });
      var area = h('div', { class: 'ax-tool' });
      function show(id) {
        current = id;
        store.set('tool', id);
        Array.prototype.forEach.call(tabs.children, function (c) {
          var on = c.getAttribute('data-id') === id;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        area.textContent = '';
        TOOLS.forEach(function (t) { if (t.id === id) { area.appendChild(t.build()); } });
      }
      TOOLS.forEach(function (t) {
        tabs.appendChild(h('button', { type: 'button', class: 'ax-chip', role: 'tab', 'data-id': t.id, onclick: function () { show(t.id); } }, [icon(t.icon), t.label]));
      });
      wrap.appendChild(tabs);
      wrap.appendChild(area);
      show(current);
      return wrap;
    });
  }

  function toolPassword() {
    var len = inp({ type: 'range', min: '8', max: '64', value: String(store.get('pw-len', 20)) });
    var lenOut = h('b', { text: len.value });
    var opts = { upper: true, lower: true, digits: true, symbols: true, similar: true };
    var saved = store.get('pw-opts', null);
    if (saved && typeof saved === 'object') { Object.keys(opts).forEach(function (k) { if (k in saved) { opts[k] = !!saved[k]; } }); }
    var boxes = {};
    var checks = h('div', { class: 'ax-checks' });
    [['upper', 'A–Z'], ['lower', 'a–z'], ['digits', '0–9'], ['symbols', '!@#$'], ['similar', 'Skip look-alikes (l, 1, O, 0)']].forEach(function (o) {
      var c = h('input', { type: 'checkbox', 'data-ax-ignore': '1' });
      c.checked = opts[o[0]];
      boxes[o[0]] = c;
      checks.appendChild(h('label', { class: 'ax-check' }, [c, o[1]]));
    });
    var result = inp({ type: 'text', readonly: 'readonly', class: 'ax-input ax-mono ax-big', 'aria-label': 'Generated password' });
    var meter = h('div', { class: 'ax-meter' }, [h('span')]);
    var meterText = h('span', { class: 'ax-field-hint' });

    function make() {
      var sets = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?'
      };
      var pick = [];
      Object.keys(sets).forEach(function (k) {
        if (boxes[k].checked) {
          var chars = boxes.similar.checked ? sets[k].replace(/[Il1O0o]/g, '') : sets[k];
          pick.push(chars);
        }
      });
      if (!pick.length) { pick.push(sets.lower); boxes.lower.checked = true; }
      var n = parseInt(len.value, 10), all = pick.join(''), chars = [];
      pick.forEach(function (set) { chars.push(set.charAt(randomInt(set.length))); });
      while (chars.length < n) { chars.push(all.charAt(randomInt(all.length))); }
      for (var i = chars.length - 1; i > 0; i--) { var j = randomInt(i + 1), t = chars[i]; chars[i] = chars[j]; chars[j] = t; }
      result.value = chars.slice(0, n).join('');
      var bits = Math.round(n * Math.log(all.length) / Math.LN2);
      var pct = Math.min(100, bits / 1.28);
      meter.firstChild.style.width = pct + '%';
      meter.className = 'ax-meter ' + (bits < 60 ? 'is-weak' : bits < 90 ? 'is-ok' : 'is-strong');
      meterText.textContent = (bits < 60 ? 'Weak' : bits < 90 ? 'Good' : 'Very strong') + ', about ' + bits + ' bits of randomness';
      lenOut.textContent = String(n);
      store.set('pw-len', n);
      var o = {}; Object.keys(boxes).forEach(function (k) { o[k] = boxes[k].checked; }); store.set('pw-opts', o);
    }
    len.addEventListener('input', make);
    Object.keys(boxes).forEach(function (k) { boxes[k].addEventListener('change', make); });
    make();

    return h('div', null, [
      intro('Strong passwords for new accounts, resets and server logins. Made in your browser with secure randomness and never sent anywhere.'),
      result,
      h('div', { class: 'ax-meter-wrap' }, [meter, meterText]),
      row([btn('Copy', function () { copyText(result.value); }, 'primary', 'copy'), btn('New one', make, '', 'refresh')]),
      h('div', { class: 'ax-field' }, [h('span', { class: 'ax-field-label' }, ['Length: ', lenOut]), len]),
      checks
    ]);
  }

  function toolDates() {
    var today = ymd(new Date());
    var start = inp({ type: 'date', value: today });
    var amount = inp({ type: 'number', value: '30', min: '0' });
    var unit = sel([['d', 'days'], ['w', 'weeks'], ['m', 'months'], ['y', 'years']], 'd');
    var dir = sel([['+', 'after'], ['-', 'before']], '+');
    var res1 = out();

    var from = inp({ type: 'date', value: today });
    var to = inp({ type: 'date', value: ymd(new Date(Date.now() + 30 * 864e5)) });
    var res2 = out();

    function parseDate(v) { var p = (v || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
    function addMonths(d, m) {
      var day = d.getDate(), r = new Date(d.getFullYear(), d.getMonth() + m, 1);
      var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
      r.setDate(Math.min(day, last));
      return r;
    }
    function calc1() {
      var d = parseDate(start.value);
      if (!d) { res1.textContent = 'Pick a start date.'; return; }
      var n = Math.round(num(amount.value)) * (dir.value === '-' ? -1 : 1), r;
      if (unit.value === 'd') { r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
      else if (unit.value === 'w') { r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * 7); }
      else if (unit.value === 'm') { r = addMonths(d, n); }
      else { r = addMonths(d, n * 12); }
      res1.textContent = nice(r) + '  (' + ymd(r) + ')';
    }
    function calc2() {
      var a = parseDate(from.value), b = parseDate(to.value);
      if (!a || !b) { res2.textContent = 'Pick both dates.'; return; }
      var days = Math.round((b - a) / 864e5);
      var abs = Math.abs(days);
      res2.textContent = abs + ' day' + (abs === 1 ? '' : 's') + (days < 0 ? ' before' : '') +
        ', or ' + (abs / 7).toFixed(1) + ' weeks, about ' + (abs / 30.4375).toFixed(1) + ' months';
    }
    onAll([start, amount, unit, dir], calc1);
    onAll([from, to], calc2);
    calc1(); calc2();

    return h('div', null, [
      intro('Work out renewal and due dates, or how long until something expires. Month maths keeps the same day of the month, or the last day when the month is shorter.'),
      h('h4', { class: 'ax-h4', text: 'Add or subtract' }),
      row([field('Amount', amount), field('Unit', unit), field('When', dir)]),
      field('From date', start),
      res1,
      h('h4', { class: 'ax-h4', text: 'Time between two dates' }),
      row([field('From', from), field('To', to)]),
      res2
    ]);
  }

  function toolPricing() {
    var monthly = inp({ type: 'number', value: String(store.get('price-m', 5000)), min: '0', step: '0.01' });
    var discount = inp({ type: 'number', value: String(store.get('price-d', 10)), min: '0', max: '100', step: '0.5' });
    var tax = inp({ type: 'number', value: String(store.get('price-t', 7.5)), min: '0', max: '100', step: '0.1' });
    var mode = sel([['add', 'Add tax on top'], ['incl', 'Prices already include tax']], store.get('price-mode', 'add'));
    var table = h('table', { class: 'ax-table' });

    var cycles = [['Monthly', 1], ['Quarterly', 3], ['Semi-annually', 6], ['Annually', 12], ['Biennially', 24], ['Triennially', 36]];
    function calc() {
      var m = num(monthly.value), d = Math.min(100, num(discount.value)) / 100, t = num(tax.value) / 100;
      store.set('price-m', m); store.set('price-d', num(discount.value)); store.set('price-t', num(tax.value)); store.set('price-mode', mode.value);
      table.textContent = '';
      table.appendChild(h('thead', null, [h('tr', null, [h('th', { text: 'Cycle' }), h('th', { text: 'Net' }), h('th', { text: 'Tax' }), h('th', { text: 'Total' }), h('th', { text: '/ month' })])]));
      var body = h('tbody');
      cycles.forEach(function (c) {
        var gross = m * c[1] * (c[1] >= 12 ? (1 - d) : 1), net, taxAmt;
        if (mode.value === 'incl') { net = gross / (1 + t); taxAmt = gross - net; }
        else { net = gross; taxAmt = gross * t; gross = net + taxAmt; }
        body.appendChild(h('tr', null, [h('td', { text: c[0] }), h('td', { text: money(net) }), h('td', { text: money(taxAmt) }), h('td', null, [h('b', { text: money(gross) })]), h('td', { text: money(gross / c[1]) })]));
      });
      table.appendChild(body);
    }

    var price = inp({ type: 'number', value: '5000', min: '0', step: '0.01' });
    var period = inp({ type: 'number', value: '30', min: '1' });
    var used = inp({ type: 'number', value: '12', min: '0' });
    var res = out();
    function prorata() {
      var p = num(price.value), per = Math.max(1, num(period.value)), u = Math.max(0, num(used.value));
      res.textContent = money(p / per * u) + ' for ' + u + ' of ' + per + ' days  ·  daily rate ' + money(p / per);
    }
    onAll([monthly, discount, tax, mode], calc);
    onAll([price, period, used], prorata);
    calc(); prorata();

    return h('div', null, [
      intro('Plan product prices for every billing cycle before you type them into Setup › Products/Services. The discount applies to annual and longer cycles.'),
      row([field('Monthly price', monthly), field('Long-term discount %', discount)]),
      row([field('Tax %', tax), field('Tax mode', mode)]),
      h('div', { class: 'ax-table-wrap' }, [table]),
      h('h4', { class: 'ax-h4', text: 'Pro-rata charge' }),
      row([field('Price for the period', price), field('Days in period', period), field('Days to charge', used)]),
      res
    ]);
  }

  function toolData() {
    var amount = inp({ type: 'number', value: '10', min: '0', step: 'any' });
    var unit = sel([['B', 'Bytes'], ['KB', 'KB'], ['MB', 'MB'], ['GB', 'GB'], ['TB', 'TB']], 'GB');
    var base = sel([['1024', 'Binary (1 GB = 1024 MB)'], ['1000', 'Decimal (1 GB = 1000 MB)']], '1024');
    var speed = inp({ type: 'number', value: '100', min: '0.01', step: 'any' });
    var res = out(), res2 = out();
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    function human(sec) {
      if (!isFinite(sec)) { return '—'; }
      if (sec < 1) { return 'under a second'; }
      var dd = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), mm = Math.floor(sec % 3600 / 60), ss = Math.round(sec % 60);
      return [dd ? dd + 'd' : '', hh ? hh + 'h' : '', mm ? mm + 'm' : '', !dd && ss ? ss + 's' : ''].filter(Boolean).join(' ');
    }
    function calc() {
      var b = num(base.value), bytes = num(amount.value) * Math.pow(b, units.indexOf(unit.value));
      res.textContent = units.slice(1).map(function (u, i) {
        var v = bytes / Math.pow(b, i + 1);
        return (v >= 100 ? Math.round(v).toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 })) + ' ' + u;
      }).join(', ');
      var sec = bytes * 8 / (num(speed.value) * 1e6);
      res2.textContent = 'About ' + human(sec) + ' at ' + num(speed.value) + ' Mbps (before overhead)';
    }
    onAll([amount, unit, base, speed], calc);
    calc();
    return h('div', null, [
      intro('Convert disk and bandwidth sizes, and estimate how long a backup or migration will take to copy.'),
      row([field('Size', amount), field('Unit', unit)]),
      field('Counting', base),
      res,
      h('h4', { class: 'ax-h4', text: 'Transfer time' }),
      field('Connection speed (Mbps)', speed),
      res2
    ]);
  }

  function toolTimestamp() {
    var unix = inp({ type: 'text', value: String(Math.floor(Date.now() / 1000)), class: 'ax-input ax-mono', inputmode: 'numeric' });
    var res = out();
    var local = inp({ type: 'datetime-local', step: '1' });
    var res2 = out();
    function fromUnix() {
      var v = num(unix.value);
      if (!v) { res.textContent = 'Paste a Unix timestamp (seconds or milliseconds).'; return; }
      var ms = v > 1e11 ? v : v * 1000, d = new Date(ms);
      if (isNaN(d)) { res.textContent = 'That does not look like a timestamp.'; return; }
      res.textContent = 'Your time: ' + d.toLocaleString() + '\nUTC: ' + d.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
    }
    function fromLocal() {
      var d = new Date(local.value);
      res2.textContent = isNaN(d) ? 'Pick a date and time.' : 'Unix time ' + Math.floor(d / 1000) + ', in milliseconds ' + d.getTime();
    }
    function now() {
      var d = new Date();
      unix.value = String(Math.floor(d / 1000));
      local.value = ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      fromUnix(); fromLocal();
    }
    onAll([unix], fromUnix);
    onAll([local], fromLocal);
    now();
    return h('div', null, [
      intro('Turn the timestamps you see in logs, API responses and the database into real dates, and back.'),
      field('Unix timestamp', unix),
      res,
      field('Date and time', local),
      res2,
      row([btn('Use now', now, '', 'clock'), btn('Copy timestamp', function () { copyText(unix.value); }, '', 'copy')])
    ]);
  }

  function toolEncode() {
    var input = inp({ rows: '5', class: 'ax-input ax-mono', placeholder: 'Paste text here…' });
    var output = inp({ rows: '5', class: 'ax-input ax-mono', readonly: 'readonly', placeholder: 'Result shows here' });
    function b64enc(s) { var b = new TextEncoder().encode(s), bin = ''; for (var i = 0; i < b.length; i++) { bin += String.fromCharCode(b[i]); } return btoa(bin); }
    function b64dec(s) { var bin = atob(s.replace(/\s+/g, '')), b = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) { b[i] = bin.charCodeAt(i); } return new TextDecoder().decode(b); }
    function run(fn) { try { output.value = fn(input.value); } catch (e) { output.value = ''; toast('That text could not be converted'); } }
    var ops = [
      ['Base64 encode', b64enc], ['Base64 decode', b64dec],
      ['URL encode', encodeURIComponent], ['URL decode', function (s) { return decodeURIComponent(s.replace(/\+/g, ' ')); }],
      ['HTML escape', function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }],
      ['Format JSON', function (s) { return JSON.stringify(JSON.parse(s), null, 2); }]
    ];
    var grid = h('div', { class: 'ax-btn-grid' });
    ops.forEach(function (o) { grid.appendChild(btn(o[0], function () { run(o[1]); })); });
    return h('div', null, [
      intro('Quick conversions for API keys, callback URLs and module logs. Everything stays in your browser.'),
      field('Input', input),
      grid,
      field('Output', output),
      row([btn('Copy result', function () { copyText(output.value); }, 'primary', 'copy'), btn('Use result as input', function () { input.value = output.value; output.value = ''; })])
    ]);
  }

  /* ---------------------------------------------------------------- */
  /* Snippets                                                          */
  /* ---------------------------------------------------------------- */
  var DEFAULT_SNIPPETS = [
    { t: 'Greeting', b: 'Hello,\n\nThank you for contacting {brand} support.' },
    { t: 'Looking into it', b: 'Thanks for your patience. We are looking into this now and will update you shortly.' },
    { t: 'Sign-off', b: 'If there is anything else we can help with, just reply to this ticket.\n\nKind regards,\n{admin}\n{brand}' }
  ];

  function snippets() {
    var s = store.get('snippets', null);
    if (!Array.isArray(s)) { s = DEFAULT_SNIPPETS.slice(); store.set('snippets', s); }
    return s;
  }

  function fillSnippet(text) {
    var d = new Date();
    return text
      .replace(/\{admin\}/g, (CFG.admin && CFG.admin.name) || '')
      .replace(/\{brand\}/g, CFG.brand || '')
      .replace(/\{date\}/g, d.toLocaleDateString())
      .replace(/\{time\}/g, d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }

  function insertSnippet(sn) {
    var text = fillSnippet(sn.b);
    var f = lastField && document.contains(lastField) ? lastField : null;
    if (!f) { copyText(text); toast('Copied. Click into a reply box first to insert directly.'); return; }
    var start = f.selectionStart != null ? f.selectionStart : f.value.length;
    var end = f.selectionEnd != null ? f.selectionEnd : f.value.length;
    f.value = f.value.slice(0, start) + text + f.value.slice(end);
    try { f.setSelectionRange(start + text.length, start + text.length); } catch (e) {}
    f.dispatchEvent(new Event('input', { bubbles: true }));
    f.focus();
    toast('Inserted “' + sn.t + '”');
  }

  function openSnippets() {
    openPanel('snippets', 'Snippets', 'message', function () {
      var wrap = h('div');
      var list = h('div', { class: 'ax-snips' });
      var editing = -1;
      var title = inp({ type: 'text', placeholder: 'Name, e.g. “Refund approved”' });
      var body = inp({ rows: '5', placeholder: 'Text to insert. You can use {admin}, {brand}, {date} and {time}.' });
      var saveBtn = btn('Save snippet', save, 'primary', 'plus');

      function render() {
        list.textContent = '';
        var all = snippets();
        if (!all.length) { list.appendChild(h('p', { class: 'ax-empty-note', text: 'No snippets yet. Add your first one below.' })); }
        all.forEach(function (sn, i) {
          list.appendChild(h('div', { class: 'ax-snip' }, [
            h('button', { type: 'button', class: 'ax-snip-main', title: 'Insert into the last text box you clicked', onclick: function () { insertSnippet(sn); } }, [
              h('b', { text: sn.t }), h('span', { text: sn.b.replace(/\s+/g, ' ').slice(0, 90) })
            ]),
            h('div', { class: 'ax-snip-actions' }, [
              h('button', { type: 'button', class: 'ax-mini', title: 'Copy', 'aria-label': 'Copy ' + sn.t, onclick: function () { copyText(fillSnippet(sn.b)); } }, [icon('copy')]),
              h('button', { type: 'button', class: 'ax-mini', title: 'Edit', 'aria-label': 'Edit ' + sn.t, onclick: function () { editing = i; title.value = sn.t; body.value = sn.b; saveBtn.lastChild.textContent = 'Update snippet'; title.focus(); } }, [icon('edit')]),
              h('button', { type: 'button', class: 'ax-mini', title: 'Delete', 'aria-label': 'Delete ' + sn.t, onclick: function () {
                var s = snippets(); s.splice(i, 1); store.set('snippets', s); render(); toast('Snippet deleted');
              } }, [icon('trash')])
            ])
          ]));
        });
      }
      function save() {
        var t = title.value.trim(), b = body.value.trim();
        if (!t || !b) { toast('Give the snippet a name and some text'); return; }
        var s = snippets();
        if (editing >= 0 && s[editing]) { s[editing] = { t: t, b: b }; } else { s.push({ t: t, b: b }); }
        store.set('snippets', s.slice(0, 60));
        editing = -1; title.value = ''; body.value = ''; saveBtn.lastChild.textContent = 'Save snippet';
        render(); toast('Snippet saved');
      }
      render();
      wrap.appendChild(intro('Reusable replies for tickets, notes and emails. Click a reply box on the page, then click a snippet to drop it in at the cursor.'));
      wrap.appendChild(list);
      wrap.appendChild(h('h4', { class: 'ax-h4', text: 'Add a snippet' }));
      wrap.appendChild(field('Name', title));
      wrap.appendChild(field('Text', body));
      wrap.appendChild(row([saveBtn, btn('Export', function () { download('aurox-snippets.json', JSON.stringify(snippets(), null, 2), 'application/json'); }, '', 'download')]));
      return wrap;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Notes                                                             */
  /* ---------------------------------------------------------------- */
  function pageNotes() { var n = store.get('page-notes', {}); return n && typeof n === 'object' && !Array.isArray(n) ? n : {}; }

  function openNotes() {
    openPanel('notes', 'Page notes', 'note', function () {
      var key = pageKey();
      var notes = pageNotes();
      var status = h('span', { class: 'ax-field-hint', text: 'Saved automatically in this browser' });
      var pageArea = inp({ rows: '6', placeholder: 'Anything to remember about this page or record…' });
      pageArea.value = (notes[key] && notes[key].n) || '';
      var scratch = inp({ rows: '9', placeholder: 'Your scratchpad: to-dos, numbers, things to follow up…' });
      scratch.value = store.get('notes', '') || '';
      var timer;
      function saved() { status.textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
      pageArea.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          var all = pageNotes();
          if (pageArea.value.trim()) { all[key] = { n: pageArea.value, t: _.pageTitle(), u: location.pathname + location.search, at: Date.now() }; }
          else { delete all[key]; }
          store.set('page-notes', all);
          refreshNoteBadge();
          saved();
        }, 350);
      });
      scratch.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { store.set('notes', scratch.value); saved(); }, 350);
      });

      var others = h('div', { class: 'ax-note-list' });
      Object.keys(pageNotes()).filter(function (k) { return k !== key; }).slice(0, 15).forEach(function (k) {
        var n = pageNotes()[k];
        others.appendChild(h('a', { class: 'ax-note-link', href: n.u }, [icon('note'), h('span', { text: n.t || k })]));
      });

      return h('div', null, [
        intro('Private notes that only you can see, saved in this browser. Handy for “call this client back Friday” or server details you check often.'),
        field('Note for ' + _.pageTitle(), pageArea),
        field('Scratchpad', scratch),
        status,
        others.children.length ? h('h4', { class: 'ax-h4', text: 'Other pages with notes' }) : null,
        others.children.length ? others : null
      ]);
    });
  }

  function refreshNoteBadge() {
    var item = document.getElementById('ax-notes-item');
    if (!item) { return; }
    var link = item.querySelector('.ax-link');
    var old = link.querySelector('.ax-badge');
    if (old) { old.remove(); }
    if (pageNotes()[pageKey()]) { link.appendChild(h('span', { class: 'ax-badge is-accent', title: 'This page has a note', text: '1' })); }
  }

  /* ---------------------------------------------------------------- */
  /* Page guide: what this page is for, tips and related pages         */
  /* ---------------------------------------------------------------- */
  var SRV = (CFG.routes && CFG.routes.services) || 'clientshostinglist.php';
  var DOM = (CFG.routes && CFG.routes.domains) || 'clientsdomainlist.php';
  var GUIDE = {
    'index.php': { t: 'Dashboard', w: 'Your daily starting point: income, orders, tickets and system alerts at a glance.', tips: ['Widgets can be rearranged; drag them to put what you check most at the top.', 'The sidebar counters show what needs attention without opening this page.'], rel: [['Pending orders', 'orders.php?status=Pending'], ['Tickets', 'supporttickets.php'], ['Overdue invoices', 'invoices.php?status=Overdue']] },
    'clients.php': { t: 'Clients', w: 'Every customer account. Search, filter and open any client from here.', tips: ['Faster: Ctrl/⌘ + K, then type “c” and the client ID.', 'Use the filter box above the table to narrow this page instantly.'], rel: [['Add new client', 'clientsadd.php'], ['Products / services', SRV], ['Domains', DOM]] },
    'clientsadd.php': { t: 'Add new client', w: 'Create a customer account by hand, for phone or walk-in sales.', tips: ['Tick the option to send the welcome email so the client gets their login.', 'You can add an order for them straight after from Orders › Add new order.'], rel: [['Add new order', 'ordersadd.php'], ['All clients', 'clients.php']] },
    'clientssummary.php': { t: 'Client summary', w: 'One client’s home: profile, services, domains, invoices, tickets and notes, reached through the tabs.', tips: ['Pin this page (star in the sidebar) if you work with this client often.', 'Use Page notes in the menu to keep your own reminder about this client.'], rel: [['All clients', 'clients.php'], ['Open new ticket', 'supporttickets.php?action=open']] },
    'clientsservices.php': { t: 'Service details', w: 'Settings for one product or hosting account: billing, server, module commands and custom fields.', tips: ['Module buttons such as Create, Suspend and Terminate talk to the server immediately.', 'Check the Module log under Utilities if a command fails.'], rel: [['Products / services list', SRV]] },
    'clientsdomains.php': { t: 'Domain details', w: 'Registration, nameservers, renewal and registrar commands for one domain.', tips: ['Registrar commands run live at the registrar.', 'The WHOIS tool under Utilities checks public records.'], rel: [['All domains', DOM], ['WHOIS lookup', 'whois.php']] },
    'clientshostinglist.php': { t: 'Products / services', w: 'Every service across all clients, with status, next due date and server.', tips: ['Filter by status or server to find accounts quickly.', 'Copy or download the visible rows as CSV with the table tools.'], rel: [['Domains', DOM], ['Cancellation requests', 'cancelrequests.php']] },
    'clientsdomainlist.php': { t: 'Domains', w: 'All registered and pending domains, with expiry dates and registrars.', tips: ['Sort by expiry to catch renewals early.'], rel: [['Domain pricing', 'configdomains.php'], ['Registrars', 'configregistrars.php']] },
    'cancelrequests.php': { t: 'Cancellation requests', w: 'Clients who asked to cancel, either at the end of the billing period or right away.', tips: ['Reach out before the date to try to keep the customer.'], rel: [['Products / services', SRV]] },
    'orders.php': { t: 'Orders', w: 'New sign-ups and upgrades. Pending orders wait for you to accept, run a fraud check or cancel.', tips: ['Accepting an order can create the account on the server and send welcome emails.', 'The sidebar badge shows how many are pending.'], rel: [['Pending orders', 'orders.php?status=Pending'], ['Add new order', 'ordersadd.php']] },
    'ordersadd.php': { t: 'Add new order', w: 'Place an order for a client yourself, with any product, domain or promo code.', tips: ['Choose whether to send the order confirmation and generate an invoice.'], rel: [['All orders', 'orders.php'], ['Add new client', 'clientsadd.php']] },
    'invoices.php': { t: 'Invoices', w: 'Every invoice, with filters for paid, unpaid, overdue and cancelled.', tips: ['Open one by ID: Ctrl/⌘ + K, then “i” and the number.', 'Plan prices with the Pricing tool in the Toolbox.'], rel: [['Unpaid', 'invoices.php?status=Unpaid'], ['Overdue', 'invoices.php?status=Overdue'], ['Transactions', 'transactions.php']] },
    'transactions.php': { t: 'Transactions', w: 'Payments, refunds and fees recorded from your gateways or added by hand.', tips: ['Check the Gateway log if a payment did not show up.'], rel: [['Gateway log', 'gatewaylog.php'], ['Invoices', 'invoices.php']] },
    'gatewaylog.php': { t: 'Gateway log', w: 'Raw callbacks from payment gateways. The first place to look when a payment did not mark an invoice paid.', tips: ['Use the Encode tool to make JSON callbacks readable.'], rel: [['Payment gateways', 'configgateways.php'], ['Transactions', 'transactions.php']] },
    'quotes.php': { t: 'Quotes', w: 'Price proposals you send to clients or prospects. An accepted quote can become an invoice.', tips: ['Use the Pricing tool to work out multi-year totals.'], rel: [['New quote', 'quotes.php?action=manage']] },
    'supporttickets.php': { t: 'Support tickets', w: 'Your support queue. Open a ticket to reply, change its status or department, or add private notes.', tips: ['Use Snippets in the sidebar to insert saved replies at the cursor.', 'Open a ticket by its internal ID with Ctrl/⌘ + K, then “t” and the number.'], rel: [['Open new ticket', 'supporttickets.php?action=open'], ['Predefined replies', 'supportticketpredefinedreplies.php']] },
    'supportkb.php': { t: 'Knowledgebase', w: 'Help articles clients can read in the client area, so fewer tickets get opened.', tips: ['Turn your most common ticket answers into articles.'], rel: [['Announcements', 'supportannouncements.php']] },
    'reports.php': { t: 'Reports', w: 'Income, sales, client and support reports. Most can be exported.', tips: ['Pin the reports you check every month.'], rel: [['Transactions', 'transactions.php']] },
    'systemactivitylog.php': { t: 'Activity log', w: 'A record of what happened in WHMCS: logins, changes, automation and errors.', tips: ['Use the Timestamp tool if you need to convert times from other logs.'], rel: [['Automation status', 'automationstatus.php'], ['System health', 'systemhealthandupdates.php']] },
    'automationstatus.php': { t: 'Automation status', w: 'Shows whether the daily cron ran and what it did: invoices, suspensions, reminders.', tips: ['If nothing ran today, check the cron job on your server.'], rel: [['Automation settings', 'configautomation.php']] },
    'configgeneral.php': { t: 'General settings', w: 'Core settings for your whole WHMCS: company details, localisation, ordering, invoicing, support and security.', tips: ['Settings are split across the tabs at the top of the page.', 'Use Ctrl/⌘ + K and type a setting area such as “tax” or “gateways” to jump straight there.'], rel: [['Payment gateways', 'configgateways.php'], ['Email templates', 'configemailtemplates.php'], ['Tax', 'configtax.php']] },
    'configproducts.php': { t: 'Products / services', w: 'The plans you sell: pricing, modules, server settings and what clients see when ordering.', tips: ['Work out cycle prices with the Pricing tool before entering them.'], rel: [['Product addons', 'configaddons.php'], ['Promotions', 'configpromotions.php'], ['Servers', 'configservers.php']] },
    'configgateways.php': { t: 'Payment gateways', w: 'Activate and configure the ways clients can pay you.', tips: ['After changing a gateway, check the Gateway log on the next payment.'], rel: [['Gateway log', 'gatewaylog.php'], ['Currencies', 'configcurrencies.php']] },
    'configemailtemplates.php': { t: 'Email templates', w: 'Every email WHMCS sends: welcome, invoices, tickets, suspensions and more.', tips: ['Send yourself a test before saving big changes.'], rel: [['General settings', 'configgeneral.php']] },
    'configservers.php': { t: 'Servers', w: 'The hosting servers WHMCS connects to for creating and managing accounts.', tips: ['Use “Test connection” after changing credentials.'], rel: [['Products / services', 'configproducts.php']] },
    'configadmins.php': { t: 'Administrators', w: 'Staff accounts, their roles and their ticket departments.', tips: ['Give each person the smallest role that lets them do their job.'], rel: [['Administrator roles', 'configadminroles.php']] },
    'configaddonmods.php': { t: 'Addon modules', w: 'Activate, configure and set access for addon modules, including Aurox Admin.', tips: ['Each addon has an Access Control list: tick the roles allowed to open it.'], rel: [['Addons menu', 'addonmodules.php']] },
    'addonmodules.php': { t: 'Addons', w: 'Pages added by your activated addon modules.', tips: ['Open Aurox Admin from here to change your personal theme settings.'], rel: [['Aurox Admin', 'addonmodules.php?module=auroxadmin'], ['Addon modules setup', 'configaddonmods.php']] }
  };

  function guideFor() {
    var g = GUIDE[_.HERE.page];
    if (_.HERE.page === 'supporttickets.php' && _.HERE.params.action === 'view') {
      return { t: 'Ticket', w: 'One support conversation. Reply at the bottom, change status, department or priority, and add private notes only staff can see.', tips: ['Click into the reply box, then use Snippets to insert saved text at the cursor.', 'Add a private note for teammates instead of replying to the client.'], rel: [['All tickets', 'supporttickets.php'], ['Predefined replies', 'supportticketpredefinedreplies.php']] };
    }
    if (_.HERE.page === 'invoices.php' && _.HERE.params.action === 'edit') {
      return { t: 'Invoice', w: 'One invoice: line items, payments, refunds and the email sent to the client.', tips: ['Add a payment here when a client pays by bank transfer.', 'Use the Pricing tool to check tax maths.'], rel: [['All invoices', 'invoices.php'], ['Transactions', 'transactions.php']] };
    }
    if (_.HERE.page === 'orders.php' && _.HERE.params.action === 'view') {
      return { t: 'Order', w: 'One order: what was bought, payment status, fraud check result and the accept/cancel buttons.', tips: ['Accepting can provision the account on the server and send the welcome email.'], rel: [['Pending orders', 'orders.php?status=Pending']] };
    }
    return g || null;
  }

  function openGuide() {
    openPanel('guide', 'Page guide', 'info', function () {
      var g = guideFor();
      var wrap = h('div');
      if (g) {
        wrap.appendChild(h('div', { class: 'ax-guide-hero' }, [h('span', { class: 'ax-guide-kicker', text: 'You are on' }), h('h4', { text: g.t }), h('p', { text: g.w })]));
        if (g.tips && g.tips.length) {
          wrap.appendChild(h('h4', { class: 'ax-h4', text: 'Good to know' }));
          var ul = h('ul', { class: 'ax-tips' });
          g.tips.forEach(function (t) { ul.appendChild(h('li', { text: t })); });
          wrap.appendChild(ul);
        }
        if (g.rel && g.rel.length) {
          wrap.appendChild(h('h4', { class: 'ax-h4', text: 'Related pages' }));
          var rel = h('div', { class: 'ax-rel' });
          g.rel.forEach(function (r) { rel.appendChild(h('a', { class: 'ax-rel-link', href: _.resolve(r[1]) }, [r[0], icon('chev')])); });
          wrap.appendChild(rel);
        }
      } else {
        wrap.appendChild(h('div', { class: 'ax-guide-hero' }, [h('span', { class: 'ax-guide-kicker', text: 'You are on' }), h('h4', { text: _.pageTitle() }), h('p', { text: 'There is no written guide for this page yet, but everything below still works here.' })]));
      }
      wrap.appendChild(h('h4', { class: 'ax-h4', text: 'Works on every page' }));
      var ul2 = h('ul', { class: 'ax-tips' });
      [_.MOD + ' + K opens search. Type a page name, or “c 42” for client #42.', 'The star at the top of the sidebar pins this page.', 'Page notes keeps a private reminder for this exact page.', 'Press ? to see every keyboard shortcut.'].forEach(function (t) { ul2.appendChild(h('li', { text: t })); });
      wrap.appendChild(ul2);
      wrap.appendChild(row([btn('Take the tour', function () { closePanel(); startTour(); }, '', 'compass'), h('a', { class: 'ax-btn', href: 'https://docs.whmcs.com/', target: '_blank', rel: 'noopener' }, [icon('external'), 'WHMCS docs'])]));
      return wrap;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Guided tour                                                       */
  /* ---------------------------------------------------------------- */
  var tour = null;
  var STEPS = [
    { sel: '.ax-nav', title: 'Everything in one menu', text: 'Every main WHMCS area is here, grouped by job. The page you are on is highlighted, and groups open to show their pages.' },
    { sel: '.ax-search', title: 'Jump anywhere', text: 'Press ' + _.MOD + ' + K (or /) and type. Try a page name like “gateways”, or “c 42” to open client #42, “i 1050” for an invoice.' },
    { sel: '[data-ax-action="pin"]', title: 'Pin what you use', text: 'Tap the star to pin the page you are on. Pinned pages sit at the top of this menu.' },
    { sel: '.ax-group > .ax-item > .ax-link > .ax-badge', title: 'What needs you', text: 'These numbers show pending orders, overdue invoices and tickets waiting for a reply. They refresh every minute.' },
    { sel: '.ax-tools-group', title: 'Help and tools', text: 'Page guide explains the page you are on. Toolbox has password, date, pricing and other calculators. Snippets and Page notes save you typing.' },
    { sel: '.ax-foot', title: 'Make it yours', text: 'Switch light or dark, see keyboard shortcuts, or shrink the menu to icons. Press ? anytime for help.' }
  ];

  function startTour() {
    endTour(true);
    _.closeOverlays();
    closePanel();
    if (window.innerWidth < 992) { _.openDrawer(); }
    var steps = STEPS.filter(function (s) {
      var n = document.querySelector(s.sel);
      return n && n.getClientRects().length > 0;
    });
    if (!steps.length) { return; }
    var spot = h('div', { class: 'ax-spot' });
    var card = h('div', { class: 'ax-tour-card', role: 'dialog', 'aria-live': 'polite' });
    var shield = h('div', { class: 'ax-tour-shield', onclick: function () { endTour(); } });
    document.body.appendChild(shield);
    document.body.appendChild(spot);
    document.body.appendChild(card);
    tour = { i: 0, steps: steps, spot: spot, card: card, shield: shield };
    showStep();
    window.addEventListener('resize', showStep);
  }

  function showStep() {
    if (!tour) { return; }
    var s = tour.steps[tour.i], target = document.querySelector(s.sel);
    if (!target) { return; }
    if (target.scrollIntoView) { try { target.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
    var r = target.getBoundingClientRect(), padPx = 6;
    var top = Math.max(4, r.top - padPx), height = Math.min(window.innerHeight - top - 8, r.height + padPx * 2);
    tour.spot.style.cssText = 'top:' + top + 'px;left:' + (r.left - padPx) + 'px;width:' + (r.width + padPx * 2) + 'px;height:' + height + 'px';
    var c = tour.card;
    c.textContent = '';
    var last = tour.i === tour.steps.length - 1;
    c.appendChild(h('span', { class: 'ax-tour-step', text: 'Step ' + (tour.i + 1) + ' of ' + tour.steps.length }));
    c.appendChild(h('h4', { text: s.title }));
    c.appendChild(h('p', { text: s.text }));
    c.appendChild(h('div', { class: 'ax-tour-actions' }, [
      h('button', { type: 'button', class: 'ax-btn ax-btn-ghost', onclick: function () { endTour(); }, text: 'Skip' }),
      tour.i ? h('button', { type: 'button', class: 'ax-btn', onclick: function () { tour.i--; showStep(); }, text: 'Back' }) : null,
      h('button', { type: 'button', class: 'ax-btn ax-btn-primary', onclick: function () { if (last) { endTour(); toast('You are all set. Press ? anytime for help.'); } else { tour.i++; showStep(); } }, text: last ? 'Done' : 'Next' })
    ]));
    var cw = Math.min(320, window.innerWidth - 24), left, topC;
    if (r.right + cw + 24 < window.innerWidth) { left = r.right + 16; topC = Math.max(12, Math.min(r.top, window.innerHeight - 230)); }
    else { left = Math.max(12, Math.min(r.left, window.innerWidth - cw - 12)); topC = r.bottom + 14 + 220 < window.innerHeight ? r.bottom + 14 : Math.max(12, r.top - 230); }
    c.style.cssText = 'left:' + left + 'px;top:' + topC + 'px;width:' + cw + 'px';
    var focusBtn = c.querySelector('.ax-btn-primary');
    if (focusBtn) { focusBtn.focus(); }
  }

  function endTour(silent) {
    if (!tour) { return; }
    ['spot', 'card', 'shield'].forEach(function (k) { if (tour[k] && tour[k].parentNode) { tour[k].parentNode.removeChild(tour[k]); } });
    window.removeEventListener('resize', showStep);
    tour = null;
    store.set('toured', '1');
    if (!silent && window.innerWidth < 992) { document.documentElement.classList.remove('ax-open'); }
  }

  document.addEventListener('keydown', function (e) {
    if (!tour) { return; }
    if (e.key === 'Escape') { endTour(); }
    else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); if (tour.i < tour.steps.length - 1) { tour.i++; showStep(); } else { endTour(); } }
    else if (e.key === 'ArrowLeft' && tour.i) { tour.i--; showStep(); }
  }, true);

  function offerTour() {
    if (CFG.tour === false || store.get('toured', null) || window.innerWidth < 600) { return; }
    var card = h('div', { class: 'ax-welcome', role: 'dialog', 'aria-label': 'Welcome' }, [
      h('span', { class: 'ax-welcome-icon' }, [icon('compass')]),
      h('div', null, [
        h('b', { text: 'Welcome to your new admin' }),
        h('p', { text: 'Take a 30-second tour of the menu, search and tools?' }),
        h('span', { class: 'ax-welcome-credit', text: 'Aurox Admin by Chimnadindu Great Chibueze' }),
        h('div', { class: 'ax-tour-actions' }, [
          h('button', { type: 'button', class: 'ax-btn ax-btn-ghost', text: 'Maybe later', onclick: function () { store.set('toured', 'later'); card.remove(); } }),
          h('button', { type: 'button', class: 'ax-btn ax-btn-primary', text: 'Show me', onclick: function () { card.remove(); startTour(); } })
        ])
      ])
    ]);
    setTimeout(function () { document.body.appendChild(card); }, 900);
  }

  /* ---------------------------------------------------------------- */
  /* Table tools: filter rows, copy and download CSV                   */
  /* ---------------------------------------------------------------- */
  function enhanceTables() {
    var tables = document.querySelectorAll('table.datatable, #contentarea table.table, .contentarea table.table');
    Array.prototype.forEach.call(tables, function (t) {
      if (t.getAttribute('data-ax-tools') || t.closest('#ax-sidebar, #ax-panel, .ax-overlay, .ax-tool, .modal')) { return; }
      var rows = Array.prototype.filter.call(t.querySelectorAll('tr'), function (r) { return r.closest('table') === t && r.querySelector('td') && !r.querySelector('th'); });
      if (rows.length < 8) { return; }
      t.setAttribute('data-ax-tools', '1');

      var headRow = t.querySelector('thead tr') || Array.prototype.filter.call(t.querySelectorAll('tr'), function (r) { return r.closest('table') === t && r.querySelector('th'); })[0];
      var heads = headRow ? Array.prototype.map.call(headRow.children, function (c) { return c.textContent.replace(/\s+/g, ' ').trim(); }) : [];

      var filter = h('input', { type: 'search', class: 'ax-input', placeholder: 'Filter rows on this page…', 'aria-label': 'Filter table rows', 'data-ax-ignore': '1' });
      var count = h('span', { class: 'ax-tt-count', text: rows.length + ' rows' });

      function visibleRows() { return rows.filter(function (r) { return r.style.display !== 'none'; }); }
      function skipFirst() {
        return rows.every(function (r) { var c = r.cells[0]; return c && !c.textContent.trim() && c.querySelector('input[type="checkbox"]'); }) || (heads[0] === '' && rows[0].cells[0] && rows[0].cells[0].querySelector('input[type="checkbox"]'));
      }
      function csv() {
        var skip = skipFirst() ? 1 : 0;
        var lines = [];
        function cell(v) { v = String(v).replace(/\s+/g, ' ').trim(); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
        if (heads.length) { lines.push(heads.slice(skip).map(cell).join(',')); }
        visibleRows().forEach(function (r) { lines.push(Array.prototype.slice.call(r.cells, skip).map(function (c) { return cell(c.textContent); }).join(',')); });
        return lines.join('\n');
      }
      filter.addEventListener('input', function () {
        var terms = filter.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
        rows.forEach(function (r) {
          var text = r.textContent.toLowerCase();
          var ok = terms.every(function (q) { return text.indexOf(q) !== -1; });
          r.style.display = ok ? '' : 'none';
          if (ok) { shown++; }
        });
        count.textContent = terms.length ? shown + ' of ' + rows.length + ' rows' : rows.length + ' rows';
      });
      filter.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); } if (e.key === 'Escape') { filter.value = ''; filter.dispatchEvent(new Event('input')); } });

      var bar = h('div', { class: 'ax-tabletools', 'data-ax-ignore': '1' }, [
        h('span', { class: 'ax-tt-search' }, [icon('filter'), filter]),
        count,
        h('span', { class: 'ax-tt-spacer' }),
        h('button', { type: 'button', class: 'ax-btn ax-btn-sm', title: 'Copy the visible rows as CSV', onclick: function () { copyText(csv()); } }, [icon('copy'), 'Copy']),
        h('button', { type: 'button', class: 'ax-btn ax-btn-sm', title: 'Download the visible rows as a CSV file', onclick: function () {
          download((_.HERE.page.replace('.php', '') || 'table') + '-' + ymd(new Date()) + '.csv', csv(), 'text/csv;charset=utf-8');
        } }, [icon('download'), 'CSV'])
      ]);
      var anchor = t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('tablebg') ? t.parentNode : t;
      anchor.parentNode.insertBefore(bar, anchor);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Unsaved changes guard                                             */
  /* ---------------------------------------------------------------- */
  function guardForms() {
    var dirty = false;
    function mark(e) {
      var t = e.target;
      if (!t || !t.form || t.closest('[data-ax-ignore], #ax-panel, .ax-overlay, #ax-sidebar, .modal')) { return; }
      if ((t.type === 'checkbox' || t.type === 'radio') && t.closest('table.datatable, table.table')) { return; }
      if ((t.form.getAttribute('method') || 'get').toLowerCase() !== 'post') { return; }
      dirty = true;
    }
    document.addEventListener('input', mark, true);
    document.addEventListener('change', mark, true);
    document.addEventListener('submit', function () { dirty = false; }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[type="submit"], input[type="submit"], form .btn-primary') : null;
      if (b) { dirty = false; }
    }, true);
    window.addEventListener('beforeunload', function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ''; return ''; }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Wire everything up                                                */
  /* ---------------------------------------------------------------- */
  function init() {
    var framed = _.FRAMED;

    if (CFG.tableTools !== false) { enhanceTables(); }
    if (CFG.guard !== false) { guardForms(); }
    if (framed) { return; }

    if (CFG.tools !== false) {
      _.addSidebarGroup('Help & tools', [
        { label: 'Page guide', icon: 'info', onClick: openGuide, hint: 'What this page is for (I)' },
        { label: 'Toolbox', icon: 'toolbox', onClick: function () { openToolbox(); }, hint: 'Password, date, pricing and other tools (B)' },
        { label: 'Snippets', icon: 'message', onClick: openSnippets, hint: 'Saved replies you can insert (S)' },
        { label: 'Page notes', icon: 'note', onClick: openNotes, id: 'ax-notes-item', hint: 'Private notes for this page, saved in your browser (M)' },
        { label: 'Take the tour', icon: 'compass', onClick: startTour, hint: 'A quick walk through the menu' }
      ], 'ax-tools-group');
      refreshNoteBadge();

      _.keys.i = openGuide;
      _.keys.b = function () { openToolbox(); };
      _.keys.s = openSnippets;
      _.keys.m = openNotes;
      _.shortcuts.push(['I', 'Page guide'], ['B', 'Toolbox'], ['S', 'Snippets'], ['M', 'Page notes']);

      _.commands.push(function () {
        var items = [
          { group: 'Tools', title: 'Page guide: what is this page?', icon: 'info', run: openGuide, keys: 'i', words: 'help explain' },
          { group: 'Tools', title: 'Snippets', icon: 'message', run: openSnippets, keys: 's', words: 'canned reply text' },
          { group: 'Tools', title: 'Page notes', icon: 'note', run: openNotes, keys: 'm', words: 'notes scratchpad reminder' },
          { group: 'Tools', title: 'Take the tour', icon: 'compass', run: startTour, words: 'help onboarding' }
        ];
        TOOLS.forEach(function (t) {
          items.push({ group: 'Tools', title: t.label + ' tool', hint: 'Toolbox', icon: t.icon, run: function () { openToolbox(t.id); }, words: t.words });
        });
        snippets().forEach(function (sn) {
          items.push({ group: 'Tools', title: 'Insert snippet: ' + sn.t, hint: sn.b.replace(/\s+/g, ' ').slice(0, 70), icon: 'insert', run: function () { insertSnippet(sn); } });
        });
        return items;
      });

      _.actions.tour = startTour;
      _.actions.guide = openGuide;
      _.actions.toolbox = function () { openToolbox(); };
      _.actions.snippets = openSnippets;
      _.actions.notes = openNotes;

      offerTour();
    }
  }

  UI.tools = { open: openToolbox, guide: openGuide, snippets: openSnippets, notes: openNotes, tour: startTour, closePanel: closePanel };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
