/* Sarac Ramsay — Client Dashboard · root app (state, router, sidebar) */
(function (SR) {
  var html = SR.html, useState = React.useState, useEffect = React.useEffect;

  var BLANK_DRAFT = function () {
    return { name: '', contact: '', email: '', region: '', owner: SR.ME ? SR.ME.username : '', retainer: '', setup: '', term: '3 months', start: SR.addDays(SR.TODAY, 7), updates: 'Weekly',
      leads: '30', cvr: '2.5', cpc: '2', ctr: '5', volume: '', close: '10', deal: '', margin: '20', comm: '10', acct: '', lp: '', cpm: '12', creative: '', pixel: '', domain: '', seoId: '', vis: '20', by: '2026-12-31', market: '', prompts: '25', articles: '4', access: '' };
  };

  function App() {
    var s = useState(SR.getTheme()); var theme = s[0], setTheme = s[1];
    var snd = useState(SR.soundOn()), soundOn = snd[0], setSoundOn = snd[1];
    var sc = useState(function () { return /[?&]screen=sales/.test(location.search) || location.hash === '#sales' ? 'sales' : 'home'; }); var screen = sc[0], setScreen = sc[1];
    var cl = useState('clear'); var activeClient = cl[0], setActiveClient = cl[1];
    var tb = useState('overview'); var clientTab = tb[0], setClientTab = tb[1];
    var ex = useState({}); var exp = ex[0], setExp = ex[1];
    var rmS = useState('timeline'); var rm = rmS[0], setRm = rmS[1];
    var acS = useState('charts'); var ac = acS[0], setAc = acS[1];
    var wh = useState('all'); var who = wh[0], setWho = wh[1];
    var sel = useState({}); var selected = sel[0], setSelected = sel[1];
    var op = useState(null); var openId = op[0], setOpenId = op[1];
    var dl = useState(null); var delId = dl[0], setDelId = dl[1];
    var sh = useState(false); var showHow = sh[0], setShowHow = sh[1];
    var openFn = function (id, how) { setOpenId(id); setShowHow(!!how); };
    var sd = useState(''); var subDraft = sd[0], setSubDraft = sd[1];
    var nt = useState(''); var newTask = nt[0], setNewTask = nt[1];
    var INIT = SR.INIT || {};
    var cls = useState(INIT.clients || SR.SEED_CLIENTS.slice()); var clients = cls[0], setClients = cls[1];
    var tks = useState(INIT.tasks || SR.SEED_TASKS.slice()); var tasks = tks[0], setTasks = tks[1];
    var sq = useState(Math.max(INIT.seq || 0, SR.SEED_SEQ, (INIT.maxId || 0) + 1)); var seq = sq[0], setSeq = sq[1];
    var evS = useState(INIT.events || []); var events = evS[0], setEvents = evS[1];
    /* results */
    var rp = useState('clear'); var resPick = rp[0], setResPick = rp[1];
    var pr = useState('week'); var period = pr[0], setPeriod = pr[1];
    var im = useState({}); var imported = im[0], setImported = im[1];
    /* onboarding */
    var st = useState(0); var step = st[0], setStep = st[1];
    var pj = useState('gads'); var proj0 = pj[0], setProj = pj[1], proj = proj0;
    var dr = useState(BLANK_DRAFT()); var draft = dr[0], setDraft = dr[1];
    var dc = useState(null); var doneClient = dc[0], setDoneClient = dc[1];
    var stS = useState({}); var settling = stS[0], setSettling = stS[1];
    var jsS = useState({}); var just = jsS[0], setJust = jsS[1];
    var phS = useState({}); var phaseSel = phS[0], setPhaseSel = phS[1];
    var psS = useState({}); var projSel = psS[0], setProjSel = psS[1];
    var jlS = useState(null); var justLive = jlS[0], setJustLive = jlS[1];
    var tsS = useState(''); var toastMsg = tsS[0], setToastMsg = tsS[1];
    var tuS = useState(null); var toastUndo = tuS[0], setToastUndo = tuS[1];
    var clkS = useState(0); var clk = clkS[0], setClk = clkS[1];
    var plS = useState(false); var palOpen = plS[0], setPalOpen = plS[1];
    var mnS = useState(null); var ctxMenu = mnS[0], setCtxMenu = mnS[1];
    var cfS = useState(null); var cf = cfS[0], setCf = cfS[1];
    var ecS = useState(null); var editId = ecS[0], setEditId = ecS[1];
    var nfS = useState(function () { return INIT.notifs || []; }); var notifs = nfS[0], setNotifs = nfS[1];
    var rlS = useState(function () { return INIT.rules || [{ id: 'r1', on: true, match: 'Launch', action: 'create', arg: 'Day-3 check on the launch', owner: '', days: 3 }, { id: 'r2', on: true, match: 'Get client approval', action: 'notify', arg: '', owner: '', days: 0 }]; }); var rules = rlS[0], setRules = rlS[1];
    var meS = useState(function () { return SR.ME ? SR.ME.username : ''; }); var me = meS[0], setMeS = meS[1];
    var pmS = useState(false); var profOpen = pmS[0], setProfOpen = pmS[1];
    var stgS = useState(false); var settingsOpen = stgS[0], setSettingsOpen = stgS[1];
    var blS = useState(false); var bellOpen = blS[0], setBellOpen = blS[1];
    var auS = useState(false); var autoOpen = auS[0], setAutoOpen = auS[1];
    /* saving and live updates */
    var stS = useState(SR.store.status); var saveState = stS[0], setSaveState = stS[1];
    var gaS = useState(INIT.gacc || null); var gacc = gaS[0], setGacc = gaS[1];
    var glS = useState(INIT.gaccList || (INIT.gacc ? [INIT.gacc] : [])); var glist = glS[0], setGlist = glS[1];
    var syncing = React.useRef(false), syncAgain = React.useRef(false);
    var gmS = useState(''); var gmsg = gmS[0], setGmsg = gmS[1];
    useEffect(function () { SR.store.onStatus(setSaveState); SR.store.subscribe(); }, []);
    useEffect(function () { SR.store.saveColl('tasks', tasks); SR.store.saveKV('order', tasks.map(function (t) { return t.id; })); }, [tasks]);
    useEffect(function () { SR.store.saveColl('events', events); }, [events]);
    useEffect(function () { SR.store.saveColl('notifs', notifs.slice(-100)); }, [notifs]);
    useEffect(function () { SR.store.saveKV('rules', rules); }, [rules]);
    useEffect(function () { SR.store.saveKV('clients', clients); }, [clients]);
    useEffect(function () { SR.store.saveKV('seq', seq); }, [seq]);
    var RES = [['periods', 'periods'], ['orgP', 'orgP'], ['orgT', 'orgT'], ['metaReal', 'metaReal'], ['acct', 'acct']];
    useEffect(function () { var iv = setInterval(function () { RES.forEach(function (k) { if (SR[k[0]]) SR.store.saveKV(k[1], SR[k[0]]); }); }, 1500); return function () { clearInterval(iv); }; }, []);
    SR.remote = {
      coll: function (name, row) {
        var d = row.data, same = function (x) { return String(x.id) === String(row.id); };
        var fn = function (arr) { var has = arr.some(same); if (row.deleted) return arr.filter(function (x) { return !same(x); }); return has ? arr.map(function (x) { return same(x) ? d : x; }) : arr.concat([d]); };
        if (name === 'tasks') { setTasks(fn); if (typeof d.id === 'number') setSeq(function (q) { return Math.max(q, d.id + 1); }); } else if (name === 'events') setEvents(fn); else setNotifs(fn);
      },
      kv: function (key, val) {
        if (key === 'clients') setClients(val); else if (key === 'rules') setRules(val); else if (key === 'seq') setSeq(function (q) { return Math.max(q, val); });
        else if (key === 'order') setTasks(function (ts) { var ix = {}; val.forEach(function (id, i) { ix[id] = i; }); return ts.slice().sort(function (a, b) { return (ix[a.id] == null ? 1e9 : ix[a.id]) - (ix[b.id] == null ? 1e9 : ix[b.id]); }); });
        else if (SR[key] && typeof val === 'object') { Object.keys(SR[key]).forEach(function (x) { delete SR[key][x]; }); Object.assign(SR[key], val); setClk(function (c) { return c + 1; }); }
      },
      gacc: function (row) { setGacc(row); },
      gaccReload: function () { SR.store.myGaccs().then(function (l) { setGlist(l); setGacc(SR.store.primaryOf(l)); if (!l.length) setGmsg(''); }, function () {}); },
      gaccs: function (row) { SR.GACCS[row.user_id] = row; setClk(function (c) { return c + 1; }); },
      profiles: function (row) { if (!row) return; var l = Object.keys(SR.PROFILES).map(function (k) { return SR.PROFILES[k]; }).filter(function (p) { return p.user_id !== row.user_id; }).concat([row]); SR.applyProfiles(l); if (row.user_id === SR.store.myId()) SR.ME = row; setClk(function (c) { return c + 1; }); }
    };
    SR.store.onRemote(SR.remote);
    /* One sync at a time. If something changes while it runs, run once more afterwards. A big calendar finishes over a few quick rounds. */
    var syncNow = function () {
      if (!gacc) return Promise.resolve();
      if (syncing.current) { syncAgain.current = true; return Promise.resolve(); }
      syncing.current = true; setGmsg('Syncing…');
      var tot = { i: 0, o: 0 };
      var round = function (n) {
        return SR.store.gSync(me).then(function (r) {
          r = r || {}; tot.i += (r.pulledNew || 0) + (r.pulledChanged || 0); tot.o += (r.pushedNew || 0) + (r.pushedChanged || 0);
          if (r.busy && n < 4) return new Promise(function (res) { setTimeout(res, 2500); }).then(function () { return round(n + 1); });
          if (r.partial && n < 12) { setGmsg('Syncing… ' + (tot.i + tot.o) + ' items so far'); return round(n + 1); }
          return r;
        });
      };
      return round(0).then(function (r) {
        syncing.current = false; r = r || {};
        if (r.errors && r.errors.length) setGmsg('Sync problem: ' + r.errors[0]);
        else setGmsg((r.partial ? 'Part synced ' : r.busy ? 'Synced ' : 'Synced ') + SR.nowParts().time + (tot.i + tot.o ? ' · ' + tot.i + ' in, ' + tot.o + ' out' : '') + (r.partial ? ' · more on the next round' : ''));
        if (syncAgain.current) { syncAgain.current = false; setTimeout(syncNow, 800); }
      }, function (e) { syncing.current = false; setGmsg('Sync failed: ' + e.message); });
    };
    useEffect(function () { if (!gacc) return; syncNow(); var iv = setInterval(function () { if (!document.hidden) syncNow(); }, 60000); return function () { clearInterval(iv); }; }, [!!gacc, me]);
    useEffect(function () { if (!gacc) return; var t = setTimeout(syncNow, 1000); return function () { clearTimeout(t); }; }, [tasks, events]);
    var renameOwner = function (a, b) {
      if (!a || !b || a === b) return;
      setTasks(function (ts) { return ts.some(function (t) { return t.owner === a; }) ? ts.map(function (t) { return t.owner === a ? Object.assign({}, t, { owner: b }) : t; }) : ts; });
      setEvents(function (es) { return es.some(function (e) { return e.who === a; }) ? es.map(function (e) { return e.who === a ? Object.assign({}, e, { who: b }) : e; }) : es; });
      setRules(function (rs) { return rs.some(function (r) { return r.owner === a; }) ? rs.map(function (r) { return r.owner === a ? Object.assign({}, r, { owner: b }) : r; }) : rs; });
      setClients(function (cs) { return cs.some(function (c) { return c.owner === a; }) ? cs.map(function (c) { return c.owner === a ? Object.assign({}, c, { owner: b }) : c; }) : cs; });
    };
    /* a new user who chose to take over the placeholder tasks (Matt or Josh) gets them under their own username */
    useEffect(function () { if (SR.ME && SR.ME.claimed && SR.ME.username !== SR.ME.claimed) renameOwner(SR.ME.claimed, SR.ME.username); }, []);
    var setMe = function (n) { if (SR.store.mode === 'cloud') return; setMeS(n); SR.jset('sr_me', n); };
    var notify = function (to, text, taskId) {
      setNotifs(function (a) { return a.concat([{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), to: to || '', text: text, taskId: taskId == null ? null : taskId, ts: new Date().toISOString(), read: false }]); });
      SR.slackPost((to ? '@' + to + ': ' : '') + text);
    };
    SR.notify = notify; SR.openPalette = function () { setPalOpen(true); };

    useEffect(function () { SR.applyTheme(theme); }, [theme]);

    /* task ops */
    var patch = function (id, obj) {
      var o0 = typeof obj === 'function' ? null : obj, cur0 = null; for (var q = 0; q < tasks.length; q++) if (tasks[q].id === id) cur0 = tasks[q];
      if (cur0 && o0 && o0.owner && o0.owner !== cur0.owner && o0.owner !== me) notify(o0.owner, me + ' assigned you: ' + cur0.name, id);
      setTasks(function (ts) { return ts.map(function (t) { return t.id === id ? Object.assign({}, t, typeof obj === 'function' ? obj(t) : obj) : t; }); }); };
    var toast = function (m, undo) { setToastMsg(m); setToastUndo(undo ? { fn: undo } : null); clearTimeout(SR._tt); SR._tt = setTimeout(function () { setToastMsg(''); setToastUndo(null); SR._lastUndo = null; }, undo ? 8000 : 3500); };
    /* undo: snapshot before a delete, put it back from the toast or with Ctrl/Cmd+Z */
    var snapshot = function () { return { clients: clients, tasks: tasks, seq: seq, projSel: projSel, res: JSON.stringify({ p: SR.periods || {}, o: SR.orgP || {}, t: SR.orgT || {}, m: SR.metaReal || {}, a: SR.acct || {} }) }; };
    var restore = function (snap) {
      setClients(snap.clients); setTasks(snap.tasks); setSeq(snap.seq); setProjSel(snap.projSel);
      var r = JSON.parse(snap.res);
      [['periods', 'p'], ['orgP', 'o'], ['orgT', 't'], ['metaReal', 'm'], ['acct', 'a']].forEach(function (k) { var tgt = SR[k[0]] = SR[k[0]] || {}; Object.keys(tgt).forEach(function (x) { delete tgt[x]; }); Object.assign(tgt, r[k[1]] || {}); });
      SR._lastUndo = null; toast('Restored');
    };
    var undoable = function (msg, fn) { var snap = snapshot(); fn(); SR._lastUndo = function () { restore(snap); }; toast(msg, SR._lastUndo); };
    SR.undoable = undoable; SR.toast = toast;
    var openBlockers = function (t) { return (t.blockedBy || []).map(function (b) { for (var i = 0; i < tasks.length; i++) if (tasks[i].id === b) return tasks[i]; return null; }).filter(function (x) { return x && !x.done; }); };
    SR.blockers = openBlockers;
    var runRules = function (cur) {
      var n = seq, add = [];
      rules.forEach(function (r) {
        if (!r.on) return; if (r.match && cur.name.toLowerCase().indexOf(r.match.toLowerCase()) < 0) return;
        if (r.action === 'create' && r.arg) { add.push({ id: n++, clientId: cur.clientId, proj: cur.proj, name: r.arg, owner: r.owner || cur.owner || '', date: SR.addDays(SR.TODAY, +r.days || 0), subs: [], note: 'Created by an automation after: ' + cur.name }); notify(r.owner || cur.owner || '', 'Automation created: ' + r.arg, n - 1); }
        else if (r.action === 'notify') notify(r.owner || '', 'Done: ' + cur.name + (SR.clientById(clients, cur.clientId).name ? ' (' + SR.clientById(clients, cur.clientId).name + ')' : ''), cur.id);
      });
      if (add.length) { setTasks(function (ts) { return ts.concat(add); }); setSeq(n); }
    };
    var toggleRef = { current: null };
    var toggle = function (id) {
      var cur = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) cur = tasks[i];
      if (!cur) return;
      if (cur.done) { patch(id, { done: false }); return; }
      var bl = openBlockers(cur);
      if (bl.length) { toast('Blocked by "' + bl[0].name + '". Finish that first.'); return; }
      patch(id, { done: true, spent: Math.max(cur.spent || 0, SR.estOf(cur)), timer: '', slots: (cur.slots || []).map(function (s) { return Object.assign({}, s, { done: true }); }) });
      SR.playTick();
      setSettling(function (o) { var n = Object.assign({}, o); n[id] = true; return n; });
      setJust(function (o) { var n = Object.assign({}, o); n[id] = true; return n; });
      setTimeout(function () {
        setSettling(function (o) { var n = Object.assign({}, o); delete n[id]; return n; });
        setJust(function (o) { var n = Object.assign({}, o); delete n[id]; return n; });
      }, 280);
      tasks.forEach(function (t) { if (!t.done && (t.blockedBy || []).indexOf(id) >= 0 && openBlockers(t).filter(function (x) { return x.id !== id; }).length === 0) notify(t.owner || '', 'Unblocked: ' + t.name + ' (after "' + cur.name + '")', t.id); });
      runRules(cur);
      if (cur.repeat && !cur.milestone) {
        var days = SR.CADENCE_DAYS[cur.repeat] || 7, nx = cur.date || SR.TODAY; nx = SR.addDays(nx, days); while (nx <= SR.TODAY) nx = SR.addDays(nx, days);
        setTimeout(function () { patch(id, { done: false, date: nx, deadline: '', ran: (cur.ran || 0) + 1, subs: (cur.subs || []).map(function (s) { return Object.assign({}, s, { done: false }); }) }); }, 1250);
      }
    };
    toggleRef.current = toggle;
    var addComment = function (id, text) {
      var tk = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) tk = tasks[i]; if (!tk || !text.trim()) return;
      var c = { id: 'c' + Date.now(), who: me, text: text.trim(), ts: new Date().toISOString() };
      setTasks(function (ts) { return ts.map(function (t) { return t.id === id ? Object.assign({}, t, { comments: (t.comments || []).concat([c]) }) : t; }); });
      var men = SR.mentionsIn(c.text), sent = {};
      men.forEach(function (n) { if (n !== me) { sent[n] = 1; notify(n, me + ' mentioned you on "' + tk.name + '": ' + c.text, id); } });
      if (tk.owner && tk.owner !== me && !sent[tk.owner]) notify(tk.owner, me + ' commented on "' + tk.name + '": ' + c.text, id);
    };
    var bulkPatch = function (map, msg) { undoable(msg, function () { setTasks(function (ts) { return ts.map(function (t) { return map[t.id] ? Object.assign({}, t, map[t.id]) : t; }); }); }); };
    SR._dbg = function () { return { tasks: tasks, events: events }; };
    SR.act2 = { patch: patch, bulkPatch: bulkPatch, me: me, notify: notify, events: events, setEvents: setEvents, gacc: gacc, gmsg: gmsg, syncNow: syncNow };
    /* scheduling: place tasks into free hours. ids = array of task ids, or true for everything the scheduler placed before */
    var scheduleTasks = function (ids, msg) {
      var res = SR.autoSchedule(tasks, events, { redo: ids });
      var map = {}; Object.keys(res).forEach(function (k) { if (k.slice(0, 2) !== '__') map[k] = res[k]; });
      var n = Object.keys(map).length; if (!n) { toast('Nothing to schedule.'); return; }
      bulkPatch(map, (msg || 'Scheduled') + ': ' + n + ' task' + (n > 1 ? 's' : '') + (res.__late ? ', ' + res.__late + ' still after the deadline' : ''));
    };
    var addTaskScheduled = function (name) {
      var t = { id: seq, clientId: 'agency', name: name, owner: me, date: SR.TODAY, est: 30, subs: [], note: '' };
      var res = SR.autoSchedule(tasks.concat([t]), events, {}), r = res[t.id];
      if (r) t = Object.assign(t, r);
      setTasks(function (ts) { return ts.concat([t]); }); setSeq(seq + 1); toast(r ? 'Scheduled ' + SR.fmtDeadline(r.date) + ' at ' + r.time : 'Task added');
    };
    var startTimer = function (id) { patch(id, { timer: new Date().toISOString() }); };
    var stopTimer = function (id) {
      var t = tasks.filter(function (x) { return x.id === id; })[0]; if (!t || !t.timer) return;
      var m = Math.max(1, Math.round((Date.now() - new Date(t.timer).getTime()) / 60000)); logTime(id, m); patch(id, { timer: '' });
    };
    var logTime = function (id, m) {
      var t = tasks.filter(function (x) { return x.id === id; })[0]; if (!t) return;
      var p0 = SR.logTime(t, m); patch(id, p0);
      if (!t.done && (p0.spent >= SR.estOf(t)) && m > 0) setTimeout(function () { toggleRef.current(id); }, 60);
    };
    SR.act2.schedule = scheduleTasks; SR.act2.logTime = logTime; SR.act2.startTimer = startTimer; SR.act2.stopTimer = stopTimer;
    var setPhase = function (cid, ph) { setPhaseSel(function (o) { var n = Object.assign({}, o); n[cid] = ph; return n; }); };
    var onSelect = function (id) { setSelected(function (sv) { var n = Object.assign({}, sv); if (n[id]) delete n[id]; else n[id] = true; return n; }); };
    var clearSel = function () { setSelected({}); };
    var bulk = function (obj) { var ids = Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number); setTasks(function (ts) { return ts.map(function (t) { return ids.indexOf(t.id) > -1 ? Object.assign({}, t, obj) : t; }); }); };
    var bulkComplete = function () { Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number).forEach(function (id) { toggle(id); }); clearSel(); };
    var addCustom = function (list) { var id = seq; var out = list.map(function (t) { return Object.assign({ id: id++, owner: me, date: SR.TODAY, done: false, subs: [], note: '' }, t); }); setTasks(function (ts) { return ts.concat(out); }); setSeq(id); toast(out.length + (out.length > 1 ? ' tasks added' : ' task added')); };
    var addTask = function () { if (!newTask.trim()) return; var t = { id: seq, clientId: screen === 'client' ? activeClient : 'agency', name: newTask.trim(), owner: SR.TEAM.indexOf(who) >= 0 ? who : me, date: SR.TODAY, subs: [], note: '' }; setTasks(tasks.concat([t])); setSeq(seq + 1); setNewTask(''); setOpenId(t.id); };
    var toggleSub = function (id, i) { patch(id, function (t) { var subs = t.subs.map(function (s, j) { return j === i ? Object.assign({}, s, { done: !s.done }) : s; }); return { subs: subs, done: subs.length && subs.every(function (s) { return s.done; }) ? true : t.done }; }); };
    var addSub = function (id) { if (!subDraft.trim()) return; patch(id, function (t) { return { subs: (t.subs || []).concat([{ name: subDraft.trim(), done: false }]) }; }); setSubDraft(''); };

    var openClient = function (id) { setActiveClient(id); setClientTab('overview'); setExp({}); setScreen('client'); setSelected({}); setOpenId(null); };
    var goResults = function (id) { setResPick(id); setScreen('results'); setOpenId(null); };
    var goLive = function (id, pt) {
      var c = SR.clientById(clients, id); pt = pt || c.type; var tp = SR.TEMPLATES[pt], add = [], n = seq, have = {};
      setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; if (pt === x.type) return Object.assign({}, x, { live: true }); var lp = Object.assign({}, x.liveP); lp[pt] = true; return Object.assign({}, x, { liveP: lp }); }); });
      tasks.forEach(function (t) { if (t.clientId === id && (t.proj || c.type) === pt) have[t.name] = true; });
      tp.maintenance.forEach(function (grp) {
        var days = SR.CADENCE_DAYS[grp.label] || 7;
        grp.items.forEach(function (raw) {
          var it = SR.item(raw); if (have[it.name]) return;
          add.push({ id: n++, clientId: id, proj: pt, name: it.name, how: it.how, owner: /update/i.test(it.name) ? (c.owner || me) : me, date: SR.addDays(SR.TODAY, days), repeat: grp.label, maint: true, done: false, subs: [], note: '' });
        });
      });
      (tp.milestones || []).forEach(function (m) {
        add.push({ id: n++, clientId: id, proj: pt, name: m[0] + ': ' + m[1], how: m[1].split(' · '), owner: me, date: '', milestone: true, maint: true, done: false, subs: [], note: '' });
      });
      setTasks(function (ts) { return ts.concat(add); }); setSeq(n); setExp({});
      var pk = pt === c.type ? id : id + ':' + pt; setPhase(pk, 'ongoing'); setJustLive(pk); setTimeout(function () { setJustLive(null); }, 1800);
      toast('Setup done. Ongoing checklists added for ' + c.name + '.');
    };
    /* auto switch to Ongoing when every setup task is done */
    useEffect(function () {
      for (var i = 0; i < clients.length; i++) {
        var c = clients[i]; if (!c.built) continue;
        var pts = c.projects || [c.type];
        for (var j = 0; j < pts.length; j++) {
          var pt = pts[j]; if (SR.isLive(c, pt) || !SR.TEMPLATES[pt] || !SR.setupTotal(pt)) continue;
          var st = tasks.filter(function (t) { return t.clientId === c.id && (t.proj || c.type) === pt && t.step && !t.maint; });
          if (st.length >= SR.setupTotal(pt) && st.every(function (t) { return t.done; })) {
            var cid = c.id, cpt = pt; var h = setTimeout(function () { goLive(cid, cpt); }, 1500);
            return function () { clearTimeout(h); };
          }
        }
      }
    }, [tasks]);
    useEffect(function () {
      if (!openId) return;
      var k = function (e) { if (e.key === 'Escape') setOpenId(null); };
      window.addEventListener('keydown', k); return function () { window.removeEventListener('keydown', k); };
    }, [openId]);

    /* onboarding */
    var setField = function (k, v) { setDraft(function (d) { var n = Object.assign({}, d); n[k] = v; return n; }); };
    var createClient = function () {
      var id = (draft.name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || ('client' + seq);
      var tp = SR.TEMPLATES[proj];
      var math = proj === 'seo' ? {} : proj === 'aeo' ? { vis: parseFloat(draft.vis) || 0, by: draft.by, prompts: parseFloat(draft.prompts) || 0, articles: parseFloat(draft.articles) || 0 }
        : { leads: parseFloat(draft.leads) || 0, cvr: parseFloat(draft.cvr) || 0, cpc: parseFloat(draft.cpc) || 0, cpm: parseFloat(draft.cpm) || 0, ctr: parseFloat(draft.ctr) || 0, volume: parseFloat(draft.volume) || 0, close: parseFloat(draft.close) || 0, deal: parseFloat(draft.deal) || 0, margin: parseFloat(draft.margin) || 0, comm: parseFloat(draft.comm) || 0 };
      var promise = proj === 'seo' ? 'More calls and leads from local search' : proj === 'aeo' ? ((draft.vis || '20') + '% AI visibility' + (draft.market ? ' in ' + draft.market : '')) : ((draft.leads || '') + ' leads a month from ' + tp.label);
      var colors = ['#5B86C5', '#3FA56A', '#D08A2E', '#9B7FD6', '#D0607A', '#6C6FD0'];
      var c = { id: id, name: draft.name || 'New client', color: colors[clients.length % colors.length], contact: draft.contact, email: draft.email, region: draft.region, owner: draft.owner, type: proj, built: true, live: false,
        promise: promise, retainer: parseFloat(draft.retainer) || 0, setup: parseFloat(draft.setup) || 0, term: draft.term, start: draft.start, updates: draft.updates, nextUpdate: '—', math: math, domain: draft.domain || '', seoId: draft.seoId || id };
      var newTasks = SR.genTasks(c, seq);
      setClients(clients.concat([c])); setTasks(tasks.concat(newTasks)); setSeq(seq + newTasks.length + 1); setDoneClient(c);
    };
    var setGoal = function (id, type, g) {
      setClients(function (cs) { return cs.map(function (x) {
        if (x.id !== id) return x;
        var pg = Object.assign({}, x.pg); pg[type] = g; var n = Object.assign({}, x, { pg: pg });
        if (type === x.type) { n.promise = g.text; var m = Object.assign({}, x.math); if (g.unit === '%') m.vis = g.target; else m.leads = g.target; n.math = m; }
        return n; }); });
    };
    var addProject = function (id, type) {
      var c = SR.clientById(clients, id), tp = SR.TEMPLATES[type];
      var pr = { gads: 'Leads from Google Ads', meta: 'Leads from Meta Ads', seo: 'More calls and leads from search and AI answers' }[type];
      var nt = tp.phases.length ? SR.genTasks(Object.assign({}, c, { type: type, start: SR.TODAY }), seq) : [];
      setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; var pg = Object.assign({}, x.pg); pg[type] = { text: pr, target: 0, unit: 'leads' }; return Object.assign({}, x, { projects: (x.projects || [x.type]).concat([type]), pg: pg, built: true }); }); });
      if (nt.length) { setTasks(function (ts) { return ts.concat(nt); }); setSeq(seq + nt.length + 1); }
      setProjSel(function (o) { var n = Object.assign({}, o); n[id] = type; return n; }); setClientTab('overview');
      toast(tp.label + ' project added to ' + c.name + '.');
    };
    var onbNext = function () { if (step < 4) setStep(step + 1); else createClient(); };
    var onbBack = function () { if (step > 0) setStep(step - 1); };
    var onbReset = function () { setStep(0); setProj('gads'); setDraft(BLANK_DRAFT()); setDoneClient(null); };
    var startOnboard = function () { onbReset(); setScreen('onboard'); };

    var deleteClient = function (id) {
      undoable('Client deleted', function () {
        setClients(function (cs) { return cs.filter(function (x) { return x.id !== id; }); });
        setTasks(function (ts) { return ts.filter(function (t) { return t.clientId !== id; }); });
        delete SR.acct[id]; setDelId(null); setOpenId(null);
        if (activeClient === id) { setScreen('home'); }
      });
    };

    /* ---------- right-click menus, delete project, edit client ---------- */
    SR.openMenu = function (e, items) { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, items: items }); };
    SR.openMenuAt = function (x, y, items) { setCtxMenu({ x: x, y: y, items: items }); };
    var ask = function (title, body, ok, fn) { setCf({ title: title, body: body, ok: ok, danger: true, fn: fn }); };
    var duplicateTask = function (id) {
      var t = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) t = tasks[i];
      if (!t) return;
      var n = Object.assign({}, t, { id: seq, name: t.name + ' (copy)', done: false, status: '', subs: (t.subs || []).map(function (s) { return Object.assign({}, s, { done: false }); }) });
      setTasks(function (ts) { var out = []; ts.forEach(function (x) { out.push(x); if (x.id === id) out.push(n); }); return out; });
      setSeq(seq + 1); toast('Task duplicated');
    };
    var removeTask = function (id) { undoable('Task deleted', function () { setTasks(function (ts) { return ts.filter(function (t) { return t.id !== id; }); }); if (openId === id) setOpenId(null); }); };
    SR.taskMenu = function (e, t) {
      SR.openMenu(e, [
        { label: 'Open', fn: function () { openFn(t.id); } },
        t.how && t.how.length ? { label: 'Show how to do it', fn: function () { openFn(t.id, true); } } : null,
        { label: t.done ? 'Mark as not done' : 'Mark complete', fn: function () { toggle(t.id); } },
        { sep: true },
        { label: 'Duplicate', fn: function () { duplicateTask(t.id); } },
        { head: 'Assign to' },
      ].concat(SR.TEAM.map(function (n) { return { label: n, hint: t.owner === n ? '✓' : '', fn: function () { patch(t.id, { owner: n }); } }; })).concat([
        { label: 'Unassign', fn: function () { patch(t.id, { owner: '' }); } },
        { head: 'Attack date' },
        { label: 'Today', fn: function () { patch(t.id, { date: SR.TODAY }); } },
        { label: 'Tomorrow', fn: function () { patch(t.id, { date: SR.addDays(SR.TODAY, 1) }); } },
        { label: 'Next week', fn: function () { patch(t.id, { date: SR.addDays(SR.TODAY, 7) }); } },
        { label: 'No date', fn: function () { patch(t.id, { date: '' }); } },
        { sep: true },
        { label: 'Save as a template', fn: function () { saveTpl(t); } },
        { label: 'Delete task', danger: true, fn: function () { removeTask(t.id); } }
      ]).filter(Boolean));
    };
    var deleteProject = function (id, type) {
      var c = SR.clientById(clients, id), projs = c.projects || [c.type];
      if (projs.length < 2) { toast('A client needs at least one project. Delete the client instead.'); return; }
      undoable(SR.TEMPLATES[type].label + ' project deleted', function () {
      var rest = projs.filter(function (t) { return t !== type; });
      setClients(function (cs) { return cs.map(function (x) {
        if (x.id !== id) return x;
        var n = Object.assign({}, x, { projects: rest }), pg = Object.assign({}, x.pg); delete pg[type]; n.pg = pg;
        if (x.liveP) { var lp = Object.assign({}, x.liveP); delete lp[type]; n.liveP = lp; }
        if (type === x.type) { var nt = rest[0]; n.type = nt; n.math = {}; n.promise = (pg[nt] || {}).text || ''; n.live = !!(x.liveP && x.liveP[nt]); }
        return n; }); });
      setTasks(function (ts) { return ts.filter(function (t) { return !(t.clientId === id && (t.proj || c.type) === type); }); });
      var pid = type === c.type ? id : id + ':' + type;
      if (SR.orgP) delete SR.orgP[pid]; if (SR.orgT) delete SR.orgT[pid]; if (type === 'gads' && SR.periods) delete SR.periods[id];
      setProjSel(function (o) { var n = Object.assign({}, o); n[id] = rest[0]; return n; }); setClientTab('overview');
      });
    };
    var resetProject = function (id, type) {
      var c = SR.clientById(clients, id), T = SR.TEMPLATES[type];
      undoable(T.label + ' tasks reset to the defaults', function () {
      var nt = T.phases.length ? SR.genTasks(Object.assign({}, c, { type: type, start: SR.TODAY }), seq) : [];
      setTasks(function (ts) { return ts.filter(function (t) { return !(t.clientId === id && (t.proj || c.type) === type); }).concat(nt); });
      setSeq(seq + nt.length + 1);
      setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; if (type === x.type) return Object.assign({}, x, { live: false }); var lp = Object.assign({}, x.liveP); lp[type] = false; return Object.assign({}, x, { liveP: lp }); }); });
      setPhaseSel(function (o) { var n = Object.assign({}, o); delete n[type === c.type ? id : id + ':' + type]; return n; });
      });
    };
    var duplicateClient = function (id) {
      var c = SR.clientById(clients, id), nid = id + '-copy' + seq, projs = c.projects || [c.type];
      var n = Object.assign({}, c, { id: nid, name: c.name + ' (copy)', live: false, liveP: {}, nextUpdate: '—' });
      var add = [], sq = seq;
      projs.forEach(function (pt) { var T = SR.TEMPLATES[pt]; if (T.phases.length) { var g = SR.genTasks(Object.assign({}, n, { type: pt, start: SR.TODAY }), sq); sq += g.length + 1; add = add.concat(g); } });
      setClients(function (cs) { return cs.concat([n]); }); setTasks(function (ts) { return ts.concat(add); }); setSeq(sq + 1);
      toast('Client duplicated with fresh default tasks');
    };
    var saveClient = function (id, f, m) {
      setClients(function (cs) { return cs.map(function (x) {
        if (x.id !== id) return x;
        var n = Object.assign({}, x, f, { retainer: parseFloat(f.retainer) || 0, setup: parseFloat(f.setup) || 0 });
        var math = Object.assign({}, x.math); Object.keys(m).forEach(function (k) { var v = m[k]; math[k] = k === 'by' ? v : (v === '' || v == null ? 0 : (parseFloat(v) || 0)); });
        n.math = math;
        var T = SR.TEMPLATES[x.type];
        if (T && T.kind === 'ads' && f.promise === x.promise && /^\d+(\.\d+)? leads a month from /.test(x.promise || '') && math.leads) n.promise = math.leads + ' leads a month from ' + T.label;
        return n; }); });
      setEditId(null); toast('Client saved');
    };
    SR.act = { edit: function (id) { setEditId(id); }, delProject: function (id, type) { var T = SR.TEMPLATES[type]; ask('Delete the ' + T.label + ' project?', 'Its tasks and logged results are removed. The client and the other projects stay.', 'Delete project', function () { deleteProject(id, type); }); }, resetProject: function (id, type) { var T = SR.TEMPLATES[type]; ask('Reset ' + T.label + ' to the defaults?', 'All its tasks, ticks and deadlines go back to the default list. Logged results stay.', 'Reset tasks', function () { resetProject(id, type); }); }, canDelProject: function (id) { var c = SR.clientById(clients, id); return (c.projects || [c.type]).length > 1; } };
    SR.clientMenu = function (e, c) {
      var projs = c.projects || [c.type], missing = SR.PROJ_TYPES.filter(function (t) { return projs.indexOf(t) < 0; });
      SR.openMenu(e, [
        { label: 'Open', fn: function () { openClient(c.id); } },
        { label: 'Edit client details', fn: function () { setEditId(c.id); } },
        { sep: true }
      ].concat(missing.length ? [{ head: 'Add a project' }].concat(missing.map(function (t) { return { label: SR.TEMPLATES[t].label, fn: function () { openClient(c.id); addProject(c.id, t); } }; })).concat([{ sep: true }]) : [])
       .concat([{ label: 'Duplicate client', fn: function () { duplicateClient(c.id); } }, { sep: true }, { label: 'Delete client', danger: true, fn: function () { ask('Delete ' + c.name + '?', 'The client, its projects, tasks and results are removed. This cannot be undone.', 'Delete client', function () { deleteClient(c.id); }); } }]));
    };

    /* ---------- drag and drop, templates, palette ---------- */
    var moveTask = function (id, beforeId, date) {
      setTasks(function (ts) {
        var t = null, rest = ts.filter(function (x) { if (x.id === id) { t = x; return false; } return true; });
        if (!t) return ts;
        var n = Object.assign({}, t); if (date !== undefined && date !== null) n.date = date;
        var i = beforeId == null ? rest.length : rest.findIndex(function (x) { return x.id === beforeId; }); if (i < 0) i = rest.length;
        rest.splice(i, 0, n); return rest;
      });
    };
    SR.dnd = { dropOnTask: function (id, targetId, date) { moveTask(id, targetId, date); }, dropOnDay: function (id, date) { patch(id, { date: date }); toast('Moved to ' + (date ? SR.fmtDeadline(date) : 'no date')); }, dropOnPerson: function (id, name) { patch(id, { owner: name }); toast(name ? 'Assigned to ' + name : 'Unassigned'); } };
    var addFromTemplate = function (tp) {
      var t = { id: seq, clientId: screen === 'client' ? activeClient : 'agency', name: tp.name, owner: tp.owner || '', how: tp.how || [], repeat: tp.repeat || '', date: SR.TODAY, subs: (tp.subs || []).map(function (n) { return { name: n, done: false }; }), note: tp.note || '' };
      setTasks(function (ts) { return ts.concat([t]); }); setSeq(seq + 1); setOpenId(t.id); toast('Task created from the template');
    };
    var saveTpl = function (t) { var arr = SR.customTpl(); arr.push({ name: t.name, how: t.how || [], repeat: t.repeat || '', owner: t.owner || '', subs: (t.subs || []).map(function (s) { return s.name; }), note: t.note || '' }); SR.saveCustomTpl(arr); toast('Saved as a template'); };
    SR.templateMenu = function (x, y) {
      var cust = SR.customTpl();
      var items = [{ head: 'Create a task from' }].concat(SR.BUILTIN_TPL.concat(cust).map(function (tp) { return { label: tp.name, hint: tp.repeat || '', fn: function () { addFromTemplate(tp); } }; }));
      if (cust.length) { items.push({ sep: true }, { head: 'Remove a saved template' }); cust.forEach(function (tp, i) { items.push({ label: tp.name, danger: true, fn: function () { var arr = SR.customTpl(); arr.splice(i, 1); SR.saveCustomTpl(arr); toast('Template removed'); } }); }); }
      SR.openMenuAt(x, y, items);
    };
    var palItems = function () {
      var it = [], edits = [];
      [['home', 'Home'], ['clients', 'Clients'], ['calendar', 'Calendar'], ['results', 'Results']].forEach(function (n) { it.push({ g: 'Go to', label: n[1], sub: 'Page', fn: function () { setScreen(n[0]); setOpenId(null); } }); });
      it.push({ g: 'Actions', label: 'Open settings', fn: function () { setSettingsOpen(true); } });
      it.push({ g: 'Actions', label: 'Open automations and connections', fn: function () { setAutoOpen(true); } });
      it.push({ g: 'Actions', label: 'Onboard a new client', fn: startOnboard });
      it.push({ g: 'Actions', label: theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode', fn: function () { setTheme(theme === 'light' ? 'dark' : 'light'); } });
      it.push({ g: 'Actions', label: soundOn ? 'Turn the tick sound off' : 'Turn the tick sound on', fn: function () { var n = !soundOn; SR.setSound(n); setSoundOn(n); } });
      it.push({ g: 'Actions', label: 'Open the Sales dashboard', fn: function () { setScreen('sales'); setOpenId(null); } });
      clients.forEach(function (c) {
        it.push({ g: 'Clients', label: c.name, sub: c.region, color: c.color, fn: function () { openClient(c.id); } });
        edits.push({ g: 'Actions', label: 'Edit ' + c.name, sub: 'Client details', color: c.color, fn: function () { setEditId(c.id); } });
        (c.projects || [c.type]).forEach(function (pt) { it.push({ g: 'Results', label: c.name + ' · ' + SR.TEMPLATES[pt].label + ' results', color: c.color, fn: function () { goResults(pt === c.type ? c.id : c.id + ':' + pt); } }); });
      });
      tasks.forEach(function (t) { var c = SR.clientById(clients, t.clientId); it.push({ g: 'Tasks', label: t.name, sub: c.name + (t.date ? ' · ' + SR.fmtDeadline(t.date) : ''), color: c.color, done: t.done, fn: function () { if (t.clientId && t.clientId !== 'agency') openClient(t.clientId); setOpenId(t.id); } }); });
      return it.concat(edits);
    };
    useEffect(function () {
      var kd = function (e) {
        var k = (e.key || '').toLowerCase();
        if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); setPalOpen(function (o) { return !o; }); }
        else if ((e.metaKey || e.ctrlKey) && k === 'z' && !e.shiftKey) {
          var tg = e.target, typing = tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable);
          if (!typing && SR._lastUndo) { e.preventDefault(); var f = SR._lastUndo; SR._lastUndo = null; f(); }
        }
      };
      document.addEventListener('keydown', kd); return function () { document.removeEventListener('keydown', kd); };
    }, []);
    useEffect(function () {
      var iv = setInterval(function () { if (!SR.tzManual) { var dz = SR.detectTz(); if (dz !== SR.tz) SR.tz = dz; } var t = SR.todayIn(SR.tz); if (t !== SR.TODAY) SR.TODAY = t; setClk(function (x) { return x + 1; }); }, 30000);
      return function () { clearInterval(iv); };
    }, []);
    /* sidebar */
    var navItem = function (on) { return 'min-height:38px;display:flex;align-items:center;gap:10px;padding:0 12px;border:0;border-radius:8px;font-family:inherit;font-size:14px;text-align:left;cursor:pointer;' + (on ? 'background:rgba(255,255,255,0.12);color:#FFF;font-weight:600' : 'background:transparent;color:#C9D2E0'); };
    var sidebar = html`<nav aria-label="Main" style=${'flex:1 1 232px;max-width:280px;background:var(--nav);color:#E8ECF2;padding:20px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px'}>
      <div style="display:flex;align-items:center;gap:10px;padding:0 8px"><div style="width:36px;height:36px;border-radius:7px;background:#000;color:#FFF;font-family:'Playfair Display',Georgia,serif;font-size:16px;display:flex;align-items:center;justify-content:center">SR</div><div style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700">Sarac Ramsay</div></div>
      <div style="display:flex;flex-direction:column;gap:2px">
        ${[['home', 'Home'], ['clients', 'Clients'], ['calendar', 'Calendar'], ['results', 'Results'], ['sales', 'Sales']].map(function (n) { return html`<button key=${n[0]} type="button" onClick=${function () { setScreen(n[0]); setOpenId(null); }} style=${navItem(screen === n[0])}>${n[1]}</button>`; })}
      </div>
      <div style="display:flex;flex-direction:column;gap:2px"><div style="font-size:11px;letter-spacing:0.12em;color:#8E9AB0;font-weight:700;padding:0 12px 6px">CLIENTS</div>
        ${clients.map(function (c) { var on = screen === 'client' && activeClient === c.id; var askd = delId === c.id; return html`<div key=${c.id} class="sr-navrow" onContextMenu=${function (e) { SR.clientMenu(e, c); }}><button type="button" onClick=${function () { openClient(c.id); }} style=${navItem(on) + ';flex:1;min-width:0'}><span style=${'width:9px;height:9px;border-radius:3px;flex:none;background:' + c.color}></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</span></button>
          <button type="button" class="sr-navmore" aria-label=${'Options for ' + c.name} title="Options" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); SR.clientMenu({ preventDefault: function () {}, stopPropagation: function () {}, clientX: r.right, clientY: r.bottom + 4 }, c); }}>⋯</button>
          <button type="button" class=${'sr-navdel' + (askd ? ' ask' : '')} aria-label=${'Delete ' + c.name} title="Delete client" onClick=${function () { if (askd) deleteClient(c.id); else { setDelId(c.id); setTimeout(function () { setDelId(function (x) { return x === c.id ? null : x; }); }, 3000); } }}>${askd ? 'Delete?' : SR.Icon('close', 13)}</button></div>`; })}
        <button type="button" onClick=${startOnboard} style="min-height:36px;margin-top:8px;padding:0 12px;border-radius:8px;border:1px dashed #3A4A66;background:transparent;color:#A9C1E8;font-family:inherit;font-size:14px;text-align:left;cursor:pointer">+ Onboard client</button>
      </div>
    </nav>`;

    var crumb = screen === 'client' ? 'Clients › ' + SR.clientById(clients, activeClient).name : { home: 'Home', clients: 'Clients', results: 'Results', onboard: 'New client', sales: 'Sales', calendar: 'Calendar' }[screen];
    var topbar = html`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px">
      <div style="font-size:13px;color:var(--muted)">${crumb}</div>
      <div style="display:flex;align-items:center;gap:8px">
      <span class=${"savest " + saveState} title=${SR.store.mode === "cloud" ? "Saved to Supabase" : "Saved in this browser only"}>${saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved, retrying" : (SR.store.mode === "cloud" ? "Saved" : "Saved on this device")}</span>
      <${SR.Bell} notifs=${notifs} me=${me} setMe=${setMe} open=${bellOpen} setOpen=${setBellOpen} onOpenTask=${function (id) { if (id != null) { setBellOpen(false); setOpenId(id); } }} setNotifs=${setNotifs} onAuto=${function () { setBellOpen(false); setAutoOpen(true); }} />
      <button type="button" class="kbtn" onClick=${function () { setPalOpen(true); }} aria-label="Search and commands">Search <kbd>${/Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘' : 'Ctrl'} K</kbd></button>
      <button type="button" class="tb-av" aria-label="Your account and settings" title=${me} onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); var it = [{ head: me }, { label: 'Settings', fn: function () { setSettingsOpen(true); } }, { label: 'Edit profile', fn: function () { setProfOpen(true); } }]; if (SR.store.mode === 'cloud') it.push({ sep: true }, { label: 'Sign out', danger: true, fn: function () { SR.store.signOut(); } }); SR.openMenuAt(r.right - 200, r.bottom + 6, it); }}>${SR.Avatar(me, 34)}</button>
      </div>
    </div>`;

    var taskProps = { tasks: tasks, clients: clients, sel: selected, onToggle: toggle, onOpen: openFn, onSelect: onSelect, onClearSel: clearSel, onBulk: bulk, newTask: newTask, onNewTask: setNewTask, onAdd: addTask, settling: settling, just: just, openId: openId };

    var body;
    if (screen === 'home') body = html`<${SR.Home} ...${taskProps} who=${who} setWho=${setWho} />`;
    else if (screen === 'calendar') body = html`<${SR.CalendarPage} tasks=${tasks} clients=${clients} events=${events} setEvents=${setEvents} me=${me} gacc=${gacc} glist=${glist} gmsg=${gmsg} syncNow=${syncNow} gPrimary=${function (a) { SR.store.gPrimary(a).then(function () { toast('Primary account changed'); }, function (e) { toast(e.message); }); }} gDisconnect=${function (a) { SR.store.gDisconnect(a).then(function () { toast('Google account disconnected'); }, function (e) { toast(e.message); }); }} onOpen=${openFn} onToggle=${toggle} onPatch=${patch} onAddTask=${addTaskScheduled} onSchedule=${scheduleTasks} drawerOpen=${!!openId} justDone=${just} />`;
    else if (screen === 'clients') body = html`<${SR.Clients} tasks=${tasks} clients=${clients} openClient=${openClient} go=${startOnboard} />`;
    else if (screen === 'onboard') body = html`<${SR.Onboarding} draft=${draft} step=${step} proj=${proj} setProj=${setProj} setField=${setField} next=${onbNext} back=${onbBack} reset=${onbReset} doneClient=${doneClient} openClient=${openClient} />`;
    else if (screen === 'sales') body = html`<iframe class="sales-frame" title="Sales dashboard" src=${'./sales/index.html?v=' + (SR.BUILD || 1)}></iframe>`;
    else if (screen === 'results') body = html`<${SR.Results} clients=${clients} resPick=${resPick} setResPick=${setResPick} period=${period} setPeriod=${setPeriod} imported=${imported} doImport=${function (id) { setImported(function (o) { var n = Object.assign({}, o); n[id] = true; return n; }); }} />`;
    else body = html`<${SR.ClientPage} proj=${projSel[activeClient]} setProj=${function (t) { setProjSel(function (o) { var n = Object.assign({}, o); n[activeClient] = t; return n; }); }} addProject=${addProject} setGoal=${setGoal} client=${SR.clientById(clients, activeClient)} tasks=${tasks} tab=${clientTab} setTab=${setClientTab} exp=${exp} toggleExp=${function (id, v) { setExp(function (e) { var n = Object.assign({}, e); n[id] = v; return n; }); }} rm=${rm} setRm=${setRm} ac=${ac} setAc=${setAc} onToggle=${toggle} onOpen=${openFn} goResults=${goResults} goLive=${goLive} sel=${selected} onSelect=${onSelect} openId=${openId} settling=${settling} just=${just} phaseSel=${phaseSel} setPhase=${setPhase} justLive=${justLive} addCustom=${addCustom} />`;

    var openTask = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === openId) openTask = tasks[i];
    var selCount = Object.keys(selected).filter(function (k) { return selected[k]; }).length;
    var where = '';
    if (openTask) {
      var oc = SR.clientById(clients, openTask.clientId), tpl = SR.TEMPLATES[openTask.proj || oc.type];
      if (openTask.maint || openTask.repeat) where = 'Ongoing';
      else if (tpl && openTask.step) tpl.phases.forEach(function (ph) { ph.steps.forEach(function (st) { if (st[0] === openTask.step) where = ph.name + ' · ' + st[1]; }); });
    }

    return html`<div style="font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-wrap:wrap;align-items:stretch">
      ${sidebar}
      <main class=${"sr-main" + (screen === "sales" ? " on-sales" : "")} style=${"flex:999 1 640px;min-width:0;position:relative;box-sizing:border-box;padding:22px " + (openTask && screen !== "calendar" ? 424 : 34) + "px 120px 34px"}>
        ${topbar}
        ${body}
        ${openTask ? html`<${SR.TaskDrawer} showHow=${showHow} task=${openTask} clients=${clients} where=${where} subDraft=${subDraft} onSubDraft=${setSubDraft}
          onClose=${function () { setOpenId(null); }} onPatch=${patch} onDelete=${function (id) { removeTask(id); }} onOpenClient=${screen === 'client' ? null : function (cid) { setOpenId(null); openClient(cid); }} onToggle=${toggle} onToggleSub=${toggleSub} onAddSub=${addSub} onComment=${addComment} me=${me} allTasks=${tasks} onLog=${logTime} onTimer=${function (id, on) { if (on) startTimer(id); else stopTimer(id); }} onSchedule=${scheduleTasks} />` : null}
      </main>
      <${SR.BulkBar} onDelete=${function () { var ids = Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number); undoable(ids.length + ' tasks deleted', function () { setTasks(function (ts) { return ts.filter(function (t) { return ids.indexOf(t.id) < 0; }); }); clearSel(); }); }} dock=${!!openTask} count=${selCount} onBulk=${bulk} onComplete=${bulkComplete} onClearSel=${clearSel} />
      ${ctxMenu ? html`<${SR.CtxMenu} menu=${ctxMenu} onClose=${function () { setCtxMenu(null); }} />` : null}
      ${cf ? html`<${SR.Confirm} cf=${cf} onClose=${function () { setCf(null); }} />` : null}
      ${editId ? html`<${SR.EditClient} key=${editId} client=${SR.clientById(clients, editId)} onClose=${function () { setEditId(null); }} onSave=${saveClient} />` : null}
      ${autoOpen ? html`<${SR.AutoModal} rules=${rules} setRules=${setRules} onClose=${function () { setAutoOpen(false); }} tasks=${tasks} events=${events} clients=${clients} />` : null}
      ${settingsOpen ? html`<${SR.SettingsModal} me=${me} theme=${theme} setTheme=${setTheme} soundOn=${soundOn} setSound=${function (v) { SR.setSound(v); setSoundOn(v); }} setTz=${function (z) { SR.setTz(z); setClk(function (c) { return c + 1; }); }} gacc=${gacc} glist=${glist} gmsg=${gmsg} syncNow=${syncNow} gPrimary=${function (a) { SR.store.gPrimary(a).then(function () { toast('Primary account changed'); }, function (e) { toast(e.message); }); }} gDisconnect=${function (a) { SR.store.gDisconnect(a).then(function () { toast('Google account disconnected'); }, function (e) { toast(e.message); }); }} onProfile=${function () { setSettingsOpen(false); setProfOpen(true); }} onClose=${function () { setSettingsOpen(false); }} />` : null}
      ${profOpen ? html`<${SR.ProfileModal} profile=${SR.ME} onClose=${function () { setProfOpen(false); }} onSave=${function (p) { var old = SR.ME && SR.ME.username; return SR.store.saveProfile(p).then(function (row) { SR.ME = row; if (old && old !== row.username) renameOwner(old, row.username); SR.applyProfiles(Object.keys(SR.PROFILES).map(function (k) { return SR.PROFILES[k]; }).filter(function (x) { return x.user_id !== row.user_id; }).concat([row])); setMeS(row.username); setProfOpen(false); toast('Profile saved'); }); }} />` : null}
      ${palOpen ? html`<${SR.Palette} items=${palItems()} onClose=${function () { setPalOpen(false); }} />` : null}
      ${toastMsg ? html`<div role="status" class="sr-toast">${SR.Icon('check', 15)} ${toastMsg}${toastUndo ? html`<button type="button" class="sr-undo" onClick=${function () { var f = toastUndo.fn; setToastMsg(''); setToastUndo(null); SR._lastUndo = null; f(); }}>Undo</button>` : null}</div>` : null}
    </div>`;
  }

  /* sign in / create account, profile set up, then load saved data and show the app */
  function Root() {
    var ps = useState('boot'), phase = ps[0], setPhase = ps[1];
    var es = useState(''), err = es[0], setErr = es[1];
    var ms = useState('in'), mode = ms[0], setMode = ms[1];
    var fs = useState({ email: '', pw: '', pw2: '', keep: (function () { try { return localStorage.getItem('sr_remember') !== '0'; } catch (e) { return true; } })() }), f = fs[0], setF = fs[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1];
    var upd = function (k, v) { var o = Object.assign({}, f); o[k] = v; setF(o); };
    var load = function () {
      return SR.store.load().then(function (d) {
        var k = d.kv || {};
        ['periods', 'orgP', 'orgT', 'metaReal', 'acct'].forEach(function (n) { if (k[n] && SR[n]) { Object.keys(SR[n]).forEach(function (x) { delete SR[n][x]; }); Object.assign(SR[n], k[n]); } });
        var tasks = d.tasks; if (tasks && k.order) { var ix = {}; k.order.forEach(function (id, i) { ix[id] = i; }); tasks = tasks.slice().sort(function (a, b) { return (ix[a.id] == null ? 1e9 : ix[a.id]) - (ix[b.id] == null ? 1e9 : ix[b.id]); }); }
        var ev = d.events; if (!ev && SR.store.mode === 'local') { var old = SR.jget('sr_events', null); if (old) ev = old; }
        SR.INIT = { clients: k.clients || null, tasks: tasks, seq: k.seq || 0, maxId: d.maxId || 0, rules: k.rules || null, notifs: d.notifs, events: ev, gacc: d.gacc, gaccList: d.gaccList || (d.gacc ? [d.gacc] : []) };
        if (location.search.indexOf('gcal=') >= 0) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
        setPhase('ready');
      }, function (e) { setErr(String(e && e.message || e)); setPhase('error'); });
    };
    /* after a session exists: is this email allowed, and does it have a profile yet */
    var enter = function () {
      if (SR.store.mode !== 'cloud') return SR.store.profiles().then(function (list) {
        var mine = list[0]; if (!mine) { setPhase('profile'); return; }
        var extras = SR.TEAM.filter(function (n) { return n !== mine.username; }); SR.applyProfiles([mine]); SR.TEAM = [mine.username].concat(extras); SR.ME = mine; return load();
      });
      return SR.store.allowed().then(function (ok) {
        if (!ok) { setPhase('notallowed'); return; }
        return SR.store.profiles().then(function (list) {
          SR.applyProfiles(list); var mine = list.filter(function (p) { return p.user_id === SR.store.myId(); })[0];
          if (!mine) { setPhase('profile'); return; }
          SR.ME = mine; return SR.store.gaccs().then(function (g) { SR.GACCS = {}; g.forEach(function (r) { SR.GACCS[r.user_id] = r; }); }, function () {}).then(load);
        });
      }, function (e) { setErr(String(e && e.message || e)); setPhase('error'); });
    };
    useEffect(function () {
      SR.store.onRecovery(function () { setErr(''); setPhase('newpw'); });
      SR.store.init().then(function (r) { if (r === 'login') setPhase('login'); else enter(); }, function (e) { setErr(String(e && e.message || e)); setPhase('error'); });
    }, []);
    if (phase === 'ready') return React.createElement(App);
    var box = function (c, wide) { return html`<div class="sr-boot"><div class="sr-bootc" style=${wide ? 'width:min(420px,92vw)' : ''}><div class="sr-bootlogo">SR</div>${c}</div></div>`; };
    var say = function (m) { setErr(m); setBusy(false); };
    if (phase === 'boot') return box(html`<p>Loading…</p>`);
    if (phase === 'error') return box(html`<p>Could not load your data.</p><p class="cal-note">${err}</p><button type="button" class="mdl-b pri" onClick=${function () { location.reload(); }}>Try again</button>`);
    if (phase === 'notallowed') return box(html`<h2 style="margin:0 0 8px">Not on the team yet</h2><p class="cal-note">${(SR.store.user && SR.store.user.email) || 'This email'} has not been added to the Sarac Ramsay dashboard. Ask Matt to add it, then sign in again.</p><button type="button" class="mdl-b pri" onClick=${function () { SR.store.signOut(); }}>Sign out</button>`);
    if (phase === 'profile') return box(html`<h2 style="margin:0 0 6px">${SR.store.mode === 'cloud' ? 'Set up your profile' : 'Welcome. Who is using this?'}</h2><p class="cal-note" style="margin-bottom:14px">Pick a username and a photo. Teammates see these, and use your username to ping you.</p>
      <${SR.ProfileForm} cta="Continue" claimable=${SR.LEGACY.filter(function (n) { return !Object.keys(SR.PROFILES).some(function (k) { return SR.PROFILES[k].claimed === n || k.toLowerCase() === n.toLowerCase(); }); })} onSave=${function (p) { return SR.store.saveProfile(p).then(function (row) { SR.ME = row; return SR.store.profiles().then(function (l) { var extras = SR.TEAM.filter(function (n) { return n !== row.username; }); SR.applyProfiles(l); if (SR.store.mode !== 'cloud') SR.TEAM = [row.username].concat(extras); return load(); }); }); }} />`, true);
    if (phase === 'newpw') return box(html`<form onSubmit=${function (e) { e.preventDefault(); if (f.pw.length < 8) { say('Use at least 8 characters.'); return; } SR.store.newPassword(f.pw).then(function () { setBusy(true); enter(); }, function (x) { say(x.message); }); }}><h2 style="margin:0 0 12px">Choose a new password</h2>
      <input class="cal-in" type="password" autocomplete="new-password" placeholder="New password" value=${f.pw} onInput=${function (e) { upd('pw', e.target.value); }} /><button type="submit" class="mdl-b pri" style="width:100%">Save password</button>${err ? html`<p class="cal-note" style="margin-top:12px">${err}</p>` : null}</form>`);
    var submit = function (e) {
      e.preventDefault(); setErr(''); var em = f.email.trim();
      if (!em) { say('Enter your email.'); return; }
      if (mode === 'reset') { setBusy(true); SR.store.resetPassword(em).then(function () { say('Check your email for the reset link.'); }, function (x) { say(x.message); }); return; }
      if (f.pw.length < 8) { say('Use a password of at least 8 characters.'); return; }
      SR.store.setRemember(f.keep); setBusy(true);
      if (mode === 'up') { if (f.pw !== f.pw2) { say('The passwords do not match.'); return; } SR.store.signUp(em, f.pw).then(function (r) { if (r === 'confirm') { setMode('in'); say('Account created. Check your email to confirm it, then sign in.'); } else enter(); }, function (x) { say(x.message); }); return; }
      SR.store.signIn(em, f.pw).then(function () { enter(); }, function (x) { say(x.message === 'Invalid login credentials' ? 'Wrong email or password.' : x.message); });
    };
    var title = mode === 'up' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in';
    return box(html`<form onSubmit=${submit}>
      <div class="au-tabs"><button type="button" class=${mode !== 'up' ? 'on' : ''} onClick=${function () { setMode('in'); setErr(''); }}>Sign in</button><button type="button" class=${mode === 'up' ? 'on' : ''} onClick=${function () { setMode('up'); setErr(''); }}>Create account</button></div>
      <h2 style="margin:0 0 12px">${title}</h2>
      <input class="cal-in" type="email" placeholder="Work email" autocomplete="username" value=${f.email} onInput=${function (e) { upd('email', e.target.value); }} />
      ${mode !== 'reset' ? html`<input class="cal-in" type="password" placeholder="Password" autocomplete=${mode === 'up' ? 'new-password' : 'current-password'} value=${f.pw} onInput=${function (e) { upd('pw', e.target.value); }} />` : null}
      ${mode === 'up' ? html`<input class="cal-in" type="password" placeholder="Repeat password" autocomplete="new-password" value=${f.pw2} onInput=${function (e) { upd('pw2', e.target.value); }} />` : null}
      ${mode !== 'reset' ? html`<label class="au-chk"><input type="checkbox" checked=${f.keep} onChange=${function (e) { upd('keep', e.target.checked); }} /> Keep me signed in on this device</label>` : null}
      <button type="submit" class="mdl-b pri" style="width:100%" disabled=${busy}>${mode === 'up' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
      ${mode === 'in' ? html`<button type="button" class="edbtn" style="border:0;margin-top:6px;width:100%" onClick=${function () { setMode('reset'); setErr(''); }}>Forgot your password?</button>` : null}
      ${mode === 'reset' ? html`<button type="button" class="edbtn" style="border:0;margin-top:6px;width:100%" onClick=${function () { setMode('in'); setErr(''); }}>Back to sign in</button>` : null}
      ${mode !== 'reset' ? html`<div class="au-or">or</div><button type="button" class="edbtn" style="width:100%" onClick=${function () { SR.store.setRemember(f.keep); SR.store.google().catch(function (x) { say(x.message); }); }}>Continue with Google (also connects your calendar)</button>` : null}
      ${err ? html`<p class="cal-note" style="margin-top:12px">${err}</p>` : null}</form>`, true);
  }
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(Root));
})(window.SR);
