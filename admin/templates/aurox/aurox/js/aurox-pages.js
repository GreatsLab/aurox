/*!
 * Aurox Admin for WHMCS - page layer
 * Makes WHMCS's own pages fit every screen and read better:
 *  - data tables become cards on phones (nested and DataTables ones too)
 *  - wide tables scroll inside their card instead of stretching the page
 *  - status words become coloured pills, old GIF icons become Aurox icons
 *  - the client profile gets a header card, toggle chips and (on phones)
 *    collapsible sections
 *  - long tab rows get an "all tabs" picker on phones
 *  - invoice totals become tiles
 *  - an overflow guard fixes anything still wider than a phone screen, and
 *    Help > Check page layout reports what it fixed
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 */
(function (window, document) {
  'use strict';

  var UI = window.AuroxUI;
  if (!UI || !UI._) { return; }
  var _ = UI._, h = _.h, icon = _.icon, store = _.store;
  var root = document.documentElement;
  var area = document.getElementById('contentarea');
  if (!area) { return; }

  var mqPhone = window.matchMedia ? window.matchMedia('(max-width: 767px)') : { matches: false };
  var mqCards = window.matchMedia ? window.matchMedia('(max-width: 639px)') : { matches: false };
  function isPhone() { return mqPhone.matches; }
  function txt(el) { return (el ? el.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
  var report = { fixed: [], cards: 0, scrolls: 0, pills: 0, icons: 0 };

  /* Places Aurox leaves alone */
  var SKIP = '.modal, #sidebar, #ax-sidebar, .ax-overlay, #ax-panel, .ui-datepicker, .dropdown-menu, .intellisearchresults, .ax-lc, .ax-pick, .selectize-dropdown, .iti__country-list';
  function skipped(el) { return !!(el.closest && el.closest(SKIP)); }

  /* ---------------------------------------------------------------- */
  /* Status pills                                                      */
  /* ---------------------------------------------------------------- */
  var TONE = {};
  [['green', 'active,paid,completed,complete,accepted,approved,delivered,success,successful,enabled,online,registered,answered,valid,live,yes'],
   ['orange', 'pending,unpaid,customer-reply,pending transfer,pending registration,payment pending,grace,suspended,awaiting reply,partially paid,pending deletion'],
   ['red', 'overdue,terminated,fraud,collections,expired,redemption,failed,error,declined,dead,inactive client'],
   ['blue', 'open,in progress,new,processing,sent,delivered to client'],
   ['gray', 'closed,cancelled,canceled,inactive,draft,transferred away,on hold,disabled,offline,no,lost'],
   ['purple', 'refunded,chargeback']].forEach(function (pair) {
    pair[1].split(',').forEach(function (w) { TONE[w] = pair[0]; });
  });
  function toneOf(text) {
    var k = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    return Object.prototype.hasOwnProperty.call(TONE, k) ? TONE[k] : null;
  }

  function pillify(scope) {
    // WHMCS labels: <span class="label active">Active</span>
    each(scope.querySelectorAll('span.label:not(.ax-pill), .label-status:not(.ax-pill)'), function (el) {
      if (skipped(el)) { return; }
      var tone = toneOf(txt(el));
      if (!tone) { return; }
      el.classList.add('ax-pill', 'is-' + tone);
      report.pills++;
    });
    // Plain status words in table cells
    each(scope.querySelectorAll('table.datatable td, table.table td, table.dataTable td, table.clientssummarystats td'), function (td) {
      if (td.getAttribute('data-ax-pill') || skipped(td)) { return; }
      td.setAttribute('data-ax-pill', '1');
      var tr = td.parentNode;
      if (tr && tr.cells && tr.cells.length === 2 && td.cellIndex === 0 && td.closest('table.clientssummarystats')) { return; } // a row label, not a status
      var t = txt(td);
      if (!t || t.length > 24) { return; }
      var tone = toneOf(t);
      if (!tone || td.querySelector('input, select, textarea, button, img, a, .ax-pill, .label')) { return; }
      if (td.children.length > 1) { return; }
      var pill = h('span', { class: 'ax-pill is-' + tone });
      while (td.firstChild) { pill.appendChild(td.firstChild); }
      td.appendChild(pill);
      report.pills++;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Old WHMCS icons (16px GIF/PNG) become Aurox icons                  */
  /* ---------------------------------------------------------------- */
  var LEGACY = {
    'edit.gif': 'pencil', 'delete.gif': 'bin', 'delete.png': 'bin', 'clientlogin.png': 'login', 'clientsadd.png': 'userplus',
    'invoicesedit.png': 'receipt', 'invoices.png': 'receipt', 'addfunds.png': 'wallet', 'ticketspredefined.png': 'refresh',
    'billableitems.png': 'list', 'income.png': 'coins', 'quotes.png': 'note', 'orders.png': 'cart', 'ordersadd.png': 'plus',
    'add.png': 'plus', 'reports.png': 'chart', 'ticketsopen.png': 'support', 'ticketsother.png': 'inbox', 'affiliates.png': 'share',
    'clients.png': 'merge', 'csvexports.png': 'download', 'email.png': 'mail', 'emails.png': 'mail', 'search.png': 'search',
    'notes.png': 'note', 'products.png': 'box', 'domains.png': 'globe', 'tick.png': 'check', 'ticks.png': 'check', 'cross.png': 'x',
    'logs.png': 'list', 'transactions.png': 'coins', 'printer.png': 'file', 'quote.png': 'message', 'attachment.png': 'file'
  };
  function swapIcons(scope) {
    each(scope.querySelectorAll('img[src*="images/"]'), function (img) {
      if (img.getAttribute('data-ax-swapped') || skipped(img)) { return; }
      var file = (img.getAttribute('src') || '').split('?')[0].split('/').pop().toLowerCase();
      var name = LEGACY[file];
      if (!name) { return; }
      img.setAttribute('data-ax-swapped', '1');
      var link = img.closest('a');
      if (link && (link.id === 'btnCloseClient')) { name = 'ban'; }
      var svg = icon(name, 'ax-legacy-ico' + (name === 'bin' ? ' is-danger' : ''));
      var label = img.getAttribute('alt') || img.getAttribute('title') || '';
      if (label) { svg.setAttribute('aria-label', label); svg.removeAttribute('aria-hidden'); svg.setAttribute('role', 'img'); }
      img.parentNode.insertBefore(svg, img);
      img.classList.add('ax-legacy-img');
      // Some WHMCS icons carry the click handler themselves (for example "delete file").
      if (img.getAttribute('onclick') || img.onclick) {
        svg.style.cursor = 'pointer';
        svg.addEventListener('click', function (e) { e.preventDefault(); img.click(); });
      }
      if (link && !txt(link)) { link.classList.add('ax-icon-link'); if (label && !link.getAttribute('title')) { link.setAttribute('title', label); } }
      report.icons++;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tables: cards on phones, sideways scrolling when too wide          */
  /* ---------------------------------------------------------------- */
  var CARD_TABLES = 'table.datatable, table.table, table.dataTable';

  function headerRow(t) {
    if (t.tHead && t.tHead.rows.length) { return t.tHead.rows[t.tHead.rows.length - 1]; }
    for (var i = 0; i < t.rows.length && i < 3; i++) {
      var r = t.rows[i];
      if (r.cells.length && r.querySelectorAll('th').length === r.cells.length) { return r; }
    }
    return null;
  }

  function bodyRows(t, head) {
    var out = [];
    each(t.tBodies, function (tb) {
      each(tb.rows, function (r) { if (r !== head && r.cells.length) { out.push(r); } });
    });
    return out;
  }
  function allTh(r) { return r.querySelectorAll('th').length === r.cells.length; }
  function hasSpan(r) { for (var i = 0; i < r.cells.length; i++) { if (r.cells[i].colSpan > 1) { return true; } } return false; }

  function labelsOf(head) {
    var labels = [];
    for (var i = 0; i < head.cells.length; i++) {
      var c = head.cells[i];
      if (c.colSpan > 1) { return null; }
      labels.push(c.querySelector('input[type="checkbox"]') && !txt(c) ? '' : txt(c));
    }
    return labels;
  }

  function onlyControls(c) {
    if (txt(c)) { return false; }
    return !!c.querySelector('a, button, img, svg, input[type="checkbox"], input[type="radio"]');
  }

  function labelRows(t, labels) {
    var rows = bodyRows(t, t._axHead);
    rows.forEach(function (r) {
      if (r.getAttribute('data-ax-row') === String(r.cells.length)) { return; }
      r.setAttribute('data-ax-row', String(r.cells.length));
      if (r.cells.length === 1) { r.classList.add('ax-row-note'); r.cells[0].setAttribute('data-label', ''); return; }
      // Group headings and total lines ("Group Name: ...", "Sub Total: $15.88")
      if (r.cells.length !== labels.length || hasSpan(r) || allTh(r)) {
        r.classList.add('ax-row-span');
        each(r.cells, function (c) { c.setAttribute('data-label', ''); c.classList.toggle('ax-cell-empty', !txt(c) && !c.querySelector('img, svg, input, select, a, button')); });
        return;
      }
      var first = true, acts = 0;
      for (var i = 0; i < r.cells.length; i++) {
        var c = r.cells[i], lab = labels[i] || '';
        c.classList.remove('ax-cell-check', 'ax-cell-first', 'ax-cell-act', 'ax-cell-act-first', 'ax-cell-empty');
        if (!lab && c.querySelector('input[type="checkbox"]') && !txt(c) && !c.querySelector('a')) {
          c.classList.add('ax-cell-check'); r.classList.add('ax-has-check'); c.setAttribute('data-label', ''); continue;
        }
        if (!lab && onlyControls(c)) {
          c.classList.add('ax-cell-act'); if (!acts) { c.classList.add('ax-cell-act-first'); } acts++; c.setAttribute('data-label', ''); continue;
        }
        if (first) { c.classList.add('ax-cell-first'); c.setAttribute('data-label', ''); first = false; continue; }
        var tv = txt(c);
        c.classList.remove('ax-cell-stack');
        if ((!tv || /^[-–—]+$|^n\/a$/i.test(tv)) && !c.querySelector('img, svg, input, select, button, textarea, .ax-pill')) { c.classList.add('ax-cell-empty'); }
        else if (tv.length > 46 || c.querySelector('textarea, select, input[type="text"], input[type="number"], .form-control, br, ul, ol, p')) { c.classList.add('ax-cell-stack'); }
        c.setAttribute('data-label', lab);
      }
      r.classList.toggle('ax-has-acts', acts > 0);
    });
  }

  function cardify(scope) {
    each(scope.querySelectorAll(CARD_TABLES), function (t) {
      if (t.classList.contains('ax-nocards') || skipped(t) || t.closest('.dataTables_scrollHead, .ax-scroll-keep') || t.classList.contains('form')) { return; }
      if (t.classList.contains('ax-cardify')) { labelRows(t, t._axLabels); return; }
      var head = headerRow(t);
      if (!head) { return; }
      var labels = labelsOf(head);
      if (!labels || labels.length < 2 || labels.length > 14) { return; }
      var rows = bodyRows(t, head);
      if (!rows.length) { return; }
      // Cards need ordinary rows; group headings / totals that span columns are fine,
      // rows with a different shape and no spanning cell are not (an unusual table).
      var good = 0, bad = 0;
      rows.forEach(function (r) {
        if (r.cells.length === 1) { return; }
        if (r.cells.length === labels.length && !hasSpan(r) && !allTh(r)) { good++; }
        else if (!(hasSpan(r) || allTh(r))) { bad++; }
      });
      if (bad || (!good && rows.some(function (r) { return r.cells.length > 1; }))) { return; }
      t._axHead = head; t._axLabels = labels;
      head.classList.add('ax-head-row');
      labelRows(t, labels);
      t.classList.add('ax-cardify');
      var cell = t.closest('td');
      if (cell) { cell.classList.add('ax-has-cards'); }
      report.cards++;
    });
  }

  /* DataTables redraw rows on sort, search and paging: label the new rows. */
  function watchDataTables() {
    var $ = window.jQuery;
    if (!$ || !$.fn) { return; }
    $(document).on('draw.dt init.dt', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'TABLE') { return; }
      var wrapper = t.closest('.dataTables_wrapper');
      if (wrapper) { wrapper.classList.toggle('ax-dt-empty', !!t.querySelector('td.dataTables_empty') || !bodyRows(t, headerRow(t)).length); }
      if (t.classList.contains('ax-cardify') && t._axLabels) { labelRows(t, t._axLabels); }
      else { cardify(t.parentNode || area); }
      pillify(t); swapIcons(t);
      schedule();
    });
  }

  function wrapWide(scope) {
    each(scope.querySelectorAll('table'), function (t) {
      if (skipped(t) || t.closest('.ax-scroll, .table-responsive, .dataTables_scrollBody, .dataTables_scrollHead, div.tablebg, .listtable')) { return; }
      if (t.classList.contains('ax-cardify') && mqCards.matches) { return; }
      if (t.classList.contains('form') || t.classList.contains('clientssummarystats')) { return; }
      var holder = t.parentNode;
      if (!holder || !holder.clientWidth || t.offsetWidth <= holder.clientWidth + 2) { return; }
      var wrap = h('div', { class: 'ax-scroll' });
      holder.insertBefore(wrap, t);
      wrap.appendChild(t);
      report.scrolls++;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Client profile (clientssummary.php)                                */
  /* ---------------------------------------------------------------- */
  var BOX_DEFAULT_CLOSED = { info: 1, contacts: 1, paymethods: 1, other: 1, files: 1, emails: 1, actions: 1, sendemail: 1 };
  var TOGGLE_NAMES = { taxstatus: 'Tax exempt', autocc: 'Auto charge', overduenotices: 'Reminders', latefees: 'Late fees' };

  function boxKey(box) {
    if (box.querySelector('#summary-login-as-owner, .summary-login-as-owner')) { return 'info'; }
    if (box.querySelector('#tablePayMethods')) { return 'paymethods'; }
    if (box.querySelector('a[href*="clientscontacts.php"]')) { return 'contacts'; }
    if (box.querySelector('a[href*="createinvoice"], a[href*="clientsbillableitems"], #manageCredits')) { return 'billing'; }
    if (box.querySelector('a[href*="ordersadd.php"]')) { return 'services'; }
    if (box.querySelector('#addfile')) { return 'files'; }
    if (box.querySelector('#btnDeleteClient, #btnCloseClient')) { return 'actions'; }
    if (box.querySelector('textarea[name="adminnotes"]')) { return 'notes'; }
    if (box.querySelector('form[action*="clientsemails.php"]')) { return 'sendemail'; }
    if (box.querySelector('a[href*="clientsemails.php"]') || /email/i.test(txt(box.querySelector('.title')))) { return 'emails'; }
    if (!box.querySelector('a, ul') && box.querySelector('table')) { return 'other'; }
    return null;
  }

  function boxHint(box, key) {
    if (!/^(contacts|paymethods|files|emails)$/.test(key)) { return ''; }
    var table = box.querySelector('table.clientssummarystats');
    if (!table) { return ''; }
    var rows = Array.prototype.filter.call(table.rows, function (r) { return txt(r); });
    if (!rows.length) { return 'None'; }
    if (rows.length === 1 && rows[0].cells.length === 1 && /^(no |none)/i.test(txt(rows[0]))) { return 'None'; }
    return String(rows.length);
  }

  function factFrom(table, index, re) {
    if (!table) { return ''; }
    var rows = table.rows, i;
    if (re) {
      for (i = 0; i < rows.length; i++) {
        if (rows[i].cells.length > 1 && re.test(txt(rows[i].cells[0]))) { return txt(rows[i].cells[1]); }
      }
    }
    if (index !== null && rows[index] && rows[index].cells.length > 1) { return txt(rows[index].cells[1]); }
    return '';
  }

  function scrollToBox(key, focusSel) {
    var box = document.querySelector('.clientssummarybox[data-ax-box="' + key + '"]');
    if (!box) { return; }
    setBox(box, true);
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var f = focusSel ? box.querySelector(focusSel) : null;
    if (f) { setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }, 350); }
  }

  function setBox(box, open, save) {
    box.classList.toggle('is-collapsed', !open);
    var t = box.querySelector('.title');
    if (t) { t.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    if (save) { store.set('csbox:' + box.getAttribute('data-ax-box'), open ? 'open' : 'closed'); }
  }

  function clientProfile() {
    var wrap = document.getElementById('clientsummarycontainer');
    if (!wrap || wrap.getAttribute('data-ax-done')) { return; }
    wrap.setAttribute('data-ax-done', '1');
    root.classList.add('ax-client-page');

    var boxes = wrap.querySelectorAll('.clientssummarybox');
    var byKey = {};
    each(boxes, function (box, i) {
      var key = boxKey(box) || ('box' + i);
      box.setAttribute('data-ax-box', key);
      byKey[key] = box;
      var title = box.querySelector('.title');
      if (!title) { return; }
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      var hint = boxHint(box, key);
      if (hint) { title.appendChild(h('span', { class: 'ax-box-hint' + (hint === 'None' ? ' is-none' : ''), text: hint })); }
      title.appendChild(icon('chevdown', 'ax-box-chev'));
      var saved = store.get('csbox:' + key, null);
      var open = saved ? saved === 'open' : !BOX_DEFAULT_CLOSED[key];
      if (key === 'notes') { var ta = box.querySelector('textarea'); if (ta && ta.value.trim()) { open = true; } }
      setBox(box, open);
      function toggle(e) {
        if (!isPhone()) { return; }
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') { return; }
        e.preventDefault();
        setBox(box, box.classList.contains('is-collapsed'), true);
      }
      title.addEventListener('click', toggle);
      title.addEventListener('keydown', toggle);
    });

    // ---- Header card -------------------------------------------------
    var nameEl = wrap.querySelector('.client-summary-name');
    var full = txt(nameEl);
    var m = full.match(/^#\s*(\d+)\s*-\s*(.*)$/);
    var id = m ? m[1] : txt(document.getElementById('userId'));
    var name = (m ? m[2] : full) || 'Client';
    var info = byKey.info ? byKey.info.querySelector('table.clientssummarystats') : null;
    var other = byKey.other ? byKey.other.querySelector('table.clientssummarystats') : null;
    var email = factFrom(info, 3, /^e-?mail/i);
    var phone = factFrom(info, 10, /phone/i);
    var company = factFrom(info, 2, /company/i);
    var status = factFrom(other, 0, /^status$/i);
    var group = factFrom(other, 1, /group/i);
    var since = factFrom(other, 3, /client for/i);
    var initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || '?';
    var tone = toneOf(status) || 'gray';

    var meta = h('div', { class: 'ax-ch-meta' }, [
      id ? h('span', { class: 'ax-ch-id', text: '#' + id }) : null,
      status ? h('span', { class: 'ax-pill is-' + tone, text: status }) : null,
      company ? h('span', { class: 'ax-ch-fact', text: company }) : null,
      group && !/^(none|-)$/i.test(group) ? h('span', { class: 'ax-ch-fact', text: group }) : null,
      since ? h('span', { class: 'ax-ch-fact', text: 'Client for ' + since }) : null
    ]);
    var contact = h('div', { class: 'ax-ch-contact' });
    if (email) { contact.appendChild(h('a', { href: 'mailto:' + email, class: 'ax-ch-link' }, [icon('mail'), h('span', { text: email })])); }
    if (phone) { contact.appendChild(h('a', { href: 'tel:' + phone.replace(/[^\d+]/g, ''), class: 'ax-ch-link' }, [icon('phone'), h('span', { text: phone })])); }

    var actions = h('div', { class: 'ax-ch-actions' });
    function addAction(label, ico, toneCls, opts) {
      var el = opts.href
        ? h('a', { class: 'ax-ch-btn', href: opts.href, title: label }, [h('span', { class: 'ax-action-ico ' + toneCls }, [icon(ico)]), h('span', { text: label })])
        : h('button', { type: 'button', class: 'ax-ch-btn', title: label, onclick: opts.run }, [h('span', { class: 'ax-action-ico ' + toneCls }, [icon(ico)]), h('span', { text: label })]);
      actions.appendChild(el);
    }
    var login = wrap.querySelector('#summary-login-as-owner');
    if (login) { addAction('Log in as client', 'login', 'is-blue', { run: function () { login.click(); } }); }
    var inv = wrap.querySelector('a[href*="action=createinvoice"]');
    if (inv) { addAction('New invoice', 'receipt', 'is-orange', { href: inv.getAttribute('href') }); }
    var ord = wrap.querySelector('a[href^="ordersadd.php"]');
    if (ord) { addAction('New order', 'cart', 'is-green', { href: ord.getAttribute('href') }); }
    var tic = wrap.querySelector('a[href*="supporttickets.php?action=open"]');
    if (tic) { addAction('New ticket', 'support', 'is-purple', { href: tic.getAttribute('href') }); }
    if (byKey.sendemail) { addAction('Send email', 'send', 'is-cyan', { run: function () { scrollToBox('sendemail', 'select'); } }); }
    if (byKey.notes) { addAction('Notes', 'note', 'is-gray', { run: function () { scrollToBox('notes', 'textarea'); } }); }

    // Tax exempt / auto CC / reminders / late fees: tap to switch (WHMCS handles the change).
    var toggles = h('div', { class: 'ax-ch-toggles' });
    var actBox = wrap.querySelector('.clientsummaryactions');
    if (actBox) {
      each(actBox.querySelectorAll('.csajaxtoggle'), function (sp) {
        var prev = sp.previousSibling, label = '';
        while (prev && prev.nodeType === 3 && !label) { label = prev.textContent.replace(/ /g, ' ').replace(/:\s*$/, '').trim(); prev = prev.previousSibling; }
        label = TOGGLE_NAMES[sp.id] || label.replace(/:$/, '') || sp.id;
        var full = (sp.previousSibling && sp.previousSibling.nodeType === 3 ? sp.previousSibling.textContent : '').replace(/\u00a0/g, ' ').replace(/[:\s]+$/, '').trim();
        var chip = h('span', { class: 'ax-toggle', title: (full || label) + ' (tap to switch)' }, [h('span', { class: 'ax-toggle-label', text: label })]);
        chip.appendChild(sp);
        chip.addEventListener('click', function (e) { if (!sp.contains(e.target)) { sp.click(); } });
        toggles.appendChild(chip);
      });
      if (toggles.children.length) { actBox.classList.add('ax-moved'); }
    }

    var head = h('section', { class: 'ax-client-head', 'aria-label': 'Client' }, [
      h('div', { class: 'ax-ch-top' }, [
        h('span', { class: 'ax-ch-avatar', text: initials }),
        h('div', { class: 'ax-ch-who' }, [h('h2', { class: 'ax-ch-name', text: name }), meta]),
      ]),
      contact.children.length ? contact : null,
      actions.children.length ? actions : null,
      toggles.children.length ? toggles : null
    ]);
    if (nameEl) { nameEl.classList.add('ax-moved'); }
    wrap.insertBefore(head, wrap.firstChild);

    // Recent pages: show the client's name rather than "Client Profile"
    var recent = store.get('recent', []);
    if (Array.isArray(recent) && recent[0] && recent[0].u === window.location.pathname + window.location.search && name !== 'Client') {
      recent[0].t = name + (id ? ' #' + id : '');
      store.set('recent', recent);
    }

    // Section titles for the services / addons / domains / quotes tables
    each(wrap.querySelectorAll('table.form'), function (f) {
      var first = f.rows[0];
      if (first && first.cells.length === 1 && first.cells[0].colSpan > 1 && f.querySelector('table')) {
        f.classList.add('ax-cs-section');
        first.classList.add('ax-cs-section-title');
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Phones: a picker for long tab rows                                */
  /* ---------------------------------------------------------------- */
  var pick = null;
  function buildPicker() {
    pick = h('div', { class: 'ax-pick', 'aria-hidden': 'true' }, [
      h('div', { class: 'ax-pick-scrim', onclick: closePicker }),
      h('div', { class: 'ax-pick-panel', role: 'dialog', 'aria-modal': 'true' }, [
        h('div', { class: 'ax-sheet-grip' }),
        h('h3', { class: 'ax-pick-title' }),
        h('div', { class: 'ax-pick-list' }),
        h('button', { type: 'button', class: 'ax-sheet-cancel', text: 'Close', onclick: closePicker })
      ])
    ]);
    document.body.appendChild(pick);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pick.classList.contains('is-open')) { closePicker(); } });
    enableSwipeDown(pick.querySelector('.ax-pick-panel'), closePicker);
  }
  function openPicker(title, items) {
    if (!pick) { buildPicker(); }
    pick.querySelector('.ax-pick-title').textContent = title;
    var list = pick.querySelector('.ax-pick-list');
    list.textContent = '';
    items.forEach(function (it) {
      list.appendChild(h('button', { type: 'button', class: 'ax-pick-item' + (it.active ? ' is-on' : ''), onclick: function () { closePicker(); setTimeout(it.run, 60); } }, [
        h('span', { text: it.label }), it.active ? icon('check') : null
      ]));
    });
    pick.classList.add('is-open');
    pick.setAttribute('aria-hidden', 'false');
  }
  function closePicker() { if (pick) { pick.classList.remove('is-open'); pick.setAttribute('aria-hidden', 'true'); } }

  function tabPickers() {
    each(area.querySelectorAll('ul.nav-tabs'), function (ul) {
      if (ul.getAttribute('data-ax-tabs') || skipped(ul)) { return; }
      var lis = Array.prototype.filter.call(ul.children, function (li) { return li.tagName === 'LI' && li.querySelector('a'); });
      ul.setAttribute('data-ax-tabs', '1');
      if (lis.length < 5) { return; }
      var row = h('div', { class: 'ax-tabs-row' });
      ul.parentNode.insertBefore(row, ul);
      row.appendChild(ul);
      var btn = h('button', { type: 'button', class: 'ax-tabs-more', 'aria-label': 'All tabs', title: 'All tabs' }, [icon('chevdown')]);
      btn.addEventListener('click', function () {
        var items = lis.map(function (li) {
          var a = li.querySelector('a');
          return { label: txt(a), active: li.classList.contains('active'), run: function () { a.click(); setTimeout(function () { centerActive(ul); }, 60); } };
        });
        openPicker('Go to', items);
      });
      row.appendChild(btn);
      centerActive(ul);
      ul.addEventListener('click', function () { setTimeout(function () { centerActive(ul); }, 60); });
    });
  }
  function centerActive(ul) {
    var on = ul.querySelector('li.active');
    if (!on || ul.scrollWidth <= ul.clientWidth) { return; }
    ul.scrollLeft = Math.max(0, on.offsetLeft - (ul.clientWidth - on.offsetWidth) / 2);
  }

  /* Swipe a bottom sheet down to close it. */
  function enableSwipeDown(panel, close) {
    if (!panel) { return; }
    var startY = null, dy = 0;
    panel.addEventListener('touchstart', function (e) {
      if (panel.scrollTop > 0 || e.touches.length !== 1) { startY = null; return; }
      startY = e.touches[0].clientY; dy = 0; panel.style.transition = 'none';
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (startY === null) { return; }
      dy = Math.max(0, e.touches[0].clientY - startY);
      if (dy > 0) { panel.style.transform = 'translateY(' + dy + 'px)'; }
    }, { passive: true });
    panel.addEventListener('touchend', function () {
      if (startY === null) { return; }
      panel.style.transition = ''; panel.style.transform = '';
      if (dy > 90) { close(); }
      startY = null;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Invoice totals ("NGN Paid: ... Unpaid: ... Overdue: ...")          */
  /* ---------------------------------------------------------------- */
  function totals() {
    var re = /^\s*(?:([A-Z]{3})\s+)?Paid:\s*(.+?)\s+Unpaid:\s*(.+?)\s+Overdue:\s*(.+?)\s*$/;
    each(area.querySelectorAll('div, p, td, span'), function (el) {
      if (el.getAttribute('data-ax-totals') || skipped(el) || el.closest('table.datatable, .ax-totals')) { return; }
      var t = el.textContent;
      if (t.length > 900 || t.indexOf('Unpaid:') < 0 || t.indexOf('Overdue:') < 0) { return; }
      // Use the innermost element that holds every line.
      var inner = Array.prototype.some.call(el.children, function (c) { return c.textContent.indexOf('Unpaid:') >= 0 && c.textContent.indexOf('Overdue:') >= 0 && c.textContent.indexOf('Paid:') >= 0 && c.tagName !== 'FONT' && c.tagName !== 'B' && c.tagName !== 'STRONG'; });
      if (inner) { return; }
      el.setAttribute('data-ax-totals', '1');
      var lines = el.innerHTML.split(/<br\s*\/?>/i).map(function (html) {
        var d = document.createElement('div'); d.innerHTML = html; return txt(d);
      }).filter(Boolean);
      var groups = [];
      lines.forEach(function (line) { var mm = line.match(re); if (mm) { groups.push(mm); } });
      if (!groups.length) { el.classList.add('ax-totals-plain'); return; }
      var box = h('div', { class: 'ax-totals' });
      groups.forEach(function (g) {
        box.appendChild(h('div', { class: 'ax-totals-row' }, [
          g[1] ? h('span', { class: 'ax-totals-cur', text: g[1] }) : null,
          tile('Paid', g[2], 'is-green', g[1]), tile('Unpaid', g[3], 'is-orange', g[1]), tile('Overdue', g[4], 'is-red', g[1])
        ]));
      });
      el.classList.add('ax-totals-host');
      el.textContent = '';
      el.appendChild(box);
    });
    function tile(label, value, tone, code) {
      var v = code ? value.replace(new RegExp('\\s*' + code + '$'), '') : value.replace(/([A-Z]{3})$/, ' $1');
      return h('div', { class: 'ax-totals-tile ' + tone, title: label + ': ' + value }, [h('small', { text: label }), h('b', { text: v.trim() })]);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Page panel, page title                                            */
  /* ---------------------------------------------------------------- */
  function pagePanel() {
    var sb = document.getElementById('sidebar');
    if (!sb) { return; }
    var heads = Array.prototype.map.call(sb.querySelectorAll('.sidebar-header'), txt).filter(Boolean).slice(0, 3);
    var opener = sb.querySelector('.sidebar-collapse-expand > span');
    if (opener && !opener.getAttribute('data-ax')) {
      opener.setAttribute('data-ax', '1');
      opener.textContent = '';
      opener.appendChild(h('b', { text: 'Page shortcuts' }));
      if (heads.length) { opener.appendChild(h('small', { text: heads.join(' · ') })); }
    }
    var min = sb.querySelector('.btn-min-sidebar');
    if (min && !min.getAttribute('data-ax')) {
      min.setAttribute('data-ax', '1');
      min.textContent = '';
      min.appendChild(icon('collapse'));
      min.appendChild(h('span', { text: 'Hide this panel' }));
    }
  }

  function pageTitle() {
    var h1 = area.querySelector(':scope > div > h1, :scope > h1');
    var top = document.getElementById('axTbTitle');
    if (h1 && top && txt(h1) === txt(top)) { h1.classList.add('ax-h1-dup'); }
  }

  /* ---------------------------------------------------------------- */
  /* Overflow guard (phones): nothing may be wider than the screen      */
  /* ---------------------------------------------------------------- */
  function describe(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) { s += '#' + el.id; }
    var cls = (typeof el.className === 'string' ? el.className : '').split(/\s+/).filter(function (c) { return c && !/^ax-/.test(c); }).slice(0, 2);
    if (cls.length) { s += '.' + cls.join('.'); }
    return s;
  }

  function fixedPos(el) {
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      var p = window.getComputedStyle(n).position;
      if (p === 'fixed' || p === 'sticky') { return true; }
    }
    return false;
  }

  function guard() {
    if (!isPhone()) { return; }
    var vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= vw + 1 && document.body.scrollWidth <= vw + 1) { return; }
    var wrapEl = document.querySelector('.ax-body-wrap') || document.body;
    var all = wrapEl.querySelectorAll('*');
    var offenders = [];
    for (var i = 0; i < all.length && offenders.length < 25; i++) {
      var el = all[i];
      if (el.closest('.ax-scroll, .ax-fit-x, .nav-tabs, .ax-chips-row, .ax-ch-actions, .dataTables_scrollBody') || el.tagName === 'OPTION') { continue; }
      var r = el.getBoundingClientRect();
      if (!r.width || r.right <= vw + 1) { continue; }
      var parent = el.parentElement;
      if (parent && parent !== wrapEl && parent.getBoundingClientRect().right > vw + 1 && !/(auto|scroll|hidden|clip)/.test(window.getComputedStyle(parent).overflowX)) { continue; }
      if (fixedPos(el)) { continue; }
      offenders.push(el);
    }
    offenders.forEach(function (el) {
      var what = describe(el);
      if (el.tagName === 'TABLE') {
        var w = h('div', { class: 'ax-scroll' });
        el.parentNode.insertBefore(w, el); w.appendChild(el);
      } else if (/^(IMG|VIDEO|IFRAME|CANVAS|SVG|OBJECT|EMBED)$/i.test(el.tagName)) {
        el.style.maxWidth = '100%'; el.style.height = 'auto';
      } else if (el.tagName === 'PRE' || el.tagName === 'CODE') {
        el.style.whiteSpace = 'pre-wrap'; el.style.wordBreak = 'break-word'; el.style.maxWidth = '100%';
      } else {
        el.style.maxWidth = '100%'; el.style.minWidth = '0'; el.style.overflowWrap = 'anywhere';
        if (el.getBoundingClientRect().right > vw + 1) { el.classList.add('ax-fit-x'); }
      }
      report.fixed.push(what);
    });
    if (offenders.length && window.console) { console.info('[Aurox] Made these fit the phone screen:', report.fixed.join(', ')); }
  }

  /* ---------------------------------------------------------------- */
  /* Help > Check page layout                                          */
  /* ---------------------------------------------------------------- */
  function layoutReport() {
    var de = document.documentElement;
    var page = (document.body.className.match(/ax-page-([\w-]+)/) || [])[1] || window.location.pathname.split('/').pop();
    var wide = de.scrollWidth > de.clientWidth + 1;
    var lines = [
      'Aurox ' + (UI.version || '') + ' layout report',
      'Page: ' + page + (window.location.search ? ' ' + window.location.search.replace(/token=[^&]+/, 'token=…') : ''),
      'Screen: ' + de.clientWidth + ' x ' + window.innerHeight + ' (' + (isPhone() ? 'phone layout' : 'desktop layout') + ', zoom ' + (window.devicePixelRatio || 1) + ')',
      'Page width: ' + de.scrollWidth + (wide ? '  <- wider than the screen' : '  (fits)'),
      'Tables as cards: ' + report.cards + ', scrolling tables: ' + report.scrolls + ', status pills: ' + report.pills + ', icons updated: ' + report.icons,
      'Fixed to fit: ' + (report.fixed.length ? report.fixed.join(', ') : 'nothing needed fixing'),
      'Browser: ' + navigator.userAgent
    ];
    if (wide) {
      var out = [];
      each(document.querySelectorAll('.ax-body-wrap *'), function (el) {
        if (out.length < 8 && !fixedPos(el) && el.getBoundingClientRect().right > de.clientWidth + 1 && !el.closest('.ax-scroll, .nav-tabs, .ax-chips-row')) { out.push(describe(el) + ' (' + Math.round(el.getBoundingClientRect().width) + 'px)'); }
      });
      lines.push('Still too wide: ' + (out.join(', ') || 'unknown'));
    }
    return lines.join('\n');
  }

  function openLayoutCheck() {
    if (_.closeOverlays) { _.closeOverlays(); }
    var old = document.querySelector('.ax-lc');
    if (old) { old.remove(); }
    var text = layoutReport();
    var ok = text.indexOf('<- wider') < 0;
    var dlg = h('div', { class: 'ax-lc', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Page layout check' }, [
      h('div', { class: 'ax-lc-card' }, [
        h('div', { class: 'ax-lc-head' }, [
          h('span', { class: 'ax-lc-ico ' + (ok ? 'is-ok' : 'is-bad') }, [icon(ok ? 'checkcircle' : 'alert')]),
          h('div', {}, [h('b', { text: ok ? 'This page fits your screen' : 'Part of this page is wider than your screen' }),
            h('small', { text: ok ? (report.fixed.length ? 'Aurox adjusted ' + report.fixed.length + ' thing(s) to make it fit.' : 'Nothing needed adjusting.') : 'Copy the report below and send it to whoever looks after your Aurox install.' })])
        ]),
        h('pre', { class: 'ax-lc-pre', text: text }),
        h('div', { class: 'ax-lc-foot' }, [
          h('button', { type: 'button', class: 'ax-btn', onclick: function () { dlg.remove(); } , text: 'Close' }),
          h('button', { type: 'button', class: 'ax-btn ax-btn-primary', onclick: function (e) {
            var b = e.currentTarget;
            function done() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy report'; }, 1600); }
            if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { selectPre(); }); } else { selectPre(); }
            function selectPre() { var r = document.createRange(); r.selectNodeContents(dlg.querySelector('pre')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); done(); } catch (er) {} }
          }, text: 'Copy report' })
        ])
      ])
    ]);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.remove(); } });
    document.body.appendChild(dlg);
  }

  /* ---------------------------------------------------------------- */
  /* Run                                                               */
  /* ---------------------------------------------------------------- */
  var busy = false, timer = null, observer = null;
  function enhance(scope) {
    busy = true;
    try {
      scope = scope || area;
      swapIcons(scope);
      pillify(scope);
      cardify(scope);
      wrapWide(scope);
      tabPickers();
    } catch (e) { if (window.console) { console.warn('[Aurox] page layer:', e); } }
    busy = false;
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (observer) { observer.disconnect(); } enhance(area); guard(); watch(); }, 250);
  }
  function watch() {
    if (!window.MutationObserver) { return; }
    if (!observer) { observer = new MutationObserver(function () { if (!busy) { schedule(); } }); }
    observer.observe(area, { childList: true, subtree: true });
  }

  function boot() {
    try { clientProfile(); } catch (e) { if (window.console) { console.warn('[Aurox] client profile:', e); } }
    try { totals(); pagePanel(); pageTitle(); } catch (e2) { if (window.console) { console.warn('[Aurox] page layer:', e2); } }
    enhance(area);
    watchDataTables();
    guard();
    watch();
    window.addEventListener('load', schedule);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { enhance(area); guard(); }, 250); });
    _.actions['layout-check'] = openLayoutCheck;
    // Phones: also reachable from Menu > Help & tools
    var sb = _.sidebar && _.sidebar();
    var group = sb ? sb.querySelector('.ax-tools-group') : null;
    if (group && !group.querySelector('[data-ax-action="layout-check"]')) {
      group.appendChild(h('div', { class: 'ax-item' }, [h('button', { type: 'button', class: 'ax-link', 'data-ax-action': 'layout-check', 'data-tip': 'Check page layout', title: 'Does this page fit your screen?' }, [icon('layout'), h('span', { class: 'ax-label', text: 'Check page layout' })])]));
    }
    _.commands.push(function () {
      return [{ group: 'Tools', title: 'Check this page\'s layout', icon: 'layout', run: openLayoutCheck, words: 'mobile phone fit wide screen report bug' }];
    });
  }

  UI.layoutReport = layoutReport;
  UI.picker = openPicker;
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
