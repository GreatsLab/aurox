/*!
 * Aurox Admin for WHMCS - dashboard revenue chart
 * A small, dependency-free SVG area chart with tooltips and 7/14/30-day ranges.
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 */
(function (window, document) {
  'use strict';

  var box = document.getElementById('axRevenueChart');
  var raw = document.getElementById('axRevenueData');
  if (!box || !raw) { return; }

  var data;
  try { data = JSON.parse(raw.textContent || '[]'); } catch (e) { data = []; }
  if (!Array.isArray(data) || !data.length) { return; }

  var prefix = box.getAttribute('data-prefix') || '';
  var suffix = (box.getAttribute('data-suffix') || '').trim();
  var days = 30;
  var NS = 'http://www.w3.org/2000/svg';

  function money(v, compact) {
    var abs = Math.abs(v), text;
    if (compact && abs >= 1e6) { text = (v / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M'; }
    else if (compact && abs >= 1e3) { text = (v / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k'; }
    else { text = v.toLocaleString(undefined, { maximumFractionDigits: abs >= 1000 ? 0 : 2 }); }
    return prefix ? prefix + text : (suffix ? text + ' ' + suffix : text);
  }
  function label(d, long) {
    var p = d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return dt.toLocaleDateString(undefined, long ? { weekday: 'short', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short' });
  }
  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function niceMax(v) {
    if (v <= 0) { return 1; }
    var pow = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
    var n = v / pow;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * pow;
  }

  var tip = document.createElement('div');
  tip.className = 'ax-chart-tip';
  tip.setAttribute('role', 'status');

  function render() {
    var pts = data.slice(-days);
    var W = Math.max(260, box.clientWidth), H = Math.max(160, box.clientHeight || 220);
    var padL = 44, padR = 10, padT = 12, padB = 26;
    var iw = W - padL - padR, ih = H - padT - padB;
    var top = Math.max.apply(null, pts.map(function (p) { return p.v; }));
    var max = niceMax(top * 1.08);
    var x = function (i) { return padL + (pts.length === 1 ? iw / 2 : i / (pts.length - 1) * iw); };
    var y = function (v) { return padT + ih - (Math.max(0, v) / max) * ih; };

    box.textContent = '';
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ax-chart-svg', preserveAspectRatio: 'none' });
    var defs = el('defs');
    var grad = el('linearGradient', { id: 'axRevGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
    var s1 = el('stop', { offset: '0%' }); s1.setAttribute('style', 'stop-color: var(--ax-accent); stop-opacity: .32');
    var s2 = el('stop', { offset: '100%' }); s2.setAttribute('style', 'stop-color: var(--ax-accent); stop-opacity: 0');
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);

    // Grid and y labels
    for (var g = 0; g <= 4; g++) {
      var gv = max / 4 * g, gy = y(gv);
      svg.appendChild(el('line', { x1: padL, x2: W - padR, y1: gy, y2: gy, class: 'ax-chart-grid' }));
      if (top <= 0 && g > 0) { continue; } // nothing came in: no made-up scale, just the zero line
      var t = el('text', { x: padL - 8, y: gy + 4, class: 'ax-chart-ylabel', 'text-anchor': 'end' });
      t.textContent = money(gv, true);
      svg.appendChild(t);
    }
    // X labels
    var every = Math.max(1, Math.ceil(pts.length / (W < 500 ? 4 : 7)));
    pts.forEach(function (p, i) {
      if (i % every !== 0 && i !== pts.length - 1) { return; }
      if (i !== pts.length - 1 && pts.length - 1 - i < every / 2) { return; }
      var tx = el('text', { x: x(i), y: H - 6, class: 'ax-chart-xlabel', 'text-anchor': i === 0 ? 'start' : (i === pts.length - 1 ? 'end' : 'middle') });
      tx.textContent = i === pts.length - 1 ? 'Today' : label(p.d);
      svg.appendChild(tx);
    });

    // Area and line (smooth curve)
    var line = '';
    pts.forEach(function (p, i) {
      var px = x(i), py = y(p.v);
      if (i === 0) { line = 'M' + px + ',' + py; return; }
      var prevX = x(i - 1), prevY = y(pts[i - 1].v), cx = (prevX + px) / 2;
      line += ' C' + cx + ',' + prevY + ' ' + cx + ',' + py + ' ' + px + ',' + py;
    });
    var area = line + ' L' + x(pts.length - 1) + ',' + (padT + ih) + ' L' + x(0) + ',' + (padT + ih) + ' Z';
    svg.appendChild(el('path', { d: area, fill: 'url(#axRevGrad)' }));
    svg.appendChild(el('path', { d: line, class: 'ax-chart-line' }));

    // Hover
    var cursor = el('line', { y1: padT, y2: padT + ih, class: 'ax-chart-cursor' });
    var dot = el('circle', { r: 5, class: 'ax-chart-dot' });
    cursor.style.display = 'none'; dot.style.display = 'none';
    svg.appendChild(cursor); svg.appendChild(dot);
    var hit = el('rect', { x: padL, y: padT, width: iw, height: ih, fill: 'transparent' });
    svg.appendChild(hit);

    function show(evt) {
      var r = svg.getBoundingClientRect();
      var cx = (evt.clientX - r.left) / r.width * W;
      var i = Math.round((cx - padL) / (iw || 1) * (pts.length - 1));
      i = Math.max(0, Math.min(pts.length - 1, i));
      var px = x(i), py = y(pts[i].v);
      cursor.setAttribute('x1', px); cursor.setAttribute('x2', px); cursor.style.display = '';
      dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.style.display = '';
      tip.innerHTML = '';
      var b = document.createElement('b'); b.textContent = money(pts[i].v, false);
      var s = document.createElement('span'); s.textContent = i === pts.length - 1 ? 'Today' : label(pts[i].d, true);
      tip.appendChild(b); tip.appendChild(s);
      tip.style.display = 'block';
      var left = px / W * r.width;
      tip.style.left = Math.max(8, Math.min(r.width - tip.offsetWidth - 8, left - tip.offsetWidth / 2)) + 'px';
      tip.style.top = Math.max(0, py / H * r.height - tip.offsetHeight - 14) + 'px';
    }
    function hide() { cursor.style.display = 'none'; dot.style.display = 'none'; tip.style.display = 'none'; }
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
    document.addEventListener('pointerdown', function (e) { if (!box.contains(e.target)) hide(); });

    box.appendChild(svg);
    box.appendChild(tip);

    var total = pts.reduce(function (a, p) { return a + p.v; }, 0);
    var tEl = document.getElementById('axRevTotal'), lEl = document.getElementById('axRevLabel');
    if (tEl) { tEl.textContent = money(total, total >= 1e6); }
    if (lEl) { lEl.textContent = 'in the last ' + days + ' days'; }
    box.setAttribute('aria-label', 'Income per day for the last ' + days + ' days, ' + money(total, false) + ' in total');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.ax-seg-btn[data-days]'), function (btn) {
    btn.addEventListener('click', function () {
      days = parseInt(btn.getAttribute('data-days'), 10) || 30;
      Array.prototype.forEach.call(document.querySelectorAll('.ax-seg-btn'), function (b) { b.classList.toggle('is-on', b === btn); });
      render();
    });
  });

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 120); });
  render();
})(window, document);
