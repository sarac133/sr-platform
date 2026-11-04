/* Sarac Ramsay — screens: Home, Clients, Onboarding, ClientPage, Results */
window.SR = window.SR || {};
(function (SR) {
  var html = SR.html, R = React, useState = React.useState;
  var card = 'background:var(--card);border:1px solid var(--border);border-radius:7px';
  var H1 = function (t) { return html`<h1 style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:32px">${t}</h1>`; };
  var label = function (t) { return html`<div style="font-size:11px;letter-spacing:0.12em;font-weight:700;color:var(--muted)">${t}</div>`; };


  /* Notion helpers: contract end, health, simple icons */
  SR.contractEnd = function (c) {
    var A = SR.acct && SR.acct[c.id]; if (A && A.renewal) return A.renewal;
    var st = (A && A.start) || c.start || ''; if (!st) return '';
    var d = new Date(st + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + (parseInt((A && A.term) || c.term) || 3)); return d.toISOString().slice(0, 10);
  };
  SR.daysTo = function (d) { return d ? Math.round((new Date(d + 'T00:00:00Z') - new Date(SR.TODAY + 'T00:00:00Z')) / 86400000) : null; };
  SR.clientHealth = function (c, tasks) {
    var mine = (tasks || []).filter(function (x) { return x.clientId === c.id && !x.done && !x.milestone; });
    var over = mine.filter(function (x) { return x.date && x.date < SR.TODAY; });
    var A = SR.acct && SR.acct[c.id];
    var payOver = A ? A.payments.filter(function (q) { return !q.paid && q.date < SR.TODAY; }).length : 0;
    var end = SR.contractEnd(c), dl = SR.daysTo(end);
    var h = payOver || over.length >= 3 ? 'risk' : (over.length || (dl != null && dl <= 45 && dl >= -3)) ? 'watch' : 'ok';
    return { h: h, over: over.length, payOver: payOver, end: end, dl: dl, next: mine.filter(function (x) { return x.date; }).sort(function (a, b) { return a.date.localeCompare(b.date); })[0] || null, A: A };
  };
  SR.HLAB = { ok: ['On track', 'g'], watch: ['Watch', 'y'], risk: ['At risk', 'r'] };

  /* ---------- HOME ---------- */
  SR.Home = function (p) {
    var mrr = SR.useMrr();
    var who = p.who;
    var hr = React.useRef(null), hw = SR.useWidth(hr), narrow = hw < 980;
    var showDone = false;
    var liveCount = p.clients.length, slots = 14;
    var st0 = p.settling || {};
    var doneCount = p.tasks.filter(function (t) { return t.done; }).length;
    var vws = useState(function () { try { return localStorage.getItem('sr_view') || 'list'; } catch (e) { return 'list'; } }), view = vws[0], setViewS = vws[1];
    var setView = function (v) { setViewS(v); try { localStorage.setItem('sr_view', v); } catch (e) {} };
    var dys = useState('all'), day = dys[0], setDay = dys[1];
    var dps = useState(''), dpick = dps[0], setDpick = dps[1];
    var T0 = SR.TODAY, T1 = SR.addDays(T0, 1), W7 = SR.addDays(T0, 7);
    var dayOk = function (t, k) { var d = t.date || ''; if (k === 'all') return true; if (k === 'over') return !!d && d < T0 && !t.done; if (k === 'today') return d === T0; if (k === 'tom') return d === T1; if (k === 'week') return !!d && d >= T0 && d <= W7; if (k === 'none') return !d; if (k === 'pick') return !dpick || d === dpick; return true; };
    var dayCount = function (k) { return p.tasks.filter(function (t) { return !t.done && dayOk(t, k); }).length; };
    var filtered = p.tasks.filter(function (t) { return (showDone || !t.done || st0[t.id] || t.doneDay === SR.TODAY) && (who === 'all' || who === 'none' || t.owner === who) && dayOk(t, day); });
    var chipCount = function (w) { return p.tasks.filter(function (t) { return !t.done && (w === 'all' || (w === 'none' ? !t.owner : t.owner === w)); }).length; };
    var openTotal = p.tasks.filter(function (t) { return !t.done; }).length;
    var overdueN = p.tasks.filter(function (t) { return !t.done && !t.milestone && t.date && t.date < SR.TODAY; }).length;
    var hs = p.clients.map(function (c) { return { c: c, H: SR.clientHealth(c, p.tasks) }; });
    var renew = hs.filter(function (x) { return x.H.dl != null && x.H.dl >= -3 && x.H.dl <= 90; }).sort(function (a, b) { return a.H.dl - b.H.dl; });
    var attn = [];
    hs.forEach(function (x) { if (x.H.payOver) attn.push({ k: 'r', c: x.c, t: x.c.name + ' has ' + x.H.payOver + ' payment overdue.' }); else if (x.H.over) attn.push({ k: x.H.over >= 3 ? 'r' : 'y', c: x.c, t: x.c.name + ' has ' + x.H.over + ' overdue task' + (x.H.over > 1 ? 's' : '') + '.' }); });
    renew.slice(0, 2).forEach(function (x) { attn.push({ k: 'b', c: x.c, t: x.c.name + ' contract ends in ' + x.H.dl + ' day' + (x.H.dl === 1 ? '' : 's') + '. Plan the renewal.' }); });
    return html`<div ref=${hr} class=${'home' + (narrow ? ' narrow' : '')} style="display:flex;flex-direction:column;gap:20px">
      <div><div style="font-size:14px;color:var(--muted);margin-bottom:6px">${(function () { var n = SR.nowParts(); return n.date + ' · ' + n.time + ' ' + n.zone; })()}</div>${H1((function () { var h = new Date().getHours(); return (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + (p.me ? ', ' + String(p.me).split(' ')[0] : ''); })())}<${SR.Ed} tag="p" id="home.desc" def="" ph="Add a description" style="margin:6px 0 0;font-size:14px;color:var(--muted)" /></div>
      <section style="padding:4px 0">
        <div class="ntabs hd-row" role="tablist" aria-label="View">${[['list', 'List'], ['date', 'By date'], ['people', 'Workload']].map(function (v) { return html`<button key=${v[0]} type="button" role="tab" aria-selected=${view === v[0]} class=${view === v[0] ? 'on' : ''} onClick=${function () { setView(v[0]); }}>${v[1]}</button>`; })}<span class="sp"></span>
          <div class="nfil hd-fil" role="group" aria-label="Filter by person" style="padding-bottom:5px">${[['all', 'Everyone']].concat(SR.TEAM.map(function (n) { return [n, n]; })).map(function (c) { return html`<button key=${c[0]} type="button" class=${'nchip' + (who === c[0] ? ' on' : '')} aria-pressed=${who === c[0]} onClick=${function () { p.setWho(c[0]); }}>${c[1]} <span style="opacity:.55">${chipCount(c[0])}</span></button>`; })}</div>
        </div>
        <div style="height:10px"></div>
        ${view === 'people' ? html`<${SR.Workload} tasks=${filtered} clients=${p.clients} onOpen=${p.onOpen} openId=${p.openId} />` : html`<${SR.TaskList} tasks=${filtered} clients=${p.clients} showClient=${true} selected=${p.sel} flat=${view !== 'date'} dnd=${true}
          onToggle=${p.onToggle} onOpen=${p.onOpen} onSelect=${p.onSelect} onClearSel=${p.onClearSel} onBulk=${p.onBulk}
          newTask=${p.newTask} onNewTask=${p.onNewTask} onAdd=${p.onAdd} qFront=${p.qFront} onQFront=${p.onQFront} qOwner=${p.qOwner} onQOwner=${p.onQOwner} autoOwner=${p.autoOwner} qNeed=${p.qNeed} settling=${p.settling} just=${p.just} openId=${p.openId} />`}
      </section>
      <${SR.Blocks} id="home" />
    </div>`;
  };


  /* ---------- MY TASKS: everything assigned to you, grouped by when ---------- */
  SR.MyTasks = function (p) {
    var sd = useState(false), showDone = sd[0], setShowDone = sd[1];
    var mrf = React.useRef(null); SR.useFlip(mrf, '.task[data-tid]', 'data-tid');
    var cs = useState(function () { try { return JSON.parse(localStorage.getItem('sr_mtc')) || {}; } catch (e) { return {}; } }), shut = cs[0], setShut = cs[1];
    var tog = function (k) { setShut(function (o) { var n = Object.assign({}, o); if (n[k]) delete n[k]; else n[k] = 1; try { localStorage.setItem('sr_mtc', JSON.stringify(n)); } catch (e) {} return n; }); };
    var T0 = SR.TODAY, W7 = SR.addDays(T0, 7), me = p.me;
    var mine = p.tasks.filter(function (t) { return t.owner === me; });
    var open = mine.filter(function (t) { return !t.done || (p.settling || {})[t.id]; });
    var byDate = function (a, b) { return String(a.date || '9999').localeCompare(String(b.date || '9999')); };
    var G = [
      { k: 'over', label: 'Overdue', danger: true, items: open.filter(function (t) { return t.date && t.date < T0; }) },
      { k: 'today', label: 'Today', date: T0, items: open.filter(function (t) { return t.date === T0; }) },
      { k: 'week', label: 'This week', items: open.filter(function (t) { return t.date && t.date > T0 && t.date <= W7; }) },
      { k: 'later', label: 'Later', items: open.filter(function (t) { return !t.date || t.date > W7; }) }
    ];
    var done = mine.filter(function (t) { return t.done && !(p.settling || {})[t.id]; }).sort(function (a, b) { return String(b.doneDay || '').localeCompare(String(a.doneDay || '')); });
    var just = p.just || {}, sel = p.sel || {};
    var row = function (t, date) {
      var c = SR.clientById(p.clients, t.clientId);
      return html`<${SR.TaskRow} key=${t.id} task=${t} selected=${!!sel[t.id]} active=${p.openId === t.id} just=${!!just[t.id]} showClient=${true} clientColor=${c.color} clientName=${c.name} dnd=${true} dropDate=${date} onToggle=${p.onToggle} onOpen=${p.onOpen} onSelect=${p.onSelect} />`;
    };
    var openCount = open.filter(function (t) { return !t.done; }).length;
    return html`<div ref=${mrf} style="display:flex;flex-direction:column;gap:6px">
      <div><div style="font-size:13px;color:var(--muted)">Assigned to ${me}</div>${H1('My tasks')}</div>
      <${SR.QuickAdd} value=${p.newTask} onChange=${p.onNewTask} onAdd=${p.onAdd} front=${p.qFront} onFront=${p.onQFront} owner=${p.qOwner} onOwner=${p.onQOwner} autoOwner=${me} need=${p.qNeed} clients=${p.clients} placeholder="+ Add a task for yourself, or paste a list" />
      <section style=${card + ';padding:20px 22px'}>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="font-size:14px;color:var(--muted)">${openCount} open across ${new Set(open.map(function (t) { return t.clientId; })).size} clients</div>
        </div>
        ${G.map(function (g) {
          if (!g.items.length && g.k !== 'today') return null;
          var items = g.items.slice().sort(byDate);
          return html`<div key=${g.k} class="mt-grp dgroup" onDragOver=${g.date ? function (e) { if (SR._drag != null) e.preventDefault(); } : null}
            onDrop=${g.date ? function (e) { e.preventDefault(); var id = SR._drag; SR._drag = null; if (id != null) SR.dnd.dropOnDay(id, g.date); } : null}>
            <h3 role="button" tabindex="0" aria-expanded=${shut[g.k] ? 'false' : 'true'} style=${'cursor:pointer;padding-bottom:6px;border-bottom:1px solid var(--border);color:' + (g.danger ? 'var(--red)' : 'var(--text)')} onClick=${function () { tog(g.k); }} onKeyDown=${function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(g.k); } }}><span class="chv" style="color:var(--muted)">${shut[g.k] ? '▸' : '▾'}</span>${g.label}<span>${items.length}</span></h3>
            ${shut[g.k] ? null : items.length ? items.map(function (t) { return row(t, g.date); }) : html`<div style="font-size:13px;color:var(--muted);padding:8px 2px">Nothing due today.</div>`}
          </div>`;
        })}
        <div class="mt-grp">
          <h3 style="padding-bottom:6px;border-bottom:1px solid var(--border)">Done<span>${done.length}</span>${done.length ? html`<button type="button" class="edbtn" style="margin-left:auto" onClick=${function () { setShowDone(!showDone); }}>${showDone ? 'Hide' : 'Show'}</button>` : null}</h3>
          ${showDone ? done.slice(0, 100).map(function (t) { return row(t); }) : null}
        </div>
      </section>
    </div>`;
  };

  /* ---------- CALENDAR: week / day / month, tasks as all-day items, timed events, team on the right ---------- */
  SR.personColor = function (n) { var pf = n && SR.PROFILES && SR.PROFILES[n]; if (pf && pf.color) return pf.color; var P = ['#4C7BD9', '#D9A441', '#3FA46A', '#B25AA6', '#D26363', '#3E9BB0']; if (!n) return '#8A94A6'; return P[n === 'Josh' ? 0 : n === 'Matt' ? 1 : 2 + (n.charCodeAt(0) + n.length) % 4]; };
  SR.parseICS = function (txt) {
    var raw = txt.replace(/\r?\n[ \t]/g, '').split(/\r?\n/), out = [], cur = null;
    var conv = function (v, utc) {
      var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(v); if (!m) return null;
      if (!m[4]) return { date: m[1] + '-' + m[2] + '-' + m[3], time: '', allDay: true };
      if (!utc) return { date: m[1] + '-' + m[2] + '-' + m[3], time: m[4] + ':' + m[5] };
      var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
      var P = {}; new Intl.DateTimeFormat('en-CA', { timeZone: SR.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).forEach(function (x) { P[x.type] = x.value; });
      return { date: P.year + '-' + P.month + '-' + P.day, time: P.hour + ':' + P.minute };
    };
    raw.forEach(function (l) {
      if (l === 'BEGIN:VEVENT') cur = {}; else if (l === 'END:VEVENT') { if (cur && cur.s) out.push(cur); cur = null; }
      else if (cur) { var k = l.indexOf(':'); if (k < 0) return; var key = l.slice(0, k), val = l.slice(k + 1), name = key.split(';')[0];
        if (name === 'SUMMARY') cur.title = val.replace(/\\,/g, ',').replace(/\\n/g, ' ');
        else if (name === 'DTSTART') cur.s = conv(val, /Z$/.test(val)); else if (name === 'DTEND') cur.e = conv(val, /Z$/.test(val)); }
    });
    return out.map(function (x, i) { return { id: 'ics' + Date.now() + i, title: x.title || 'Event', date: x.s.date, start: x.s.time || '', end: x.e && !x.e.allDay && x.e.date === x.s.date ? x.e.time : '', allDay: !!x.s.allDay, who: '' }; });
  };
  SR.CalendarPage = function (p) {
    var T0 = SR.TODAY, me = p.me, MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var ms = useState(function () { return SR.jget('sr_calmode', 'week'); }), mode = ms[0], setModeS = ms[1];
    var setMode = function (m) { setModeS(m); SR.jset('sr_calmode', m); };
    var rs = useState(function () { return SR.jget('sr_calrail', true) !== false; }), railOpen = rs[0], setRailS = rs[1];
    var ls = useState(function () { return SR.jget('sr_calleft', true) !== false; }), leftOpen = ls[0], setLeftS = ls[1];
    var setLeft = function (v) { setLeftS(v); try { SR.jset('sr_calleft', v); } catch (e) {} };
    var setRail = function (v) { setRailS(v); SR.jset('sr_calrail', v); };
    var as = useState(T0), anchor = as[0], setAnchor = as[1];
    var vs = useState(function () { return SR.jget('sr_calvis', null); }), visSaved = vs[0], setVisSaved = vs[1];
    var shs = useState(function () { return SR.jget('sr_calshowdone', false); }), showDone = shs[0], setShowDone = shs[1];
    var fs = useState(null), form = fs[0], setForm = fs[1];
    var gs = useState(null), ghost = gs[0], setGhost = gs[1];
    var pps = useState(null), pop = pps[0], setPop = pps[1];
    var mus = useState(false), moreU = mus[0], setMoreU = mus[1];
    var qs = useState(''), tq = qs[0], setTq = qs[1];
    var ns = useState(''), nt = ns[0], setNt = ns[1];
    var addOpen = useState(false), adding = addOpen[0], setAdding = addOpen[1];
    var bodyRef = R.useRef(null), scrollRef = R.useRef(null), fileRef = R.useRef(null);
    var events = p.events, setEvents = p.setEvents, gacc = p.gacc, tasks = p.tasks, clients = p.clients;
    var people = SR.TEAM.slice(), visible = {};
    people.forEach(function (n) { visible[n] = visSaved ? !!visSaved[n] : n === me; }); visible[''] = true;
    var toggleVis = function (n) { var o = {}; people.forEach(function (x) { o[x] = visible[x]; }); o[n] = !o[n]; setVisSaved(o); SR.jset('sr_calvis', o); };
    var H0 = 6, H1 = 22, HH = 52;
    var dow = function (d) { return (new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7; };
    var mondayOf = function (d) { return SR.addDays(d, -dow(d)); };
    var ymd = function (d) { var a = d.split('-'); return { y: +a[0], m: +a[1], d: +a[2] }; };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var days, title, q0 = ymd(anchor);
    if (mode === 'day') { days = [anchor]; title = DN[dow(anchor)] + ' ' + q0.d + ' ' + MN[q0.m - 1].slice(0, 3) + ' ' + q0.y; }
    else if (mode === 'week') { var m0 = mondayOf(anchor); days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return SR.addDays(m0, i); }); var a = ymd(days[0]), b = ymd(days[6]); title = (a.m === b.m ? MN[a.m - 1].slice(0, 3) : MN[a.m - 1].slice(0, 3) + ' to ' + MN[b.m - 1].slice(0, 3)) + ' ' + b.y; }
    else { var g0 = mondayOf(q0.y + '-' + pad(q0.m) + '-01'); days = []; for (var i = 0; i < 42; i++) days.push(SR.addDays(g0, i)); title = MN[q0.m - 1].slice(0, 3) + ' ' + q0.y; }
    var step = function (n) { if (mode === 'month') { var mm = q0.m - 1 + n, yy = q0.y + Math.floor(mm / 12); mm = ((mm % 12) + 12) % 12; setAnchor(yy + '-' + pad(mm + 1) + '-01'); } else setAnchor(SR.addDays(anchor, n * (mode === 'week' ? 7 : 1))); };
    var cl = function (id) { return SR.clientById(clients, id); };
    var tmin = SR.mins;
    var taskVisible = function (t) { return t.owner ? !!visible[t.owner] : !!visible[me]; };
    var evVisible = function (e) { return !e.who || !!visible[e.who]; };

    /* everything that sits on the grid on one day: task blocks and events, with side by side lanes when they overlap */
    var itemsOn = function (d) {
      var out = [];
      tasks.forEach(function (t) { if (!taskVisible(t) || (t.done && !showDone && t.doneDay !== SR.TODAY && !(p.justDone && p.justDone[t.id]))) return; SR.blocks(t).forEach(function (b) { if (b.date !== d) return; if (b.done && !showDone) return; out.push({ kind: 'task', id: t.id, i: b.i, t: t, b: b, s: tmin(b.time), e: tmin(b.time) + b.min }); }); });
      events.forEach(function (e) { if (e.date !== d || !evVisible(e) || e.allDay || !e.start) return; var s = tmin(e.start), en = e.end ? tmin(e.end) : s + 60; out.push({ kind: 'ev', id: e.id, ev: e, s: s, e: Math.max(en, s + 15) }); });
      out.sort(function (x, y) { return x.s - y.s || y.e - x.e; });
      var lanes = [], cluster = [], cEnd = -1;
      var close = function () { var n = lanes.length || 1; cluster.forEach(function (it) { it.n = n; }); lanes = []; cluster = []; };
      out.forEach(function (it) { if (it.s >= cEnd && cluster.length) { close(); } var l = 0; while (lanes[l] != null && lanes[l] > it.s) l++; lanes[l] = it.e; it.l = l; cluster.push(it); cEnd = Math.max(cEnd < 0 ? 0 : cEnd, it.e); });
      close(); return out;
    };
    var alldayOn = function (d) { return events.filter(function (e) { return e.date === d && evVisible(e) && (e.allDay || !e.start); }); };
    var lateInfo = function (t) { if (t.done || !t.deadline) return null; var bs = SR.blocks(t).filter(function (b) { return !b.done; }); var last = bs.length ? bs.map(function (b) { return b.date; }).sort().pop() : t.date; if (last && last > t.deadline) return Math.round((new Date(last) - new Date(t.deadline)) / 86400000); return null; };

    var openPop = function (e, ev) { var w = window.innerWidth, h = window.innerHeight; setPop({ ev: ev, x: Math.max(8, Math.min(e.clientX + 8, w - 396)), y: Math.max(8, Math.min(e.clientY - 20, h - 340)) }); };
    R.useEffect(function () { if (!pop) return; var k = function (e) { if (e.key === 'Escape') setPop(null); }; document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, [!!pop]);
    var patchEv = function (id, o) { setEvents(function (es) { return es.map(function (x) { return x.id === id ? Object.assign({}, x, o) : x; }); }); };
    var colAt = function (x, y) {
      var cs = bodyRef.current ? bodyRef.current.querySelectorAll('.cal-col') : [], hit = -1, k;
      for (k = 0; k < cs.length; k++) { var r0 = cs[k].getBoundingClientRect(); if (x >= r0.left && x < r0.right) hit = k; }
      if (hit < 0) hit = cs.length && x < cs[0].getBoundingClientRect().left ? 0 : cs.length - 1; if (hit < 0) return { date: days[0], min: 0 };
      var r = cs[hit].getBoundingClientRect(); return { date: days[hit], min: Math.round(((y - r.top) / HH * 60 + H0 * 60) / 15) * 15 };
    };
    var track = function (e, onMove, onUp) {
      var x0 = e.clientX, y0 = e.clientY, moved = false;
      var mv = function (ev) { if (!moved && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 5) return; moved = true; onMove(ev); };
      var up = function (ev) { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); setGhost(null); onUp(ev, moved); };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    };
    var press = function (e, it, mode2) {
      if (e.button !== 0) return; e.stopPropagation(); e.preventDefault();
      var s0 = it.s, du0 = it.e - it.s, date0 = it.kind === 'ev' ? it.ev.date : it.b.date, grab = colAt(e.clientX, e.clientY).min - s0, cur = null;
      var label = it.kind === 'ev' ? it.ev.title : it.t.name, color = it.kind === 'ev' ? (it.ev.color || SR.personColor(it.ev.who)) : cl(it.t.clientId).color;
      track(e, function (ev) {
        var q = colAt(ev.clientX, ev.clientY);
        if (mode2 === 'move') { var st = Math.max(H0 * 60, Math.min(q.min - grab, H1 * 60 - 15)); cur = { date: q.date, start: st, end: st + du0 }; }
        else cur = { date: date0, start: s0, end: Math.max(s0 + 15, Math.min(q.min, H1 * 60)) };
        setGhost({ date: cur.date, start: cur.start, end: cur.end, title: label, color: color });
      }, function (ev, moved) {
        if (!moved) { if (it.kind === 'ev') openPop(ev, it.ev); else p.onOpen(it.id); return; }
        var el = document.elementFromPoint(ev.clientX, ev.clientY), ad = el && el.closest ? el.closest('.cal-ad') : null;
        if (ad && mode2 === 'move' && it.kind === 'ev') { patchEv(it.id, { date: ad.getAttribute('data-date'), start: '', end: '', allDay: true }); return; }
        if (!cur) return;
        if (it.kind === 'ev') patchEv(it.id, { date: cur.date, start: SR.hm(cur.start), end: SR.hm(Math.min(cur.end, 1439)), allDay: false });
        else p.onPatch(it.id, SR.blockPatch(it.t, it.b.i, { date: cur.date, time: SR.hm(cur.start), min: cur.end - cur.start }));
      });
    };
    var pressNew = function (e, d) {
      if (e.button !== 0 || (e.target.closest && e.target.closest('.cal-tev'))) return;
      var a = colAt(e.clientX, e.clientY).min, a0 = Math.floor(a / 60) * 60, cur = null;
      track(e, function (ev) { var q = colAt(ev.clientX, ev.clientY), lo = Math.min(a, q.min), hi = Math.max(a, q.min); if (hi - lo < 15) hi = lo + 15; cur = { start: Math.max(lo, H0 * 60), end: Math.min(hi, H1 * 60) }; setGhost({ date: d, start: cur.start, end: cur.end, title: '(new event)', color: SR.personColor(me) }); },
        function (ev, moved) { var st = moved && cur ? cur.start : a0, en = moved && cur ? cur.end : a0 + 60; setForm({ id: '', title: '', date: d, start: SR.hm(Math.max(H0 * 60, Math.min(st, H1 * 60 - 15))), end: SR.hm(Math.min(en, H1 * 60)), who: me }); });
    };
    var submit = function () { if (!form.title.trim()) return; var ad = !!form.allDay || !form.start; var ev = { id: form.id || 'e' + Date.now(), title: form.title.trim(), date: form.date, start: ad ? '' : form.start, end: ad ? '' : form.end, allDay: ad, who: form.who, desc: form.desc || '', loc: form.loc || '', rem: form.rem == null ? '' : form.rem, gcolor: form.gcolor || '', color: form.color || '' }; setEvents(function (es) { return form.id ? es.map(function (x) { return x.id === form.id ? Object.assign({}, x, ev) : x; }) : es.concat([ev]); }); setForm(null); };
    var delEv = function (ev) { var prev = events; setEvents(function (es) { return es.filter(function (x) { return x.id !== ev.id; }); }); SR.toast('Event deleted', function () { setEvents(prev); }); };
    var evMenu = function (e, ev) { e.preventDefault(); e.stopPropagation(); SR.openMenu(e, [{ label: 'Edit event', fn: function () { setForm(Object.assign({}, ev)); } }, { sep: true }, { label: 'Delete event', danger: true, fn: function () { delEv(ev); } }]); };
    var onFile = function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var add = SR.parseICS(String(r.result)).map(function (x) { x.who = me; return x; }); setEvents(function (es) { return es.concat(add); }); if (add[0]) setAnchor(add[0].date); SR.toast(add.length + (add.length === 1 ? ' event imported' : ' events imported')); }; r.readAsText(f); e.target.value = ''; };
    var done = function (it) { if (it.t.slots && it.t.slots.length && !it.b.done) p.onPatch(it.id, SR.logTime(it.t, it.b.min)); else p.onToggle(it.id); };
    var taskDragged = function (dg) { if (typeof dg !== 'string' || dg.indexOf('task:') !== 0) return null; var id = dg.slice(5); return tasks.filter(function (x) { return String(x.id) === id; })[0] || null; };
    var dropDay = function (e, d) { e.preventDefault(); var dg = SR._drag; SR._drag = null; setGhost(null); if (typeof dg === 'string' && dg.indexOf('ev:') === 0) patchEv(dg.slice(3), { date: d }); var tk = taskDragged(dg); if (tk) { p.onPatch(tk.id, { date: d, time: tk.time || '09:00', owner: tk.owner || me, auto: false }); SR.toast && SR.toast('Scheduled "' + tk.name + '" on ' + d); } };
    var durOf = function (t) { return Math.max(15, SR.remaining(t) || SR.estOf(t)); };
    var colOver = function (e, d) { var tk = taskDragged(SR._drag); if (!tk) return; e.preventDefault(); var q = colAt(e.clientX, e.clientY), st = Math.max(H0 * 60, Math.min(q.min, H1 * 60 - 15)), du = durOf(tk); if (!ghost || ghost.date !== d || ghost.start !== st) setGhost({ date: d, start: st, end: Math.min(st + du, H1 * 60), title: tk.name, color: cl(tk.clientId).color }); };
    var colDrop = function (e, d) { var dg = SR._drag, tk = taskDragged(dg); if (!tk) return; e.preventDefault(); SR._drag = null; var q = colAt(e.clientX, e.clientY), st = Math.max(H0 * 60, Math.min(q.min, H1 * 60 - 15)); setGhost(null); p.onPatch(tk.id, { date: d, time: SR.hm(st), owner: tk.owner || me, auto: false }); SR.toast && SR.toast('Scheduled "' + tk.name + '" at ' + SR.hm(st)); };
    var scrollTo = function () { if (scrollRef.current) { var nowM = tmin(SR.nowParts().time); scrollRef.current.scrollTop = Math.max(0, ((Math.min(Math.max(nowM, 8 * 60), 18 * 60) - 90) - H0 * 60) / 60 * HH); } };
    R.useEffect(scrollTo, [mode]);

    /* right panel: upcoming scheduled work for the people ticked on the left */
    var mine = tasks.filter(function (t) { return !t.done && taskVisible(t); });
    var late = mine.filter(function (t) { return lateInfo(t) != null; });
    var upcoming = {}; mine.forEach(function (t) { SR.blocks(t).forEach(function (b) { if (b.done || b.date < T0) return; (upcoming[b.date] = upcoming[b.date] || []).push({ t: t, b: b }); }); });
    var upDays = Object.keys(upcoming).sort().slice(0, 7);
    var unsched = mine.filter(function (t) { return !SR.blocks(t).length; });
    var shownPeople = people.filter(function (n) { return !tq || n.toLowerCase().indexOf(tq.toLowerCase()) >= 0; });
    var dayLabel = function (d) { var q = ymd(d); return [q.d + ' ' + MN[q.m - 1].slice(0, 3), d === T0 ? 'TODAY' : DN[dow(d)].toUpperCase()]; };
    var mini = (function () { var f = q0.y + '-' + pad(q0.m) + '-01', g = mondayOf(f), arr = []; for (var k = 0; k < 42; k++) arr.push(SR.addDays(g, k)); return arr; })();
    var nowTop = (function () { var m = tmin(SR.nowParts().time); return m >= H0 * 60 && m < H1 * 60 ? (m - H0 * 60) / 60 * HH : -1; })();
    var addNew = function (e) { e.preventDefault(); if (!nt.trim()) return; p.onAddTask(nt.trim()); setNt(''); setAdding(false); };
    var blockHtml = function (it) {
      var top = (it.s - H0 * 60) / 60 * HH, h = Math.max(24, (it.e - it.s) / 60 * HH - 2), w = 100 / it.n, lft = it.l * w;
      var pos = 'top:' + top + 'px;height:' + h + 'px;left:calc(' + lft + '% + 2px);width:calc(' + w + '% - 6px);';
      if (it.kind === 'ev') { var col = it.ev.color || SR.personColor(it.ev.who); return html`<div key=${'e' + it.id} class="cal-tev ev" style=${pos + 'background:' + col + '26;border-left:3px solid ' + col} onMouseDown=${function (e) { press(e, it, 'move'); }} onContextMenu=${function (e) { evMenu(e, it.ev); }}><b>${it.ev.title}</b><span>${it.ev.start}${it.ev.end ? ' - ' + it.ev.end : ''}</span><i class="cal-rz" onMouseDown=${function (e) { press(e, it, 'resize'); }}></i></div>`; }
      var t = it.t, c = cl(t.clientId), n = (t.slots || []).length, dn = it.b.done || t.done, lt = lateInfo(t), pr = t.spent ? SR.pct(t) : 0;
      return html`<div key=${'t' + t.id + '_' + it.b.i} class=${'cal-tev tk' + (dn ? ' dn' : '') + (h < 40 ? ' short' : '')} title=${t.name} style=${pos + 'border-left:3px solid ' + c.color} onMouseDown=${function (e) { press(e, it, 'move'); }} onContextMenu=${function (e) { e.preventDefault(); e.stopPropagation(); if (SR.taskMenu) SR.taskMenu(e, t); }}>
        <button type="button" class=${'tk-cb' + (dn ? ' on' : '')} aria-label="Mark done" onMouseDown=${function (e) { e.stopPropagation(); }} onClick=${function (e) { e.stopPropagation(); done(it); }}>${dn ? '✓' : ''}</button>
        <div class="tk-t"><b>${t.name}${n > 1 ? ' (part ' + (it.b.i + 1) + '/' + n + ')' : ''}${lt ? html`<em class="tk-late" title=${'Scheduled ' + lt + ' days after the deadline'}>!</em>` : null}</b><span>${it.b.time} - ${SR.hm(it.e)}${SR.TEAM.length > 1 && t.owner && visible[me] && Object.keys(visible).filter(function (k) { return k && visible[k]; }).length > 1 ? ' · ' + t.owner : ''}</span></div>
        ${pr ? html`<div class="tk-pr" style=${'width:' + pr + '%'}></div>` : null}<i class="cal-rz" onMouseDown=${function (e) { press(e, it, 'resize'); }}></i></div>`;
    };
    var modeSel = html`<div class="cal-seg" role="tablist" aria-label="Calendar view">${[['day', 'Day'], ['week', 'Week'], ['month', 'Month']].map(function (m) { return html`<button key=${m[0]} type="button" role="tab" aria-selected=${mode === m[0]} class=${mode === m[0] ? 'on' : ''} onClick=${function () { setMode(m[0]); }}>${m[1]}</button>`; })}</div>`;
    var anyAllday = days.some(function (d) { return alldayOn(d).length; });
    return html`<div class=${"cpg" + (p.drawerOpen || !railOpen ? " nor" : "") + (leftOpen ? "" : " nol")}>
      ${leftOpen ? html`<aside class="cp-l">
        <div class="cal-mini"><div class="cp-mh"><button type="button" class="cp-ar" aria-label="Previous month" onClick=${function () { var mm = q0.m - 2, yy = q0.y + Math.floor(mm / 12); mm = ((mm % 12) + 12) % 12; setAnchor(yy + '-' + pad(mm + 1) + '-01'); }}>‹</button><b>${MN[q0.m - 1] + ' ' + q0.y}</b><button type="button" class="cp-ar" aria-label="Next month" onClick=${function () { var mm = q0.m, yy = q0.y + Math.floor(mm / 12); mm = mm % 12; setAnchor(yy + '-' + pad(mm + 1) + '-01'); }}>›</button></div>
          <div class="cal-mg">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (d, k) { return html`<span key=${k} class="mdw">${d}</span>`; })}
            ${mini.map(function (d) { return html`<button key=${d} type="button" class=${'md' + (d === T0 ? ' today' : '') + (days.indexOf(d) >= 0 && mode !== 'month' ? ' sel' : '') + (ymd(d).m !== q0.m ? ' out' : '')} onClick=${function () { setAnchor(d); }}>${ymd(d).d}</button>`; })}</div></div>
        <input class="cp-search" placeholder="Search teammates" aria-label="Search teammates" value=${tq} onInput=${function (e) { setTq(e.target.value); }} />
        <div class="cp-h">My calendars</div>
        ${shownPeople.map(function (n) { var pf = SR.PROFILES[n], g = pf ? (n === me ? gacc : (SR.GACCS || {})[pf.user_id]) : null, cloud = SR.store.mode === 'cloud';
          return html`<label key=${n} class="cp-person"><input type="checkbox" checked=${!!visible[n]} onChange=${function () { toggleVis(n); }} style=${'accent-color:' + SR.personColor(n)} />${SR.Avatar(n, 22)}<span class="cp-pn"><b>${n}${n === me ? ' (you)' : ''}</b>${cloud ? html`<em class=${'cp-gs' + (g ? ' on' : '')}>${g ? 'Google · ' + (g.google_email || 'connected') : 'Google not connected'}</em>` : null}</span></label>`; })}
        ${shownPeople.length ? null : html`<div class="cal-note">No one matches.</div>`}
        <div class="cp-h">Accounts</div>
        <div class="cal-note">Google Calendar sync is paused. Events and tasks stay in this calendar only. You can import a Google .ics file below.</div>
        <input ref=${fileRef} type="file" accept=".ics,text/calendar" style="display:none" onChange=${onFile} /><button type="button" class="edbtn" style="margin-top:8px" onClick=${function () { fileRef.current && fileRef.current.click(); }}>Import .ics file</button>
      </aside>` : null}
      <section class="cp-c">
        <div class="cal-bar"><button type="button" class="edbtn" onClick=${function () { setAnchor(T0); setTimeout(scrollTo, 0); }}>Today</button>
          <button type="button" class="cal-arrow" aria-label="Previous" onClick=${function () { step(-1); }}>‹</button><button type="button" class="cal-arrow" aria-label="Next" onClick=${function () { step(1); }}>›</button>
          <h3 class="cal-title">${title}</h3>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center"><button type="button" class="cal-arrow" aria-label="Search" title="Search (Ctrl K)" onClick=${function () { SR.openPalette && SR.openPalette(); }}>⌕</button><button type="button" class="cal-arrow" aria-label="New event" title="New event" onClick=${function () { setForm({ id: '', title: '', date: anchor, start: '09:00', end: '10:00', who: me }); }}>+</button>${modeSel}<button type="button" class=${'nchip' + (leftOpen ? ' on' : '')} aria-pressed=${leftOpen} title=${leftOpen ? 'Tuck the calendar list away' : 'Show the calendar list'} onClick=${function () { setLeft(!leftOpen); }}>${leftOpen ? 'Hide calendars' : 'Show calendars'}</button>${p.drawerOpen ? null : html`<button type="button" class=${'nchip' + (railOpen ? ' on' : '')} aria-pressed=${railOpen} title=${railOpen ? 'Tuck the task list away' : 'Show the task list'} onClick=${function () { setRail(!railOpen); }}>${railOpen ? 'Hide tasks' : 'Show tasks'}</button>`}</div></div>
        ${mode === 'month' ? html`<div class="cal-month">${DN.map(function (d) { return html`<div key=${d} class="cal-dow">${d}</div>`; })}
          ${days.map(function (d) { var q5 = ymd(d), its = itemsOn(d).map(function (x) { return x; }).concat(alldayOn(d).map(function (e) { return { kind: 'ev', ev: e, id: e.id, allday: true }; }));
            return html`<div key=${d} class=${'cal-cell' + (q5.m !== q0.m ? ' out' : '') + (d === T0 ? ' today' : '')} onClick=${function () { setForm({ id: '', title: '', date: d, start: '', end: '', who: me }); }} onDragOver=${function (e) { e.preventDefault(); }} onDrop=${function (e) { dropDay(e, d); }}>
              <div class="cal-dn"><span>${q5.d}</span></div>
              ${its.slice(0, 4).map(function (x) { if (x.kind === 'ev') { var col = x.ev.color || SR.personColor(x.ev.who); return html`<div key=${'e' + x.id} class="cal-ev" draggable="true" onDragStart=${function (e) { SR._drag = 'ev:' + x.id; try { e.dataTransfer.setData('text/plain', x.id); } catch (z) {} }} style=${'background:' + col + '26;border-left:3px solid ' + col} onClick=${function (e) { e.stopPropagation(); openPop(e, x.ev); }} onContextMenu=${function (e) { evMenu(e, x.ev); }}><b>${x.ev.start ? x.ev.start + ' ' : ''}</b>${x.ev.title}</div>`; }
                return html`<div key=${'t' + x.id + x.b.i} class=${'cal-task' + (x.t.done ? ' dn' : '')} style=${'background:' + cl(x.t.clientId).color} onClick=${function (e) { e.stopPropagation(); p.onOpen(x.id); }}>${x.t.name}</div>`; })}
              ${its.length > 4 ? html`<div class="cal-more" onClick=${function (e) { e.stopPropagation(); setAnchor(d); setMode('day'); }}>+${its.length - 4} more</div>` : null}</div>`; })}</div>`
        : html`<div class="cal-week" style=${'--cols:' + days.length}>
          <div class="cal-head"><div class="cal-gut cal-tz">${SR.nowParts().zone}</div>${days.map(function (d) { var q6 = ymd(d); return html`<div key=${d} class=${'cal-hd' + (d === T0 ? ' today' : '')}><span>${DN[dow(d)]}</span><b>${q6.d}</b></div>`; })}</div>
          ${anyAllday ? html`<div class="cal-allday"><div class="cal-gut">All day</div>${days.map(function (d) { return html`<div key=${d} data-date=${d} class="cal-ad" onDragOver=${function (e) { e.preventDefault(); }} onDrop=${function (e) { dropDay(e, d); }}>${alldayOn(d).map(function (e) { var col = e.color || SR.personColor(e.who); return html`<div key=${e.id} class="cal-ev" style=${'background:' + col + '26;border-left:3px solid ' + col} onClick=${function (x) { openPop(x, e); }} onContextMenu=${function (x) { evMenu(x, e); }}>${e.title}</div>`; })}</div>`; })}</div>` : html`<div class="cal-allday thin"><div class="cal-gut"></div>${days.map(function (d) { return html`<div key=${d} data-date=${d} class="cal-ad" onDragOver=${function (e) { e.preventDefault(); }} onDrop=${function (e) { dropDay(e, d); }}></div>`; })}</div>`}
          <div class="cal-scroll" ref=${scrollRef}><div class="cal-body" ref=${bodyRef} style=${'height:' + (H1 - H0) * HH + 'px'}>
            <div class="cal-gut cal-hours">${Array.from({ length: H1 - H0 }, function (_, k) { var h = H0 + k; return html`<div key=${k} style=${'height:' + HH + 'px'}><span>${h === 12 ? '12 PM' : h > 12 ? (h - 12) + ' PM' : h + ' AM'}</span></div>`; })}</div>
            ${days.map(function (d) { return html`<div key=${d} data-date=${d} class=${'cal-col' + (d === T0 ? ' today' : '')} onMouseDown=${function (e) { pressNew(e, d); }} onDragOver=${function (e) { colOver(e, d); }} onDrop=${function (e) { colDrop(e, d); }}>
              ${Array.from({ length: H1 - H0 }, function (_, k) { return html`<div key=${k} class="cal-slot" style=${'height:' + HH + 'px'}></div>`; })}
              ${itemsOn(d).map(blockHtml)}
              ${ghost && ghost.date === d ? html`<div class="cal-tev cal-ghost" style=${'top:' + (ghost.start - H0 * 60) / 60 * HH + 'px;height:' + Math.max(24, (ghost.end - ghost.start) / 60 * HH - 2) + 'px;background:' + ghost.color + ';left:2px;right:6px'}><b>${ghost.title}</b><span>${SR.hm(ghost.start)} - ${SR.hm(ghost.end)}</span></div>` : null}
              ${d === T0 && nowTop >= 0 ? html`<div class="cal-now" style=${'top:' + nowTop + 'px'}></div>` : null}</div>`; })}
          </div></div></div>`}
        <label class="cp-foot"><input type="checkbox" checked=${showDone} onChange=${function (e) { setShowDone(e.target.checked); SR.jset('sr_calshowdone', e.target.checked); }} /> Show completed tasks</label>
      </section>
      ${p.drawerOpen ? null : !railOpen ? html`<button type="button" class="cp-tab" aria-label="Show the task list" title="Show the task list" onClick=${function () { setRail(true); }}>‹ Tasks</button>` : html`<aside class="cp-r">
        <button type="button" class="cp-min" aria-label="Minimise the task list" title="Minimise the task list" onClick=${function () { setRail(false); }}>Minimise ›</button>
        ${adding ? html`<form onSubmit=${addNew}><input class="cal-in" autofocus placeholder="Task name, then Enter. It is scheduled for you." value=${nt} onInput=${function (e) { setNt(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Escape') setAdding(false); }} /></form>` : html`<button type="button" class="cp-add" onClick=${function () { setAdding(true); }}>+ Add task</button>`}
        ${late.length ? html`<div class="cp-warn"><div><b>${late.length}</b> task${late.length > 1 ? 's' : ''} scheduled past deadline</div><button type="button" onClick=${function () { p.onSchedule(late.map(function (t) { return t.id; }), 'Resolved'); }}>Resolve</button></div>` : null}
        <div class="cp-list">
          ${upDays.length ? upDays.map(function (d) { var lb = dayLabel(d); return html`<div key=${d}><div class="cp-day"><b>${lb[0]}</b><span>${lb[1]}</span></div>
            ${upcoming[d].sort(function (x, y) { return x.b.time < y.b.time ? -1 : 1; }).map(function (x) { var t = x.t, lt = lateInfo(t), n = (t.slots || []).length; return html`<div key=${t.id + '_' + x.b.i} class="cp-it" onClick=${function () { p.onOpen(t.id); }} onContextMenu=${function (e) { if (SR.taskMenu) SR.taskMenu(e, t); }}>
              <button type="button" class="tk-cb" aria-label="Mark done" onClick=${function (e) { e.stopPropagation(); done({ t: t, b: x.b, id: t.id }); }}></button>
              <div class="cp-tx"><b>${t.name}${n > 1 ? ' (part ' + (x.b.i + 1) + '/' + n + ')' : ''}</b><span>${x.b.time} - ${SR.hm(tmin(x.b.time) + x.b.min)} · ${SR.dur(x.b.min)}${t.spent ? ' · ' + SR.dur(t.spent) + ' of ' + SR.dur(SR.estOf(t)) + ' done' : ''}</span></div>
              ${lt ? html`<em class="cp-lt">+${lt}d</em>` : null}</div>`; })}</div>`; }) : html`<div class="cal-note" style="padding:12px 4px">Nothing scheduled. Add a task, or press Refresh to schedule your open tasks.</div>`}
          ${unsched.length ? html`<div><div class="cp-day"><b>Not scheduled</b><span>${unsched.length}</span></div>${unsched.slice(0, moreU ? 400 : 12).map(function (t) { return html`<div key=${t.id} class="cp-it" draggable="true" title="Drag onto the calendar to schedule" onDragStart=${function (e) { SR._drag = 'task:' + t.id; try { e.dataTransfer.setData('text/plain', String(t.id)); e.dataTransfer.effectAllowed = 'move'; } catch (z) {} var end = function () { SR._drag = null; setGhost(null); e.currentTarget && e.currentTarget.removeEventListener('dragend', end); }; e.currentTarget.addEventListener('dragend', end); }} onClick=${function () { p.onOpen(t.id); }}><button type="button" class="tk-cb" aria-label="Mark done" onClick=${function (e) { e.stopPropagation(); p.onToggle(t.id); }}></button><div class="cp-tx"><b>${t.name}</b><span>${SR.dur(SR.estOf(t))}${t.deadline ? ' · due ' + SR.fmtDeadline(t.deadline) : ''}</span></div></div>`; })}${unsched.length > 12 ? html`<button type="button" class="edbtn" style="margin:6px 0" onClick=${function () { setMoreU(!moreU); }}>${moreU ? 'Show fewer' : 'Show all ' + unsched.length}</button>` : null}</div>` : null}
        </div>
        <button type="button" class="cp-refresh" onClick=${function () { p.onSchedule(true, 'Refreshed'); }}>Refresh all tasks</button>
      </aside>`}
      ${pop ? (function () { var ev = pop.ev, dt = new Date(ev.date + 'T00:00:00Z'), dl = DN[dow(ev.date)] + ', ' + MN[dt.getUTCMonth()] + ' ' + dt.getUTCDate(), tm = ev.allDay || !ev.start ? 'All day' : ev.start + (ev.end ? ' – ' + ev.end : ''), col = ev.color || SR.personColor(ev.who);
        var rl = ev.rem === 'none' ? 'No reminder' : (ev.rem !== '' && ev.rem != null && !isNaN(+ev.rem)) ? (+ev.rem >= 60 && +ev.rem % 60 === 0 ? (+ev.rem / 60) + (+ev.rem === 60 ? ' hour' : ' hours') : ev.rem + ' minutes') + ' before' : '';
        var line = function (ic, body) { return html`<div class="evp-l">${SR.Icon(ic, 16)}<div>${body}</div></div>`; };
        return html`<div class="evp-bg" onMouseDown=${function () { setPop(null); }}></div><div class="evp" role="dialog" aria-label=${'Event: ' + ev.title} style=${'left:' + pop.x + 'px;top:' + pop.y + 'px'}>
          <div class="evp-tools"><button type="button" aria-label="Edit event" title="Edit" onClick=${function () { setForm(Object.assign({ desc: '', loc: '', rem: '', gcolor: '', color: '' }, ev)); setPop(null); }}>${SR.Icon('pencil', 16)}</button><button type="button" aria-label="Delete event" title="Delete" onClick=${function () { delEv(ev); setPop(null); }}>${SR.Icon('trash', 16)}</button><button type="button" aria-label="Close" title="Close" onClick=${function () { setPop(null); }}>${SR.Icon('close', 16)}</button></div>
          <div class="evp-h"><i style=${'background:' + col}></i><div><h3>${ev.title}</h3><div class="evp-d">${dl} · ${tm}</div>${ev.rec ? html`<div class="evp-d">Repeating event. Changes here affect only this one.</div>` : null}</div></div>
          ${ev.loc ? line('pin', ev.loc) : null}
          ${ev.meet ? line('link', html`<a href=${ev.meet} target="_blank" rel="noopener">Join with Google Meet</a>`) : null}
          ${ev.desc ? line('doc', html`<div class="evp-desc">${ev.desc}</div>`) : null}
          ${rl ? line('bell', rl) : null}
          ${line('calendar', html`<b>${ev.who || 'Whole team'}</b>${ev.cal ? html`<div class="evp-d">${ev.cal}</div>` : null}${ev.by ? html`<div class="evp-d">Created by ${ev.by}</div>` : null}`)}
          ${ev.link ? html`<a class="evp-gl" href=${ev.link} target="_blank" rel="noopener">Open in Google Calendar ↗</a>` : null}
        </div>`; })() : null}
      ${form ? html`<div class="mdl-bg" onMouseDown=${function (e) { if (e.target === e.currentTarget) setForm(null); }}><div class="mdl sm evf" role="dialog" aria-label="Event">
        <h2 style="margin:0 0 12px">${form.id ? 'Edit event' : 'New event'}</h2>
        <input class="cal-in" autofocus placeholder="Event title" aria-label="Event title" value=${form.title} onInput=${function (e) { setForm(Object.assign({}, form, { title: e.target.value })); }} onKeyDown=${function (e) { if (e.key === 'Enter') submit(); }} />
        <div class="cal-row"><input class="cal-in" type="date" aria-label="Date" value=${form.date} onChange=${function (e) { setForm(Object.assign({}, form, { date: e.target.value })); }} />${form.allDay || !form.start && form.id ? null : html`<input class="cal-in" type="time" aria-label="Start" value=${form.start} onChange=${function (e) { setForm(Object.assign({}, form, { start: e.target.value })); }} /><input class="cal-in" type="time" aria-label="End" value=${form.end} onChange=${function (e) { setForm(Object.assign({}, form, { end: e.target.value })); }} />`}</div>
        <label class="evf-ck"><input type="checkbox" checked=${!!form.allDay || (!form.start && !!form.id)} onChange=${function (e) { setForm(Object.assign({}, form, e.target.checked ? { allDay: true, start: '', end: '' } : { allDay: false, start: '09:00', end: '10:00' })); }} /> All day</label>
        <input class="cal-in" placeholder="Add location" aria-label="Location" value=${form.loc || ''} onInput=${function (e) { setForm(Object.assign({}, form, { loc: e.target.value })); }} />
        <textarea class="cal-in" rows="3" style="padding:8px 10px;resize:vertical" placeholder="Add description" aria-label="Description" value=${form.desc || ''} onInput=${function (e) { setForm(Object.assign({}, form, { desc: e.target.value })); }}></textarea>
        <div class="cal-row"><select class="cal-in" aria-label="Reminder" value=${form.rem == null ? '' : String(form.rem)} onChange=${function (e) { setForm(Object.assign({}, form, { rem: e.target.value })); }}><option value="">Default reminder</option><option value="none">No reminder</option><option value="0">At the time</option><option value="10">10 minutes before</option><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="1440">1 day before</option></select>
          <select class="cal-in" aria-label="Calendar owner" value=${form.who} onChange=${function (e) { setForm(Object.assign({}, form, { who: e.target.value })); }}><option value="">Whole team</option>${SR.TEAM.map(function (n) { return html`<option key=${n} value=${n}>${n}</option>`; })}</select></div>
        <div class="evf-sw" role="group" aria-label="Colour"><button type="button" class=${'evf-c' + (!form.gcolor ? ' on' : '')} aria-label="Default colour" title="Default" style="background:var(--line)" onClick=${function () { setForm(Object.assign({}, form, { gcolor: '', color: '' })); }}></button>${Object.keys(SR.GCOLORS).map(function (k) { return html`<button key=${k} type="button" class=${'evf-c' + (String(form.gcolor) === k ? ' on' : '')} aria-label=${'Colour ' + k} style=${'background:' + SR.GCOLORS[k]} onClick=${function () { setForm(Object.assign({}, form, { gcolor: k, color: SR.GCOLORS[k] })); }}></button>`; })}</div>
        ${form.rec ? html`<div class="cal-note">This event repeats. Saving changes only this one.</div>` : null}
        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:14px">${form.id ? html`<button type="button" class="edbtn" style="color:var(--red)" onClick=${function () { delEv(form); setForm(null); }}>Delete</button>` : html`<span></span>`}<span style="display:flex;gap:8px"><button type="button" class="edbtn" onClick=${function () { setForm(null); }}>Cancel</button><button type="button" class="mdl-b pri" onClick=${submit}>Save</button></span></div>
      </div></div>` : null}
    </div>`;
  };

  /* ---------- WORKLOAD: one column per person, drag a task to reassign ---------- */
  SR.Workload = function (p) {
    var ns = useState(''), nm = ns[0], setNm = ns[1];
    var rs = useState(0), rt = rs[0], setRt = rs[1];
    var open = p.tasks.filter(function (t) { return !t.done; });
    var T0 = SR.TODAY, W7 = SR.addDays(T0, 7), CAP = 40;
    var cols = SR.TEAM.map(function (n) { return { name: n, label: n, list: open.filter(function (t) { return t.owner === n; }) }; })
      .concat(open.some(function (t) { return !t.owner || SR.TEAM.indexOf(t.owner) < 0; }) ? [{ name: '', label: 'Unassigned', list: open.filter(function (t) { return !t.owner || SR.TEAM.indexOf(t.owner) < 0; }) }] : []);
    var by = function (a, b) { return (a.date || '9999') < (b.date || '9999') ? -1 : (a.date || '9999') > (b.date || '9999') ? 1 : 0; };
    var add = function () { if (nm.trim()) { SR.addPerson(nm); setNm(''); setRt(rt + 1); } };
    return html`<div style="margin-top:16px">
      <div class="wl">
        ${cols.map(function (c) {
          var over = c.list.filter(function (t) { return t.date && t.date < T0; }).length, today = c.list.filter(function (t) { return t.date === T0; }).length, wk = c.list.filter(function (t) { return t.date && t.date > T0 && t.date <= W7; }).length;
          var pct = Math.min(100, Math.round(c.list.length / CAP * 100));
          return html`<section key=${c.label} class="wlc" aria-label=${c.label + ' workload'}
            onDragOver=${function (e) { if (SR._drag != null) { e.preventDefault(); e.currentTarget.classList.add('dover'); } }} onDragLeave=${function (e) { e.currentTarget.classList.remove('dover'); }}
            onDrop=${function (e) { e.preventDefault(); e.currentTarget.classList.remove('dover'); var id = SR._drag; SR._drag = null; if (id != null) SR.dnd.dropOnPerson(id, c.name); }}>
            <div class="wlh">${SR.Avatar(c.name, 30)}<div style="flex:1;min-width:0"><div class="wln">${c.label}</div><div class="wls">${c.list.length} open${over ? ' · ' : ''}${over ? html`<b style="color:var(--red)">${over} overdue</b>` : null}</div></div>
              ${c.name && SR.store.mode !== 'cloud' ? html`<button type="button" class="wlx" aria-label=${'Remove ' + c.name} title="Remove from the team" onClick=${function () { SR.removePerson(c.name); setRt(rt + 1); }}>×</button>` : null}</div>
            <div class="wlbar" title=${c.list.length + ' of ' + CAP + ' open tasks'}><div style=${'width:' + pct + '%;background:' + (pct > 85 ? 'var(--red)' : pct > 60 ? 'var(--gold)' : 'var(--green)')}></div></div>
            <div class="wlst"><span>Today <b>${today}</b></span><span>Next 7 days <b>${wk}</b></span><span>Overdue <b>${over}</b></span></div>
            <div class="wlist">${c.list.slice().sort(by).map(function (t) {
              var cl = SR.clientById(p.clients, t.clientId);
              return html`<div key=${t.id} class=${'wcard' + (p.openId === t.id ? ' sel' : '')} draggable="true"
                onDragStart=${function (e) { SR._drag = t.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(t.id)); } catch (x) {} }} onDragEnd=${function () { SR._drag = null; }}
                onContextMenu=${function (e) { if (SR.taskMenu) SR.taskMenu(e, t); }}>
                <button type="button" class="wc-t" onClick=${function () { p.onOpen(t.id); }}>${t.name}</button>
                <div class="wc-m"><span style=${'width:8px;height:8px;border-radius:3px;background:' + cl.color}></span><span>${cl.name}</span>${t.date ? html`<span class=${t.date < T0 ? 'late' : ''}>${SR.fmtDeadline(t.date)}</span>` : null}</div>
              </div>`;
            })}${c.list.length ? null : html`<div class="wl0">Nothing assigned.</div>`}</div>
          </section>`;
        })}
        ${SR.store.mode === 'cloud' ? null : html`<section class="wlc add" aria-label="Add a person"><div class="wln" style="margin-bottom:8px">Add a person</div>
          <input type="text" placeholder="Name" value=${nm} onChange=${function (e) { setNm(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') add(); }} />
          <button type="button" class="edbtn" style="margin-top:8px" onClick=${add}>Add to the team</button>
          <div style="font-size:12px;color:var(--muted);margin-top:10px">Drag a card onto a column to reassign it.</div></section>`}
      </div>
    </div>`;
  };

  /* ---------- CLIENTS (cards) ---------- */
  /* progress of one project: results vs target when logged, otherwise setup progress */
  SR.projPct = function (c, t, tasks) {
    var prim = t === c.type, pid = prim ? c.id : c.id + ':' + t, clamp = function (x) { return Math.max(0, Math.min(100, Math.round(x))); };
    if (t === 'gads' && SR.periods && SR.periods[c.id] && SR.periods[c.id].length && SR.adsCalc) {
      var P = SR.periods[c.id], last = SR.adsCalc(P[P.length - 1]), tg = SR.adsTarget(prim ? (c.math || {}) : {}), tc = tg.conv * last.days / 30;
      if (tc) return { v: clamp(last.conv / tc * 100), src: 'results' };
    }
    if ((t === 'seo' || t === 'aeo') && SR.orgP && SR.orgP[pid] && SR.orgP[pid].length) {
      var L = SR.orgP[pid][SR.orgP[pid].length - 1], T = (SR.orgT && SR.orgT[pid]) || {};
      if (T.leads && L.leads != null) return { v: clamp(L.leads / T.leads * 100), src: 'results' };
    }
    var st = tasks.filter(function (x) { return x.clientId === c.id && (x.proj || c.type) === t && x.step && !x.maint; });
    if (st.length) return { v: clamp(st.filter(function (x) { return x.done; }).length / st.length * 100), src: 'setup' };
    if (t === 'seo' && SR.SEO_BUNDLE) {
      try {
        var id = (c.seoId || c.id || 'client').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40), rec = JSON.parse(localStorage.getItem('srseo:client:' + id)), n = 0, tot = 0;
        SR.SEO_BUNDLE.work.forEach(function (ph) { ph.items.forEach(function (i) { if (i.kind !== 's') tot++; }); });
        if (rec && rec.marks) Object.keys(rec.marks).forEach(function (k) { if (/^\d/.test(k) && (rec.marks[k].s === 'done' || rec.marks[k].s === 'na')) n++; });
        return { v: tot ? clamp(n / tot * 100) : 0, src: 'setup' };
      } catch (e) {}
    }
    return { v: 0, src: 'setup' };
  };
  SR.Clients = function (p) {
    var tasks = p.tasks || [];
    var vs = useState(function () { try { return localStorage.getItem('sr_cview') || 'table'; } catch (e) { return 'table'; } }), view = vs[0], setViewS = vs[1];
    var setView = function (v) { setViewS(v); try { localStorage.setItem('sr_cview', v); } catch (e) {} };
    var fs = useState('all'), fil = fs[0], setFil = fs[1];
    var qs = useState(''), q = qs[0], setQ = qs[1];
    var ss = useState('attn'), sort = ss[0], setSort = ss[1];
    var rows = p.clients.map(function (c) {
      var projs = (c.projects || [c.type]).map(function (t) { var T = SR.TEMPLATES[t] || {}; return { t: t, label: T.label || t, color: T.color || '#C9A84C', pct: SR.projPct(c, t, tasks) }; });
      var H = SR.clientHealth(c, tasks), A = H.A;
      var nextPay = A ? A.payments.filter(function (x) { return !x.paid; }).sort(function (x, y) { return x.date.localeCompare(y.date); })[0] : null;
      var mrr = A ? (+A.retainer || 0) : (c.retainer || 0);
      var why = H.payOver ? H.payOver + ' payment overdue' : H.over ? H.over + ' task' + (H.over > 1 ? 's' : '') + ' overdue' : (H.dl != null && H.dl <= 45 && H.dl >= -3) ? 'Contract ends in ' + H.dl + ' days' : '';
      return { c: c, projs: projs, H: H, h: H.h, nextPay: nextPay, nxt: H.next, mrr: mrr, why: why, over: H.over };
    });
    var total = rows.reduce(function (t, r) { return t + r.mrr; }, 0), attn = rows.filter(function (r) { return r.h !== 'ok'; }).length;
    var cnt = function (k) { return rows.filter(function (r) { return k === 'all' || r.h === k; }).length; };
    var vis = rows.filter(function (r) { return (fil === 'all' || r.h === fil) && (!q || (r.c.name + ' ' + (r.c.region || '') + ' ' + (r.c.contact || '')).toLowerCase().indexOf(q.toLowerCase()) > -1); });
    var rank = { risk: 0, watch: 1, ok: 2 };
    vis.sort(function (x, y) { if (sort === 'mrr') return y.mrr - x.mrr; if (sort === 'name') return x.c.name.localeCompare(y.c.name); if (sort === 'end') return (x.H.end || '9').localeCompare(y.H.end || '9'); return rank[x.h] - rank[y.h] || y.mrr - x.mrr; });
    var tag = function (h, txt) { var L = SR.HLAB[h]; return html`<span class=${'ntag ' + L[1]}>${txt || L[0]}</span>`; };
    var dot = function (c) { return html`<span class="nav" style=${'background:' + c.color}>${SR.ini ? SR.ini(c.name) : c.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()}</span>`; };
    var open = function (c) { p.openClient(c.id); };
    var nextTxt = function (r) { return r.nxt ? html`<span style=${r.nxt.date < SR.TODAY ? 'color:var(--red)' : ''}>${r.nxt.name.length > 34 ? r.nxt.name.slice(0, 32) + '…' : r.nxt.name}</span> <span class="m">${SR.fmtDay(r.nxt.date)}</span>` : html`<span class="m">Nothing scheduled</span>`; };
    var table = html`<div role="table" aria-label="Clients">
      <div class="nrow h" role="row"><span>Client</span><span>Projects</span><span>Health</span><span>Fee</span><span>Ends</span><span>Next task</span></div>
      ${vis.map(function (r) { var c = r.c;
        return html`<div key=${c.id} class="nrow" role="row" tabindex="0" onContextMenu=${function (e) { SR.clientMenu(e, c); }} onClick=${function () { open(c); }} onKeyDown=${function (e) { if (e.key === 'Enter') open(c); }}>
          <span style="display:flex;align-items:center;gap:10px;min-width:0">${dot(c)}<b style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</b><span class="m">${c.region || ''}</span></span>
          <span style="display:flex;flex-wrap:wrap;gap:4px">${r.projs.map(function (x) { return html`<span key=${x.t} class="ntag n" title=${x.pct.src === 'results' ? 'Latest result vs target' : 'Setup progress'}>${x.label} ${x.pct.v}%</span>`; })}</span>
          <span>${tag(r.h, r.why || null)}</span>
          <span style="font-variant-numeric:tabular-nums"><b style="font-weight:500">${SR.money(r.mrr)}</b></span>
          <span class="m">${r.H.end ? SR.fmtDay(r.H.end) : '—'}</span>
          <span>${nextTxt(r)}</span></div>`; })}
      <button type="button" class="nchip" style="margin-top:10px;border:0" onClick=${function () { p.go('onboard'); }}>+ New client</button></div>`;
    var board = html`<div class="nboard">${[['risk', 'At risk'], ['watch', 'Watch'], ['ok', 'On track']].map(function (col) {
      var cs = vis.filter(function (r) { return r.h === col[0]; });
      return html`<div key=${col[0]} class="ncol"><b>${col[1]} <span style="color:var(--muted);font-weight:400">${cs.length}</span></b>
        ${cs.map(function (r) { var c = r.c; return html`<button key=${c.id} type="button" class="ncard" onContextMenu=${function (e) { SR.clientMenu(e, c); }} onClick=${function () { open(c); }}>
          <span style="display:flex;align-items:center;gap:8px">${dot(c)}<b style="font-weight:600;font-size:14px">${c.name}</b></span>
          <span style="font-size:13px;color:var(--muted)">${SR.money(r.mrr)} a month${r.H.end ? ' · ends ' + SR.fmtDay(r.H.end) : ''}</span>
          <span style="display:flex;flex-wrap:wrap;gap:4px">${r.projs.map(function (x) { return html`<span key=${x.t} class="ntag n">${x.label}</span>`; })}</span>
          ${r.why ? html`<span style="font-size:13px;color:var(--muted)">${r.why}</span>` : null}</button>`; })}
        ${cs.length ? null : html`<div style="font-size:13px;color:var(--muted);padding:4px">Nobody here</div>`}</div>`; })}</div>`;
    var renewals = html`<div role="table" aria-label="Renewals">${vis.slice().sort(function (x, y) { return (x.H.end || '9').localeCompare(y.H.end || '9'); }).map(function (r) { var c = r.c;
      return html`<div key=${c.id} class="nrow" style="grid-template-columns:minmax(0,2.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" tabindex="0" onClick=${function () { open(c); }} onKeyDown=${function (e) { if (e.key === 'Enter') open(c); }}><span style="display:flex;align-items:center;gap:10px">${dot(c)}<b style="font-weight:600">${c.name}</b></span><span>${r.H.end ? SR.fmtDay(r.H.end) : '—'}</span><span class="m">${r.H.dl == null ? '' : r.H.dl < 0 ? 'ended' : r.H.dl + ' days left'}</span><span style="font-variant-numeric:tabular-nums">${SR.money(r.mrr)}</span></div>`; })}</div>`;
    return html`<div style="display:flex;flex-direction:column;gap:16px">
      <div><${SR.Ed} tag="h1" id="clients.title" def="Clients" style="margin:0" ph="Add a title" /><p style="margin:6px 0 0;font-size:14px;color:var(--muted)">${rows.length} clients · ${SR.money(total)} a month · ${attn ? attn + ' need attention' : 'everyone is on track'}</p><${SR.Ed} tag="p" id="clients.desc" def="" ph="Add a description" style="margin:4px 0 0;font-size:14px;color:var(--muted)" /></div>
      <div class="ntabs" role="tablist">${[['table', 'Table'], ['board', 'Board'], ['renew', 'Renewals']].map(function (v) { return html`<button key=${v[0]} type="button" role="tab" aria-selected=${view === v[0]} class=${view === v[0] ? 'on' : ''} onClick=${function () { setView(v[0]); }}>${v[1]}</button>`; })}<span class="sp"></span>
        <button type="button" onClick=${function () { p.go('onboard'); }} style="color:var(--accent);font-weight:600">+ Onboard client</button></div>
      <div class="nfil"><input class="nsearch" type="search" placeholder="Search clients" aria-label="Search clients" value=${q} onInput=${function (e) { setQ(e.target.value); }} />
        ${[['all', 'All'], ['ok', 'On track'], ['watch', 'Watch'], ['risk', 'At risk']].map(function (f) { return html`<button key=${f[0]} type="button" class=${'nchip' + (fil === f[0] ? ' on' : '')} aria-pressed=${fil === f[0]} onClick=${function () { setFil(f[0]); }}>${f[1]} ${cnt(f[0])}</button>`; })}
        <span style="flex:1"></span><label style="font-size:13px;color:var(--muted)">Sort <select class="nsel" value=${sort} onChange=${function (e) { setSort(e.target.value); }}><option value="attn">Needs attention</option><option value="mrr">Fee, high to low</option><option value="end">Contract end</option><option value="name">Name</option></select></label></div>
      ${vis.length ? (view === 'board' ? board : view === 'renew' ? renewals : table) : html`<div style="padding:30px 0;color:var(--muted);font-size:14px">No clients match.</div>`}
      <${SR.Blocks} id="clients" />
    </div>`;
  };

  /* ---------- ONBOARDING (A — stepper) ---------- */
  var FIELDS = {
    client: [['name', 'Client', 'text'], ['contact', 'Main contact', 'text'], ['email', 'Email', 'text'], ['region', 'Market', 'text'], ['owner', 'Account owner', 'choice', function () { return SR.TEAM.slice(); }]],
    deal: [['retainer', 'Retainer ($ / month)', 'number'], ['setup', 'Set-up fee ($)', 'number'], ['term', 'Minimum term', 'choice', ['3 months', '6 months', '12 months']], ['start', 'Kick-off date', 'date'], ['updates', 'Client updates', 'choice', ['Weekly', 'Fortnightly', 'Monthly']]],
    gads: [['leads', 'Leads a month we promise', 'number'], ['cvr', 'Landing page conversion rate (%) · real estate ~2.5', 'number'], ['cpc', 'Avg CPC ($) · Keyword Planner top-of-page bids', 'number'], ['ctr', 'Expected CTR (%)', 'number'], ['volume', 'Monthly searches for the keywords', 'number'], ['close', 'Client close rate (%)', 'number'], ['deal', 'Avg $ per closed deal', 'number'], ['margin', 'Client profit margin on a sale (%)', 'number'], ['comm', 'Our commission (% of profit)', 'number'], ['acct', 'Google Ads account', 'choice', ['Client has one', 'We create it']], ['lp', 'Landing page', 'choice', ['Use existing', 'We build it']]],
    meta: [['leads', 'Leads a month we promise', 'number'], ['cvr', 'Conversion rate (%)', 'number'], ['cpm', 'CPM ($)', 'number'], ['ctr', 'CTR (%)', 'number'], ['close', 'Client close rate (%)', 'number'], ['deal', 'Avg $ per closed deal', 'number'], ['creative', 'Ad creative', 'choice', ['Client supplies', 'We make it']], ['pixel', 'Meta pixel', 'choice', ['Installed', 'Not yet']]],
    seo: [['domain', 'Website (no https)', 'text'], ['seoId', 'Client id in the SEO platform (optional, set later)', 'text']],
    aeo: [['vis', 'AI visibility we promise (%)', 'number'], ['by', 'By', 'date'], ['market', 'Market and language', 'text'], ['prompts', 'Prompts to track', 'number'], ['articles', 'Articles a week', 'number'], ['access', 'Website backend access', 'choice', ['Client gives access', 'Still to ask']]]
  };
  SR.Onboarding = function (p) {
    var f = p.draft, step = p.step, proj = p.proj, tp = SR.TEMPLATES[proj], ads = tp.kind === 'ads';
    var set = function (k) { return function (e) { p.setField(k, e.target.value); }; };
    var choose = function (k, v) { return function () { p.setField(k, v); }; };
    var m = SR.projectMath(proj, f);
    var promiseText = ads ? (f.leads ? f.leads + ' leads a month from ' + tp.label : '—') : (f.vis ? f.vis + '% AI visibility' + (f.market ? ' in ' + f.market : '') : '—');
    var plan = '';
    if (f.start) { var dt = new Date(f.start + 'T00:00:00'); if (!isNaN(dt.getTime())) plan = new Date(dt.getTime() + tp.days * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
    var check = '', bad = false;
    if (ads && m.clicksDay) {
      if (proj === 'gads' && parseFloat(f.volume) && m.imprMonth > parseFloat(f.volume)) { bad = true; check = 'Needs ~' + SR.n0(m.imprMonth) + ' impressions a month, but the keywords only get ' + SR.n0(parseFloat(f.volume)) + ' searches. Lower the promise or widen the keywords.'; }
      else { check = 'To get ' + f.leads + ' leads you need ~' + SR.n0(m.clicksDay) + ' clicks a day: ' + SR.money(m.daily) + ' a day, ' + SR.money(m.monthly) + ' a month in ad spend.'; }
    } else if (!ads) { check = 'Readings come in weekly from Peec AI.'; }
    var mathBoxes = ads ? [['Clicks needed a day', SR.n0(m.clicksDay)], ['Ad budget a day', SR.money(m.daily)], ['Ad budget a month', SR.money(m.monthly)], ['Cost per lead', m.cpl ? SR.money(m.cpl) : '—']] : [['Prompts tracked', f.prompts || '—'], ['Articles a month', f.articles ? SR.n0(parseFloat(f.articles) * 4) : '—'], ['Tracking', 'Peec AI'], ['Deadline', f.by || '—']];

    var fieldNode = function (d) {
      var isC = d[2] === 'choice';
      if (isC) return html`<div key=${d[0]} style="display:flex;flex-direction:column;gap:6px"><span style="font-size:13px;color:var(--muted)">${d[1]}</span><div style="display:flex;gap:8px;flex-wrap:wrap">${(typeof d[3] === 'function' ? d[3]() : d[3]).map(function (o) {
        var on = f[d[0]] === o;
        return html`<button key=${o} type="button" onClick=${choose(d[0], o)} aria-pressed=${on ? 'true' : 'false'} style=${'min-height:40px;padding:0 16px;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;' + (on ? 'background:var(--accentBg);color:var(--accent);border:1.5px solid var(--accent)' : 'background:var(--card);color:var(--muted);border:1px solid var(--border)')}>${o}</button>`;
      })}</div></div>`;
      return html`<div key=${d[0]} style="display:flex;flex-direction:column;gap:6px"><label style="font-size:13px;color:var(--muted)">${d[1]}</label><input type=${d[2]} value=${f[d[0]] || ''} onChange=${set(d[0])} style="min-height:44px;background:var(--input);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:0 12px;font-family:inherit;font-size:15px" /></div>`;
    };

    var STEPS = [['Client', 'Who is the client?', 'Filled in from the pipeline card. Check it’s right.'], ['Deal', 'The deal', 'What they pay and how often we update them.'], ['Project', 'What are we doing for them?', 'Picking the project loads its template and the numbers it needs.'], [ads ? 'Numbers' : 'Goal', ads ? 'The promise and what it takes' : 'The promise and how we track it', ads ? 'Start from the promise. The budget is worked out from it.' : 'This becomes the goal on the client page.'], ['Review', 'Check and create', 'Nothing is created until you press Create client.']];
    var stepper = STEPS.map(function (s, i) { return html`<li key=${i} style="display:flex;flex-direction:column;gap:8px"><span style=${'display:block;height:4px;border-radius:2px;background:' + (i <= step ? 'var(--accent)' : 'var(--border)')}></span><span style=${'font-size:13px;font-weight:' + (i === step ? '700' : '500') + ';color:' + (i <= step ? 'var(--text)' : 'var(--muted)')}>${(i + 1) + ' · ' + s[0]}</span></li>`; });

    var stepFields = step === 0 ? FIELDS.client : step === 1 ? FIELDS.deal : step === 3 ? FIELDS[proj] : [];
    var body;
    if (step === 2) {
      body = html`<div role="group" aria-label="Project type" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px">
        ${['gads', 'meta', 'seo'].map(function (k) {
          var on = proj === k, t = SR.TEMPLATES[k];
          return html`<button key=${k} type="button" onClick=${function () { p.setProj(k); }} aria-pressed=${on ? 'true' : 'false'} style=${'display:flex;flex-direction:column;gap:6px;text-align:left;border-radius:8px;font-family:inherit;color:var(--text);cursor:pointer;' + (on ? 'background:var(--accentBg);border:2px solid var(--accent);padding:17px 19px' : 'background:var(--card);border:1px solid var(--border);padding:18px 20px')}>
            <span style="font-size:17px;font-weight:700">${t.label}</span><span style="font-size:13px;color:var(--muted)">${t.kind === 'ads' ? 'Paid ads · goal: leads' : 'Organic · goal: visibility'}</span></button>`;
        })}
      </div>`;
    } else if (step === 4) {
      var review = [['Client', f.name + ' · ' + f.contact], ['Market · owner', f.region + ' · ' + f.owner], ['Retainer', (f.retainer ? SR.money(parseFloat(f.retainer)) + ' / month' : '—') + ' · ' + f.term], ['Kick-off', f.start || '—'], ['Project', tp.label], ['Promise', promiseText]];
      var creates = [tp.phases.reduce(function (a, ph) { return a + ph.steps.length; }, 0) + ' setup & launch steps from the ' + tp.label + ' template', 'Planned live ' + (plan || '—'), (f.updates || 'Weekly') + ' client update task', 'Added to Clients, Results and the task list'];
      body = html`<div style="display:flex;flex-direction:column;gap:16px">
        <div>${review.map(function (r, i) { return html`<div key=${i} style="display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-top:1px solid var(--line);font-size:15px"><span style="color:var(--muted)">${r[0]}</span><span style="font-weight:600;text-align:right">${r[1]}</span></div>`; })}</div>
        <div style="background:var(--card2);border-radius:7px;padding:16px 18px"><div style="font-size:13px;color:var(--muted);margin-bottom:6px">Creating this client will add</div>${creates.map(function (x, i) { return html`<div key=${i} style="font-size:14px;padding:3px 0">✓ ${x}</div>`; })}</div>
      </div>`;
    } else {
      body = html`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 20px">${stepFields.map(fieldNode)}</div>`;
    }

    if (p.doneClient) {
      return html`<main style="max-width:780px;margin:0 auto;padding:36px 24px 60px">
        <section style=${card + ';padding:40px 36px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center'}>
          <div style="width:52px;height:52px;border-radius:26px;background:var(--greenBg);color:var(--green);font-size:26px;display:flex;align-items:center;justify-content:center">✓</div>
          ${H1(p.doneClient.name + ' is set up')}
          <p style="margin:0;font-size:15px;color:var(--muted)">Its setup steps and tasks are on the client page. Planned live ${plan || '—'}.</p>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button type="button" onClick=${function () { p.openClient(p.doneClient.id); }} style="min-height:42px;padding:0 20px;border-radius:10px;border:0;background:var(--primary);color:#FFF;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer">Open client</button>
            <button type="button" onClick=${p.reset} style="min-height:42px;padding:0 20px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-family:inherit;font-size:14px;cursor:pointer">Add another</button>
          </div>
        </section>
      </main>`;
    }

    return html`<main style="max-width:780px;margin:0 auto;padding:36px 24px 60px;display:flex;flex-direction:column;gap:26px">
      <ol aria-label="Steps" style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px">${stepper}</ol>
      <section style=${card + ';padding:32px 36px;display:flex;flex-direction:column;gap:24px'}>
        <div><h1 style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:30px">${STEPS[step][1]}</h1><p style="margin:6px 0 0;font-size:15px;color:var(--muted)">${STEPS[step][2]}</p></div>
        ${body}
        ${step === 3 ? html`<div style="display:flex;flex-direction:column;gap:10px;padding-top:6px;border-top:1px solid var(--line)">
          <div style="font-size:13px;color:var(--muted);padding-top:14px">What these numbers add up to</div>
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px">${mathBoxes.map(function (b, i) { return html`<div key=${i} style="background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:12px 14px"><div style="font-size:12px;color:var(--muted)">${b[0]}</div><div style="font-size:22px;font-weight:700;margin-top:2px">${b[1]}</div></div>`; })}</div>
          <div style=${'font-size:14px;font-weight:600;color:' + (bad ? 'var(--red)' : 'var(--green)')}>${check}</div>
        </div>` : null}
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px">
          <button type="button" onClick=${p.back} style=${'min-height:46px;padding:0 20px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-family:inherit;font-size:15px;cursor:pointer;visibility:' + (step === 0 ? 'hidden' : 'visible')}>Back</button>
          <button type="button" onClick=${p.next} style="min-height:46px;padding:0 26px;border-radius:10px;border:0;background:var(--primary);color:#FFF;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer">${step === 4 ? 'Create client' : 'Continue'}</button>
        </div>
      </section>
    </main>`;
  };
})(window.SR);
