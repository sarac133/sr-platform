/* Sarac Ramsay — shared UI: theme, small helpers, task row, task drawer */
window.SR = window.SR || {};
(function (SR) {
  var html = SR.html;
  var R = React;

  SR.THEMES = {
    light: { bg: '#F3F5F8', card: '#FFFFFF', card2: '#F6F8FB', border: '#DCE2EA', line: '#EBEFF4', text: '#13213A', muted: '#5B6678', accent: '#2F5C99', accentBg: '#E7EEF8', green: '#087443', greenBg: '#E5F4EC', red: '#B42318', redBg: '#FCEBEA', gold: '#8A5A00', goldBg: '#FBF1DC', input: '#FFFFFF', primary: '#2F5C99', nav: '#0F1C33', cbline: '#8896A8', pillBg: '#E6ECF4', pillInk: '#142C49', goldFill: '#C9A84C', onGold: '#142C49', greenBtn: '#1F8A56', onPrimary: '#FFFFFF' },
    dark: { bg: '#0B1626', card: '#11233A', card2: '#0F1E33', border: '#2F4A6C', line: '#223855', text: '#EEF2F7', muted: '#9FB0C5', accent: '#DBBF69', accentBg: '#1A2F4B', green: '#4CC38A', greenBg: '#13302A', red: '#F87171', redBg: '#3A1B20', gold: '#DBBF69', goldBg: '#3A3014', input: '#0B1626', primary: '#C9A84C', nav: '#08111F', cbline: '#5C7392', pillBg: '#1D3452', pillInk: '#E3CB86', goldFill: '#C9A84C', onGold: '#142C49', greenBtn: '#2E9E68', onPrimary: '#142C49' }
  };
  /* Switch between Clients and Sales. Both live in the same app, behind the same login. */
  SR.AppSwitch = function (p) {
    var onSales = p.mode === 'sales';
    return html`<div class=${'sr-appsw' + (onSales ? ' sales' : '')} role="group" aria-label="Switch between Sales and Clients"><span class="th"></span>
      <button type="button" class=${'op' + (onSales ? ' on' : '')} aria-pressed=${onSales ? 'true' : 'false'} onClick=${p.onSales}>Sales</button>
      <button type="button" class=${'op' + (!onSales ? ' on' : '')} aria-pressed=${!onSales ? 'true' : 'false'} onClick=${p.onClients}>Clients</button></div>`;
  };
  /* tick sound: a short two note chime made with Web Audio, no file needed. Remembered in sr_sound. */
  SR.soundOn = function () { try { return localStorage.getItem('sr_sound') !== 'off'; } catch (e) { return true; } };
  SR.setSound = function (on) { try { localStorage.setItem('sr_sound', on ? 'on' : 'off'); } catch (e) {} };
  SR.playTick = function () {
    if (!SR.soundOn()) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      SR._ac = SR._ac || new AC(); var ac = SR._ac; if (ac.state === 'suspended') ac.resume();
      var t0 = ac.currentTime;
      [[880, 0], [1318.5, 0.09]].forEach(function (n) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t0 + n[1]); g.gain.exponentialRampToValueAtTime(0.14, t0 + n[1] + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + 0.28);
        o.connect(g); g.connect(ac.destination); o.start(t0 + n[1]); o.stop(t0 + n[1] + 0.3);
      });
    } catch (e) {}
  };

  SR.getTheme = function () { try { var t = localStorage.getItem('sr_theme'); if (t === 'dark' || t === 'light') return t; } catch (e) {} return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; };
  SR.applyTheme = function (name) {
    try { localStorage.setItem('sr_theme', name); } catch (e) {}
    var t = SR.THEMES[name], r = document.documentElement;
    Object.keys(t).forEach(function (k) { r.style.setProperty('--' + k, t[k]); });
    r.style.setProperty('color-scheme', name);
    if (SR.applyAccent) SR.applyAccent();
  };
  SR.ACCENTS = ['#2F5C99', '#6D4AE0', '#0E8F7E', '#D9622B', '#C2347A', '#3E8E3E'];
  SR.accentKey = function () { return 'sr_accent_' + (SR.ME && SR.ME.username || 'local'); };
  SR.getAccent = function () { try { return localStorage.getItem(SR.accentKey()) || ''; } catch (e) { return ''; } };
  SR.applyAccent = function () { var a = SR.getAccent(), r = document.documentElement; if (!a) { r.style.removeProperty('--uacc'); r.style.removeProperty('--uaccBg'); return; } r.style.setProperty('--accent', a); r.style.setProperty('--primary', a); r.style.setProperty('--uacc', a); r.style.setProperty('--uaccBg', 'color-mix(in srgb,' + a + ' 14%,var(--card))'); r.style.setProperty('--accentBg', 'color-mix(in srgb,' + a + ' 14%,var(--card))'); };
  SR.setAccent = function (a) { try { if (a) localStorage.setItem(SR.accentKey(), a); else localStorage.removeItem(SR.accentKey()); } catch (e) {} SR.applyTheme(SR.getTheme()); };
  SR.getDensity = function () { try { return localStorage.getItem('sr_density') || 'comfortable'; } catch (e) { return 'comfortable'; } };
  SR.setDensity = function (d) { try { localStorage.setItem('sr_density', d); } catch (e) {} document.documentElement.setAttribute('data-density', d); };
  try { SR.setDensity(SR.getDensity()); var pw = localStorage.getItem('sr_panelw'); if (pw) document.documentElement.style.setProperty('--panelw', pw); } catch (e) {}
  /* rows glide to their new place when a list reorders */
  SR.useWidth = function (ref) {
    var st = R.useState(1400);
    R.useLayoutEffect(function () { var el = ref.current; if (!el) return; var f = function () { st[1](Math.round(el.getBoundingClientRect().width)); }; f(); if (!window.ResizeObserver) return; var ro = new ResizeObserver(f); ro.observe(el); return function () { ro.disconnect(); }; }, []);
    return st[0];
  };
  SR.useFlip = function (ref, sel, attr) {
    var prev = R.useRef({});
    R.useLayoutEffect(function () {
      var root = ref.current; if (!root) return; var next = {}, y = window.scrollY || 0;
      root.querySelectorAll(sel).forEach(function (el) {
        var k = el.getAttribute(attr), top = el.getBoundingClientRect().top + y; next[k] = top; var o = prev.current[k];
        if (o != null && Math.abs(o - top) > 2 && Math.abs(o - top) < 900 && el.animate && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) el.animate([{ transform: 'translateY(' + (o - top) + 'px)' }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
      prev.current = next;
    });
  };
  /* drag the right edge of any table header to resize the column; double-click resets it */
  SR.colResizer = function (doc) {
    var KEY = 'sr_colw:' + ((doc.defaultView && doc.defaultView.location.pathname) || ''), W = {}, drag = null, lastEnd = 0;
    try { W = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    var sig = function (th) { var t = th.closest('table'); if (!t || !t.rows[0]) return ''; return Array.prototype.map.call(t.rows[0].cells, function (c) { return (c.textContent || '').trim().slice(0, 24); }).join('|') + '#' + th.cellIndex; };
    var setW = function (th, w) { th.style.width = th.style.minWidth = th.style.maxWidth = w ? w + 'px' : ''; th.dataset.rz = w ? String(w) : ''; };
    var apply = function () { doc.querySelectorAll('table th').forEach(function (th) { var w = W[sig(th)]; if (w && th.dataset.rz !== String(w)) setW(th, w); }); };
    var near = function (e) { var th = e.target.closest && e.target.closest('th'); if (!th) return null; var d = th.getBoundingClientRect().right - e.clientX; return d <= 6 && d >= -2 ? th : null; };
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) {} };
    doc.addEventListener('mousemove', function (e) { if (drag) { drag.cur = Math.max(40, Math.round(drag.w + e.clientX - drag.x)); setW(drag.th, drag.cur); return; } if (doc.body) doc.body.style.cursor = near(e) ? 'col-resize' : ''; }, true);
    doc.addEventListener('mousedown', function (e) { var th = near(e); if (!th) return; e.preventDefault(); e.stopPropagation(); drag = { th: th, x: e.clientX, w: th.getBoundingClientRect().width, key: sig(th), cur: 0 }; }, true);
    doc.addEventListener('mouseup', function () { if (!drag) return; if (drag.cur) { W[drag.key] = drag.cur; save(); } drag = null; lastEnd = Date.now(); if (doc.body) doc.body.style.cursor = ''; }, true);
    doc.addEventListener('click', function (e) { if (Date.now() - lastEnd < 250 && near(e)) { e.stopPropagation(); e.preventDefault(); } }, true);
    doc.addEventListener('dblclick', function (e) { var th = near(e); if (!th) return; delete W[sig(th)]; save(); setW(th, 0); }, true);
    var t0; new MutationObserver(function () { clearTimeout(t0); t0 = setTimeout(apply, 80); }).observe(doc.documentElement, { childList: true, subtree: true });
    apply();
  };
  /* apply the saved theme right away, before the first paint */
  try { SR.applyTheme(SR.getTheme()); } catch (e) {}

  /* date helpers */
  SR.fmtDay = function (d) {
    if (!d) return '';
    if (d === SR.TODAY) return 'today';
    if (d === SR.addDays(SR.TODAY, 1)) return 'tomorrow';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  SR.fmtDeadline = function (d) {
    if (!d) return '';
    if (d === SR.TODAY) return 'Today';
    if (d === SR.addDays(SR.TODAY, 1)) return 'Tomorrow';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  SR.money = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
  SR.n0 = function (v) { return Math.round(v).toLocaleString('en-US'); };
  /* battlefronts: the built-in fronts plus every client */
  SR.FRONTS = { agency: { id: 'agency', name: 'Agency / Admin', color: '#8F99AA', kind: 'agency' }, sales: { id: 'sales', name: 'Sales', color: '#E0A33A', kind: 'sales' }, marketing: { id: 'marketing', name: 'Marketing', color: '#B07CE0', kind: 'marketing' } };
  SR.clientById = function (clients, id) { for (var i = 0; i < clients.length; i++) if (clients[i].id === id) return clients[i]; if (id === '' || id == null) return { id: '', name: 'No battlefront yet', color: '#B0B6C2' }; return SR.FRONTS[id] || { id: 'agency', name: 'Agency', color: '#8F99AA' }; };
  SR.isLate = function (t, today) { return !t.done && ((t.deadline && t.deadline < today) || (t.date && t.date < today) || (t.rolled || 0) >= 2); };
  SR.fronts = function (clients) { return Object.keys(SR.FRONTS).map(function (k) { return SR.FRONTS[k]; }).concat(clients); };
  SR.frontAlias = { admin: 'agency', ops: 'agency', operations: 'agency', agency: 'agency', internal: 'agency', hq: 'agency', sr: 'agency', sales: 'sales', outreach: 'sales', pipeline: 'sales', calls: 'sales', 'cold calling': 'sales', marketing: 'marketing', website: 'marketing', content: 'marketing', brand: 'marketing', social: 'marketing' };
  var nrm = function (x) { return String(x || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); };
  SR.matchFront = function (word, clients) {
    var w = nrm(word); if (!w) return null; if (SR.frontAlias[w]) return SR.frontAlias[w];
    for (var i = 0; i < clients.length; i++) { var c = clients[i], n = nrm(c.name), d = nrm(String(c.domain || '').split('.')[0]); if (n === w || d === w || (w.length >= 3 && (n.indexOf(w) === 0 || (n.length >= 3 && w.indexOf(n) === 0)))) return c.id; }
    return null;
  };
  /* clean pasted task lists: checkboxes, bullets, numbering, "Admin - " prefixes, headings, @owner */
  SR.parseTaskLines = function (text, clients, tasks) {
    var CHK = /^\s*(?:[-*+•▪◦]\s*)?(?:\[\s*([xX✓✔]?)\s*\]|([☐□▢⬜])|([☑✅✔☒✓]))\s*/;
    var BUL = /^\s*(?:[-*+•▪◦–—]|\d{1,3}[.)])\s+/;
    var rows = [], group = null;
    String(text || '').replace(/\r/g, '').split('\n').forEach(function (raw) {
      var s = raw.replace(/\t/g, ' ').trim(); if (!s) return;
      var hm = !CHK.test(s) && (/^#{1,6}\s+(.+?)\s*#*$/.exec(s) || /^\*\*([^*]{2,40})\*\*:?$/.exec(s) || /^([A-Za-z][A-Za-z0-9&' ]{1,30}):$/.exec(s));
      if (hm) { group = SR.matchFront(hm[1], clients); return; }
      var done = false, m = CHK.exec(s);
      if (m) { done = !!(m[1] || m[3]); s = s.slice(m[0].length); } else s = s.replace(BUL, '');
      m = CHK.exec(s); if (m) { done = done || !!(m[1] || m[3]); s = s.slice(m[0].length); }
      s = s.replace(/^\*\*(.+?)\*\*/, '$1').replace(/~~(.+?)~~/g, '$1').replace(/^(?:todo|task)\s*[:\-]\s*/i, '').trim();
      if (s) rows.push({ s: s, done: done, group: group });
    });
    var PFX = /^([A-Za-z0-9&'\/ ]{2,30}?)(?:\s[-–—]\s|:\s|\s\|\s)\s*(.+)$/, counts = {};
    rows.forEach(function (r) { var m = PFX.exec(r.s); r.pfx = m ? m[1].trim() : ''; r.rest = m ? m[2].trim() : r.s; if (r.pfx) counts[nrm(r.pfx)] = (counts[nrm(r.pfx)] || 0) + 1; });
    var seen = {}, existing = {};
    (tasks || []).forEach(function (t) { if (!t.done) existing[t.clientId + '|' + nrm(t.name)] = 1; });
    return rows.map(function (r, i) {
      var front = r.pfx ? SR.matchFront(r.pfx, clients) : null, name = r.s, tag = '', from = '';
      if (front) { name = r.rest; from = 'prefix'; } else if (r.pfx && counts[nrm(r.pfx)] >= 2 && r.pfx.split(' ').length <= 2) { name = r.rest; tag = r.pfx; }
      if (!front && r.group) { front = r.group; from = 'heading'; }
      var owner = '';
      name = name.replace(/(^|\s)@([A-Za-z]+)\b/g, function (all, sp, n) { var t = (SR.TEAM || []).filter(function (x) { return x.toLowerCase() === n.toLowerCase(); })[0]; if (t) { owner = t; return sp; } return all; }).replace(/\s{2,}/g, ' ').replace(/^[\s\-–—:]+/, '').trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
      var key = nrm(name), dupe = !!seen[key] || (front && !!existing[front + '|' + key]); seen[key] = 1;
      return { i: i, name: name, front: front, from: from, owner: owner, done: r.done, tag: tag, dupe: dupe, include: !!name && !r.done && !dupe };
    }).filter(function (x) { return x.name; });
  };

  SR.fx = function () {}; SR.gameDone = function () {};
  /* one-line composer: type or paste, press Enter. Battlefront and owner stick. */
  SR.QuickAdd = function (p) {
    var fr = SR.fronts(p.clients), team = SR.TEAM || [], val = p.value || '', has = !!val.trim(), fi = React.useRef(null), dr = React.useState(false), over = dr[0], setOver = dr[1];
    var readFile = function (f) { if (!f) return; var r = new FileReader(); r.onload = function () { var csv = /\.csv$/i.test(f.name), t = String(r.result || '').split(/\r?\n/).map(function (l) { if (!csv) return l; var m = /^\s*"((?:[^"]|"")*)"/.exec(l); return m ? m[1].replace(/""/g, '"') : l.split(',')[0]; }).join('\n'); p.onChange((val ? val + '\n' : '') + t); }; r.readAsText(f); };
    return html`<div class=${'qa2' + (p.need ? ' need' : '') + (over ? ' over' : '')} onDragOver=${function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); setOver(true); } }} onDragLeave=${function () { setOver(false); }} onDrop=${function (e) { setOver(false); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { e.preventDefault(); readFile(f); } }}>
      <div class="qa2-row"><span class="qa2-plus" aria-hidden="true">+</span>
        <textarea rows=${Math.min(7, Math.max(1, val.split('\n').length))} placeholder=${over ? 'Drop the file here' : 'Add a task, or paste a list'} aria-label="Add tasks" value=${val} onChange=${function (e) { p.onChange(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); p.onChange(e.target.value); setTimeout(p.onAdd, 0); } }}></textarea>
        <input ref=${fi} type="file" accept=".txt,.csv,text/plain,text/csv" style="display:none" onChange=${function (e) { readFile(e.target.files && e.target.files[0]); e.target.value = ''; }} /></div>
    </div>`;
  };
  /* review popup: choose the battlefront and owner before anything is posted */
  SR.AddReview = function (p) {
    var st = R.useState(p.items), rows = st[0], setRows = st[1];
    var ds = R.useState('today'), dmode = ds[0], setDmode = ds[1];
    var dp = R.useState(''), dpick = dp[0], setDpick = dp[1];
    R.useEffect(function () { var k = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, []);
    var fr = SR.fronts(p.clients), team = SR.TEAM || [];
    var upd = function (i, o) { setRows(function (rs) { return rs.map(function (r) { return r.i === i ? Object.assign({}, r, o) : r; }); }); };
    var all = function (o) { setRows(function (rs) { return rs.map(function (r) { return Object.assign({}, r, o); }); }); };
    var inc = rows.filter(function (r) { return r.include; }), missing = inc.filter(function (r) { return !r.front; }).length;
    var date = dmode === 'today' ? SR.TODAY : dmode === 'tomorrow' ? SR.addDays(SR.TODAY, 1) : dmode === 'pick' ? dpick : '';
    var opt = function (v, l) { return html`<option key=${v} value=${v}>${l}</option>`; };
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="mdl ar-mdl" role="dialog" aria-label="Review tasks">
      <div class="mdl-top"><h2>Review ${rows.length} task${rows.length === 1 ? '' : 's'}</h2><button type="button" class="edbtn" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 14)}</button></div>
      <div class="ar-all">
        <label>Battlefront for all<select class="cal-in" value="" onChange=${function (e) { if (e.target.value) all({ front: e.target.value }); }}>${opt('', 'Keep detected')}${fr.map(function (f) { return opt(f.id, f.name); })}</select></label>
        <label>Owner for all<select class="cal-in" value="" onChange=${function (e) { if (e.target.value !== '') all({ owner: e.target.value === '__none' ? '' : e.target.value }); }}>${opt('', 'Keep as is')}${team.map(function (n) { return opt(n, n); })}${opt('__none', 'Unassigned')}</select></label>
        <label>Date<span style="display:flex;gap:6px"><select class="cal-in" value=${dmode} onChange=${function (e) { setDmode(e.target.value); }}>${opt('today', 'Today')}${opt('tomorrow', 'Tomorrow')}${opt('none', 'No date')}${opt('pick', 'Pick a date')}</select>${dmode === 'pick' ? html`<input type="date" class="cal-in" value=${dpick} onChange=${function (e) { setDpick(e.target.value); }} />` : null}</span></label>
      </div>
      <div class="ar-list">${rows.map(function (r) {
        return html`<div key=${r.i} class=${'ar-row' + (r.include ? '' : ' off') + (r.include && !r.front ? ' need' : '')}>
          <input type="checkbox" checked=${r.include} aria-label="Include" onChange=${function (e) { upd(r.i, { include: e.target.checked }); }} />
          <div class="ar-main"><input class="cal-in ar-name" type="text" value=${r.name} aria-label="Task name" onChange=${function (e) { upd(r.i, { name: e.target.value }); }} />
            <div class="ar-tags">${r.done ? html`<span class="ar-b">already ticked in your paste</span>` : null}${r.dupe ? html`<span class="ar-b warn">looks like a duplicate</span>` : null}${r.from === 'prefix' ? html`<span class="ar-b">front from prefix</span>` : null}${r.from === 'heading' ? html`<span class="ar-b">front from heading</span>` : null}${r.tag ? html`<span class="ar-b">label: ${r.tag}</span>` : null}</div></div>
          <select class="cal-in ar-sel" aria-label="Battlefront" value=${r.front || ''} onChange=${function (e) { upd(r.i, { front: e.target.value || null }); }}>${opt('', 'Choose a front…')}${fr.map(function (f) { return opt(f.id, f.name); })}</select>
          <select class="cal-in ar-sel" aria-label="Owner" value=${r.owner || ''} onChange=${function (e) { upd(r.i, { owner: e.target.value }); }}>${opt('', 'Unassigned')}${team.map(function (n) { return opt(n, n); })}</select>
        </div>`; })}</div>
      <div class="ar-foot"><span class="ar-note">${missing ? missing + ' still need a battlefront' : inc.length + ' ready to post'}</span>
        <button type="button" class="edbtn" onClick=${p.onClose}>Cancel</button>
        <button type="button" class="ar-go" disabled=${!inc.length || !!missing} onClick=${function () { p.onPost(inc, date); }}>Post ${inc.length} task${inc.length === 1 ? '' : 's'}</button></div>
    </div></div>`;
  };


  /* ---- editable text, Notion style: click a title or description to change it ---- */
  SR.uiprefs = SR.uiprefs || {};
  SR.uiprefs.texts = SR.uiprefs.texts || {}; SR.uiprefs.labels = SR.uiprefs.labels || {}; SR.uiprefs.icons = SR.uiprefs.icons || {}; SR.uiprefs.order = SR.uiprefs.order || [];
  /* Eclipse mark: a dark moon crossing a blue sun, leaving a thin crescent */
  SR.Logo = function (size, tile) {
    var s = size || 22; return html`<svg width=${s} height=${s} viewBox="0 0 32 32" role="img" aria-label="Eclipse" style="flex:none;display:block"><rect width="32" height="32" rx="8" fill=${tile || '#191919'}/><circle cx="16" cy="16" r="9.5" fill="#2383E2"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#9CCBF5" stroke-width=".7" opacity=".7"/><circle cx="19.2" cy="13.6" r="8.6" fill=${tile || '#191919'}/></svg>`;
  };

  SR.Ed = function (p) {
    var tk = React.useState(0), setT = tk[1], T = SR.uiprefs.texts || (SR.uiprefs.texts = {}), has = Object.prototype.hasOwnProperty.call(T, p.id), v = has ? T[p.id] : (p.def || '');
    var tag = p.tag || 'span';
    var save = function (txt) { txt = String(txt || '').replace(/\s+/g, ' ').trim(); if (txt === (p.def || '')) delete T[p.id]; else T[p.id] = txt; setT(function (x) { return x + 1; }); };
    return html`<${tag} key=${p.id + ':' + v} class=${'ed' + (v ? '' : ' empty') + (p.cls ? ' ' + p.cls : '')} style=${p.style || ''} data-ph=${p.ph || 'Add text'} contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" role="textbox" aria-label=${p.ph || 'Edit text'}
      onBlur=${function (e) { save(e.currentTarget.textContent); }}
      onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } else if (e.key === 'Escape') { e.currentTarget.textContent = v; e.currentTarget.blur(); } }}
      onPaste=${function (e) { e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text') || ''; document.execCommand('insertText', false, t.replace(/\s+/g, ' ')); }}>${v}<//>`;
  };

  /* ---- Notion-style blocks and databases ---- */
  var BK = {
    p: ['Text', 'Just start writing with plain text'], h: ['Heading 1', 'Big section heading'], h2: ['Heading 2', 'Medium heading'], h3: ['Heading 3', 'Small heading'],
    ul: ['Bulleted list', 'A simple bulleted list'], ol: ['Numbered list', 'A list with numbering'], todo: ['To-do list', 'Track tasks with a checkbox'],
    toggle: ['Toggle list', 'Hide and show content'], quote: ['Quote', 'Capture a quote'], callout: ['Callout', 'Make writing stand out'], code: ['Code', 'Capture a code snippet'],
    divider: ['Divider', 'Visually divide blocks'], toc: ['Table of contents', 'Links to the headings on this page'], bookmark: ['Web bookmark', 'A link card for a web page'], date: ['Date', 'Insert today\'s date'], mention: ['Mention a person', 'Tag someone from the team'], emoji: ['Emoji', 'Insert an emoji'], table: ['Table', 'A simple table'], db: ['Database', 'A table, board or list you can sort and filter']
  };
  var BORDER = ['p', 'h', 'h2', 'h3', 'ul', 'ol', 'todo', 'toggle', 'quote', 'callout', 'code', 'divider', 'toc', 'bookmark', 'table', 'db', 'date', 'mention', 'emoji'];
  var cleanHtml = function (h) {
    var d = document.createElement('div'); d.innerHTML = String(h || '');
    var walk = function (n) { Array.prototype.slice.call(n.childNodes).forEach(function (c) { if (c.nodeType === 1) { var t = c.tagName.toLowerCase(); if (t === 'b' || t === 'strong') { var b = document.createElement('b'); while (c.firstChild) b.appendChild(c.firstChild); n.replaceChild(b, c); walk(b); } else if (t === 'i' || t === 'em') { var i = document.createElement('i'); while (c.firstChild) i.appendChild(c.firstChild); n.replaceChild(i, c); walk(i); } else if (t === 'u' || t === 's' || t === 'strike' || t === 'code' || t === 'br') { walk(c); } else if (t === 'a') { var href = c.getAttribute('href') || ''; if (!/^(https?:|mailto:)/i.test(href)) { c.removeAttribute('href'); } Array.prototype.slice.call(c.attributes).forEach(function (a) { if (a.name !== 'href') c.removeAttribute(a.name); }); c.setAttribute('target', '_blank'); c.setAttribute('rel', 'noopener'); walk(c); } else { while (c.firstChild) n.insertBefore(c.firstChild, c); n.removeChild(c); } } else if (c.nodeType !== 3) n.removeChild(c); }); };
    walk(d); return d.innerHTML;
  };
  var plain = function (h) { var d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent || ''; };
  var KW = { h: 'h1 heading1 title', h2: 'h2 heading2', h3: 'h3 heading3', ul: 'bullet list', ol: 'number list', todo: 'checkbox task', toggle: 'collapse', db: 'table board list kanban', toc: 'contents', bookmark: 'link url' };
  var COLORS = [['Default', ''], ['Gray', '#9B9A97'], ['Brown', '#9F6B53'], ['Orange', '#D9730D'], ['Yellow', '#CB912F'], ['Green', '#448361'], ['Blue', '#337EA9'], ['Purple', '#9065B0'], ['Pink', '#C14C8A'], ['Red', '#D44C47']];
  var EMOJI = ['😀', '👍', '🎉', '✅', '🔥', '⭐', '💡', '📌', '🚀', '⚠️', '❤️', '👀'];
  var uid = function () { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };
  var newDb = function () { return { type: 'db', title: 'Untitled database', view: 'table', props: [{ id: 'name', name: 'Name', type: 'title' }, { id: 'st', name: 'Status', type: 'select', opts: ['Not started', 'In progress', 'Done'] }, { id: 'dt', name: 'Date', type: 'date' }], rows: [{ id: uid(), v: {} }, { id: uid(), v: {} }], sort: '', q: '' }; };
  var mkBlock = function (k) {
    if (k === 'table') return { type: 'table', rows: [['', '', ''], ['', '', ''], ['', '', '']] };
    if (k === 'db') return newDb();
    if (k === 'divider') return { type: 'divider' };
    if (k === 'toc') return { type: 'toc' };
    if (k === 'bookmark') return { type: 'bookmark', url: '', title: '' };
    if (k === 'callout') return { type: 'callout', html: '', icon: '💡' };
    if (k === 'toggle') return { type: 'toggle', html: '', body: '', open: true };
    if (k === 'todo') return { type: 'todo', html: '', done: false };
    return { type: k, html: '' };
  };
  var TAGC = ['#E7F3F8:#0B6E99', '#DBEDDB:#1C3829', '#FBF3DB:#7A5F14', '#FFE2DD:#8B1A0F', '#E8DEEE:#492F64', '#EEE0DA:#603B2C', '#F1F1EF:#37352F'];
  var tagStyle = function (s) { var i = 0; for (var k = 0; k < String(s).length; k++) i += String(s).charCodeAt(k); var c = TAGC[i % TAGC.length].split(':'); return 'background:' + c[0] + ';color:' + c[1]; };

  SR.Database = function (p) {
    var b = p.block, bump = p.bump, R = React;
    var ms = R.useState(null), menu = ms[0], setMenu = ms[1];
    var P = b.props, titleP = P[0];
    var addRow = function (v) { b.rows.push({ id: uid(), v: v || {} }); bump(); };
    var setV = function (r, pid, val) { r.v[pid] = val; bump(); };
    var rows = b.rows.slice();
    if (b.q) { var q = b.q.toLowerCase(); rows = rows.filter(function (r) { return P.some(function (pp) { var v = r.v[pp.id]; return String(Array.isArray(v) ? v.join(' ') : v == null ? '' : v).toLowerCase().indexOf(q) > -1; }); }); }
    if (b.sort) { var sp = P.filter(function (x) { return x.id === b.sort; })[0]; if (sp) rows.sort(function (a, c) { var x = a.v[sp.id], y = c.v[sp.id]; if (sp.type === 'number') return (+x || 0) - (+y || 0); return String(x == null ? '' : x).localeCompare(String(y == null ? '' : y)); }); }
    var cell = function (r, pp) {
      var v = r.v[pp.id];
      if (pp.type === 'title' || pp.type === 'text' || pp.type === 'url') return html`<div class="dbc-t" contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" data-ph=${pp.type === 'title' ? 'Untitled' : ''} onBlur=${function (e) { var t = String(e.currentTarget.textContent || '').trim(); if (t !== (v || '')) r.v[pp.id] = t; }} onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>${v || ''}</div>`;
      if (pp.type === 'number') return html`<input class="dbc-i" type="number" value=${v == null ? '' : v} onChange=${function (e) { setV(r, pp.id, e.target.value === '' ? null : +e.target.value); }} />`;
      if (pp.type === 'date') return html`<input class="dbc-i" type="date" value=${v || ''} onChange=${function (e) { setV(r, pp.id, e.target.value); }} />`;
      if (pp.type === 'checkbox') return html`<input type="checkbox" class="dbc-ck" checked=${!!v} onChange=${function (e) { setV(r, pp.id, e.target.checked); }} />`;
      if (pp.type === 'select') return html`<select class="dbc-s" value=${v || ''} style=${v ? tagStyle(v) : ''} onChange=${function (e) { if (e.target.value === '__new') { var nm = window.prompt('New option'); if (nm && nm.trim()) { pp.opts = (pp.opts || []).concat([nm.trim()]); setV(r, pp.id, nm.trim()); } else bump(); } else setV(r, pp.id, e.target.value); }}><option value="">Empty</option>${(pp.opts || []).map(function (o) { return html`<option key=${o} value=${o}>${o}</option>`; })}<option value="__new">+ New option</option></select>`;
      if (pp.type === 'person') return html`<select class="dbc-s" value=${v || ''} onChange=${function (e) { setV(r, pp.id, e.target.value); }}><option value="">Empty</option>${(SR.TEAM || []).map(function (o) { return html`<option key=${o} value=${o}>${o}</option>`; })}</select>`;
      return null;
    };
    var propMenu = menu && menu.pid ? P.filter(function (x) { return x.id === menu.pid; })[0] : null;
    var TYPES = [['text', 'Text'], ['number', 'Number'], ['select', 'Select'], ['date', 'Date'], ['checkbox', 'Checkbox'], ['url', 'URL'], ['person', 'Person']];
    var table = html`<div class="db-scroll"><table class="db-tbl"><thead><tr>${P.map(function (pp) { return html`<th key=${pp.id}><button type="button" class="db-th" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); setMenu({ pid: pp.id, x: r.left, y: r.bottom + 4 }); }}><span class="db-ti">${pp.type === 'title' ? 'Aa' : pp.type === 'number' ? '#' : pp.type === 'date' ? '▦' : pp.type === 'checkbox' ? '☑' : pp.type === 'select' ? '▾' : pp.type === 'url' ? '↗' : pp.type === 'person' ? '☺' : '≡'}</span>${pp.name}</button></th>`; })}<th class="db-addcol"><button type="button" class="db-th" aria-label="Add a property" onClick=${function () { var n = 'Property ' + P.length; P.push({ id: uid(), name: n, type: 'text' }); bump(); }}>+</button></th></tr></thead>
      <tbody>${rows.map(function (r) { return html`<tr key=${r.id}>${P.map(function (pp) { return html`<td key=${pp.id}>${cell(r, pp)}</td>`; })}<td class="db-rm"><button type="button" aria-label="Delete row" onClick=${function () { b.rows = b.rows.filter(function (x) { return x.id !== r.id; }); bump(); }}>×</button></td></tr>`; })}</tbody></table>
      <button type="button" class="db-new" onClick=${function () { addRow(); }}>+ New</button></div>`;
    var gp = P.filter(function (x) { return x.type === 'select'; })[0];
    var board = !gp ? html`<div class="db-empty">Add a Select property to group the board.</div>` : html`<div class="db-board">${(gp.opts || []).concat(['']).map(function (o) { var col = rows.filter(function (r) { return (r.v[gp.id] || '') === o; });
      return html`<div key=${o || 'none'} class="db-col" onDragOver=${function (e) { if (p.dragRow) e.preventDefault(); }} onDrop=${function (e) { e.preventDefault(); var id = p.dragRow(); if (!id) return; b.rows.forEach(function (r) { if (r.id === id) r.v[gp.id] = o; }); bump(); }}>
        <div class="db-ch">${o ? html`<span class="db-tag" style=${tagStyle(o)}>${o}</span>` : html`<span class="db-tag" style="background:var(--card2);color:var(--muted)">No ${gp.name}</span>`} <span class="db-n">${col.length}</span></div>
        ${col.map(function (r) { return html`<div key=${r.id} class="db-card" draggable="true" onDragStart=${function () { p.setDragRow(r.id); }}>${cell(r, titleP)}${P.filter(function (x) { return x.id !== titleP.id && x.id !== gp.id && r.v[x.id] != null && r.v[x.id] !== ''; }).map(function (x) { return html`<div key=${x.id} class="db-cm">${x.type === 'checkbox' ? (r.v[x.id] ? '☑ ' + x.name : '') : String(r.v[x.id])}</div>`; })}</div>`; })}
        <button type="button" class="db-new" onClick=${function () { var v = {}; v[gp.id] = o; addRow(v); }}>+ New</button></div>`; })}</div>`;
    var list = html`<div class="db-list">${rows.map(function (r) { return html`<div key=${r.id} class="db-li"><div style="flex:1;min-width:0">${cell(r, titleP)}</div>${P.slice(1, 4).map(function (pp) { return html`<div key=${pp.id} class="db-lc">${cell(r, pp)}</div>`; })}<button type="button" class="db-rmb" aria-label="Delete row" onClick=${function () { b.rows = b.rows.filter(function (x) { return x.id !== r.id; }); bump(); }}>×</button></div>`; })}<button type="button" class="db-new" onClick=${function () { addRow(); }}>+ New</button></div>`;
    return html`<div class="db">
      <div class="db-head"><div class="db-title" contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" data-ph="Untitled database" onBlur=${function (e) { b.title = String(e.currentTarget.textContent || '').trim(); bump(); }} onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>${b.title}</div>
        <div class="db-tools"><button type="button" class="dbx" onClick=${function () { if (window.confirm('Delete this database and all its rows?')) p.onDelete(); }} title="Delete database">Delete</button></div></div>
      <div class="db-bar"><div class="ntabs db-views" role="tablist">${[['table', 'Table'], ['board', 'Board'], ['list', 'List']].map(function (v) { return html`<button key=${v[0]} type="button" role="tab" aria-selected=${b.view === v[0]} class=${b.view === v[0] ? 'on' : ''} onClick=${function () { b.view = v[0]; bump(); }}>${v[1]}</button>`; })}</div>
        <span style="flex:1"></span><select class="nsel" aria-label="Sort" value=${b.sort || ''} onChange=${function (e) { b.sort = e.target.value; bump(); }}><option value="">Sort: none</option>${P.map(function (pp) { return html`<option key=${pp.id} value=${pp.id}>Sort: ${pp.name}</option>`; })}</select>
        <input class="nsearch" type="search" placeholder="Filter" aria-label="Filter rows" value=${b.q || ''} onInput=${function (e) { b.q = e.target.value; bump(); }} /></div>
      ${b.view === 'board' ? board : b.view === 'list' ? list : table}
      ${propMenu ? html`<div class="qas-bg" style="background:transparent;padding:0" onMouseDown=${function () { setMenu(null); }}><div class="sr-navmenu" style=${'left:' + Math.min(menu.x, window.innerWidth - 230) + 'px;top:' + Math.min(menu.y, window.innerHeight - 330) + 'px;min-width:210px'} onMouseDown=${function (e) { e.stopPropagation(); }}>
        <input class="sr-navren" style="margin-bottom:4px" defaultValue=${propMenu.name} aria-label="Property name" onKeyDown=${function (e) { if (e.key === 'Enter') { var v = e.target.value.trim(); if (v) propMenu.name = v; setMenu(null); bump(); } }} onBlur=${function (e) { var v = e.target.value.trim(); if (v) propMenu.name = v; bump(); }} />
        ${propMenu.type === 'title' ? html`<div style="font-size:12px;color:var(--muted);padding:4px 8px">The name column cannot change type.</div>` : html`<div style="font-size:11px;color:var(--muted);padding:4px 8px">Type</div>${TYPES.map(function (t) { return html`<button type="button" key=${t[0]} style=${propMenu.type === t[0] ? 'font-weight:600' : ''} onClick=${function () { propMenu.type = t[0]; if (t[0] === 'select' && !propMenu.opts) propMenu.opts = ['Option 1', 'Option 2']; setMenu(null); bump(); }}>${t[1]}${propMenu.type === t[0] ? ' ✓' : ''}</button>`; })}${propMenu.type === 'select' ? html`<button type="button" onClick=${function () { var nm = window.prompt('New option'); if (nm && nm.trim()) { propMenu.opts = (propMenu.opts || []).concat([nm.trim()]); } setMenu(null); bump(); }}>+ Add an option</button>` : null}<button type="button" style="color:var(--red)" onClick=${function () { var id = propMenu.id; b.props = b.props.filter(function (x) { return x.id !== id; }); setMenu(null); bump(); }}>Delete property</button>`}
      </div></div>` : null}</div>`;
  };

  SR.Blocks = function (p) {
    var R = React, tk = R.useState(0), bump = function () { tk[1](function (x) { return x + 1; }); };
    var P = SR.uiprefs; P.blocks = P.blocks || {}; var L = P.blocks[p.id] = P.blocks[p.id] || [];
    L.forEach(function (x) { if (x.html === undefined && x.text !== undefined && x.type !== 'table') { x.html = String(x.text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); delete x.text; } });
    var ms = R.useState(null), menu = ms[0], setMenu = ms[1];
    var fs = R.useState(null), fmt = fs[0], setFmt = fs[1];
    var dragId = R.useRef(null), dragRow = R.useRef(null), overId = R.useState(null), over = overId[0], setOver = overId[1];
    var idx = function (id) { for (var i = 0; i < L.length; i++) if (L[i].id === id) return i; return -1; };
    var add = function (after, b) { b.id = uid(); var i = after ? idx(after) + 1 : L.length; L.splice(i, 0, b); SR._fb = b.id; bump(); return b; };
    var del = function (id, focusPrev) { var i = idx(id); if (i < 0) return; L.splice(i, 1); if (focusPrev && L[i - 1]) SR._fb = L[i - 1].id; bump(); };
    var turn = function (id, k) { var i = idx(id); if (i < 0) return; var old = L[i], nb = mkBlock(k); if (nb.html !== undefined && old.html !== undefined) nb.html = old.html; nb.id = id; L[i] = nb; SR._fb = id; bump(); };
    var fref = function (id) { return function (el) { if (el && SR._fb === id) { SR._fb = null; setTimeout(function () { try { el.focus(); var r = document.createRange(); r.selectNodeContents(el); r.collapse(false); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (x) {} }, 0); } }; };
    var save = function (b, el) { b.html = cleanHtml(el.innerHTML); };
    var caretInfo = function (el) { var s = window.getSelection(); if (!s.rangeCount || !el.contains(s.anchorNode)) return null; var r = s.getRangeAt(0), pre = document.createRange(); pre.selectNodeContents(el); pre.setEnd(r.startContainer, r.startOffset); var post = document.createRange(); post.selectNodeContents(el); post.setStart(r.endContainer, r.endOffset); var a = document.createElement('div'); a.appendChild(pre.cloneContents()); var z = document.createElement('div'); z.appendChild(post.cloneContents()); return { before: a.innerHTML, after: z.innerHTML, atStart: plain(a.innerHTML) === '', atEnd: plain(z.innerHTML) === '' }; };
    var SHORT = { '#': 'h', '##': 'h2', '###': 'h3', '-': 'ul', '*': 'ul', '1.': 'ol', '[]': 'todo', '>': 'toggle', '"': 'quote' };
    var numberOf = function (b) { var n = 1, i = idx(b.id) - 1; while (i >= 0 && L[i].type === 'ol') { n++; i--; } return n; };
    var openSlash = function (b, el) { var r = el.getBoundingClientRect(); setMenu({ id: b.id, x: r.left, y: r.bottom + 4, q: '' }); };
    var recent = (P.recent || []).filter(function (k) { return BORDER.indexOf(k) > -1; }).slice(0, 3);
    var cmdQ = menu ? (menu.q || '').toLowerCase() : '';
    var colorHit = menu && cmdQ ? COLORS.filter(function (c) { return c[1] && c[0].toLowerCase().indexOf(cmdQ) === 0; }) : [];
    var cmdHit = menu && !menu.after ? ['delete', 'duplicate'].filter(function (c) { return cmdQ && c.indexOf(cmdQ) === 0; }) : [];
    var menuItems = menu ? BORDER.filter(function (k) { var q = cmdQ; return !q || BK[k][0].toLowerCase().indexOf(q) > -1 || (KW[k] || '').split(' ').some(function (w) { return w.indexOf(q) === 0; }); }) : [];
    if (menu && !cmdQ) menuItems = recent.concat(menuItems.filter(function (k) { return recent.indexOf(k) < 0; }));
    var pickMenu = function (k) { var m = menu; setMenu(null); if (!m) return; P.recent = [k].concat((P.recent || []).filter(function (x) { return x !== k; })).slice(0, 5);
      var who = ''; if (k.indexOf('mention:') === 0) { who = k.slice(8); k = 'mention'; }
      if (k === 'date' || k === 'emoji' || k === 'mention') { var tgt = m.after ? null : L[idx(m.id)]; if (!tgt || tgt.html === undefined) tgt = add(m.after || m.id, mkBlock('p')); var ins = k === 'date' ? '<b>' + new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + '</b> ' : k === 'emoji' ? EMOJI[Math.floor(Math.random() * EMOJI.length)] + ' ' : '<b>@' + (who || 'Name') + '</b> '; if (m.after) { tgt.html = ins; } else { tgt.html = ins; SR._fb = tgt.id; } bump(); return; } if (m.after) { var nb = mkBlock(k); add(m.after, nb); } else { var i = idx(m.id); if (i < 0) return; var cur = L[i]; if (cur.html !== undefined && plain(cur.html).replace(/^\//, '') !== '' && !m.keep) cur.html = ''; turn(m.id, k); } };
    var onKey = function (b) { return function (e) {
      var el = e.currentTarget, t = plain(el.innerHTML);
      if (e.key === 'Escape' && !(menu && menu.id === b.id)) { e.preventDefault(); setSel(b.id); setTimeout(function () { var w = document.getElementById('blk-' + b.id); if (w) w.focus(); }, 0); return; }
      if (menu && menu.id === b.id) {
        if (e.key === 'Escape') { setMenu(null); return; }
        if (e.key === 'Enter') { e.preventDefault(); if (cmdHit[0] || colorHit[0]) { var cq = cmdHit[0] ? cmdHit[0] : 'color:' + colorHit[0][0]; var mm = menu; setMenu(null); el.innerHTML = ''; b.html = ''; if (cq === 'delete') del(b.id); else if (cq === 'duplicate') { var cp2 = JSON.parse(JSON.stringify(b)); cp2.id = uid(); L.splice(idx(b.id) + 1, 0, cp2); bump(); } else { b.color = colorHit[0][1]; bump(); } return; } if (menuItems[0]) { el.innerHTML = ''; b.html = ''; pickMenu(menuItems[0]); } return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); return; }
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) { var k = e.key.toLowerCase(); if (k === 'b' || k === 'i' || k === 'u') { e.preventDefault(); document.execCommand(k === 'b' ? 'bold' : k === 'i' ? 'italic' : 'underline'); save(b, el); return; } if (k === 'e') { e.preventDefault(); wrapCode(); save(b, el); return; } if (k === 'k') { e.preventDefault(); link(b, el); return; } }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); document.execCommand('strikeThrough'); save(b, el); return; }
      if (e.key === ' ' && SHORT[t] && b.type === 'p') { e.preventDefault(); el.innerHTML = ''; b.html = ''; turn(b.id, SHORT[t]); return; }
      if (e.key === 'Enter' && !e.shiftKey) {
        if (b.type === 'code') return;
        e.preventDefault();
        if (t === '---' && b.type === 'p') { b.html = ''; var i = idx(b.id); L[i] = { id: b.id, type: 'divider' }; add(b.id, { type: 'p', html: '' }); return; }
        var ci = caretInfo(el); if (!ci) return;
        if (!t && ['ul', 'ol', 'todo', 'quote', 'callout', 'toggle', 'h', 'h2', 'h3'].indexOf(b.type) > -1 && b.type !== 'h' && b.type !== 'h2' && b.type !== 'h3') { turn(b.id, 'p'); return; }
        b.html = cleanHtml(ci.before); var keepT = (b.type === 'ul' || b.type === 'ol' || b.type === 'todo') ? b.type : 'p'; var nb = mkBlock(keepT); nb.html = cleanHtml(ci.after); add(b.id, nb); return;
      }
      if (e.key === 'Backspace' && (!t || (caretInfo(el) && caretInfo(el).atStart && b.type !== 'p'))) { if (!t) { e.preventDefault(); if (b.type !== 'p') turn(b.id, 'p'); else del(b.id, true); } else if (caretInfo(el).atStart && b.type !== 'p') { e.preventDefault(); turn(b.id, 'p'); } return; }
      if (e.key === 'ArrowUp') { var c1 = caretInfo(el); if (c1 && c1.atStart) { var i2 = idx(b.id); if (L[i2 - 1] && L[i2 - 1].html !== undefined) { e.preventDefault(); SR._fb = L[i2 - 1].id; bump(); } } }
      if (e.key === 'ArrowDown') { var c2 = caretInfo(el); if (c2 && c2.atEnd) { var i3 = idx(b.id); if (L[i3 + 1] && L[i3 + 1].html !== undefined) { e.preventDefault(); SR._fb = L[i3 + 1].id; bump(); } } }
    }; };
    var onInput = function (b) { return function (e) { var t = plain(e.currentTarget.innerHTML); if (t.charAt(0) === '/' && t.length < 20 && b.type !== 'code') { var r = e.currentTarget.getBoundingClientRect(); setMenu({ id: b.id, x: r.left, y: r.bottom + 4, q: t.slice(1) }); } else if (menu && menu.id === b.id) setMenu(null); }; };
    var wrapCode = function () { var s = window.getSelection(); if (!s.rangeCount || s.isCollapsed) return; var r = s.getRangeAt(0), c = document.createElement('code'); try { c.appendChild(r.extractContents()); r.insertNode(c); } catch (x) {} };
    var link = function (b, el) { var s = window.getSelection(); if (!s.rangeCount || s.isCollapsed) return; var u = window.prompt('Link address (https://...)'); if (u) { document.execCommand('createLink', false, /^(https?:|mailto:)/i.test(u) ? u : 'https://' + u); save(b, el); } };
    R.useEffect(function () {
      var on = function () { var s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { setFmt(null); return; } var n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement); var el = n && n.closest && n.closest('.blk-t'); if (!el || !el.closest('.blocks[data-bid="' + p.id + '"]')) { setFmt(null); return; } var r = s.getRangeAt(0).getBoundingClientRect(); setFmt({ x: r.left + r.width / 2, y: r.top, id: el.getAttribute('data-bid') }); };
      document.addEventListener('selectionchange', on); return function () { document.removeEventListener('selectionchange', on); };
    }, []);
    var fmtDo = function (cmd) { document.execCommand(cmd); var s = window.getSelection(); var n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement), el = n && n.closest('.blk-t'); if (el) { var b = L[idx(el.getAttribute('data-bid'))]; if (b) save(b, el); } };
    var sl = R.useState(null), sel = sl[0], setSel = sl[1];
    var blkOps = R.useState(null), ops = blkOps[0], setOps = blkOps[1];
    var dnd = function (b) { return { onDragOver: function (e) { if (dragId.current) { e.preventDefault(); setOver(b.id); } }, onDrop: function (e) { if (!dragId.current) return; e.preventDefault(); var f = dragId.current; dragId.current = null; setOver(null); if (f === b.id) return; var fi = idx(f), blk = L.splice(fi, 1)[0], ti = idx(b.id); L.splice(ti + (fi < ti + 1 && fi <= ti ? 1 : 0), 0, blk); bump(); } }; };
    var gutter = function (b) { return html`<div class="blk-g"><button type="button" class="blk-plus" aria-label="Add a block below" title="Add a block below" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); setMenu({ after: b.id, x: r.left, y: r.bottom + 4, q: '' }); }}>+</button><button type="button" class="blk-hd" draggable="true" aria-label="Drag to move, click for options" title="Drag to move. Click for options" onDragStart=${function (e) { dragId.current = b.id; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'blk'); } catch (x) {} }} onDragEnd=${function () { dragId.current = null; setOver(null); }} onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); setOps({ id: b.id, x: r.left, y: r.bottom + 4 }); }}>⋮⋮</button></div>`; };
    var ce = function (b, cls, ph, extra) { return html`<div class=${'blk-t ' + (cls || '')} data-bid=${b.id} contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" data-ph=${ph} ref=${fref(b.id)} dangerouslySetInnerHTML=${{ __html: b.html || '' }} onBlur=${function (e) { save(b, e.currentTarget); }} onKeyDown=${onKey(b)} onInput=${onInput(b)} onPaste=${function (e) { e.preventDefault(); var tx = (e.clipboardData || window.clipboardData).getData('text') || ''; document.execCommand('insertText', false, tx); }}></div>`; };
    var render = function (b) {
      var wrap = function (cls, inner) { return html`<div key=${b.id} id=${'blk-' + b.id} style=${b.color ? 'color:' + b.color : ''} tabindex="-1" class=${'blk ' + cls + (over === b.id ? ' blk-over' : '') + (sel === b.id ? ' blk-sel' : '')} ...${dnd(b)} onKeyDown=${function (e) { if (sel === b.id && e.target === e.currentTarget) { if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); setSel(null); del(b.id); } else if (e.key === 'Enter') { e.preventDefault(); setSel(null); SR._fb = b.id; bump(); } } }}>${gutter(b)}${inner}</div>`; };
      switch (b.type) {
        case 'h': return wrap('blk-h', ce(b, '', 'Heading 1'));
        case 'h2': return wrap('blk-h2', ce(b, '', 'Heading 2'));
        case 'h3': return wrap('blk-h3', ce(b, '', 'Heading 3'));
        case 'ul': return wrap('blk-li', html`<span class="blk-mk">•</span>${ce(b, '', 'List')}`);
        case 'ol': return wrap('blk-li', html`<span class="blk-mk blk-num">${numberOf(b)}.</span>${ce(b, '', 'List')}`);
        case 'todo': return wrap('blk-li' + (b.done ? ' blk-done' : ''), html`<input type="checkbox" class="blk-ck" checked=${!!b.done} onChange=${function (e) { b.done = e.target.checked; bump(); }} />${ce(b, '', 'To-do')}`);
        case 'quote': return wrap('blk-quote', ce(b, '', 'Quote'));
        case 'callout': return wrap('blk-callout', html`<button type="button" class="blk-ico" onClick=${function () { var e2 = window.prompt('Emoji for the callout', b.icon || '💡'); if (e2) { b.icon = e2; bump(); } }}>${b.icon || '💡'}</button>${ce(b, '', 'Type something')}`);
        case 'code': return wrap('blk-code', ce(b, 'blk-mono', 'Code'));
        case 'toggle': return wrap('blk-toggle', html`<button type="button" class="blk-tg" aria-expanded=${!!b.open} onClick=${function () { b.open = !b.open; bump(); }}>${b.open ? '▾' : '▸'}</button><div style="flex:1;min-width:0">${ce(b, '', 'Toggle')}${b.open ? html`<div class="blk-tbody" contentEditable="true" suppressContentEditableWarning=${true} data-ph="Empty toggle. Click to add content." onBlur=${function (e) { b.body = String(e.currentTarget.innerText || '').trim(); }}>${b.body || ''}</div>` : null}</div>`);
        case 'divider': return wrap('blk-div', html`<hr/>`);
        case 'toc': return wrap('blk-toc', html`<div style="flex:1">${L.filter(function (x) { return x.type === 'h' || x.type === 'h2' || x.type === 'h3'; }).map(function (x) { return html`<a key=${x.id} href=${'#blk-' + x.id} class=${'blk-tl blk-tl-' + x.type} onClick=${function (e) { e.preventDefault(); var w = document.getElementById('blk-' + x.id); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>${plain(x.html) || 'Untitled'}</a>`; })}${L.some(function (x) { return x.type === 'h' || x.type === 'h2' || x.type === 'h3'; }) ? null : html`<span style="color:var(--muted);font-size:13px">Add headings and they show up here.</span>`}</div>`);
        case 'bookmark': return wrap('blk-bm', b.url ? html`<a class="blk-bmc" href=${b.url} target="_blank" rel="noopener"><b>${b.title || b.url}</b><span>${b.url}</span></a>` : html`<form class="blk-bmf" onSubmit=${function (e) { e.preventDefault(); var u = String(e.currentTarget.elements.u.value || '').trim(); if (!u) return; if (!/^https?:/i.test(u)) u = 'https://' + u; b.url = u; try { b.title = new URL(u).hostname.replace(/^www\./, ''); } catch (x) {} bump(); }}><input name="u" class="cal-in" style="margin:0" placeholder="Paste a link, then press Enter" autofocus /></form>`);
        case 'db': return wrap('blk-db', html`<${SR.Database} block=${b} bump=${bump} dragRow=${function () { return dragRow.current; }} setDragRow=${function (v) { dragRow.current = v; }} onDelete=${function () { del(b.id); }} />`);
        case 'table': {
          var Rw = b.rows, nc = Rw[0].length, focusCell = function (tbl, n) { var c = tbl.querySelectorAll('td'); if (c[n]) c[n].focus(); };
          return wrap('blk-table', html`<div><div class="blk-scroll"><table>${Rw.map(function (r, ri) { return html`<tr key=${ri}>${r.map(function (c, ci) { return html`<td key=${ri + '-' + ci} contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" ref=${ri === 0 && ci === 0 ? fref(b.id) : null} onBlur=${function (e) { Rw[ri][ci] = String(e.currentTarget.textContent || ''); }} onKeyDown=${function (e) { if (e.key === 'Tab') { e.preventDefault(); var tbl = e.currentTarget.closest('table'), n = ri * nc + ci + (e.shiftKey ? -1 : 1); Rw[ri][ci] = String(e.currentTarget.textContent || ''); if (n >= Rw.length * nc) { Rw.push(new Array(nc).fill('')); bump(); setTimeout(function () { focusCell(tbl, n); }, 20); } else focusCell(tbl, Math.max(0, n)); } else if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>${c}</td>`; })}</tr>`; })}</table></div>
            <div class="blk-tact"><button type="button" onClick=${function () { Rw.push(new Array(nc).fill('')); bump(); }}>+ Row</button><button type="button" onClick=${function () { Rw.forEach(function (r) { r.push(''); }); bump(); }}>+ Column</button>${Rw.length > 1 ? html`<button type="button" onClick=${function () { Rw.pop(); bump(); }}>− Row</button>` : null}${nc > 1 ? html`<button type="button" onClick=${function () { Rw.forEach(function (r) { r.pop(); }); bump(); }}>− Column</button>` : null}</div></div>`);
        }
        default: return wrap('blk-p', ce(b, '', 'Type / for blocks'));
      }
    };
    var opBlock = ops ? L[idx(ops.id)] : null;
    var PS = P.pageStyle = P.pageStyle || {}; var psm = R.useState(false), psOpen = psm[0], setPsOpen = psm[1];
    return html`<div class=${'blocks' + (PS.font === 'serif' ? ' pg-serif' : PS.font === 'mono' ? ' pg-mono' : '') + (PS.small ? ' pg-small' : '') + (PS.full ? ' pg-full' : '')} data-bid=${p.id} aria-label="Notes">
      <div class="pg-ctl"><button type="button" class="pg-b" aria-label="Page style" title="Page style: font, text size, width" onClick=${function () { setPsOpen(!psOpen); }}>Aa</button>${psOpen ? html`<div class="sr-navmenu pg-menu"><div style="font-size:11px;color:var(--muted);padding:4px 9px">Font</div>${[['', 'Default'], ['serif', 'Serif'], ['mono', 'Mono']].map(function (f) { return html`<button type="button" key=${f[0]} style=${(PS.font || '') === f[0] ? 'font-weight:600' : ''} onClick=${function () { PS.font = f[0]; bump(); }}>${f[1]}${(PS.font || '') === f[0] ? ' ✓' : ''}</button>`; })}<button type="button" onClick=${function () { PS.small = !PS.small; bump(); }}>Small text${PS.small ? ' ✓' : ''}</button><button type="button" onClick=${function () { PS.full = !PS.full; bump(); }}>Full width${PS.full ? ' ✓' : ''}</button><button type="button" onClick=${function () { setPsOpen(false); }}>Close</button></div>` : null}</div>
      ${L.map(render)}
      <div class="blk-add" onClick=${function () { var last = L[L.length - 1]; if (last && last.type === 'p' && !plain(last.html)) { SR._fb = last.id; bump(); } else add(null, { type: 'p', html: '' }); }}>${L.length ? '' : 'Click to write. Type / for headings, lists, tables and databases.'}</div>
      ${menu ? html`<div class="qas-bg" style="background:transparent;padding:0" onMouseDown=${function () { setMenu(null); }}><div class="sr-navmenu blk-menu" style=${'left:' + Math.min(menu.x, window.innerWidth - 300) + 'px;top:' + Math.min(menu.y, window.innerHeight - 360) + 'px'} onMouseDown=${function (e) { e.preventDefault(); e.stopPropagation(); }}>
        ${cmdHit.concat(colorHit.map(function (c) { return 'color:' + c[0]; })).map(function (c) { return html`<button type="button" key=${c} onClick=${function () { var m = menu; setMenu(null); var el = document.querySelector('.blk-t[data-bid="' + m.id + '"]'), bb = L[idx(m.id)]; if (el) el.innerHTML = ''; if (!bb) return; bb.html = ''; if (c === 'delete') { if (bb.html === '' && L.length) del(m.id); } else if (c === 'duplicate') { var cp = JSON.parse(JSON.stringify(bb)); cp.id = uid(); L.splice(idx(m.id) + 1, 0, cp); bump(); } else { var nm = c.slice(6), col = COLORS.filter(function (x) { return x[0] === nm; })[0]; bb.color = col ? col[1] : ''; bump(); } }}><b>${c.indexOf('color:') === 0 ? 'Color: ' + c.slice(6) : '/' + c}</b><span>${c === 'delete' ? 'Remove this block' : c === 'duplicate' ? 'Make a copy of this block' : 'Change the text color'}</span></button>`; })}
        <div style="font-size:11px;color:var(--muted);padding:4px 9px">${!cmdQ && recent.length ? 'Recent and basic blocks' : 'Basic blocks'}</div>${menuItems.length || cmdHit.length || colorHit.length ? [].concat.apply([], menuItems.map(function (k) { return k === 'mention' ? (SR.TEAM || []).map(function (n) { return ['mention:' + n, 'Mention ' + n, 'Tag them on this page']; }) : [[k, BK[k][0], BK[k][1]]]; })).map(function (e) { return html`<button type="button" key=${e[0]} onClick=${function () { var m = menu; var el = document.querySelector('.blk-t[data-bid="' + m.id + '"]'); if (el && !m.after) { el.innerHTML = ''; var bb = L[idx(m.id)]; if (bb) bb.html = ''; } pickMenu(e[0]); }}><b>${e[1]}</b><span>${e[2]}</span></button>`; }) : html`<div style="padding:8px 10px;color:var(--muted)">No results</div>`}</div></div>` : null}
      ${ops && opBlock ? html`<div class="qas-bg" style="background:transparent;padding:0" onMouseDown=${function () { setOps(null); }}><div class="sr-navmenu" style=${'left:' + Math.min(ops.x, window.innerWidth - 230) + 'px;top:' + Math.min(ops.y, window.innerHeight - 300) + 'px'} onMouseDown=${function (e) { e.stopPropagation(); }}>
        ${opBlock.html !== undefined ? html`<div style="font-size:11px;color:var(--muted);padding:4px 9px">${(function () { var tx = plain(opBlock.html).trim(); var w = tx ? tx.split(/\s+/).length : 0; return w + ' word' + (w === 1 ? '' : 's') + ', ' + tx.length + ' characters'; })()}</div>` : null}
        <button type="button" onClick=${function () { var o = ops; setOps(null); del(o.id); }}>Delete</button>
        <button type="button" onClick=${function () { var o = ops; setOps(null); var u = location.href.split('#')[0] + '#blk-' + o.id; try { navigator.clipboard.writeText(u); } catch (x) {} }}>Copy link to block</button>
        ${opBlock.html !== undefined ? html`<div style="font-size:11px;color:var(--muted);padding:6px 9px 2px">Color</div><div class="blk-sw">${COLORS.map(function (c) { return html`<button type="button" key=${c[0]} title=${c[0]} aria-label=${c[0]} class=${'blk-swb' + ((opBlock.color || '') === c[1] ? ' on' : '')} style=${'color:' + (c[1] || 'var(--text)')} onClick=${function () { var o = ops; setOps(null); var bb = L[idx(o.id)]; if (bb) { bb.color = c[1]; bump(); } }}>A</button>`; })}</div>` : null}
        <button type="button" onClick=${function () { var o = ops; setOps(null); var i = idx(o.id), cp = JSON.parse(JSON.stringify(L[i])); cp.id = uid(); L.splice(i + 1, 0, cp); bump(); }}>Duplicate</button>
        <button type="button" onClick=${function () { var o = ops; setOps(null); var i = idx(o.id); if (i > 0) { var t = L[i]; L[i] = L[i - 1]; L[i - 1] = t; bump(); } }}>Move up</button>
        <button type="button" onClick=${function () { var o = ops; setOps(null); var i = idx(o.id); if (i < L.length - 1) { var t = L[i]; L[i] = L[i + 1]; L[i + 1] = t; bump(); } }}>Move down</button>
        ${opBlock.html !== undefined ? html`<div style="font-size:11px;color:var(--muted);padding:6px 9px 2px">Turn into</div>${['p', 'h', 'h2', 'h3', 'ul', 'ol', 'todo', 'toggle', 'quote', 'callout', 'code'].map(function (k) { return html`<button type="button" key=${k} onClick=${function () { var o = ops; setOps(null); turn(o.id, k); }}>${BK[k][0]}</button>`; })}` : null}</div></div>` : null}
      ${fmt ? html`<div class="blk-fmt" style=${'left:' + Math.max(8, Math.min(window.innerWidth - 230, fmt.x - 105)) + 'px;top:' + Math.max(8, fmt.y - 42) + 'px'} onMouseDown=${function (e) { e.preventDefault(); }}>
        <button type="button" title="Bold (Ctrl B)" onClick=${function () { fmtDo('bold'); }}><b>B</b></button><button type="button" title="Italic (Ctrl I)" onClick=${function () { fmtDo('italic'); }}><i>I</i></button><button type="button" title="Underline (Ctrl U)" onClick=${function () { fmtDo('underline'); }}><u>U</u></button><button type="button" title="Strikethrough" onClick=${function () { fmtDo('strikeThrough'); }}><s>S</s></button>
        <button type="button" title="Code (Ctrl E)" onClick=${function () { wrapCode(); var q = window.getSelection(), n = q.anchorNode && (q.anchorNode.nodeType === 1 ? q.anchorNode : q.anchorNode.parentElement), el = n && n.closest('.blk-t'); if (el) { var bb = L[idx(el.getAttribute('data-bid'))]; if (bb) save(bb, el); } }} style="font-family:monospace">&lt;/&gt;</button><button type="button" title="Link (Ctrl K)" onClick=${function () { var s = window.getSelection(), n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement), el = n && n.closest('.blk-t'); if (el) link(L[idx(el.getAttribute('data-bid'))], el); }}>🔗</button></div>` : null}
    </div>`;
  };



  /* quick assign: after adding tasks, pick the battlefront (and owner) in one click */
  SR.QuickAssign = function (p) {
    var R2 = React, fr = SR.fronts(p.clients), team = SR.TEAM || [];
    var qs = R2.useState(''), q = qs[0], setQ = qs[1];
    var ids = p.ids, rows = ids.map(function (id) { return p.tasks.filter(function (t) { return t.id === id; })[0]; }).filter(Boolean);
    var ss = R2.useState(function () { return rows.filter(function (t) { return !t.clientId; }).map(function (t) { return t.id; }); }), sel = ss[0], setSel = ss[1];
    var inp = R2.useRef(null);
    R2.useEffect(function () { if (inp.current) inp.current.focus(); }, []);
    R2.useEffect(function () { var k = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, []);
    var ini = function (n) { return String(n || '?').split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase(); };
    var shortN = function (n) { return String(n).replace(/\s+(Consulting|Services?)$/i, '').replace(/\s+for\s+Expats$/i, '').replace(/ \/ Admin$/, ''); };
    var ql = q.trim().toLowerCase();
    var list = fr.filter(function (f) { return !ql || f.name.toLowerCase().indexOf(ql) > -1; });
    var apply = function (f) {
      var target = sel.length ? sel : rows.filter(function (t) { return !t.clientId; }).map(function (t) { return t.id; });
      if (!target.length) target = ids;
      p.onSet(target, { clientId: f.id });
      var left = rows.filter(function (t) { return !t.clientId && target.indexOf(t.id) < 0; }).map(function (t) { return t.id; });
      setSel(left); setQ(''); if (!left.length && rows.length === 1) p.onClose();
      if (inp.current) inp.current.focus();
    };
    var missing = rows.filter(function (t) { return !t.clientId; }).length;
    var tog = function (id) { setSel(function (a) { return a.indexOf(id) > -1 ? a.filter(function (x) { return x !== id; }) : a.concat([id]); }); };
    var owners = team;
    var allOwn = rows.length && rows.every(function (t) { return t.owner === rows[0].owner; }) ? rows[0].owner : '';
    return html`<div class="qas-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="qas" role="dialog" aria-label="Choose battlefront">
      <div class="qas-top"><b>${rows.length === 1 ? 'Where does this go?' : 'Where do these ' + rows.length + ' go?'}</b><button type="button" class="qas-x" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 14)}</button></div>
      <div class="qas-rows">${rows.map(function (t) {
        var c = t.clientId ? SR.clientById(p.clients, t.clientId) : null, on = sel.indexOf(t.id) > -1;
        return html`<button type="button" key=${t.id} class=${'qas-row' + (on ? ' on' : '')} onClick=${function () { tog(t.id); }}>
          <span class="qas-ck">${on ? SR.Icon('check', 11) : null}</span><span class="qas-nm">${t.name}</span>
          ${c ? html`<span class="qas-tag"><i style=${'background:' + c.color}></i>${shortN(c.name)}</span>` : html`<span class="qas-tag none">No front</span>`}</button>`; })}</div>
      <input ref=${inp} class="qas-s" type="text" placeholder="Type to find a battlefront" value=${q} onInput=${function (e) { setQ(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter' && list.length) { e.preventDefault(); apply(list[0]); } }} />
      <div class="qas-grid">${list.map(function (f) { return html`<button type="button" key=${f.id} class="qas-f" onClick=${function () { apply(f); }}><span class="sr-ib" style=${'background:' + f.color}>${ini(f.name)}</span><span>${shortN(f.name)}</span></button>`; })}${list.length ? null : html`<span class="qas-none">No match</span>`}</div>
      <div class="qas-foot"><span class="qas-own">Owner ${owners.map(function (n) { return html`<button type="button" key=${n} class=${'nchip' + (allOwn === n ? ' on' : '')} onClick=${function () { p.onSet(ids, { owner: n }); }}>${n}</button>`; })}</span>
        <button type="button" class="ar-go" onClick=${p.onClose}>${missing ? 'Skip (' + missing + ' left)' : 'Done'}</button></div>
    </div></div>`;
  };

  /* quick links for a task, picked from its wording */
  SR.taskLinks = function (t, c) {
    var n = (t.name || '').toLowerCase(), out = [], add = function (l, h) { if (!out.some(function (x) { return x[1] === h; })) out.push([l, h]); };
    var ADS = ['Google Ads', 'https://ads.google.com'];
    var isMeta = /^m(research|build|launch)$/.test(t.ph || '') || (t.maint && c && (t.proj ? t.proj === 'meta' : c.type === 'meta'));
    if (isMeta) {
      var MA = ['Meta Ads Manager', 'https://adsmanager.facebook.com'];
      if (/budget|breakeven|math|requirement/.test(n)) add('Project maths sheet', 'https://docs.google.com/spreadsheets/d/180gzZJ1Wj_R8uDWdko81QDTAvBzg9UGQ7dfo7LGVA3A/edit?usp=sharing');
      if (/ad library|top player|competitor|inspiration|angles|hooks/.test(n)) add('Meta Ad Library', 'https://www.facebook.com/ads/library');
      if (/pixel|dataset|conversions api|lead event|events|match quality|tracking/.test(n)) add('Events Manager', 'https://business.facebook.com/events_manager2');
      if (/business manager|access|partner|page|instagram|domain|billing|payment|restriction|account quality/.test(n)) { add('Business settings', 'https://business.facebook.com/settings'); add('Account Quality', 'https://business.facebook.com/business-support-home'); }
      if (/test lead|instant form|lead destination|lead alert|alerts/.test(n)) { add('Lead Ads Testing Tool', 'https://developers.facebook.com/tools/lead-ads-testing'); add('Leads Center', 'https://business.facebook.com/latest/leads_center'); }
      if (/audience|exclusion|lookalike|retarget/.test(n)) add('Audiences', 'https://adsmanager.facebook.com/adsmanager/audiences');
      if (/landing page|speed|mobile/.test(n)) add('PageSpeed Insights', 'https://pagespeed.web.dev');
      if (!out.length || /campaign|budget|creative|ad copy|preview|spend|frequency|cost per lead|placement|go live|day-3|launch/.test(n)) add(MA[0], MA[1]);
      return out.slice(0, 4);
    }
    if (/keyword planner|keyword|negative/.test(n)) add('Keyword Planner', 'https://ads.google.com/aw/keywordplanner/home');
    if (/budget|bid|cpc/.test(n)) add('Keyword Planner', 'https://ads.google.com/aw/keywordplanner/home');
    if (/billing|payment/.test(n)) add('Google Ads billing', 'https://ads.google.com/aw/billing/summary');
    if (/tag manager|tag fires|tracking|conversion|pre-launch|fires/.test(n)) { add('Tag Manager', 'https://tagmanager.google.com'); add('Tag Assistant', 'https://tagassistant.google.com'); }
    if (/ga4|analytics|key event|bounce/.test(n)) add('Google Analytics', 'https://analytics.google.com');
    if (/business profile/.test(n)) add('Google Business Profile', 'https://business.google.com');
    if (/landing page|pagespeed|speed|mobile|h1|page loads/.test(n)) add('PageSpeed Insights', 'https://pagespeed.web.dev');
    if (/top player|competitor|auction/.test(n)) { add('Google Ads Transparency Center', 'https://adstransparency.google.com'); add('Meta Ad Library', 'https://www.facebook.com/ads/library'); }
    if (/ad copy|headline|description|ads for disapproval|ad strength/.test(n) || /campaign|ad group|match|asset|bidding|network|location|language|budget|search term|recommend|quality score|disapprov|split test|audience|ads by/.test(n) || t.ph === 'build' || t.ph === 'launch' || t.maint) add(ADS[0], ADS[1]);
    if (/access|account exists|manager/.test(n)) add(ADS[0], ADS[1]);
    if (/ads|google/.test(n) && !out.length) add(ADS[0], ADS[1]);
    return out.slice(0, 4);
  };

  /* ---- icons ---- */
  var ICONS = {
    trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/>',
    bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    wallet: '<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0V6a2 2 0 012-2h11"/><circle cx="17" cy="14" r="1.2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9m-3 3l3 3"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/>',
    page: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 13l2 2 4-4"/>',
    play: '<path d="M7 4l13 8-13 8V4z"/>',
    repeat: '<path d="M4 12a8 8 0 0113.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.7L4 16M4 20v-4h4"/>',
    flag: '<path d="M5 21V4m0 0h12l-2 4 2 4H5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',
    funnel: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12 19 5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    spark: '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
    clip: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.4-2.5-1.2M12 6.5V8m0 8v1.5"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    doc: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    house: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pencil: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  SR.Icon = function (name, size) {
    var z = size || 16;
    return html`<svg viewBox="0 0 24 24" width=${z} height=${z} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none" dangerouslySetInnerHTML=${{ __html: ICONS[name] || ICONS.list }}></svg>`;
  };

  /* simple pill button */
  SR.Pill = function (p) {
    return html`<button type="button" onClick=${p.onClick} aria-pressed=${p.on ? 'true' : 'false'}
      style=${'min-height:34px;padding:0 13px;border-radius:17px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;'
      + (p.on ? 'background:var(--accentBg);color:var(--accent);border:1px solid var(--accent)' : 'background:transparent;color:var(--muted);border:1px solid var(--border)')}>${p.children}</button>`;
  };

  /* person avatar */
  SR.Avatar = function (owner, size) {
    var init = owner ? owner[0] : '–', z = size || 26;
    var PAL = [['#DCE7F7', '#24487A'], ['#F5E6C8', '#7A5200'], ['#DDF1E4', '#1E6B3A'], ['#F3DDF0', '#7A2A6E'], ['#FADDDD', '#8A2B2B'], ['#DDEFF3', '#1F5F6E']];
    var ix = owner ? (owner.charCodeAt(0) + owner.length) % 6 : -1;
    var st = ix < 0 ? 'background:var(--line);color:var(--muted)' : 'background:' + PAL[ix][0] + ';color:' + PAL[ix][1];
    var pf = owner && SR.PROFILES && SR.PROFILES[owner];
    if (pf && pf.avatar) return html`<img alt=${owner} title=${owner} src=${pf.avatar} style=${'width:' + z + 'px;height:' + z + 'px;border-radius:50%;flex:none;object-fit:cover'} />`;
    if (pf && pf.color) st = 'background:' + pf.color + ';color:#fff';
    return html`<span aria-label=${'Owner ' + (owner || 'unassigned')}
      style=${'width:' + z + 'px;height:' + z + 'px;border-radius:50%;flex:none;font-size:' + Math.round(z * 0.46) + 'px;font-weight:700;display:flex;align-items:center;justify-content:center;' + st}>${init}</span>`;
  };

  /* next-due text for recurring tasks */
  SR.dueText = function (t) {
    if (!t.date) return '';
    if (t.date < SR.TODAY) return 'Overdue ' + SR.fmtDay(t.date);
    if (t.date === SR.TODAY) return 'Due today';
    return 'Due ' + new Date(t.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  /* a single task row: same markup as the Local SEO platform */
  SR.TaskRow = function (p) {
    var t = p.task, sel = p.selected;
    var late = t.deadline && t.deadline < SR.TODAY && !t.done;
    var meta = [];
    if (p.showClient) meta.push(html`<span key="c" class="chip"><span style=${'width:8px;height:8px;border-radius:3px;background:' + p.clientColor}></span>${p.clientName}</span>`);
    if (t.repeat && !t.milestone) meta.push(html`<span key="r" class="chip" style=${'color:' + (t.date && t.date < SR.TODAY && !t.done ? 'var(--red)' : 'var(--accent)')}>${SR.Icon('repeat', 12)} ${t.repeat}${t.done && t.next ? ' · back ' + SR.fmtDay(t.next) : (t.date ? ' · ' + SR.dueText(t) : '')}</span>`);
    if ((t.est || t.spent) && !t.done) meta.push(html`<span key="e" class="chip">${t.spent ? SR.dur(t.spent) + ' / ' : ''}${SR.dur(SR.estOf(t))}${t.slots && t.slots.length > 1 ? ' · ' + t.slots.length + ' chunks' : ''}</span>`);
    var bk = SR.blockers ? SR.blockers(t) : [];
    if (bk.length && !t.done) meta.push(html`<span key="b" class="chip" style="color:var(--red);font-weight:600" title=${'Waiting for: ' + bk[0].name}>Blocked · ${bk.length}</span>`);
    if (t.comments && t.comments.length) meta.push(html`<span key="cm" class="chip">${t.comments.length} comment${t.comments.length > 1 ? 's' : ''}</span>`);
    if (t.subs && t.subs.length) meta.push(html`<span key="s" class="chip">${t.subs.filter(function (s) { return s.done; }).length}/${t.subs.length} subitems</span>`);
    if (t.rolled && !t.done) meta.push(html`<span key="r" class="chip" title=${'Carried over from ' + SR.fmtDeadline(t.was || t.date)} style="color:var(--muted)">\u21BB ${t.rolled}d</span>`);
    if (t.deadline && (p.showClient || late)) meta.push(html`<span key="d" class="chip" style=${'font-weight:600;color:' + (late ? 'var(--red)' : (t.deadline === SR.TODAY || t.deadline === SR.addDays(SR.TODAY, 1) ? 'var(--gold)' : 'var(--muted)'))}>Deadline ${SR.fmtDeadline(t.deadline)}</span>`);
    var cls = 'task' + (t.done ? ' fin' : '') + (p.active ? ' sel' : '') + (p.just ? ' just' : '') + (sel ? ' picked' : '');
    var dnd = p.dnd && SR.dnd, ov = R.useState(false), over = ov[0], setOver = ov[1];
    if (over) cls += ' over';
    return html`<div class=${cls} data-tid=${t.id} onContextMenu=${function (e) { if (SR.taskMenu) SR.taskMenu(e, t); }}
      onDragOver=${dnd ? function (e) { if (SR._drag != null && SR._drag !== t.id) { e.preventDefault(); if (!over) setOver(true); } } : null}
      onDragLeave=${dnd ? function () { setOver(false); } : null}
      onDrop=${dnd ? function (e) { e.preventDefault(); e.stopPropagation(); setOver(false); var id = SR._drag; SR._drag = null; if (id != null) SR.dnd.dropOnTask(id, t.id, p.dropDate); } : null}>
      ${dnd ? html`<span class="grip" draggable="true" title="Drag to reorder or move" aria-hidden="true" onDragStart=${function (e) { SR._drag = t.id; var ms = sel && SR.selIds ? SR.selIds() : []; SR._dragMulti = ms.length > 1 && ms.indexOf(t.id) >= 0 ? ms : null; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(t.id)); var row = e.currentTarget.closest('.task'); e.dataTransfer.setDragImage(row, 20, 20); row.classList.add('dragging'); if (SR._dragMulti) document.querySelectorAll('.task.picked').forEach(function (r) { r.classList.add('dragging'); }); } catch (x) {} }} onDragEnd=${function (e) { SR._drag = null; SR._dragMulti = null; document.querySelectorAll('.task.dragging').forEach(function (r) { r.classList.remove('dragging'); }); }}>⋮⋮</span>` : null}
      <button type="button" class=${'cb' + (t.done ? ' done' : '')} onClick=${function () { p.onToggle(t.id); }} aria-pressed=${t.done ? 'true' : 'false'} aria-label=${(t.done ? 'Mark not done: ' : 'Mark done: ') + t.name}><span>${t.done ? '✓' : ''}</span></button>
      <button type="button" class="tx" onClick=${function () { p.onOpen(t.id); }} aria-expanded=${p.active ? 'true' : 'false'}>
        ${p.num ? html`<span class="id">${p.num}</span>` : null}
        <span class="t"><span><span class="tt" title=${t.name}>${t.name}</span></span>${meta.length ? html`<span class="m">${meta}</span>` : null}</span>
      </button>
      ${t.how && t.how.length ? html`<button type="button" class="pill hw" onClick=${function () { p.onOpen(t.id, true); }} aria-label=${'How to: ' + t.name}>How</button>` : null}
      ${p.showClient || (t.owner && t.owner !== (SR.ME ? SR.ME.username : '')) ? SR.Avatar(t.owner, 22) : null}
      <button type="button" class="pick" onClick=${function () { p.onSelect(t.id); }} aria-pressed=${sel ? 'true' : 'false'} aria-label="Select task">✓</button>
    </div>`;
  };

  /* group tasks by day; completed sink to the bottom of each day (settling ones wait for their animation) */
  SR.groupByDay = function (tasks, settling) {
    var g = {}, keys = [], tm = SR.addDays(SR.TODAY, 1), st = settling || {};
    var fin = function (t) { return t.done && !st[t.id]; };
    tasks.forEach(function (t) {
      var d = t.date || '9999';
      var k = d < SR.TODAY ? '0' : d === SR.TODAY ? '1' : d === tm ? '2' : '3' + d;
      var label = k === '0' ? 'Overdue' : k === '1' ? 'Today · ' + new Date(SR.TODAY + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : k === '2' ? 'Tomorrow · ' + new Date(tm + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : d === '9999' ? 'No date' : new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
      if (!g[k]) { g[k] = { label: label, danger: k === '0', items: [], open: 0, date: k === '0' ? null : k === '1' ? SR.TODAY : k === '2' ? tm : d === '9999' ? '' : d }; keys.push(k); }
      g[k].items.push(t); if (!t.done) g[k].open++;
    });
    keys.sort();
    return keys.map(function (k) { var x = g[k]; x.items.sort(function (a, b) { return (fin(a) ? 1 : 0) - (fin(b) ? 1 : 0); }); return x; });
  };

  /* task list (Home) */
  SR.TaskList = function (p) {
    var rf = React.useRef(null); SR.useFlip(rf, '.task[data-tid]', 'data-tid');
    var bk = React.useState(false), bulkOn = bk[0], setBulkOn = bk[1];
    var sel = p.selected, just = p.just || {};
    var row = function (t, g) {
      var c = SR.clientById(p.clients, t.clientId);
      return html`<${SR.TaskRow} key=${t.id} task=${t} selected=${!!sel[t.id]} active=${p.openId === t.id} just=${!!just[t.id]} showClient=${true} clientColor=${c.color} clientName=${c.name}
        dnd=${!!p.dnd} dropDate=${g ? g.date : undefined} onToggle=${p.onToggle} onOpen=${p.onOpen} onSelect=${p.onSelect} />`;
    };
    var hl = function (on) { return function (e) { if (SR._drag != null) { e.currentTarget.classList.toggle('dover', on); } }; };
    var body;
    if (p.flat) {
      var fin = function (t) { return t.done && !(p.settling || {})[t.id]; };
      var items = p.tasks.slice().sort(function (a, b) { return (fin(a) ? 1 : 0) - (fin(b) ? 1 : 0); });
      body = html`<div style="margin-top:14px">${items.map(function (t) { return row(t, null); })}</div>`;
    } else {
      var groups = SR.groupByDay(p.tasks, p.settling);
      body = html`<div>
        ${groups.map(function (g, gi) {
          return html`<div key=${gi} class="dgroup" onDragOver=${p.dnd && g.date !== null ? function (e) { if (SR._drag != null) e.preventDefault(); } : null} onDragEnter=${p.dnd ? hl(true) : null} onDragLeave=${p.dnd ? hl(false) : null}
            onDrop=${p.dnd && g.date !== null ? function (e) { e.preventDefault(); e.currentTarget.classList.remove('dover'); var id = SR._drag; SR._drag = null; if (id != null) SR.dnd.dropOnDay(id, g.date); } : null}>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:18px;padding-bottom:6px;border-bottom:1px solid var(--border)">
              <h3 style=${'margin:0;font-family:\'DM Sans\',system-ui,sans-serif;font-size:19px;color:' + (g.danger ? 'var(--red)' : 'var(--text)')}>${g.label}</h3>
              <span style="font-size:12px;color:var(--muted)">${g.open} open</span></div>
            ${g.items.map(function (t) { return row(t, g); })}
          </div>`;
        })}
      </div>`;
    }
    return html`<div ref=${rf}>
      <${SR.QuickAdd} value=${p.newTask} onChange=${p.onNewTask} onAdd=${p.onAdd} front=${p.qFront} onFront=${p.onQFront} owner=${p.qOwner} onOwner=${p.onQOwner} autoOwner=${p.autoOwner} lockFront=${p.lockFront} need=${p.qNeed} clients=${p.clients} />
      ${body}
      ${p.tasks.length ? null : html`<div style="padding:16px 0;font-size:14px;color:var(--muted)">Nothing here.</div>`}
    </div>`;
  };

  /* floating bulk bar, fixed at the bottom of the screen */
  SR.BulkBar = function (p) {
    var n = p.count; if (!n) return null;
    var sel = function (label, opts, fn) { return html`<select class="sr-bsel" value="" aria-label=${label} onChange=${function (e) { var v = e.target.value; if (v !== '') fn(v); }}><option value="">${label}</option>${opts.map(function (o) { return html`<option key=${o[0]} value=${o[0]}>${o[1]}</option>`; })}</select>`; };
    var dateIn = function (label, key, gold) { return html`<label class=${'sr-bdate' + (gold ? ' gold' : '')}><span>${label}</span><input type="date" aria-label=${label} onChange=${function (e) { if (e.target.value) { var o = {}; o[key] = e.target.value; p.onBulk(o); } }} /></label>`; };
    return html`<div class=${"sr-bulkwrap" + (p.dock ? " dock" : "")}><div class="sr-bulk" role="toolbar" aria-label="Selected tasks">
      <div class="sr-bulkcount"><strong>${n}</strong> selected</div>
      <button type="button" class="sr-bdone" onClick=${function () { p.onComplete(); }}>✓ Complete</button>
      ${sel('Assign to…', SR.TEAM.map(function (n) { return [n, n]; }).concat([['__none', 'Unassign']]), function (v) { p.onBulk({ owner: v === '__none' ? '' : v }); })}
      ${sel('Status…', [['planned', 'Planned'], ['doing', 'In progress'], ['done', 'Done']], function (v) { if (v === 'done') p.onComplete(); else p.onBulk({ status: v, done: false }); })}
      ${sel('Frequency…', [['__once', 'Does not repeat']].concat(SR.CADENCES.map(function (x) { return [x, x]; })), function (v) { p.onBulk({ repeat: v === '__once' ? '' : v }); })}
      ${dateIn('Attack', 'date', false)}
      ${dateIn('⚑ Deadline', 'deadline', true)}
      <button type="button" class="sr-bdel" onClick=${function () { p.onDelete(); }}>Delete</button>
      <button type="button" class="sr-bclear" onClick=${p.onClearSel} aria-label="Clear selection">${SR.Icon('close', 16)}</button>
    </div></div>`;
  };

  /* right-hand task panel (same layout as the Sales dashboard panel) */
  SR.TaskDrawer = function (p) {
    var t = p.task; if (!t) return null;
    var c = SR.clientById(p.clients, t.clientId);
    var subs = t.subs || [], subsDone = subs.filter(function (s) { return s.done; }).length;
    var fmtLong = function (d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
    var status = t.done ? 'done' : (t.status || 'planned');
    var delState = R.useState(false), confirmDel = delState[0], setConfirmDel = delState[1];
    var lab = function (txt, sub) { return html`<div><div class="sr-lab">${txt}</div>${sub ? html`<div class="sr-sub" style="margin-top:4px">${sub}</div>` : null}</div>`; };
    var chip = function (txt, on, fn) { return html`<button type="button" class=${'sr-chip' + (on ? ' on' : '')} onClick=${fn}>${txt}</button>`; };
    var links = SR.taskLinks(t, c);
    var freqHelp = t.repeat ? 'Comes back ' + t.repeat.toLowerCase() + ' once you tick it.' : 'Happens once.';
    return html`<div>
      <aside aria-label="Task details" class="sr-panel"><div class="sr-pgrip" title="Drag to resize, double-click to reset" onDoubleClick=${function () { document.documentElement.style.removeProperty("--panelw"); try { localStorage.removeItem("sr_panelw"); } catch (x) {} }} onMouseDown=${function (e) { e.preventDefault(); var x0 = e.clientX, w0 = e.currentTarget.parentNode.getBoundingClientRect().width; var mv = function (ev) { var w = Math.max(340, Math.min(window.innerWidth - 80, w0 + (x0 - ev.clientX))); document.documentElement.style.setProperty("--panelw", Math.round(w) + "px"); window.dispatchEvent(new Event("resize")); }; var up = function () { document.removeEventListener("mousemove", mv); document.removeEventListener("mouseup", up); try { localStorage.setItem("sr_panelw", document.documentElement.style.getPropertyValue("--panelw")); } catch (x) {} }; document.addEventListener("mousemove", mv); document.addEventListener("mouseup", up); }}></div>
        <div class="sr-phead"><span class="sr-plabel0">TASK</span>
          <div class="sr-hbtns">
            <button type="button" class="sr-del" onClick=${function () { if (confirmDel) { p.onDelete(t.id); } else { setConfirmDel(true); setTimeout(function () { setConfirmDel(false); }, 3000); } }}>${confirmDel ? 'Sure? Click again' : 'Delete'}</button>
            <button type="button" class="sr-x" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 20)}</button>
          </div>
        </div>
        <div class="sr-pbody">
          <div class="sr-top">
            <span class="sr-where"><i></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}${p.where ? ' · ' + p.where : ''}</span></span>
            <select class="sr-status" value=${status} onChange=${function (e) { var v = e.target.value; if (v === 'done') p.onPatch(t.id, { done: true }); else p.onPatch(t.id, { done: false, status: v }); }} aria-label="Status"><option value="planned">Planned</option><option value="doing">In progress</option><option value="done">Done</option></select>
          </div>
          <textarea rows=${Math.max(1, Math.ceil(t.name.length / 30))} value=${t.name} onChange=${function (e) { p.onPatch(t.id, { name: e.target.value }); }} aria-label="Task name" class="sr-ptitle"></textarea>

          ${(t.how && t.how.length) || links.length ? html`<div class="sr-section">${t.how && t.how.length ? html`<div class="sr-lab">How</div><ol class="sr-steps">${t.how.map(function (h, i) { return html`<li key=${i}>${h}</li>`; })}</ol>` : null}
            ${links.length ? html`<div class="sr-lab" style="margin-top:6px">Quick links</div><div class="links">${links.map(function (l) { return html`<a key=${l[1]} href=${l[1]} target="_blank" rel="noopener"><span>${l[0]}</span><span aria-hidden="true">↗</span></a>`; })}</div>` : null}</div>` : null}

          <div class="sr-section">${lab('Client')}
            <select value=${t.clientId} onChange=${function (e) { p.onPatch(t.id, { clientId: e.target.value }); }} class="sr-field" aria-label="Client">${t.clientId ? null : html`<option value="">Choose a battlefront…</option>`}${SR.fronts(p.clients).map(function (cl) { return html`<option key=${cl.id} value=${cl.id}>${cl.name}</option>`; })}</select></div>

          <div class="sr-section">${lab('Assigned to')}
            <div class="sr-owners">${SR.TEAM.map(function (o) { return html`<button key=${o} type="button" class=${'sr-owner' + (t.owner === o ? ' on' : '')} onClick=${function () { p.onPatch(t.id, { owner: t.owner === o ? '' : o }); }}>${o}</button>`; })}</div>
            <div class="sr-sub">Click again to unassign.</div></div>

          ${t.milestone ? null : html`<div class="sr-section">${lab('Frequency')}
            <select value=${t.repeat || ''} onChange=${function (e) { p.onPatch(t.id, { repeat: e.target.value }); }} class="sr-field"><option value="">Does not repeat</option>${SR.CADENCES.map(function (x) { return html`<option key=${x}>${x}</option>`; })}</select>
            <div class="sr-sub">${freqHelp}</div></div>`}

          <div class="sr-section">${lab('Attack date', 'When you plan to work on this.')}
            <div class="sr-chips">${chip('Today', t.date === SR.TODAY, function () { p.onPatch(t.id, { date: SR.TODAY }); })}${chip('Unscheduled', !t.date, function () { p.onPatch(t.id, { date: '' }); })}
              <input type="date" class="sr-datein" value=${t.date || ''} onChange=${function (e) { p.onPatch(t.id, { date: e.target.value }); }} /></div>
            ${t.date ? html`<div class="sr-gold">${fmtLong(t.date)}</div>` : null}</div>

          <div class="sr-deadline"><div class="sr-lab">⚑ Deadline (optional)</div>
            <input type="date" class="sr-field" value=${t.deadline || ''} onChange=${function (e) { p.onPatch(t.id, { deadline: e.target.value }); }} />
            <div class="sr-sub">Hard cutoff the work must be finished by.</div></div>

          <div class="sr-section">${lab('Attack time')}
            <input type="time" class="sr-field" value=${t.time || ''} onChange=${function (e) { p.onPatch(t.id, { time: e.target.value }); }} />
            <div class="sr-sub">Exact time you plan to start, e.g. 09:00 or 14:30.</div></div>

          <div class="sr-section">${lab('Time', 'Duration, what is already done, and whether to split it into chunks.')}
            <div class="sr-chips">${[15, 30, 60, 120, 240].map(function (m) { return chip(SR.dur(m), SR.estOf(t) === m && !!t.est, function () { p.onPatch(t.id, { est: t.est === m ? 0 : m }); }); })}
              <input type="number" min="5" step="5" class="sr-datein" style="width:96px" placeholder="minutes" value=${t.est || ''} onChange=${function (e) { p.onPatch(t.id, { est: Math.max(0, +e.target.value || 0) }); }} aria-label="Duration in minutes" /></div>
            <div class="tt-bar" aria-label="Completed time"><i style=${'width:' + SR.pct(t) + '%'}></i></div>
            <div class="sr-sub"><b>${SR.dur(t.spent || 0)}</b> done of ${SR.dur(SR.estOf(t))}${SR.remaining(t) && (t.spent || 0) ? ', ' + SR.dur(SR.remaining(t)) + ' left' : ''}${t.timer ? html` <span class="tt-run">● running ${SR.dur(Math.max(1, Math.round((Date.now() - new Date(t.timer).getTime()) / 60000)))}</span>` : null}</div>
            <div class="tt-row">${[15, 30, 60].map(function (m) { return html`<button key=${m} type="button" class="sr-chip" onClick=${function () { p.onLog(t.id, m); }}>+${SR.dur(m)}</button>`; })}
              <button type="button" class="sr-chip" onClick=${function () { p.onLog(t.id, -15); }} disabled=${!t.spent}>-15m</button>
              <button type="button" class=${'sr-chip' + (t.timer ? ' on' : '')} onClick=${function () { p.onTimer(t.id, !t.timer); }}>${t.timer ? 'Stop timer' : 'Start timer'}</button></div>
            <div class="sr-lab" style="margin-top:12px">Split into chunks</div>
            <select class="sr-field" value=${t.chunkMin || 0} onChange=${function (e) { p.onPatch(t.id, { chunkMin: +e.target.value, slots: [] }); }} aria-label="Chunk size"><option value="0">Do not split</option><option value="30">Chunks of 30m</option><option value="60">Chunks of 1h</option><option value="90">Chunks of 1h 30m</option><option value="120">Chunks of 2h</option><option value="240">Chunks of 4h</option></select>
            ${(t.slots || []).map(function (s, i) { return html`<div key=${i} class=${'tt-chunk' + (s.done ? ' dn' : '')}><span>Part ${i + 1}/${t.slots.length}: ${SR.fmtDeadline(s.date)} ${s.time}, ${SR.dur(s.min)}</span>${s.done ? html`<em style="font-style:normal;color:#3FA46A">Done</em>` : html`<button type="button" class="sr-chip" onClick=${function () { p.onLog(t.id, s.min); }}>Mark done</button>`}</div>`; })}
            ${t.owner ? html`<button type="button" class="sr-chip" style="margin-top:8px" onClick=${function () { p.onSchedule([t.id], 'Scheduled'); }}>${(t.slots && t.slots.length) || (t.date && t.time) ? 'Reschedule' : 'Schedule it for me'}</button>` : html`<div class="sr-sub" style="margin-top:6px">Assign it to someone to schedule it.</div>`}</div>

          <div class="sr-section">${lab('Blocked by', 'This task cannot be ticked until these are done.')}
            ${(t.blockedBy || []).map(function (b) { var bt = (p.allTasks || []).filter(function (x) { return x.id === b; })[0]; if (!bt) return null; return html`<div key=${b} class="sr-blk"><span class=${bt.done ? 'ok' : ''}>${bt.done ? '✓ ' : '⏳ '}${bt.name}</span><button type="button" aria-label="Remove" onClick=${function () { p.onPatch(t.id, { blockedBy: (t.blockedBy || []).filter(function (x) { return x !== b; }) }); }}>×</button></div>`; })}
            <select class="sr-field" value="" onChange=${function (e) { var v = +e.target.value; if (v) p.onPatch(t.id, { blockedBy: (t.blockedBy || []).concat([v]) }); }} aria-label="Add a blocker"><option value="">+ Add a blocking task</option>${(p.allTasks || []).filter(function (x) { return x.id !== t.id && !x.done && x.clientId === t.clientId && (t.blockedBy || []).indexOf(x.id) < 0 && (x.blockedBy || []).indexOf(t.id) < 0; }).slice(0, 150).map(function (x) { return html`<option key=${x.id} value=${x.id}>${x.name}</option>`; })}</select></div>

          ${t.date ? html`<div class="sr-section"><a class="sr-gcal" href=${SR.gcalLink(t, c.name)} target="_blank" rel="noopener">Add to Google Calendar ↗</a></div>` : null}

          <div class="sr-section"><div style="display:flex;gap:14px;align-items:baseline"><div class="sr-lab">Subitems</div><div class="sr-sub">${subs.length ? subsDone + ' of ' + subs.length + ' done' : 'None yet'}</div></div>
            ${subs.map(function (s, i) {
              return html`<div key=${i} class=${'sr-subrow' + (s.done ? ' done' : '')}><button type="button" class=${'cb sm' + (s.done ? ' done' : '')} onClick=${function () { if (!s.done) SR.playTick(); p.onToggleSub(t.id, i); }} aria-label=${s.name}><span>${s.done ? '✓' : ''}</span></button><span>${s.name}</span></div>`;
            })}
            <input type="text" class="sr-addsub" placeholder="+ Add subitem, press Enter" value=${p.subDraft} onChange=${function (e) { p.onSubDraft(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); p.onAddSub(t.id); } }} /></div>

          <div class="sr-section">${lab('Notes')}
            <textarea rows="3" value=${t.note || ''} onChange=${function (e) { p.onPatch(t.id, { note: e.target.value }); }} class="sr-field" style="padding:12px 16px;font-size:15px;resize:vertical"></textarea></div>

          <div class="sr-section">${lab('Comments')}
            ${(t.comments || []).map(function (c2) { return html`<div key=${c2.id} class="sr-cmt"><div class="sr-ch">${SR.Avatar(c2.who, 22)}<b>${c2.who}</b><span>${SR.fmtStamp(c2.ts)}</span></div><div class="sr-ct">${c2.text.split(/(@\w+)/g).map(function (x, i) { return /^@/.test(x) ? html`<mark key=${i}>${x}</mark>` : x; })}</div></div>`; })}
            <${SR.CommentBox} onSend=${function (txt) { p.onComment(t.id, txt); }} me=${p.me} /></div>
        </div>
        <div class="sr-foot">
          ${p.onOpenClient ? html`<button type="button" class="sr-open" onClick=${function () { p.onOpenClient(t.clientId); }}>Open in client</button>` : html`<span></span>`}
          <button type="button" class=${'sr-complete' + (t.done ? ' on' : '')} onClick=${function () { p.onToggle(t.id); }}>${t.done ? 'Done. Mark as not done' : (t.repeat && !t.milestone ? 'Mark done for this round' : 'Mark complete')}</button>
        </div>
      </aside>
    </div>`;
  };

  /* ---------- profile: username, photo, colour ---------- */
  SR.PROFILE_COLORS = ['#4C7BD9', '#D9A441', '#3FA46A', '#B25AA6', '#D26363', '#3E9BB0', '#7C6BD6', '#E07B39'];
  SR.ProfileForm = function (p) {
    var st = R.useState({ username: p.profile ? p.profile.username : '', avatar: p.profile ? p.profile.avatar || '' : '', color: p.profile ? p.profile.color || SR.PROFILE_COLORS[0] : SR.PROFILE_COLORS[0], claimed: '' }), v = st[0], setV = st[1];
    var es = R.useState(''), err = es[0], setErr = es[1], bs = R.useState(false), busy = bs[0], setBusy = bs[1];
    var fileRef = R.useRef(null);
    var set = function (k, x) { var o = Object.assign({}, v); o[k] = x; setV(o); };
    var pick = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { var im = new Image(); im.onload = function () { var c = document.createElement('canvas'), z = 160, m = Math.min(im.width, im.height), cx = c.getContext('2d'); c.width = c.height = z; cx.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, z, z); set('avatar', c.toDataURL('image/jpeg', 0.85)); }; im.src = String(r.result); };
      r.readAsDataURL(f); e.target.value = '';
    };
    var save = function (e) {
      e.preventDefault(); var n = v.username.trim();
      if (!/^[A-Za-z0-9_]{2,20}$/.test(n)) { setErr('Username: 2 to 20 letters, numbers or underscores.'); return; }
      setBusy(true); setErr('');
      p.onSave({ username: n, avatar: v.avatar, color: v.color, claimed: v.claimed || '' }).then(null, function (x) { setBusy(false); setErr(/duplicate|unique/i.test(x.message || '') ? 'That username is taken.' : (x.message || 'Could not save.')); });
    };
    var initial = (v.username || '?')[0].toUpperCase();
    return html`<form onSubmit=${save}>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
        <button type="button" class="pf-av" onClick=${function () { fileRef.current && fileRef.current.click(); }} aria-label="Choose a profile photo" style=${'background:' + v.color}>${v.avatar ? html`<img alt="" src=${v.avatar} />` : html`<span>${initial}</span>`}<i>Change</i></button>
        <div style="flex:1;min-width:0"><div class="sr-lab">Photo</div><div class="cal-note">Square works best. Click the circle to upload.</div>${v.avatar ? html`<button type="button" class="edbtn" style="margin-top:6px" onClick=${function () { set('avatar', ''); }}>Remove photo</button>` : null}</div>
        <input ref=${fileRef} type="file" accept="image/*" style="display:none" onChange=${pick} /></div>
      <div class="sr-lab">Username</div><div class="cal-note" style="margin-bottom:6px">This is what teammates see and use to @mention you.</div>
      <input class="cal-in" placeholder="e.g. Matt" maxlength="20" value=${v.username} onInput=${function (e) { set('username', e.target.value); }} autofocus />
      ${(!p.profile && p.claimable && p.claimable.length) ? html`<div class="sr-lab">Existing tasks</div><div class="cal-note" style="margin-bottom:6px">The starter data has tasks assigned to placeholder names. Take over one set, or start empty.</div>
        <select class="cal-in" value=${v.claimed} onChange=${function (e) { set('claimed', e.target.value); }}><option value="">Start with no assigned tasks</option>${p.claimable.map(function (n) { return html`<option key=${n} value=${n}>Take over the tasks assigned to ${n}</option>`; })}</select>` : null}
      <div class="sr-lab">Colour</div><div class="pf-cols">${SR.PROFILE_COLORS.map(function (c) { return html`<button key=${c} type="button" aria-label=${c} class=${v.color === c ? 'on' : ''} style=${'background:' + c} onClick=${function () { set('color', c); }}></button>`; })}</div>
      ${err ? html`<p class="cal-note" style="color:#E5484D">${err}</p>` : null}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${p.onCancel ? html`<button type="button" class="edbtn" onClick=${p.onCancel}>Cancel</button>` : null}<button type="submit" class="mdl-b pri" disabled=${busy}>${p.cta || 'Save'}</button></div></form>`;
  };
  SR.ProfileModal = function (p) {
    R.useEffect(function () { var k = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, []);
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="mdl sm" role="dialog" aria-label="Your profile"><h2 style="margin:0 0 14px">Your profile</h2>
      <${SR.ProfileForm} profile=${p.profile} onSave=${p.onSave} onCancel=${p.onClose} /></div></div>`;
  };

  /* ---------- settings: sound, theme, time zone, Google Calendar, account ---------- */
  SR.ShortcutHelp = function (p) {
    R.useEffect(function () { var k = function (e) { if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); p.onClose(); } }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, []);
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || ''), M = mac ? '⌘' : 'Ctrl';
    var L = [['C', 'New task'], ['J / K', 'Move down / up the task list'], ['X', 'Tick the highlighted task'], ['E or Enter', 'Open the highlighted task'], ['/ or ' + M + ' K', 'Search and commands'], [M + ' Z', 'Undo'], ['G then H', 'Go to Home'], ['G then M', 'Go to My tasks'], ['G then C', 'Go to Calendar'], ['G then S', 'Go to Sales'], ['Esc', 'Close a panel or menu'], ['?', 'This list']];
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="mdl st-mdl" role="dialog" aria-label="Keyboard shortcuts" style="max-width:420px">
      <div class="mdl-top"><h2>Keyboard shortcuts</h2><button type="button" class="edbtn" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 14)}</button></div>
      <div class="mdl-body">${L.map(function (x) { return html`<div key=${x[0]} class="st-row"><div class="st-t"><b>${x[1]}</b></div><div class="st-c"><kbd class="kbk">${x[0]}</kbd></div></div>`; })}</div></div></div>`;
  };

  SR.SettingsModal = function (p) {
    R.useEffect(function () { var k = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, []);
    var cloud = SR.store.mode === 'cloud', zones = []; try { zones = Intl.supportedValuesOf('timeZone'); } catch (x) {} if (zones.indexOf(SR.tz) < 0) zones = [SR.tz].concat(zones);
    var auto = !SR.tzManual;
    var seg = function (on, label, fn) { return html`<button type="button" class=${'st-seg' + (on ? ' on' : '')} aria-pressed=${on ? 'true' : 'false'} onClick=${fn}>${label}</button>`; };
    var row = function (t, d, c) { return html`<div class="st-row"><div class="st-t"><b>${t}</b>${d ? html`<span>${d}</span>` : null}</div><div class="st-c">${c}</div></div>`; };
    var g = p.gacc; var fu = R.useState(0), force = fu[1];
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="mdl st-mdl" role="dialog" aria-label="Settings">
      <div class="mdl-top"><h2>Settings</h2><button type="button" class="edbtn" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 14)}</button></div>
      <div class="mdl-body">
        <h3>Profile</h3>
        ${row(p.me || 'You', cloud && SR.store.user ? SR.store.user.email : 'Saved in this browser', html`<span style="display:flex;align-items:center;gap:10px">${SR.Avatar(p.me, 34)}<button type="button" class="edbtn" onClick=${p.onProfile}>Edit profile</button></span>`)}
        <h3>Appearance</h3>
        ${row('Theme', 'Light or dark', html`<span class="st-segs">${seg(p.theme === 'light', 'Light', function () { p.setTheme('light'); })}${seg(p.theme === 'dark', 'Dark', function () { p.setTheme('dark'); })}</span>`)}
        ${row('Row density', 'How much space task rows take', html`<span class="st-segs">${[['compact', 'Compact'], ['comfortable', 'Comfortable'], ['spacious', 'Spacious']].map(function (d) { return seg(SR.getDensity() === d[0], d[1], function () { SR.setDensity(d[0]); force(function (x) { return x + 1; }); }); })}</span>`)}
        ${row('Accent color', 'Your own color for buttons and highlights, saved for ' + (p.me || 'you'), html`<span style="display:flex;gap:8px;align-items:center">${[''].concat(SR.ACCENTS).map(function (a) { var on = SR.getAccent() === a; return html`<button type="button" key=${a || 'def'} class="st-sw2" aria-label=${a ? 'Accent ' + a : 'Default accent'} aria-pressed=${on ? 'true' : 'false'} title=${a ? a : 'Default'} style=${'background:' + (a || 'conic-gradient(#2F5C99,#DBBF69,#2F5C99)') + ';' + (on ? 'box-shadow:0 0 0 2px var(--card),0 0 0 4px ' + (a || 'var(--text)') : '')} onClick=${function () { SR.setAccent(a); force(function (x) { return x + 1; }); }}></button>`; })}</span>`)}
        ${row('Sound', 'A soft chime when you tick a task', html`<span class="st-segs">${seg(p.soundOn, 'On', function () { p.setSound(true); SR.playTick(); })}${seg(!p.soundOn, 'Off', function () { p.setSound(false); })}</span>`)}
        <h3>Time zone</h3>
        ${row('Set automatically', 'Uses the time zone of this device: ' + SR.detectTz().replace(/_/g, ' '), html`<label class="st-sw"><input type="checkbox" checked=${auto} onChange=${function (e) { p.setTz(e.target.checked ? '' : SR.tz); }} /><i></i></label>`)}
        ${auto ? null : row('Time zone', 'Used for dates, the calendar and Google sync', html`<select class="cal-in" style="margin:0;max-width:240px" value=${SR.tz} onChange=${function (e) { p.setTz(e.target.value); }}>${zones.map(function (z) { return html`<option key=${z} value=${z}>${z.replace(/_/g, ' ')}</option>`; })}</select>`)}
        <h3>Integrations</h3>
        ${row('Google Calendar', 'Sync is paused. Nothing is read from or written to Google.', html`<span class="cal-note">Paused</span>`)}
        ${cloud ? html`<h3>Account</h3>${row('Sign out', 'You will need your email and password again', html`<button type="button" class="edbtn" style="color:#E5484D" onClick=${function () { SR.store.signOut(); }}>Sign out</button>`)}` : null}
      </div></div></div>`;
  };

  /* ---------- comment box, bell, automations and connections ---------- */
  SR.CommentBox = function (p) {
    var st = R.useState(''), v = st[0], setV = st[1];
    var send = function () { if (v.trim()) { p.onSend(v); setV(''); } };
    return html`<div class="sr-cbox"><textarea rows="2" class="sr-field" style="padding:10px 14px;font-size:14px;resize:vertical" placeholder=${'Comment as ' + p.me + '. Use @' + (SR.TEAM[0] || 'Name') + ' to mention'} value=${v} onInput=${function (e) { setV(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}></textarea>
      <div style="display:flex;gap:6px;align-items:center;margin-top:6px">${SR.TEAM.map(function (n) { return html`<button key=${n} type="button" class="sr-chip" onClick=${function () { setV(v + (v && !/\s$/.test(v) ? ' ' : '') + '@' + n + ' '); }}>@${n}</button>`; })}<button type="button" class="mdl-b pri" style="margin-left:auto" onClick=${send}>Send</button></div></div>`;
  };
  SR.Bell = function (p) {
    var mine = p.notifs.filter(function (n) { return !n.to || n.to === p.me; }).slice().reverse(), unread = mine.filter(function (n) { return !n.read; }).length;
    var readAll = function () { p.setNotifs(function (a) { return a.map(function (n) { return (!n.to || n.to === p.me) ? Object.assign({}, n, { read: true }) : n; }); }); };
    return html`<div class="bell-wrap"><button type="button" class="kbtn bell" aria-label="Notifications" aria-expanded=${p.open ? 'true' : 'false'} onClick=${function () { p.setOpen(!p.open); }}>🔔${unread ? html`<i class="bell-n">${unread}</i>` : null}</button>
      ${p.open ? html`<div class="bell-pop" role="dialog" aria-label="Notifications">
        <div class="bell-h"><b>Notifications</b><span style="margin-left:auto;display:flex;gap:6px;align-items:center">${SR.store.mode === "cloud" ? null : html`<select aria-label="You are" class="tzsel" style="margin:0;max-width:90px" value=${p.me} onChange=${function (e) { p.setMe(e.target.value); }}>${SR.TEAM.map(function (n) { return html`<option key=${n} value=${n}>${n}</option>`; })}</select>`}<button type="button" class="edbtn" onClick=${readAll}>Mark all read</button></span></div>
        <div class="bell-l">${mine.length ? mine.slice(0, 40).map(function (n) { var em = ((SR.jget('sr_hooks', {}).emails) || {})[n.to]; return html`<div key=${n.id} class=${'bell-i' + (n.read ? '' : ' un')}><button type="button" class="bell-b" onClick=${function () { p.setNotifs(function (a) { return a.map(function (x) { return x.id === n.id ? Object.assign({}, x, { read: true }) : x; }); }); p.onOpenTask(n.taskId); }}><span>${n.text}</span><em>${SR.fmtStamp(n.ts)}</em></button>${em ? html`<a class="sr-gcal" target="_blank" rel="noopener" href=${'https://mail.google.com/mail/?view=cm&to=' + encodeURIComponent(em) + '&su=' + encodeURIComponent('Sarac Ramsay: ' + n.text.slice(0, 60)) + '&body=' + encodeURIComponent(n.text)}>Email</a>` : null}</div>`; }) : html`<div class="cal-note" style="padding:16px">Nothing yet. You get a note when a task is assigned to you, someone mentions you, a blocker clears or an automation runs.</div>`}</div>
        <div class="bell-f"><button type="button" class="edbtn" onClick=${p.onAuto}>Automations and connections</button></div></div>` : null}</div>`;
  };
  SR.AutoModal = function (p) {
    var ts = R.useState('auto'), tab = ts[0], setTab = ts[1];
    var hs = R.useState(function () { return SR.jget('sr_hooks', {}); }), hooks = hs[0], setHooks = hs[1];
    var ds = R.useState({ match: '', action: 'create', arg: '', owner: '', days: 0 }), dr = ds[0], setDr = ds[1];
    var saveHooks = function (h) { setHooks(h); SR.jset('sr_hooks', h); };
    var set = function (k, v) { var o = Object.assign({}, dr); o[k] = v; setDr(o); };
    var addRule = function () { if (dr.action === 'create' && !dr.arg.trim()) return; p.setRules(p.rules.concat([Object.assign({ id: 'r' + Date.now(), on: true }, dr)])); setDr({ match: '', action: 'create', arg: '', owner: '', days: 0 }); };
    var dl = function () { var b = new Blob([SR.exportICS(p.tasks, p.events, p.clients)], { type: 'text/calendar' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'sarac-ramsay-tasks.ics'; document.body.appendChild(a); a.click(); a.remove(); };
    var people = [['', 'Same owner / team']].concat(SR.TEAM.map(function (n) { return [n, n]; }));
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}><div class="mdl" role="dialog" aria-label="Automations and connections" style="padding:22px;overflow:auto">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><h2 style="margin:0;font-size:20px">Automations and connections</h2><button type="button" class="sr-x" style="margin-left:auto" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 20)}</button></div>
      <div class="viewsw" role="group" style="align-self:flex-start;margin-bottom:14px">${[['auto', 'Automations'], ['conn', 'Connections']].map(function (v) { return html`<button key=${v[0]} type="button" class=${tab === v[0] ? 'on' : ''} onClick=${function () { setTab(v[0]); }}>${v[1]}</button>`; })}</div>
      ${tab === 'auto' ? html`<div>
        <div class="cal-note" style="margin-bottom:10px">Rules run when a task is ticked complete. Leave the name empty to match every task.</div>
        ${p.rules.map(function (r) { return html`<div key=${r.id} class="au-rule"><label style="display:flex;gap:8px;align-items:center;flex:1;min-width:0"><input type="checkbox" checked=${r.on} onChange=${function () { p.setRules(p.rules.map(function (x) { return x.id === r.id ? Object.assign({}, x, { on: !x.on }) : x; })); }} />
          <span style="font-size:14px">When a task${r.match ? ' containing "' + r.match + '"' : ''} is completed, ${r.action === 'create' ? 'create "' + r.arg + '"' + (r.owner ? ' for ' + r.owner : '') + ' in ' + (+r.days || 0) + ' days' : 'notify ' + (r.owner || 'the team')}</span></label>
          <button type="button" class="edbtn" onClick=${function () { p.setRules(p.rules.filter(function (x) { return x.id !== r.id; })); }}>Remove</button></div>`; })}
        <div class="au-new"><div class="sr-lab">New rule</div>
          <input class="cal-in" placeholder="When a task containing this text is completed (optional)" value=${dr.match} onInput=${function (e) { set('match', e.target.value); }} />
          <div class="cal-row" style="grid-template-columns:1fr 1fr 90px"><select class="cal-in" value=${dr.action} onChange=${function (e) { set('action', e.target.value); }}><option value="create">Create a task</option><option value="notify">Send a notification</option></select>
            <select class="cal-in" value=${dr.owner} onChange=${function (e) { set('owner', e.target.value); }}>${people.map(function (x) { return html`<option key=${x[0]} value=${x[0]}>${x[1]}</option>`; })}</select>
            <input class="cal-in" type="number" min="0" title="Days later" value=${dr.days} onInput=${function (e) { set('days', e.target.value); }} disabled=${dr.action !== 'create'} /></div>
          ${dr.action === 'create' ? html`<input class="cal-in" placeholder="New task name" value=${dr.arg} onInput=${function (e) { set('arg', e.target.value); }} />` : null}
          <button type="button" class="mdl-b pri" onClick=${addRule}>Add rule</button></div></div>` : html`<div>
        <div class="sr-lab">Slack</div><div class="cal-note">Paste an incoming webhook URL. Every notification (assigned, mentioned, unblocked, automation) is also posted to that channel.</div>
        <input class="cal-in" style="margin-top:8px" placeholder="https://hooks.slack.com/services/..." value=${hooks.slack || ''} onInput=${function (e) { saveHooks(Object.assign({}, hooks, { slack: e.target.value.trim() })); }} />
        <button type="button" class="edbtn" onClick=${function () { SR.slackPost('Test from the Sarac Ramsay dashboard'); SR.toast && SR.toast('Test message sent'); }} disabled=${!hooks.slack}>Send a test</button>
        <div class="sr-lab" style="margin-top:18px">Gmail</div><div class="cal-note">Add each person's email. Notifications get an "Email" button that opens a ready draft in Gmail.</div>
        ${SR.TEAM.map(function (n) { return html`<div key=${n} class="cal-row" style="grid-template-columns:90px 1fr;align-items:center;margin-top:6px"><span style="font-size:14px">${n}</span><input class="cal-in" style="margin:0" placeholder="name@company.com" value=${(hooks.emails || {})[n] || ''} onInput=${function (e) { var em = Object.assign({}, hooks.emails || {}); em[n] = e.target.value.trim(); saveHooks(Object.assign({}, hooks, { emails: em })); }} /></div>`; })}
        <div class="sr-lab" style="margin-top:18px">Google Calendar</div><div class="cal-note">Every task with a date has an "Add to Google Calendar" link. Export all scheduled tasks and events as one file to import or subscribe to.</div>
        <button type="button" class="edbtn" style="margin-top:8px" onClick=${dl}>Download all as .ics</button>
        <div class="cal-note" style="margin-top:16px">Live two way sync with Slack, Gmail and Google Calendar needs a small server and sign in with each service. This panel is the part that works without one.</div></div>`}
    </div></div>`;
  };

  /* ---------- right-click menu, confirm box, edit client ---------- */
  SR.CtxMenu = function (p) {
    var ref = R.useRef(null), ps = R.useState({ x: p.menu.x, y: p.menu.y }), pos = ps[0], setPos = ps[1];
    R.useLayoutEffect(function () {
      var el = ref.current; if (!el) return; var r = el.getBoundingClientRect(), x = p.menu.x, y = p.menu.y;
      if (x + r.width > window.innerWidth - 8) x = Math.max(8, window.innerWidth - r.width - 8);
      if (y + r.height > window.innerHeight - 8) y = Math.max(8, window.innerHeight - r.height - 8);
      setPos({ x: x, y: y });
      var b = el.querySelector('button:not([disabled])'); if (b) b.focus({ preventScroll: true });
    }, [p.menu]);
    R.useEffect(function () {
      var close = p.onClose; var t0 = Date.now(); var sc = function (e) { if (Date.now() - t0 < 400) return; if (ref.current && e.target && ref.current.contains(e.target)) return; close(); };
      var md = function (e) { if (ref.current && !ref.current.contains(e.target)) close(); };
      var kd = function (e) { if (e.key === 'Escape') close(); };
      document.addEventListener('mousedown', md, true); document.addEventListener('keydown', kd);
      window.addEventListener('scroll', sc, true); window.addEventListener('resize', close); window.addEventListener('blur', close);
      return function () { document.removeEventListener('mousedown', md, true); document.removeEventListener('keydown', kd); window.removeEventListener('scroll', sc, true); window.removeEventListener('resize', close); window.removeEventListener('blur', close); };
    }, [p.menu]);
    var onKey = function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return; e.preventDefault();
      var bs = Array.prototype.slice.call(ref.current.querySelectorAll('button:not([disabled])')), i = bs.indexOf(document.activeElement);
      bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus();
    };
    return html`<div class="ctx" role="menu" ref=${ref} style=${'left:' + pos.x + 'px;top:' + pos.y + 'px'} onKeyDown=${onKey} onContextMenu=${function (e) { e.preventDefault(); }}>
      ${p.menu.items.map(function (it, i) {
        if (it.sep) return html`<div key=${i} class="ctx-sep" role="separator"></div>`;
        if (it.head) return html`<div key=${i} class="ctx-head">${it.head}</div>`;
        return html`<button key=${i} type="button" role="menuitem" class=${'ctx-i' + (it.danger ? ' danger' : '')} disabled=${!!it.disabled} onClick=${function () { p.onClose(); it.fn(); }}><span>${it.label}</span>${it.hint ? html`<span class="ctx-k">${it.hint}</span>` : null}</button>`;
      })}
    </div>`;
  };

  SR.Confirm = function (p) {
    var cf = p.cf;
    R.useEffect(function () { var kd = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', kd); return function () { document.removeEventListener('keydown', kd); }; }, []);
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}>
      <div class="mdl sm" role="alertdialog" aria-modal="true" aria-label=${cf.title}>
        <h2>${cf.title}</h2><p>${cf.body}</p>
        <div class="mdl-foot"><button type="button" class="mdl-b" onClick=${p.onClose}>Cancel</button><button type="button" autofocus class=${'mdl-b ' + (cf.danger ? 'danger' : 'pri')} onClick=${function () { p.onClose(); cf.fn(); }}>${cf.ok}</button></div>
      </div></div>`;
  };

  SR.EditClient = function (p) {
    var c = p.client, M = c.math || {}, tpl = SR.TEMPLATES[c.type] || {};
    var s = R.useState({ name: c.name || '', contact: c.contact || '', email: c.email || '', region: c.region || '', owner: c.owner || SR.TEAM[0] || '', color: c.color || '#5B86C5', retainer: c.retainer == null ? '' : c.retainer, setup: c.setup == null ? '' : c.setup, term: c.term || '', start: c.start || '', updates: c.updates || 'Weekly', nextUpdate: c.nextUpdate || '', domain: c.domain || '', promise: c.promise || '', logo: c.logo || '' }), d = s[0], setD = s[1];
    var pickLogo = function (e) {
      var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      var rd = new FileReader(); rd.onload = function () { var im = new Image(); im.onload = function () { var S = 128, k = Math.min(1, S / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(im.width * k)); cv.height = Math.max(1, Math.round(im.height * k)); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); var url = cv.toDataURL('image/png'); setD(function (o) { return Object.assign({}, o, { logo: url }); }); }; im.src = rd.result; }; rd.readAsDataURL(f);
    };
    var ms = R.useState(Object.assign({}, M)), m = ms[0], setM = ms[1];
    R.useEffect(function () { var kd = function (e) { if (e.key === 'Escape') p.onClose(); }; document.addEventListener('keydown', kd); return function () { document.removeEventListener('keydown', kd); }; }, []);
    var set = function (k) { return function (e) { var v = e.target.value; setD(function (o) { var n = Object.assign({}, o); n[k] = v; return n; }); }; };
    var setm = function (k) { return function (e) { var v = e.target.value; setM(function (o) { var n = Object.assign({}, o); n[k] = v; return n; }); }; };
    var inp = function (k, lbl, type, ph) { return html`<label key=${k}>${lbl}<input type=${type || 'text'} step="any" value=${d[k]} placeholder=${ph || ''} onChange=${set(k)} /></label>`; };
    var minp = function (k, lbl, ph) { return html`<label key=${k}>${lbl}<input type="number" step="any" value=${m[k] == null ? '' : m[k]} placeholder=${ph || ''} onChange=${setm(k)} /></label>`; };
    var COLORS = ['#4F86C6', '#2FA79C', '#5B86C5', '#3FA56A', '#D08A2E', '#C9774F', '#9B7FD6', '#D0607A', '#6C6FD0', '#C9A84C'];
    var mathFields = tpl.kind === 'ads' ? [minp('leads', 'Leads a month'), minp('cvr', 'Conversion rate (%)'), c.type === 'meta' ? minp('cpm', 'CPM ($)') : minp('cpc', 'CPC ($)'), minp('ctr', 'CTR (%)'), minp('volume', 'Market volume'), minp('close', 'Close rate (%)'), minp('deal', 'Value of a customer ($)'), minp('margin', 'Profit margin (%)'), minp('comm', 'Your commission (%)')] : (M.vis != null ? [minp('vis', 'AI visibility goal (%)'), html`<label key="by">By date<input type="date" value=${m.by || ''} onChange=${setm('by')} /></label>`, minp('prompts', 'Prompts tracked'), minp('articles', 'Articles a week')] : []);
    return html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}>
      <div class="mdl" role="dialog" aria-modal="true" aria-label="Edit client">
        <div class="mdl-top"><h2>Edit client</h2><button type="button" class="sr-x" onClick=${p.onClose} aria-label="Close">${SR.Icon('close', 20)}</button></div>
        <div class="mdl-body">
          <h3>Client</h3>
          <div class="rform">${inp('name', 'Client name')}${inp('contact', 'Contact')}${inp('email', 'Email', 'email')}${inp('region', 'Region')}${inp('domain', 'Website')}
            <label>Owner<select value=${d.owner} onChange=${set('owner')}>${SR.TEAM.map(function (n) { return html`<option key=${n}>${n}</option>`; })}</select></label></div>
          <div class="mdl-lab">Logo or image <span style="font-weight:400;opacity:.7">(uses the website icon until you upload one)</span></div>
          <div class="mdl-logo">${(d.logo || (function () { var dm = String(d.domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim(); return dm.indexOf('.') > 0 ? 'https://www.google.com/s2/favicons?sz=128&domain=' + encodeURIComponent(dm) : ''; })()) ? html`<img src=${d.logo || (function () { var dm = String(d.domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim(); return dm.indexOf('.') > 0 ? 'https://www.google.com/s2/favicons?sz=128&domain=' + encodeURIComponent(dm) : ''; })()} alt="Logo" />` : html`<span style=${'background:' + d.color}>${String(d.name || '?').charAt(0).toUpperCase()}</span>`}
            <label class="mdl-b" style="cursor:pointer">${d.logo ? 'Change image' : 'Upload image'}<input type="file" accept="image/*" style="display:none" onChange=${pickLogo} /></label>${d.logo ? html`<button type="button" class="mdl-b" onClick=${function () { setD(function (o) { return Object.assign({}, o, { logo: '' }); }); }}>Remove</button>` : null}</div>
          <div class="mdl-lab">Colour</div>
          <div class="mdl-colors">${COLORS.map(function (k) { return html`<button key=${k} type="button" class=${'mdl-sw' + (d.color === k ? ' on' : '')} style=${'background:' + k} aria-label=${'Colour ' + k} aria-pressed=${d.color === k ? 'true' : 'false'} onClick=${function () { setD(function (o) { return Object.assign({}, o, { color: k }); }); }}></button>`; })}<input type="color" value=${d.color} onChange=${set('color')} aria-label="Custom colour" /></div>
          <h3>Contract</h3>
          <div class="rform">${inp('retainer', 'Monthly retainer ($)', 'number')}${inp('setup', 'Set-up fee ($)', 'number')}${inp('term', 'Term')}${inp('start', 'Start date', 'date')}
            <label>Client updates<select value=${d.updates} onChange=${set('updates')}><option>Weekly</option><option>Fortnightly</option><option>Monthly</option></select></label>${inp('nextUpdate', 'Next update')}</div>
          <h3>${(tpl.label || 'Main project') + ' goal and project maths'}</h3>
          <div class="rform"><label style="grid-column:1/-1">The promise<input type="text" value=${d.promise} onChange=${set('promise')} /></label>${mathFields}</div>
        </div>
        <div class="mdl-foot"><button type="button" class="mdl-b" onClick=${p.onClose}>Cancel</button><button type="button" class="mdl-b pri" onClick=${function () { p.onSave(c.id, d, m); }}>Save changes</button></div>
      </div></div>`;
  };

  /* ---------- search and command bar (Ctrl/Cmd+K) ---------- */
  SR.Palette = function (p) {
    var qs = R.useState(''), q = qs[0], setQ = qs[1], is = R.useState(0), idx = is[0], setIdx = is[1], inp = R.useRef(null), box = R.useRef(null);
    R.useEffect(function () { if (inp.current) inp.current.focus(); }, []);
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    var order = ['Go to', 'Actions', 'Clients', 'Results', 'Tasks'];
    var list = [];
    order.forEach(function (g) {
      var rows = p.items.filter(function (x) { return x.g === g; });
      if (!toks.length) { if (g === 'Tasks' || g === 'Results') return; rows = rows.filter(function (x) { return g !== 'Actions' || !/^Edit /.test(x.label); }); }
      else rows = rows.filter(function (x) { var h = (x.label + ' ' + (x.sub || '')).toLowerCase(); return toks.every(function (t) { return h.indexOf(t) > -1; }); })
        .sort(function (a, b) { var s = function (x) { var l = x.label.toLowerCase(); return l.indexOf(toks[0]) === 0 ? 0 : l.indexOf(toks[0]) > -1 ? 1 : 2; }; return s(a) - s(b); });
      rows.slice(0, g === 'Tasks' ? 8 : 6).forEach(function (x) { list.push(x); });
    });
    var onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); p.onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(Math.min(idx + 1, list.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(Math.max(idx - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); var it = list[idx]; if (it) { p.onClose(); it.fn(); } }
    };
    R.useEffect(function () { var el = box.current && box.current.querySelector('.pal-i.on'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }, [idx, q]);
    var lastG = '';
    return html`<div class="pal-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) p.onClose(); }}>
      <div class="pal" role="dialog" aria-modal="true" aria-label="Search and commands" onKeyDown=${onKey}>
        <input ref=${inp} type="text" placeholder="Search clients, tasks, results or type a command" value=${q} onChange=${function (e) { setQ(e.target.value); setIdx(0); }} onInput=${function (e) { setQ(e.target.value); setIdx(0); }} aria-label="Search" />
        <div class="pal-list" ref=${box} role="listbox">
          ${list.length ? list.map(function (it, i) {
            var head = it.g !== lastG ? (lastG = it.g, html`<div class="pal-h" key=${'h' + i}>${it.g}</div>`) : null;
            return [head, html`<button key=${i} type="button" role="option" aria-selected=${i === idx ? 'true' : 'false'} class=${'pal-i' + (i === idx ? ' on' : '')} onMouseMove=${function () { if (idx !== i) setIdx(i); }} onClick=${function () { p.onClose(); it.fn(); }}>
              ${it.color ? html`<span class="dot" style=${'background:' + it.color}></span>` : null}<span style=${it.done ? 'text-decoration:line-through;opacity:.6' : ''}>${it.label}</span>${it.sub ? html`<span class="pm">${it.sub}</span>` : null}</button>`];
          }) : html`<div style="padding:22px;font-size:14px;color:var(--muted)">Nothing matches "${q}".</div>`}
        </div>
        <div class="pal-foot"><span>↑ ↓ to move</span><span>Enter to open</span><span>Esc to close</span></div>
      </div></div>`;
  };
})(window.SR);
