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
  SR.applyAccent = function () { var a = SR.getAccent(), r = document.documentElement; if (!a) return; r.style.setProperty('--accent', a); r.style.setProperty('--primary', a); r.style.setProperty('--accentBg', 'color-mix(in srgb,' + a + ' 14%,var(--card))'); };
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
        ${has ? null : html`<button type="button" class="qa2-up" onClick=${function () { fi.current && fi.current.click(); }} title="Upload a .txt or .csv list">Upload</button>`}
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
