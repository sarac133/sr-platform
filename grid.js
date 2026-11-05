/* Sarac Ramsay Eclipse: spreadsheet behaviour for the SEO / AEO tables.
   SR.seoGrid is turned into a string and runs INSIDE the SEO workspace iframe (see screens2.js),
   so it can only use things that exist there: S, render, toast, Sheets, window.__SX, window.__SPECS, window.__ED. */
window.SR = window.SR || {};
SR.seoGrid = function () {
  var X = window.__SX, ED = window.__ED, SP = window.__SPECS;
  if (!X || !ED || !SP) return;
  var app = document.getElementById('app');
  var G = { tab: '', a: null, f: null, mode: 'select', drag: null, undo: [], busy: false };

  /* ---------------- small helpers ---------------- */
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var A1 = function (c) { var s = ''; c++; while (c > 0) { var m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  var colNum = function (s) { s = s.toUpperCase(); var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n - 1; };
  var tbl = function () { return app.querySelector('table.sheet[data-tab]'); };
  var wrapEl = function () { return app.querySelector('.sheetwrap'); };
  var tabName = function () { var t = tbl(); return t ? t.dataset.tab : ''; };
  var rowEls = function () { var t = tbl(); return t ? Array.prototype.slice.call(t.tBodies[0].querySelectorAll('tr[data-row]')) : []; };
  var cols = function () { var s = SP[tabName()]; return s ? s.cols : []; };
  var isFixed = function () { var s = SP[tabName()]; return !!(s && s.fixed); };
  var rowId = function (r) { var tr = rowEls()[r]; return tr ? tr.dataset.row : null; };
  var tdAt = function (r, c) { var tr = rowEls()[r]; return tr ? tr.children[c + 1] : null; };
  var inputAt = function (r, c) { var td = tdAt(r, c); return td ? td.querySelector('.cell') : null; };
  var editable = function (col) { return col && !col.calc && !col.fix && !col.button; };
  var posOf = function (td) {
    var tr = td.closest('tr[data-row]'); if (!tr) return null;
    var r = rowEls().indexOf(tr), c = Array.prototype.indexOf.call(tr.children, td) - 1;
    if (r < 0 || c < 0 || c >= cols().length) return null;
    return { r: r, c: c };
  };
  var rowData = function (r) { var id = rowId(r); return id ? X.rowOf(tabName(), id) : {}; };
  var rawOf = function (r, c) {
    var col = cols()[c], td = tdAt(r, c); if (!col || !td) return '';
    if (col.calc || col.fix) return (td.textContent || '').trim();
    if (col.button) return '';
    var row = rowData(r), v = col.get ? col.get(row) : row[col.k];
    return v == null ? '' : String(v);
  };
  var fxOf = function (r, c) { var col = cols()[c], row = rowData(r); return col && row._fx && row._fx[col.k] ? row._fx[col.k] : ''; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o == null ? null : o)); };

  /* ---------------- formula engine ---------------- */
  var ERR = function (m) { var e = new Error(m); e.xl = true; return e; };
  var tokenize = function (s) {
    var t = [], i = 0, m;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '"') {
        var j = i + 1, str = '';
        while (j < s.length) { if (s[j] === '"') { if (s[j + 1] === '"') { str += '"'; j += 2; continue; } break; } str += s[j++]; }
        if (j >= s.length) throw ERR('#ERROR!');
        t.push({ t: 's', v: str }); i = j + 1; continue;
      }
      var rest = s.slice(i);
      if ((m = /^#REF!/.exec(rest))) throw ERR('#REF!');
      if ((m = /^(\d+(\.\d+)?|\.\d+)/.exec(rest))) { t.push({ t: 'n', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ((m = /^\$?([A-Za-z]{1,2})\$?(\d+)(?::\$?([A-Za-z]{1,2})\$?(\d+))?(?![A-Za-z0-9_(])/.exec(rest))) {
        t.push(m[3] ? { t: 'rng', c1: colNum(m[1]), r1: +m[2] - 1, c2: colNum(m[3]), r2: +m[4] - 1 } : { t: 'ref', c: colNum(m[1]), r: +m[2] - 1 }); i += m[0].length; continue;
      }
      if ((m = /^\$?([A-Za-z]{1,2}):\$?([A-Za-z]{1,2})(?![A-Za-z0-9_(])/.exec(rest))) { t.push({ t: 'rng', c1: colNum(m[1]), r1: 0, c2: colNum(m[2]), r2: 1e6 }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest))) {
        var nm = m[0].toUpperCase(), nx = rest[m[0].length];
        if (nx === '(') t.push({ t: 'fn', v: nm }); else if (nm === 'TRUE' || nm === 'FALSE') t.push({ t: 'b', v: nm === 'TRUE' }); else throw ERR('#NAME?');
        i += m[0].length; continue;
      }
      if ((m = /^(<>|<=|>=|[<>=+\-*\/^&%(),])/.exec(rest))) { t.push({ t: 'o', v: m[0] }); i += m[0].length; continue; }
      throw ERR('#ERROR!');
    }
    return t;
  };
  var parse = function (src) {
    var tk = tokenize(src), p = 0;
    var peek = function () { return tk[p]; }, isO = function (v) { var x = tk[p]; return x && x.t === 'o' && x.v === v; };
    var cmp = function () {
      var a = cat();
      while (peek() && peek().t === 'o' && /^(=|<>|<=|>=|<|>)$/.test(peek().v)) { var op = tk[p++].v; a = { k: 'bin', op: op, a: a, b: cat() }; }
      return a;
    };
    var cat = function () { var a = add(); while (isO('&')) { p++; a = { k: 'bin', op: '&', a: a, b: add() }; } return a; };
    var add = function () { var a = mul(); while (isO('+') || isO('-')) { var op = tk[p++].v; a = { k: 'bin', op: op, a: a, b: mul() }; } return a; };
    var mul = function () { var a = pow(); while (isO('*') || isO('/')) { var op = tk[p++].v; a = { k: 'bin', op: op, a: a, b: pow() }; } return a; };
    var pow = function () { var a = un(); while (isO('^')) { p++; a = { k: 'bin', op: '^', a: a, b: un() }; } return a; };
    var un = function () { if (isO('-')) { p++; return { k: 'neg', a: un() }; } if (isO('+')) { p++; return un(); } var a = prim(); while (isO('%')) { p++; a = { k: 'pct', a: a }; } return a; };
    var prim = function () {
      var x = tk[p++]; if (!x) throw ERR('#ERROR!');
      if (x.t === 'n') return { k: 'num', v: x.v };
      if (x.t === 's') return { k: 'str', v: x.v };
      if (x.t === 'b') return { k: 'bool', v: x.v };
      if (x.t === 'ref') return { k: 'ref', r: x.r, c: x.c };
      if (x.t === 'rng') return { k: 'rng', r1: x.r1, c1: x.c1, r2: x.r2, c2: x.c2 };
      if (x.t === 'fn') {
        if (!isO('(')) throw ERR('#ERROR!'); p++;
        var args = [];
        if (isO(')')) { p++; return { k: 'fn', n: x.v, args: args }; }
        for (;;) { args.push(cmp()); if (isO(',')) { p++; continue; } if (isO(')')) { p++; break; } throw ERR('#ERROR!'); }
        return { k: 'fn', n: x.v, args: args };
      }
      if (x.t === 'o' && x.v === '(') { var e = cmp(); if (!isO(')')) throw ERR('#ERROR!'); p++; return e; }
      throw ERR('#ERROR!');
    };
    var ast = cmp(); if (p < tk.length) throw ERR('#ERROR!');
    return ast;
  };

  var memo = null, stack = null;
  var cellVal = function (r, c) {
    var rows = rowEls(), cs = cols();
    if (r < 0 || c < 0 || r >= rows.length || c >= cs.length) return '';
    var key = r + ',' + c; if (memo[key] !== undefined) return memo[key];
    if (stack[key]) throw ERR('#CIRC!');
    var f = fxOf(r, c), v;
    if (f && /^=/.test(f)) { stack[key] = 1; try { v = run(parse(f.slice(1))); } finally { delete stack[key]; } if (Array.isArray(v)) v = v[0]; }
    else { var raw = rawOf(r, c), n = X.num(raw); v = n !== null ? n : raw; }
    memo[key] = v; return v;
  };
  var flat = function (v) { return Array.isArray(v) ? v : [v]; };
  var nums = function (args) { var out = []; args.forEach(function (a) { flat(a).forEach(function (x) { if (typeof x === 'number') out.push(x); else if (typeof x === 'boolean' && !Array.isArray(a)) out.push(x ? 1 : 0); else if (!Array.isArray(a) && typeof x === 'string' && x !== '' && X.num(x) !== null) out.push(X.num(x)); }); }); return out; };
  var toNum = function (v) {
    if (Array.isArray(v)) v = v[0];
    if (typeof v === 'number') return v; if (typeof v === 'boolean') return v ? 1 : 0;
    if (v === '' || v == null) return 0;
    var n = X.num(v); if (n === null) throw ERR('#VALUE!'); return n;
  };
  var toStr = function (v) { if (Array.isArray(v)) v = v[0]; if (typeof v === 'number') return String(Math.round(v * 1e10) / 1e10); if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'; return v == null ? '' : String(v); };
  var truthy = function (v) { if (Array.isArray(v)) v = v[0]; if (typeof v === 'string') return v !== '' && v.toUpperCase() !== 'FALSE'; return !!v; };
  var critFn = function (crit) {
    var m = /^(<>|<=|>=|<|>|=)?(.*)$/.exec(String(crit)), op = m[1] || '=', rhs = m[2], rn = X.num(rhs);
    return function (x) {
      var xn = typeof x === 'number' ? x : (x !== '' && X.num(x) !== null ? X.num(x) : null);
      if (rn !== null && xn !== null) { return op === '=' ? xn === rn : op === '<>' ? xn !== rn : op === '<' ? xn < rn : op === '>' ? xn > rn : op === '<=' ? xn <= rn : xn >= rn; }
      var a = String(x).toLowerCase(), b = rhs.toLowerCase();
      if (op === '=') return a === b; if (op === '<>') return a !== b; return false;
    };
  };
  var round = function (x, n) { var f = Math.pow(10, n || 0); return Math.round(x * f) / f; };
  var run = function (n) {
    switch (n.k) {
      case 'num': case 'str': case 'bool': return n.v;
      case 'ref': return cellVal(n.r, n.c);
      case 'rng': { var out = [], rmax = Math.min(n.r2, rowEls().length - 1), cmax = Math.min(n.c2, cols().length - 1); for (var r = Math.min(n.r1, n.r2); r <= rmax; r++) for (var c = Math.min(n.c1, n.c2); c <= cmax; c++) out.push(cellVal(r, c)); return out; }
      case 'neg': return -toNum(run(n.a));
      case 'pct': return toNum(run(n.a)) / 100;
      case 'bin': {
        var a = run(n.a), b = run(n.b);
        if (n.op === '&') return toStr(a) + toStr(b);
        if (/^(=|<>|<|>|<=|>=)$/.test(n.op)) {
          if (Array.isArray(a)) a = a[0]; if (Array.isArray(b)) b = b[0];
          var an = typeof a === 'number', bn = typeof b === 'number', x = a, y = b;
          if (!(an && bn)) { x = toStr(a).toLowerCase(); y = toStr(b).toLowerCase(); if (a === '' && bn) { x = 0; y = b; } if (b === '' && an) { y = 0; x = a; } }
          return n.op === '=' ? x === y : n.op === '<>' ? x !== y : n.op === '<' ? x < y : n.op === '>' ? x > y : n.op === '<=' ? x <= y : x >= y;
        }
        var p = toNum(a), q = toNum(b);
        if (n.op === '+') return p + q; if (n.op === '-') return p - q; if (n.op === '*') return p * q;
        if (n.op === '/') { if (q === 0) throw ERR('#DIV/0!'); return p / q; }
        return Math.pow(p, q);
      }
      case 'fn': {
        var N = n.n, A = n.args;
        if (N === 'IF') { var c0 = run(A[0]); return truthy(c0) ? (A[1] ? run(A[1]) : true) : (A[2] ? run(A[2]) : false); }
        if (N === 'IFERROR') { try { var v0 = run(A[0]); if (typeof v0 === 'number' && !isFinite(v0)) throw ERR('#NUM!'); return v0; } catch (e) { if (e.xl) return A[1] ? run(A[1]) : ''; throw e; } }
        var V = A.map(run);
        switch (N) {
          case 'SUM': return nums(V).reduce(function (s, x) { return s + x; }, 0);
          case 'AVERAGE': case 'AVG': { var l = nums(V); if (!l.length) throw ERR('#DIV/0!'); return l.reduce(function (s, x) { return s + x; }, 0) / l.length; }
          case 'MIN': { var l2 = nums(V); return l2.length ? Math.min.apply(null, l2) : 0; }
          case 'MAX': { var l3 = nums(V); return l3.length ? Math.max.apply(null, l3) : 0; }
          case 'MEDIAN': { var l4 = nums(V).sort(function (x, y) { return x - y; }); if (!l4.length) throw ERR('#NUM!'); var h = Math.floor(l4.length / 2); return l4.length % 2 ? l4[h] : (l4[h - 1] + l4[h]) / 2; }
          case 'COUNT': return nums(V).length;
          case 'COUNTA': { var k = 0; V.forEach(function (a) { flat(a).forEach(function (x) { if (x !== '' && x != null) k++; }); }); return k; }
          case 'ROUND': return round(toNum(V[0]), V[1] === undefined ? 0 : toNum(V[1]));
          case 'ABS': return Math.abs(toNum(V[0]));
          case 'AND': { var ok = true; V.forEach(function (a) { flat(a).forEach(function (x) { if (!truthy(x)) ok = false; }); }); return ok; }
          case 'OR': { var any = false; V.forEach(function (a) { flat(a).forEach(function (x) { if (truthy(x)) any = true; }); }); return any; }
          case 'NOT': return !truthy(V[0]);
          case 'LEN': return toStr(V[0]).length;
          case 'UPPER': return toStr(V[0]).toUpperCase();
          case 'LOWER': return toStr(V[0]).toLowerCase();
          case 'TRIM': return toStr(V[0]).trim().replace(/\s+/g, ' ');
          case 'CONCAT': case 'CONCATENATE': return V.map(function (a) { return flat(a).map(toStr).join(''); }).join('');
          case 'TODAY': return new Date().toISOString().slice(0, 10);
          case 'COUNTIF': { var f1 = critFn(toStr(V[1])); return flat(V[0]).filter(f1).length; }
          case 'SUMIF': { var f2 = critFn(toStr(V[1])), rg = flat(V[0]), sg = V[2] ? flat(V[2]) : rg, s2 = 0; rg.forEach(function (x, i) { if (f2(x)) { var y = sg[i]; if (typeof y === 'number') s2 += y; } }); return s2; }
          default: throw ERR('#NAME?');
        }
      }
    }
    throw ERR('#ERROR!');
  };
  var evalFormula = function (f) {
    try {
      var v = run(parse(f.replace(/^=/, '')));
      if (Array.isArray(v)) v = v[0];
      if (typeof v === 'number' && !isFinite(v)) return '#NUM!';
      return toStr(v);
    } catch (e) { return e.xl ? e.message : '#ERROR!'; }
  };
  /* Recalculate every formula cell of the open table. Results are kept in the row (so lists, stats and exports see plain values). */
  var recalc = function () {
    var tab = tabName(); if (!tab) return;
    memo = {}; stack = {};
    var cs = cols(), changed = false;
    rowEls().forEach(function (tr, r) {
      var row = X.rowOf(tab, tr.dataset.row);
      if (!row._fx) return;
      Object.keys(row._fx).forEach(function (k) {
        var c = cs.findIndex(function (x) { return x.k === k; }); if (c < 0) return;
        var el = inputAt(r, c);
        if (el && /^=/.test(el.value) && el.value !== row._fx[k]) return; /* being typed or just applied from the bar */
        var v; memo = memo; try { v = cellFx(r, c); } catch (e) { v = e.xl ? e.message : '#ERROR!'; }
        if (row[k] !== v) { row[k] = v; X.markDirty(tab, tr.dataset.row); changed = true; }
        if (el && document.activeElement !== el && el.value !== v) el.value = v;
        var td = tdAt(r, c); if (td) td.classList.add('fx');
      });
    });
    rowEls().forEach(function (tr) { try { X.refreshRow(tab, tr.dataset.row, tr); } catch (e) {} });
    return changed;
  };
  var cellFx = function (r, c) { var v = cellVal(r, c); return toStr(v); };

  /* ---------------- selection ---------------- */
  var rect = function () {
    if (!G.a || !G.f) return null;
    return { r1: Math.min(G.a.r, G.f.r), r2: Math.max(G.a.r, G.f.r), c1: Math.min(G.a.c, G.f.c), c2: Math.max(G.a.c, G.f.c) };
  };
  var multi = function () { var q = rect(); return !!q && (q.r1 !== q.r2 || q.c1 !== q.c2); };
  var clamp = function () {
    var R = rowEls().length, C = cols().length; if (!R || !C) { G.a = G.f = null; return; }
    [G.a, G.f].forEach(function (p) { if (p) { p.r = Math.max(0, Math.min(R - 1, p.r)); p.c = Math.max(0, Math.min(C - 1, p.c)); } });
  };
  var paint = function () {
    var t = tbl(); if (!t) return;
    t.querySelectorAll('.gs,.ga,.gh').forEach(function (n) { n.classList.remove('gs', 'ga', 'gh'); });
    var q = rect(); if (!q) { updateBar(); return; }
    var R = rowEls().length, C = cols().length, rows = rowEls();
    for (var r = q.r1; r <= q.r2; r++) for (var c = q.c1; c <= q.c2; c++) { var td = tdAt(r, c); if (td) td.classList.add('gs'); }
    var a = tdAt(G.a.r, G.a.c); if (a) a.classList.add('ga');
    var heads = t.tHead.rows[0].children;
    if (q.r1 === 0 && q.r2 === R - 1) for (var c2 = q.c1; c2 <= q.c2; c2++) if (heads[c2 + 1]) heads[c2 + 1].classList.add('gh');
    if (q.c1 === 0 && q.c2 === C - 1) for (var r2 = q.r1; r2 <= q.r2; r2++) { var rn = rows[r2] && rows[r2].children[0]; if (rn) rn.classList.add('gh'); }
    if (q.r1 === 0 && q.r2 === R - 1 && q.c1 === 0 && q.c2 === C - 1) heads[0].classList.add('gh');
    updateBar(); updateButtons();
  };
  var setSel = function (a, f, noFocus) { G.a = a; G.f = f || a; clamp(); paint(); if (!noFocus) focusActive(); };
  var focusActive = function () {
    if (!G.a) return;
    if (multi()) { var w = wrapEl(); if (w && document.activeElement !== w) { G.keep = true; w.focus({ preventScroll: true }); G.keep = false; } return; }
    var el = inputAt(G.a.r, G.a.c);
    if (el) { G.keep = true; el.focus({ preventScroll: true }); if (el.select && G.mode === 'select') el.select(); G.keep = false; }
    else { var w2 = wrapEl(); if (w2) w2.focus({ preventScroll: true }); }
  };
  var selectAll = function () { var R = rowEls().length, C = cols().length; if (!R || !C) return; G.a = { r: 0, c: 0 }; G.f = { r: R - 1, c: C - 1 }; paint(); var w = wrapEl(); if (w) { G.keep = true; w.focus({ preventScroll: true }); G.keep = false; } };

  /* ---------------- toolbar and formula bar ---------------- */
  var barHtml = function () {
    return '<div class="gridbar"><div class="gbtns">' +
      '<button type="button" class="gbtn" data-g="rowadd" title="Add a row below the selection">+ Row</button>' +
      '<button type="button" class="gbtn" data-g="rowdel" title="Delete the selected rows">Delete row</button>' +
      '<button type="button" class="gbtn" data-g="coladd" title="Add a column to the right of the selection">+ Column</button>' +
      '<button type="button" class="gbtn" data-g="coldel" title="Delete the selected columns">Delete column</button>' +
      '<button type="button" class="gbtn" data-g="undo" title="Undo the last row, column or clear">Undo</button></div>' +
      '<div class="fxrow"><span class="fxname" id="fxname">A1</span><span class="fxl">fx</span><input class="fxin" id="fxin" type="text" autocomplete="off" spellcheck="false" placeholder="Click a cell. Start with = to write a formula, for example =SUM(B1:B10)" aria-label="Formula bar"></div></div>';
  };
  var updateBar = function () {
    var nm = document.getElementById('fxname'), fi = document.getElementById('fxin'); if (!nm || !fi) return;
    var q = rect(); if (!q) { nm.textContent = ''; fi.value = ''; return; }
    nm.textContent = multi() ? A1(q.c1) + (q.r1 + 1) + ':' + A1(q.c2) + (q.r2 + 1) : A1(G.a.c) + (G.a.r + 1);
    if (document.activeElement !== fi) fi.value = multi() ? '' : (fxOf(G.a.r, G.a.c) || rawOf(G.a.r, G.a.c));
    fi.disabled = multi() || !editable(cols()[G.a.c]) || !!(cols()[G.a.c] || {}).opts;
  };
  var updateButtons = function () {
    var u = app.querySelector('[data-g="undo"]'); if (u) u.disabled = !G.undo.length;
    var f = isFixed();
    var rd = app.querySelector('[data-g="rowdel"]'); if (rd) rd.textContent = f ? 'Hide metric' : 'Delete row';
    var ra = app.querySelector('[data-g="rowadd"]'); if (ra) ra.textContent = f ? '+ Metric' : '+ Row';
  };
  var decorate = function () {
    if (G.busy) return;
    var t = tbl(), w = wrapEl();
    if (!t || !w) { G.tab = ''; return; }
    var tab = t.dataset.tab;
    if (tab !== G.tab) { G.tab = tab; G.a = G.f = null; G.mode = 'select'; }
    if (!app.querySelector('.gridbar')) w.insertAdjacentHTML('beforebegin', barHtml());
    w.tabIndex = -1;
    var cs = cols();
    var hd = t.tHead.rows[0].children;
    cs.forEach(function (col, c) { var th = hd[c + 1]; if (th && !th.querySelector('.gl') && !th.querySelector('.gren')) th.insertAdjacentHTML('afterbegin', '<span class="gl">' + A1(c) + '</span>'); });
    rowEls().forEach(function (tr, r) {
      var row = X.rowOf(tab, tr.dataset.row);
      cs.forEach(function (col, c) { var td = tr.children[c + 1]; if (td) td.classList.toggle('fx', !!(row._fx && row._fx[col.k])); });
    });
    G.busy = true; try { clamp(); paint(); } finally { G.busy = false; }
  };
  var pending = 0;
  new MutationObserver(function () { if (pending) return; pending = requestAnimationFrame(function () { pending = 0; decorate(); }); }).observe(app, { childList: true, subtree: true });

  /* ---------------- undo ---------------- */
  var snap = function (label) {
    var tab = tabName(), d = X.D(tab), e = ED.edits();
    G.undo.push({ tab: tab, label: label, order: clone(d.order), rows: clone(d.rows), cols: clone(e.cols), base: clone(e.base) });
    if (G.undo.length > 25) G.undo.shift();
    updateButtons();
  };
  var undo = function () {
    var s = G.undo.pop(); if (!s) { toast('Nothing to undo'); return; }
    var d = X.D(s.tab), dels = Object.keys(d.rows).filter(function (id) { return !s.rows[id]; });
    d.order = s.order; d.rows = s.rows;
    X.send(s.tab, { puts: s.rows, dels: dels, order: s.order });
    var e = ED.edits(), patch = {};
    if (JSON.stringify(e.cols) !== JSON.stringify(s.cols)) patch.cols = s.cols;
    if (JSON.stringify(e.base) !== JSON.stringify(s.base)) patch.base = s.base;
    if (Object.keys(patch).length) ED.saveEd(patch);
    toast('Undone: ' + s.label); redraw();
  };

  /* ---------------- shifting formula references after row / column edits ---------------- */
  var mapIdx = function (i, op, end) {
    if (op.kind === 'ins') return i >= op.at ? i + op.n : i;
    var before = 0; op.del.forEach(function (x) { if (x < i) before++; });
    if (op.del.indexOf(i) > -1) return end ? i - before - 1 : i - before;
    return i - before;
  };
  var shiftFormula = function (f, axis, op) {
    var parts = f.split(/("(?:[^"]|"")*")/);
    return parts.map(function (p, i) {
      if (i % 2) return p;
      p = p.replace(/(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?::(\$?)([A-Za-z]{1,2})(\$?)(\d+))?(?![A-Za-z0-9_(])/g, function (m, d1, l1, d2, n1, d3, l2, d4, n2) {
        var c1 = colNum(l1), r1 = +n1 - 1, range = !!l2, c2 = range ? colNum(l2) : c1, r2 = range ? +n2 - 1 : r1;
        if (axis === 'r') {
          if (!range && op.kind === 'del' && op.del.indexOf(r1) > -1) return '#REF!';
          r1 = mapIdx(r1, op, false); r2 = mapIdx(r2, op, true); if (range && r2 < r1) return '#REF!'; if (!range) r2 = r1;
        } else {
          if (!range && op.kind === 'del' && op.del.indexOf(c1) > -1) return '#REF!';
          c1 = mapIdx(c1, op, false); c2 = mapIdx(c2, op, true); if (range && c2 < c1) return '#REF!'; if (!range) c2 = c1;
        }
        return d1 + A1(c1) + d2 + (r1 + 1) + (range ? ':' + d3 + A1(c2) + d4 + (r2 + 1) : '');
      });
      if (axis === 'c') p = p.replace(/(\$?)([A-Za-z]{1,2}):(\$?)([A-Za-z]{1,2})(?![A-Za-z0-9_(])/g, function (m, d1, l1, d3, l2) { var a = mapIdx(colNum(l1), op, false), b = mapIdx(colNum(l2), op, true); return b < a ? '#REF!' : d1 + A1(a) + ':' + d3 + A1(b); });
      return p;
    }).join('');
  };
  var shiftAll = function (axis, op) {
    var tab = tabName(), d = X.D(tab);
    Object.keys(d.rows).forEach(function (id) {
      var row = d.rows[id]; if (!row || !row._fx) return;
      var ch = false;
      Object.keys(row._fx).forEach(function (k) { var nf = shiftFormula(row._fx[k], axis, op); if (nf !== row._fx[k]) { row._fx[k] = nf; ch = true; } });
      if (ch) X.markDirty(tab, id);
    });
  };

  var redraw = function () { render(); try { recalc(); } catch (e) {} };
  /* ---------------- operations ---------------- */
  var selRows = function () { var q = rect(); if (!q) return []; var out = []; for (var r = q.r1; r <= q.r2; r++) out.push(r); return out; };
  var selCols = function () { var q = rect(); if (!q) return []; var out = []; for (var c = q.c1; c <= q.c2; c++) out.push(c); return out; };
  var pluralRows = function (n) { return n + ' row' + (n === 1 ? '' : 's'); };

  var clearRange = function (label) {
    var q = rect(); if (!q) return; var tab = tabName(), cs = cols(), any = false;
    snap(label || 'cleared cells');
    for (var r = q.r1; r <= q.r2; r++) {
      var id = rowId(r); if (!id) continue;
      for (var c = q.c1; c <= q.c2; c++) {
        var col = cs[c]; if (!editable(col)) continue;
        var row = X.rowOf(tab, id), cur = col.get ? col.get(row) : row[col.k];
        if (X.blank(cur) && !(row._fx && row._fx[col.k])) continue;
        X.setValue(tab, id, col, ''); any = true;
        var real = X.D(tab).rows[id]; if (real && real._fx) { delete real._fx[col.k]; if (!Object.keys(real._fx).length) delete real._fx; }
      }
    }
    if (!any) { G.undo.pop(); updateButtons(); return; }
    recalc(); redraw();
  };

  var insertRow = function (below) {
    var tab = tabName(), rs = selRows(); if (!rs.length) { rs = [Math.max(0, rowEls().length - 1)]; below = true; }
    var pos = below ? rs[rs.length - 1] + 1 : rs[0];
    snap('added a row');
    if (isFixed()) {
      var id = rowId(Math.min(rs[0], rowEls().length - 1)), sec = '', cur = '';
      (S.baselineDef || []).forEach(function (m) { if (m.section) cur = m._o || m.section; else if (m.id === id) sec = cur; });
      var b = Object.assign({}, ED.edits().base); b.add = (b.add || []).concat([{ id: ED.rid('bx'), label: 'New metric', where: '', freq: 'Monthly', sec: sec }]); ED.saveEd({ base: b });
      toast('Added a metric at the end of this section'); redraw(); return;
    }
    var d = X.D(tab), ids = X.idsOf(tab), anchor = ids[pos], nid = X.uid();
    d.rows[nid] = {};
    var at = anchor && d.rows[anchor] && d.order.indexOf(anchor) > -1 ? d.order.indexOf(anchor) : d.order.length;
    d.order.splice(at, 0, nid);
    X.send(tab, { puts: (function (o) { o[nid] = {}; return o; })({}), order: d.order });
    shiftAll('r', { kind: 'ins', at: pos, n: 1 });
    redraw();
    setTimeout(function () { setSel({ r: pos, c: G.a ? G.a.c : 0 }); }, 30);
  };
  var deleteRows = function () {
    var tab = tabName(), rs = selRows(); if (!rs.length) { toast('Click a row number first'); return; }
    var ids = rs.map(rowId).filter(Boolean);
    snap('deleted ' + pluralRows(ids.length));
    if (isFixed()) {
      var b = Object.assign({}, ED.edits().base); b.add = (b.add || []).slice(); b.gone = Object.assign({}, b.gone);
      ids.forEach(function (id) { if (b.add.some(function (x) { return x.id === id; })) b.add = b.add.filter(function (x) { return x.id !== id; }); else b.gone[id] = true; });
      ED.saveEd({ base: b }); shiftAll('r', { kind: 'del', del: rs });
      toast('Hid ' + pluralRows(ids.length) + ' (turn on Edit to bring them back)'); G.a = G.f = null; redraw(); return;
    }
    var d = X.D(tab), dels = [];
    ids.forEach(function (id) {
      if (d.rows[id]) { dels.push(id); delete d.rows[id]; d.order = d.order.filter(function (x) { return x !== id; }); }
      else { X.pad[tab] = (X.pad[tab] || []).filter(function (x) { return x !== id; }); delete X.padRows[id]; }
    });
    if (dels.length) X.send(tab, { dels: dels, order: d.order });
    shiftAll('r', { kind: 'del', del: rs });
    toast('Deleted ' + pluralRows(ids.length) + '. Use Undo to bring them back.');
    var keep = Math.min(rs[0], Math.max(0, rowEls().length - ids.length - 1));
    G.a = { r: keep, c: G.a ? G.a.c : 0 }; G.f = G.a; redraw();
  };

  var colKeys = function () { return cols().map(function (c) { return c.k; }); };
  var colsEdit = function (fn) {
    var tab = tabName(), e = ED.edits(), c = Object.assign({}, e.cols), ce = Object.assign({ gone: {}, ren: {}, add: [], ord: null }, c[tab]);
    ce.gone = Object.assign({}, ce.gone); ce.ren = Object.assign({}, ce.ren); ce.add = (ce.add || []).slice();
    fn(ce); c[tab] = ce; ED.saveEd({ cols: c });
  };
  var insertCol = function (right) {
    var cs = selCols(); if (!cs.length) { toast('Click a cell first'); return; }
    var pos = right ? cs[cs.length - 1] + 1 : cs[0];
    if (pos < 1) pos = 1;
    snap('added a column');
    var nk = ED.rid('x'), order = colKeys();
    colsEdit(function (ce) { ce.add.push({ k: nk, label: 'New column' }); order.splice(pos, 0, nk); ce.ord = order; });
    shiftAll('c', { kind: 'ins', at: pos, n: 1 });
    redraw(); setTimeout(function () { setSel({ r: G.a ? G.a.r : 0, c: pos }); }, 30);
  };
  var deleteCols = function () {
    var cs = selCols(); if (!cs.length) { toast('Click a column header first'); return; }
    var all = cols(), keys = cs.map(function (c) { return all[c] && all[c].k; }).filter(Boolean);
    var okKeys = keys.filter(function (k) { var col = all.find(function (x) { return x.k === k; }); return col && !col.first; });
    if (!okKeys.length) { toast("The first column can't be deleted"); return; }
    snap('deleted ' + okKeys.length + ' column' + (okKeys.length === 1 ? '' : 's'));
    var delIdx = cs.filter(function (c) { return all[c] && okKeys.indexOf(all[c].k) > -1; });
    colsEdit(function (ce) {
      okKeys.forEach(function (k) { if (ce.add.some(function (a) { return a.k === k; })) ce.add = ce.add.filter(function (a) { return a.k !== k; }); else ce.gone[k] = true; });
      if (ce.ord) ce.ord = ce.ord.filter(function (k) { return okKeys.indexOf(k) < 0; });
    });
    shiftAll('c', { kind: 'del', del: delIdx });
    toast('Deleted ' + okKeys.length + ' column' + (okKeys.length === 1 ? '' : 's') + '. Use Undo to bring ' + (okKeys.length === 1 ? 'it' : 'them') + ' back.');
    G.a = G.f = { r: G.a ? G.a.r : 0, c: Math.max(0, Math.min(cs[0], all.length - okKeys.length - 1)) };
    redraw();
  };
  var renameCol = function (c) {
    var th = tbl().tHead.rows[0].children[c + 1], col = cols()[c]; if (!th || !col) return;
    var inp = document.createElement('input'); inp.className = 'gren'; inp.value = col.label; th.textContent = ''; th.appendChild(inp); inp.focus(); inp.select();
    var done = false, commit = function (save) {
      if (done) return; done = true; var v = inp.value.trim();
      if (save && v && v !== col.label) { snap('renamed a column'); colsEdit(function (ce) { ce.ren[col.k] = v; }); }
      redraw();
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); commit(true); } else if (e.key === 'Escape') commit(false); });
    inp.addEventListener('blur', function () { commit(true); });
  };
  var sortCol = function (c, dir) {
    var tab = tabName(), col = cols()[c]; if (isFixed() || !col) { toast('This table keeps its own order'); return; }
    var d = X.D(tab); snap('sorted by ' + col.label);
    var val = function (id) { var row = d.rows[id], v = col.get ? col.get(row) : row[col.k]; return v == null ? '' : String(v); };
    var ids = d.order.filter(function (i) { return d.rows[i]; });
    ids.sort(function (a, b) {
      var x = val(a), y = val(b), bx = X.blank(x), by = X.blank(y);
      if (bx || by) return bx === by ? 0 : bx ? 1 : -1;
      var nx = X.num(x), ny = X.num(y), r = nx !== null && ny !== null ? nx - ny : x.toLowerCase().localeCompare(y.toLowerCase());
      return dir * r;
    });
    d.order = ids; X.send(tab, { puts: {}, order: ids }); redraw();
  };

  /* ---------------- copy / paste ---------------- */
  var rangeText = function () {
    var q = rect(), out = []; if (!q) return '';
    for (var r = q.r1; r <= q.r2; r++) { var line = []; for (var c = q.c1; c <= q.c2; c++) line.push(rawOf(r, c).replace(/[\t\n\r]+/g, ' ')); out.push(line.join('\t')); }
    return out.join('\n');
  };
  var pasteText = function (text) {
    var q = rect(); if (!q) return;
    var tab = tabName(), cs = cols(), grid = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(function (l) { return l.split('\t'); });
    var one = grid.length === 1 && grid[0].length === 1;
    snap('pasted');
    var ids = X.idsOf(tab), nR = one ? q.r2 - q.r1 + 1 : grid.length, nC = one ? q.c2 - q.c1 + 1 : Math.max.apply(null, grid.map(function (g) { return g.length; }));
    for (var i = 0; i < nR; i++) {
      var r = q.r1 + i, id = ids[r];
      if (!id) { if (isFixed()) break; id = X.uid(); X.padRows[id] = {}; (X.pad[tab] = X.pad[tab] || []).push(id); ids.push(id); }
      for (var j = 0; j < nC; j++) {
        var col = cs[q.c1 + j]; if (!editable(col)) continue;
        var v = (one ? grid[0][0] : (grid[i] || [])[j]); if (v == null) continue; v = String(v).trim();
        if (col.opts) { var m = col.opts.find(function (o) { return o.toLowerCase() === v.toLowerCase(); }); v = m || ''; }
        X.setValue(tab, id, col, v);
        var row = X.D(tab).rows[id];
        if (row) { if (/^=./.test(v)) { row._fx = row._fx || {}; row._fx[col.k] = v; } else if (row._fx) { delete row._fx[col.k]; } }
      }
    }
    G.f = { r: Math.min(q.r1 + nR - 1, Math.max(0, ids.length - 1)), c: Math.min(q.c1 + nC - 1, cs.length - 1) };
    redraw(); setTimeout(function () { recalc(); paint(); }, 40);
  };

  /* ---------------- context menu ---------------- */
  var menu = null;
  var closeMenu = function () { if (menu) { menu.remove(); menu = null; } };
  var openMenu = function (e, kind) {
    closeMenu();
    var rs = selRows(), cs = selCols(), f = isFixed();
    var items = [];
    if (kind === 'cell') items.push(['Cut', 'cut'], ['Copy', 'copy'], ['Clear cells', 'clear'], '-');
    if (kind === 'row') items.push(['Clear row' + (rs.length > 1 ? 's' : ''), 'clear'], '-');
    if (kind === 'col') items.push(['Clear column' + (cs.length > 1 ? 's' : ''), 'clear'], '-');
    if (kind !== 'col') {
      if (f) items.push(['Add a metric to this section', 'rowbelow'], [rs.length > 1 ? 'Hide ' + rs.length + ' metrics' : 'Hide this metric', 'rowdel'], '-');
      else items.push(['Insert row above', 'rowabove'], ['Insert row below', 'rowbelow'], [rs.length > 1 ? 'Delete ' + pluralRows(rs.length) : 'Delete row ' + (rs[0] + 1), 'rowdel', 1], '-');
    }
    if (kind !== 'row') {
      items.push(['Insert column left', 'colleft'], ['Insert column right', 'colright'], [cs.length > 1 ? 'Delete ' + cs.length + ' columns' : 'Delete column ' + A1(cs[0]), 'coldel', 1], ['Rename column', 'colren'], '-');
      if (!f) items.push(['Sort A to Z', 'sorta'], ['Sort Z to A', 'sortz']);
    }
    while (items.length && items[items.length - 1] === '-') items.pop();
    var m = document.createElement('div'); m.className = 'gmenu';
    m.innerHTML = items.map(function (it) { return it === '-' ? '<div class="gsep"></div>' : '<button type="button" data-gm="' + it[1] + '"' + (it[2] ? ' class="bad"' : '') + '>' + esc(it[0]) + '</button>'; }).join('');
    document.body.appendChild(m); menu = m;
    var x = e.pageX, y = e.pageY, W = document.documentElement.clientWidth;
    m.style.left = Math.max(6, Math.min(x, W - m.offsetWidth - 8)) + 'px'; m.style.top = y + 'px';
    m.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    m.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-gm]'); if (!b) return; var a = b.dataset.gm; closeMenu(); act(a);
    });
  };
  var act = function (a) {
    if (a === 'rowabove') insertRow(false); else if (a === 'rowbelow') insertRow(true); else if (a === 'rowdel') deleteRows();
    else if (a === 'colleft') insertCol(false); else if (a === 'colright') insertCol(true); else if (a === 'coldel') deleteCols();
    else if (a === 'clear') clearRange(); else if (a === 'colren') renameCol(G.a ? G.a.c : 0);
    else if (a === 'sorta') sortCol(G.a ? G.a.c : 0, 1); else if (a === 'sortz') sortCol(G.a ? G.a.c : 0, -1);
    else if (a === 'copy' || a === 'cut') { var w = wrapEl(); if (w) { w.focus({ preventScroll: true }); document.execCommand(a); } }
    else if (a === 'undo') undo();
  };

  /* ---------------- events ---------------- */
  var cellFromEvent = function (e) { var td = e.target.closest && e.target.closest('td'); return td && tbl() && tbl().contains(td) ? td : null; };
  app.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    var t = tbl(); if (!t || !t.contains(e.target)) return;
    closeMenu();
    if (e.target.closest('.delx,[data-sh],.gren,.crz,.rsz')) return;
    var th = e.target.closest('th');
    var R = rowEls().length, C = cols().length;
    if (th) {
      var idx = Array.prototype.indexOf.call(th.parentNode.children, th) - 1;
      if (idx < -1) return;
      e.preventDefault();
      if (idx === -1) { selectAll(); return; }
      if (idx >= C) return;
      var anchor = e.shiftKey && G.a ? G.a : { r: 0, c: idx };
      G.a = { r: 0, c: e.shiftKey && G.a ? G.a.c : idx }; G.f = { r: R - 1, c: idx }; paint();
      G.drag = { mode: 'col' }; var w = wrapEl(); if (w) { G.keep = true; w.focus({ preventScroll: true }); G.keep = false; }
      return;
    }
    var td = cellFromEvent(e); if (!td) return;
    if (td.classList.contains('rn')) {
      e.preventDefault();
      var r = rowEls().indexOf(td.parentNode); if (r < 0) return;
      G.a = { r: e.shiftKey && G.a ? G.a.r : r, c: 0 }; G.f = { r: r, c: C - 1 }; paint();
      G.drag = { mode: 'row' }; var w2 = wrapEl(); if (w2) { G.keep = true; w2.focus({ preventScroll: true }); G.keep = false; }
      return;
    }
    var p = posOf(td); if (!p) return;
    if (e.shiftKey && G.a) { e.preventDefault(); G.f = p; paint(); var w3 = wrapEl(); if (w3) { G.keep = true; w3.focus({ preventScroll: true }); G.keep = false; } return; }
    var el = e.target.closest('.cell');
    G.mode = el && document.activeElement === el && !multi() ? 'edit' : 'select';
    G.a = G.f = p; G.drag = { mode: 'cell', moved: false, from: td }; paint();
  }, true);
  document.addEventListener('mousemove', function (e) {
    var d = G.drag; if (!d || !(e.buttons & 1)) return;
    var td = e.target.closest && e.target.closest('td, th'); if (!td || !tbl() || !tbl().contains(td)) return;
    var C = cols().length, R = rowEls().length;
    if (d.mode === 'cell') {
      if (td.tagName === 'TH') return;
      var p = posOf(td); if (!p) return;
      if (!d.moved && td === d.from) return;
      if (!d.moved) { d.moved = true; document.body.classList.add('gdrag'); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); var w = wrapEl(); if (w) { G.keep = true; w.focus({ preventScroll: true }); G.keep = false; } }
      G.f = p; paint();
    } else if (d.mode === 'row') {
      var r = rowEls().indexOf(td.closest('tr')); if (r < 0) return; G.f = { r: r, c: C - 1 }; paint();
    } else if (d.mode === 'col') {
      var idx = Array.prototype.indexOf.call(td.parentNode.children, td) - 1; if (idx < 0 || idx >= C) return; G.f = { r: R - 1, c: idx }; paint();
    }
  });
  document.addEventListener('mouseup', function () {
    var d = G.drag; G.drag = null; document.body.classList.remove('gdrag');
    if (d && d.mode === 'cell' && !d.moved && G.mode === 'select') {
      var el = G.a && inputAt(G.a.r, G.a.c);
      if (el && el.select && document.activeElement === el) setTimeout(function () { if (document.activeElement === el && G.mode === 'select') el.select(); }, 0);
    }
  });
  app.addEventListener('dblclick', function (e) { if (e.target.closest && e.target.closest('.cell')) G.mode = 'edit'; });
  app.addEventListener('focusin', function (e) {
    var el = e.target; if (!el.classList || !el.classList.contains('cell') || !el.dataset.t) return;
    var p = posOf(el.closest('td')); if (!p) return;
    var row = X.rowOf(el.dataset.t, el.dataset.r), f = row._fx && row._fx[el.dataset.k];
    if (f && el.value !== f) el.value = f;
    if (!G.keep && !(multi() && G.drag)) { if (!G.drag) G.mode = 'select'; G.a = G.f = p; paint(); }
  });
  app.addEventListener('focusout', function (e) {
    var el = e.target; if (!el.classList || !el.classList.contains('cell') || !el.dataset.t || el.tagName !== 'INPUT') return;
    finalize(el);
  });
  /* runs after the table's own input handler (it was registered earlier) */
  app.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'fxin') return;
    if (el.classList && el.classList.contains('cell')) {
      G.mode = 'edit';
      var fi = document.getElementById('fxin'); if (fi && document.activeElement !== fi) fi.value = el.value;
      recalc();
    }
  });
  var finalize = function (el) {
    var tab = el.dataset.t, id = el.dataset.r, k = el.dataset.k; if (tab !== tabName()) return;
    var col = cols().find(function (c) { return c.k === k; }); if (!editable(col) || col.opts) return;
    var d = X.D(tab), row = d.rows[id], v = el.value;
    if (/^=./.test(v)) {
      row = X.realize(tab, id); row._fx = row._fx || {}; row._fx[k] = v; X.markDirty(tab, id);
      recalc(); var td = el.closest('td'); if (td) td.classList.add('fx');
      if (row[k] != null && document.activeElement !== el) el.value = row[k];
    } else if (row && row._fx && row._fx[k] !== undefined) {
      delete row._fx[k]; if (!Object.keys(row._fx).length) delete row._fx; X.markDirty(tab, id); recalc();
      var td2 = el.closest('td'); if (td2) td2.classList.remove('fx');
    }
  };
  var applyBar = function () {
    var fi = document.getElementById('fxin'); if (!fi || !G.a || multi()) return;
    var el = inputAt(G.a.r, G.a.c); if (!el || el.tagName !== 'INPUT') return;
    el.value = fi.value; el.dispatchEvent(new Event('input', { bubbles: true })); finalize(el);
    fi.blur(); focusActive();
  };
  window.addEventListener('keydown', function (e) {
    if (e.target && e.target.id === 'fxin') {
      if (e.key === 'Enter') { e.preventDefault(); applyBar(); } else if (e.key === 'Escape') { e.target.value = G.a ? (fxOf(G.a.r, G.a.c) || rawOf(G.a.r, G.a.c)) : ''; e.target.blur(); focusActive(); }
      e.stopPropagation(); return;
    }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!G.tab || !tbl()) return;
    if (e.key === 'Escape' && menu) { closeMenu(); return; }
    var el = document.activeElement, w = wrapEl();
    var inCell = !!(el && el.classList && el.classList.contains('cell') && tbl().contains(el));
    var inWrap = el === w;
    if (!inCell && !inWrap) return;
    var mod = e.ctrlKey || e.metaKey, selMode = inWrap || multi() || G.mode === 'select';
    var k = e.key;
    if (mod && (k === 'a' || k === 'A') && selMode) { e.preventDefault(); selectAll(); return; }
    if (mod && (k === 'z' || k === 'Z') && selMode && G.undo.length && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (mod) return; /* copy, cut and paste are handled by their own events */
    if ((k === 'Delete' || k === 'Backspace') && selMode && (multi() || inWrap || el.tagName === 'SELECT' || G.mode === 'select')) { e.preventDefault(); e.stopPropagation(); clearRange('cleared cells'); setTimeout(focusActive, 30); return; }
    if (k === 'F2' && inCell) { e.preventDefault(); G.mode = 'edit'; if (el.setSelectionRange) { var n = el.value.length; el.setSelectionRange(n, n); } return; }
    if (k === 'Escape') { if (G.a) { G.f = G.a; paint(); focusActive(); } return; }
    var mv = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[k];
    if (mv && (selMode || (el.tagName === 'SELECT'))) {
      if (el.tagName === 'SELECT' && !e.shiftKey && (k === 'ArrowUp' || k === 'ArrowDown')) return; /* let the dropdown change */
      e.preventDefault(); e.stopPropagation();
      var q = G.f || G.a; if (!q) return;
      var np = { r: Math.max(0, Math.min(rowEls().length - 1, q.r + mv[0])), c: Math.max(0, Math.min(cols().length - 1, q.c + mv[1])) };
      if (e.shiftKey) { G.f = np; paint(); focusActive(); } else { G.mode = 'select'; setSel(np, np); }
      return;
    }
    if (k === 'Enter' && inWrap) { e.preventDefault(); var n2 = { r: Math.min(rowEls().length - 1, (G.f || G.a).r + 1), c: G.a.c }; G.mode = 'select'; setSel(n2, n2); return; }
    if (inWrap && k.length === 1 && !e.altKey && G.a) { /* typing over a selection starts editing the first cell */
      var t = inputAt(G.a.r, G.a.c); if (t && t.tagName === 'INPUT' && editable(cols()[G.a.c])) { e.preventDefault(); G.f = G.a; paint(); t.focus(); t.value = k; G.mode = 'edit'; t.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }, true);
  document.addEventListener('copy', function (e) {
    var el = document.activeElement, w = wrapEl();
    if (!(el === w || multi())) return;
    if (!G.tab || !rect()) return;
    e.clipboardData.setData('text/plain', rangeText()); e.preventDefault();
  });
  document.addEventListener('cut', function (e) {
    var el = document.activeElement, w = wrapEl();
    if (!(el === w || multi())) return;
    if (!G.tab || !rect()) return;
    e.clipboardData.setData('text/plain', rangeText()); e.preventDefault(); clearRange('cut cells');
  });
  document.addEventListener('paste', function (e) {
    var el = document.activeElement, w = wrapEl();
    if (!G.tab || !rect() || !(el === w || (multi() && el && el.classList && el.classList.contains('cell')))) return;
    var text = (e.clipboardData || window.clipboardData).getData('text'); if (!text) return;
    e.preventDefault(); e.stopPropagation(); pasteText(text);
  }, true);
  document.addEventListener('contextmenu', function (e) {
    var t = tbl(); if (!t || !t.contains(e.target)) return;
    var th = e.target.closest('th'), td = e.target.closest('td'), kind = 'cell', C = cols().length, R = rowEls().length;
    if (th) {
      var idx = Array.prototype.indexOf.call(th.parentNode.children, th) - 1;
      if (idx < 0 || idx >= C) return;
      var q = rect(); if (!(q && q.r1 === 0 && q.r2 === R - 1 && idx >= q.c1 && idx <= q.c2)) { G.a = { r: 0, c: idx }; G.f = { r: R - 1, c: idx }; paint(); }
      kind = 'col';
    } else if (td && td.classList.contains('rn')) {
      var r = rowEls().indexOf(td.parentNode); if (r < 0) return;
      var q2 = rect(); if (!(q2 && q2.c1 === 0 && q2.c2 === C - 1 && r >= q2.r1 && r <= q2.r2)) { G.a = { r: r, c: 0 }; G.f = { r: r, c: C - 1 }; paint(); }
      kind = 'row';
    } else if (td) {
      var p = posOf(td); if (!p) return;
      var q3 = rect(); if (!(q3 && p.r >= q3.r1 && p.r <= q3.r2 && p.c >= q3.c1 && p.c <= q3.c2)) { G.a = G.f = p; paint(); }
    } else return;
    e.preventDefault(); openMenu(e, kind);
  });
  document.addEventListener('mousedown', function (e) { if (menu && !e.target.closest('.gmenu')) closeMenu(); }, true);
  window.addEventListener('scroll', closeMenu, true);
  app.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-g]'); if (!b || b.disabled) return;
    var a = b.dataset.g;
    if (a === 'rowadd') act('rowbelow'); else if (a === 'rowdel') act('rowdel'); else if (a === 'coladd') act('colright'); else if (a === 'coldel') act('coldel'); else if (a === 'undo') undo();
  });
  /* leave the sheet alone when the user clicks somewhere else on the page */
  document.addEventListener('mousedown', function (e) {
    if (!G.tab) return;
    if (e.target.closest && (e.target.closest('table.sheet') || e.target.closest('.gridbar') || e.target.closest('.gmenu'))) return;
    if (G.a) { G.a = G.f = null; paint(); }
  }, true);
  setTimeout(decorate, 50);
};
