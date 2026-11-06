/* Sarac Ramsay Eclipse · root app (state, router, sidebar) */
(function (SR) {
  var html = SR.html, useState = React.useState, useEffect = React.useEffect;

  var BLANK_DRAFT = function () {
    return { name: '', contact: '', email: '', region: '', owner: SR.ME ? SR.ME.username : '', retainer: '', setup: '', term: '3 months', start: SR.addDays(SR.TODAY, 7), updates: 'Weekly',
      leads: '30', cvr: '2.5', cpc: '2', ctr: '5', volume: '', close: '10', deal: '', margin: '20', comm: '10', acct: '', lp: '', cpm: '12', creative: '', pixel: '', domain: '', seoId: '', vis: '20', by: '2026-12-31', market: '', prompts: '25', articles: '4', access: '' };
  };

  function App() {
    var s = useState(SR.getTheme()); var theme = s[0], setTheme = s[1];
    var snd = useState(SR.soundOn()), soundOn = snd[0], setSoundOn = snd[1];
    var nm = useState(function () { try { return localStorage.getItem('sr_navmin') === '1'; } catch (e) { return false; } }); var navMin = nm[0], setNavMinS = nm[1];
    var setNavMin = function (v) { setNavMinS(v); try { localStorage.setItem('sr_navmin', v ? '1' : '0'); } catch (e) {} };
    var co = useState(function () { try { return localStorage.getItem('sr_navclients') !== '0'; } catch (e) { return true; } }); var clientsOpen = co[0], setClientsOpenS = co[1];
    var dr = useState(null), dropAt = dr[0], setDropAt = dr[1];
    var nwS = useState(function () { try { return Math.max(200, Math.min(420, parseInt(localStorage.getItem('sr_navw'), 10) || 232)); } catch (e) { return 232; } }), navW = nwS[0], setNavW = nwS[1];
    var qeS = useState([]), queue = qeS[0], setQueue = qeS[1]; var asS = useState([]), assignIds = asS[0], setAssignIds = asS[1]; var nmS = useState(null), navMenu = nmS[0], setNavMenu = nmS[1]; var rnS = useState(null), renK = rnS[0], setRenK = rnS[1]; var ubS = useState(0), setUb = ubS[1]; SR.uiBump = function () { setUb(function (x) { return x + 1; }); };
    var qfS = useState(function () { try { return localStorage.getItem('sr_qfront') || ''; } catch (e) { return ''; } }), qFront = qfS[0], setQFrontRaw = qfS[1];
    var qoS = useState(''), qOwner = qoS[0], setQOwner = qoS[1], qnS = useState(false), qNeed = qnS[0], setQNeed = qnS[1];
    var setQFront = function (v) { setQFrontRaw(v); setQNeed(false); try { localStorage.setItem('sr_qfront', v); } catch (e) {} };
    var hpS = useState(false), helpOpen = hpS[0], setHelpOpen = hpS[1];
    var vwS = useState(window.innerWidth), vw = vwS[0], setVw = vwS[1];
    useEffect(function () { var f = function () { setVw(window.innerWidth); }; window.addEventListener('resize', f); return function () { window.removeEventListener('resize', f); }; }, []);
    var navRef = React.useRef(null); SR.useFlip(navRef, '.sr-navrow[data-fk]', 'data-fk');
    var setClientsOpen = function (v) { setClientsOpenS(v); try { localStorage.setItem('sr_navclients', v ? '1' : '0'); } catch (e) {} };
    var na = useState(false); var navAuto = na[0], setNavAuto = na[1];
    useEffect(function () { var on = function (e) { if (e.data && e.data.sr === 'nav') setNavAuto(!!e.data.compact); }; window.addEventListener('message', on); return function () { window.removeEventListener('message', on); }; }, []);
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
    var openFn = function (id, how) { if (openId === id && !how) { setOpenId(null); return; } setOpenId(id); setShowHow(!!how); };
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
    var afS = useState(''); var activeFront = afS[0], setActiveFront = afS[1];
    var nfS = useState(null); var newFront = nfS[0], setNewFront = nfS[1];
    var FCOL = ['#E0674A', '#3FA796', '#7B6CF6', '#D9A441', '#4B8BE0', '#C45A9B'];
    var addFront = function (name) { name = String(name || '').trim(); if (!name) return; SR.uiprefs.fronts = SR.uiprefs.fronts || {}; var id = 'f_' + Date.now().toString(36), n = Object.keys(SR.uiprefs.fronts).length; SR.uiprefs.fronts[id] = { id: id, name: name, color: FCOL[n % FCOL.length], kind: 'custom' }; setClk(function (c) { return c + 1; }); setActiveFront(id); setScreen('front'); setOpenId(null); };
    var delFront = function (id) { var f = SR.uiprefs.fronts && SR.uiprefs.fronts[id]; if (!f) return; var n = tasks.filter(function (t) { return t.clientId === id; }).length; var rest = Object.assign({}, SR.uiprefs.fronts); delete rest[id]; SR.uiprefs.fronts = rest; if (n) setTasks(function (ts) { return ts.map(function (t) { return t.clientId === id ? Object.assign({}, t, { clientId: 'agency' }) : t; }); }); if (screen === 'front' && activeFront === id) setScreen('home'); setClk(function (c) { return c + 1; }); toast(n ? '"' + f.name + '" removed. Its ' + n + ' task' + (n === 1 ? '' : 's') + ' moved to Agency / Admin.' : '"' + f.name + '" removed'); };
    var renFront = function (id, name) { name = String(name || '').trim(); var f = SR.uiprefs.fronts && SR.uiprefs.fronts[id]; if (!f || !name || name === f.name) return; SR.uiprefs.fronts = Object.assign({}, SR.uiprefs.fronts, (function (o) { o[id] = Object.assign({}, f, { name: name }); return o; })({})); setClk(function (c) { return c + 1; }); };
    var plS = useState(false); var palOpen = plS[0], setPalOpen = plS[1];
    var mnS = useState(null); var ctxMenu = mnS[0], setCtxMenu = mnS[1];
    var cfS = useState(null); var cf = cfS[0], setCf = cfS[1];
    var ecS = useState(null); var editId = ecS[0], setEditId = ecS[1];
    var nfS = useState(function () { return INIT.notifs || []; }); var notifs = nfS[0], setNotifs = nfS[1];
    var rlS = useState(function () { return (INIT.rules || null) && INIT.rules.map(function (r) { return r && r.id === 'r1' && r.match === 'Launch' && r.arg === 'Day-3 check on the launch' ? Object.assign({}, r, { match: 'Launch the campaign' }) : r; }) || [{ id: 'r1', on: true, match: 'Launch the campaign', action: 'create', arg: 'Day-3 check on the launch', owner: '', days: 3 }, { id: 'r2', on: true, match: 'Get client approval', action: 'notify', arg: '', owner: '', days: 0 }]; }); var rules = rlS[0], setRules = rlS[1];
    var meS = useState(function () { return SR.ME ? SR.ME.username : ''; }); var me = meS[0], setMeS = meS[1];
    var pmS = useState(false); var profOpen = pmS[0], setProfOpen = pmS[1];
    var stgS = useState(false); var settingsOpen = stgS[0], setSettingsOpen = stgS[1];
    var blS = useState(false); var bellOpen = blS[0], setBellOpen = blS[1];
    var auS = useState(false); var autoOpen = auS[0], setAutoOpen = auS[1];
    /* saving and live updates */
    var stS = useState(SR.store.status); var saveState = stS[0], setSaveState = stS[1];
    var gaS = useState(null); var gacc = gaS[0], setGacc = gaS[1];
    var glS = useState([]); var glist = glS[0], setGlist = glS[1];
    var syncing = React.useRef(false), syncAgain = React.useRef(false);
    var gmS = useState(''); var gmsg = gmS[0], setGmsg = gmS[1];
    /* tasks keep their owner. Anyone not on the team list shows under Unassigned instead of being reassigned. */
    useEffect(function () { SR.store.onStatus(setSaveState); SR.store.subscribe(); }, []);
    useEffect(function () { SR.store.saveColl('tasks', tasks); SR.store.saveKV('order', tasks.map(function (t) { return t.id; })); }, [tasks]);
    useEffect(function () { SR.store.saveColl('events', events); }, [events]);
    useEffect(function () { SR.store.saveColl('notifs', notifs.slice(-100)); }, [notifs]);
    useEffect(function () { SR.store.saveKV('rules', rules); }, [rules]);
    useEffect(function () { SR.store.saveKV('clients', clients); }, [clients]);
    useEffect(function () { SR.store.saveKV('seq', seq); }, [seq]);
    SR.templates = SR.templates || {}; SR.warmap = SR.warmap || {};
    var RES = [['periods', 'periods'], ['orgP', 'orgP'], ['orgT', 'orgT'], ['metaReal', 'metaReal'], ['acct', 'acct'], ['templates', 'templates'], ['warmap', 'warmap'], ['game', 'game'], ['fin', 'fin'], ['agoals', 'agoals'], ['uiprefs', 'uiprefs']];
    /* overdue tasks carry over to today on their own */
    useEffect(function () {
      var go = function () {
        var T = SR.TODAY, late = tasks.filter(function (t) { return !t.done && t.date && t.date < T && !(t.slots && t.slots.length); });
        if (!late.length || localStorage.getItem('sr_roll') === 'off') return;
        var ids = {}; late.forEach(function (t) { ids[t.id] = 1; });
        undoable(late.length + ' overdue task' + (late.length === 1 ? '' : 's') + ' moved to today', function () {
          setTasks(function (ts) { return ts.map(function (t) { if (!ids[t.id]) return t; var d = Math.max(1, Math.round((new Date(T) - new Date(t.date)) / 864e5)); return Object.assign({}, t, { was: t.was || t.date, rolled: (t.rolled || 0) + d, date: T }); }); });
        });
      };
      var tm = setTimeout(go, 600); return function () { clearTimeout(tm); };
    }, []);
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
      gacc: function () {},
      gaccReload: function () {},
      gaccs: function () {},
      profiles: function (row) { if (!row) return; var l = Object.keys(SR.PROFILES).map(function (k) { return SR.PROFILES[k]; }).filter(function (p) { return p.user_id !== row.user_id; }).concat([row]); SR.applyProfiles(l); if (row.user_id === SR.store.myId()) SR.ME = row; setClk(function (c) { return c + 1; }); }
    };
    SR.store.onRemote(SR.remote);
    useEffect(function () {
      var rs = function () { setTimeout(function () { SR._drag = null; SR._dragMulti = null; SR._dragC = null; if (SR._spr) { clearTimeout(SR._spr.t); SR._spr = null; } document.querySelectorAll('.tdrop,.task.over').forEach(function (x) { x.classList.remove('tdrop'); x.classList.remove('over'); }); }, 0); };
      var scr = null, sy = 0, tick = function () { if (!scr) return; window.scrollBy(0, scr); requestAnimationFrame(tick); };
      var edge = function (e) { if (SR._drag == null) { scr = null; return; } var h = window.innerHeight, y = e.clientY; sy = y < 90 ? -Math.ceil((90 - y) / 6) : y > h - 90 ? Math.ceil((y - (h - 90)) / 6) : 0; if (sy && !scr) { scr = sy; requestAnimationFrame(tick); } else scr = sy || null; };
      document.addEventListener('dragover', edge, true); document.addEventListener('dragend', function () { scr = null; }, true); document.addEventListener('drop', function () { scr = null; }, true);
      document.addEventListener('dragend', rs, true); document.addEventListener('drop', rs, false);
      SR.colResizer(document);
      return function () { document.removeEventListener('dragend', rs, true); document.removeEventListener('drop', rs, false); };
    }, []);
    useEffect(function () { if (SR.applyTheme) SR.applyTheme(SR.getTheme()); }, [me]);
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
      setTasks(function (ts) { return ts.map(function (t) { if (t.id !== id) return t; var o = typeof obj === 'function' ? obj(t) : obj; var n = Object.assign({}, t, o); if (o && o.done === true && !t.done) n.doneDay = SR.TODAY; else if (o && o.done === false) n.doneDay = ''; return n; }); }); };
    var toast = function (m, undo) { setToastMsg(m); setToastUndo(undo ? { fn: undo } : null); clearTimeout(SR._tt); SR._tt = setTimeout(function () { setToastMsg(''); setToastUndo(null); }, undo ? 8000 : 3500); };
    /* undo: snapshot before a delete, put it back from the toast or with Ctrl/Cmd+Z */
    var snapshot = function () { return { clients: clients, tasks: tasks, seq: seq, projSel: projSel, res: JSON.stringify({ p: SR.periods || {}, o: SR.orgP || {}, t: SR.orgT || {}, m: SR.metaReal || {}, a: SR.acct || {} }) }; };
    var restore = function (snap) {
      setClients(snap.clients); setTasks(snap.tasks); setSeq(snap.seq); setProjSel(snap.projSel);
      var r = JSON.parse(snap.res);
      [['periods', 'p'], ['orgP', 'o'], ['orgT', 't'], ['metaReal', 'm'], ['acct', 'a']].forEach(function (k) { var tgt = SR[k[0]] = SR[k[0]] || {}; Object.keys(tgt).forEach(function (x) { delete tgt[x]; }); Object.assign(tgt, r[k[1]] || {}); });
      toast('Restored');
    };
    var undoable = function (msg, fn) {
      var snap = snapshot(); fn(); var st = SR._undoStack = SR._undoStack || [];
      var u = function () { restore(snap); }; st.push(u); if (st.length > 30) st.shift();
      toast(msg, function () { var i = st.indexOf(u); if (i >= 0) st.splice(i, 1); u(); });
    };
    SR.undoable = undoable; SR.toast = toast;
    var openBlockers = function (t) { return (t.blockedBy || []).map(function (b) { for (var i = 0; i < tasks.length; i++) if (tasks[i].id === b) return tasks[i]; return null; }).filter(function (x) { return x && !x.done; }); };
    SR.blockers = openBlockers;
    var runRules = function (cur) {
      var n = seq, add = [];
      rules.forEach(function (r) {
        if (!r.on) return; if (r.match && cur.name.toLowerCase().indexOf(r.match.toLowerCase()) < 0) return;
        if (r.action === 'create' && r.arg) { if (tasks.some(function (x) { return !x.done && x.clientId === cur.clientId && x.name === r.arg; }) || add.some(function (x) { return x.clientId === cur.clientId && x.name === r.arg; })) return; add.push({ id: n++, clientId: cur.clientId, proj: cur.proj, name: r.arg, owner: r.owner || cur.owner || '', date: SR.addDays(SR.TODAY, +r.days || 0), subs: [], note: 'Created by an automation after: ' + cur.name }); notify(r.owner || cur.owner || '', 'Automation created: ' + r.arg, n - 1); }
        else if (r.action === 'notify') notify(r.owner || '', 'Done: ' + cur.name + (SR.clientById(clients, cur.clientId).name ? ' (' + SR.clientById(clients, cur.clientId).name + ')' : ''), cur.id);
      });
      if (add.length) { setTasks(function (ts) { return ts.concat(add); }); setSeq(n); }
    };
    var toggleRef = { current: null };
    var toggle = function (id) {
      var cur = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) cur = tasks[i];
      if (!cur) return;
      if (cur.done) { patch(id, cur.next ? { done: false, next: '', ran: Math.max(0, (cur.ran || 0) - 1) } : { done: false }); return; }
      var bl = openBlockers(cur);
      if (bl.length) { toast('Blocked by "' + bl[0].name + '". Finish that first.'); return; }
      var recur = cur.repeat && !cur.milestone, nxd = '';
      if (recur) { var dd = SR.cadDays(cur.repeat); nxd = SR.addDays(cur.date && cur.date > SR.TODAY ? cur.date : SR.TODAY, dd); if (cur.date && cur.date <= SR.TODAY) { nxd = SR.addDays(cur.date, dd); while (nxd <= SR.TODAY) nxd = SR.addDays(nxd, dd); } }
      patch(id, { done: true, spent: Math.max(cur.spent || 0, SR.estOf(cur)), timer: '', slots: (cur.slots || []).map(function (s) { return Object.assign({}, s, { done: true }); }), next: nxd, ran: recur ? (cur.ran || 0) + 1 : cur.ran });
      SR.playTick();
      setSettling(function (o) { var n = Object.assign({}, o); n[id] = true; return n; });
      setJust(function (o) { var n = Object.assign({}, o); n[id] = true; return n; });
      setTimeout(function () {
        setSettling(function (o) { var n = Object.assign({}, o); delete n[id]; return n; });
        setJust(function (o) { var n = Object.assign({}, o); delete n[id]; return n; });
      }, 280);
      tasks.forEach(function (t) { if (!t.done && (t.blockedBy || []).indexOf(id) >= 0 && openBlockers(t).filter(function (x) { return x.id !== id; }).length === 0) notify(t.owner || '', 'Unblocked: ' + t.name + ' (after "' + cur.name + '")', t.id); });
      runRules(cur);
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
    var bulkPatch = function (map, msg) { undoable(msg, function () { setTasks(function (ts) { return ts.map(function (t) { return map[t.id] ? (function () { var n = Object.assign({}, t, map[t.id]); if (map[t.id].done === true && !t.done) n.doneDay = SR.TODAY; else if (map[t.id].done === false) n.doneDay = ''; return n; })() : t; }); }); }); };
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
    var addTask = function () {
      var all = SR.parseTaskLines(newTask, clients, tasks); if (!all.length) return;
      var dOwner = screen === 'mytasks' ? me : (SR.TEAM.indexOf(who) >= 0 ? who : me);
      var items = all.filter(function (x) { return x.include; });
      if (!items.length) { toast('Nothing new: ' + all.length + ' skipped (already ticked or duplicates)'); return; }
      var dFront = screen === 'client' ? activeClient : screen === 'front' ? activeFront : '';
      var made = items.map(function (it, i) { return { id: seq + i, clientId: it.front || dFront, name: it.name, owner: it.owner || dOwner, date: SR.TODAY, subs: [], note: '' }; });
      undoable(made.length + ' task' + (made.length === 1 ? '' : 's') + ' added', function () { setTasks(tasks.concat(made)); setSeq(seq + made.length); });
      setNewTask('');
      var need = made.filter(function (t) { return !t.clientId; }).map(function (t) { return t.id; });
      setQueue([]); if (need.length) setAssignIds(made.map(function (t) { return t.id; }));
      else if (need.length) { setQueue(need); setOpenId(need[0]); }
    };
    var qStep = function (d) { var i = queue.indexOf(openId), n = i + d; if (n < 0) return; if (n >= queue.length) { setQueue([]); setOpenId(null); return; } setOpenId(queue[n]); };
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
        add.push({ id: n++, clientId: id, proj: pt, name: m[0] + ': ' + m[1], how: m[2] || m[1].split(' · '), owner: me, date: '', milestone: true, maint: true, done: false, subs: [], note: '' });
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
    var setEdits = function (id, type, fn) {
      setClients(function (cs) { return cs.map(function (x) {
        if (x.id !== id) return x; var all = Object.assign({}, x.edits); all[type] = fn(Object.assign({ ph: {}, st: {}, gone: {}, add: {} }, all[type])); return Object.assign({}, x, { edits: all }); }); });
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
      var pr = { gads: 'Leads from Google Ads', meta: 'Leads from Meta Ads', seo: 'More calls and leads from search and AI answers' }[type] || '';
      var nt = tp.phases.length ? SR.genTasks(Object.assign({}, c, { type: type, start: SR.TODAY }), seq) : [];
      setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; var pg = Object.assign({}, x.pg); pg[type] = { text: pr, target: 0, unit: 'leads' }; return Object.assign({}, x, { projects: (x.projects || [x.type]).concat([type]), pg: pg, built: true, liveP: SR.isCustom(type) ? Object.assign({}, x.liveP, (function () { var o = {}; o[type] = true; return o; })()) : x.liveP }); }); });
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
      setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; var ed = Object.assign({}, x.edits); delete ed[type]; x = Object.assign({}, x, { edits: ed }); if (type === x.type) return Object.assign({}, x, { live: false }); var lp = Object.assign({}, x.liveP); lp[type] = false; return Object.assign({}, x, { liveP: lp }); }); });
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
    var moveClient = function (dragId, targetId, after) {
      if (dragId === targetId) return;
      undoable('Clients reordered', function () { setClients(function (cs) { var d = null; cs.forEach(function (c) { if (c.id === dragId) d = c; }); if (!d) return cs; var rest = cs.filter(function (c) { return c.id !== dragId; }); var i = -1; rest.forEach(function (c, k) { if (c.id === targetId) i = k; }); if (i < 0) return cs; rest.splice(after ? i + 1 : i, 0, d); return rest; }); });
    };
    var toggleFav = function (c) { setClients(function (cs) { return cs.map(function (x) { return x.id === c.id ? Object.assign({}, x, { fav: !x.fav }) : x; }); }); toast(c.fav ? 'Removed from favorites' : 'Added to favorites'); };
    /* checklist templates: save a tweaked project, start the next client from it */
    var saveTemplate = function (id, type) {
      var c = SR.clientById(clients, id), T = SR.TEMPLATES[type];
      var nm = window.prompt('Name this template', c.name + ' ' + T.label); if (!nm || !nm.trim()) return;
      var tid = 't' + Date.now().toString(36);
      var tl = tasks.filter(function (t) { return t.clientId === id && (t.proj || c.type) === type; }).map(function (t) { return { name: t.name, how: t.how || [], owner: t.owner || '', ph: t.ph || '', step: t.step || '', repeat: t.repeat || '', milestone: !!t.milestone, maint: !!t.maint, custom: !!t.custom }; });
      SR.templates[tid] = { id: tid, name: nm.trim(), type: type, by: me, at: SR.TODAY, edits: JSON.parse(JSON.stringify((c.edits || {})[type] || {})), tasks: tl };
      setClk(function (x) { return x + 1; }); toast('Template saved: ' + nm.trim() + ' (' + tl.length + ' tasks)');
    };
    var applyTemplate = function (id, type, tid) {
      var tpl = SR.templates[tid]; if (!tpl) return; var c = SR.clientById(clients, id);
      undoable('Template applied: ' + tpl.name, function () {
        var sq = seq, nt = tpl.tasks.map(function (t) { return { id: sq++, clientId: id, proj: type, name: t.name, how: t.how, owner: t.owner || 'Matt', date: c.start || SR.TODAY, ph: t.ph || undefined, step: t.step || undefined, repeat: t.repeat || undefined, milestone: t.milestone || undefined, maint: t.maint || undefined, custom: t.custom || undefined, done: false, subs: [], note: '' }; });
        setTasks(function (ts) { return ts.filter(function (t) { return !(t.clientId === id && (t.proj || c.type) === type); }).concat(nt); });
        setSeq(sq + 1);
        setClients(function (cs) { return cs.map(function (x) { if (x.id !== id) return x; var ed = Object.assign({}, x.edits); ed[type] = JSON.parse(JSON.stringify(tpl.edits || {})); return Object.assign({}, x, { edits: ed }); }); });
      });
    };
    var delTemplate = function (tid) { var tp = SR.templates[tid]; if (!tp) return; delete SR.templates[tid]; setClk(function (x) { return x + 1; }); toast('Template removed: ' + tp.name); };
    SR.act.saveTemplate = saveTemplate; SR.act.applyTemplate = applyTemplate; SR.act.delTemplate = delTemplate;
    SR.clientMenu = function (e, c) {
      var projs = c.projects || [c.type], missing = SR.PROJ_TYPES.filter(function (t) { return projs.indexOf(t) < 0; });
      SR.openMenu(e, [
        { label: 'Open', fn: function () { openClient(c.id); } },
        { label: 'Edit client details', fn: function () { setEditId(c.id); } },
        { label: c.fav ? 'Remove from favorites' : 'Add to favorites', fn: function () { toggleFav(c); } },
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
    var dragIds = function (id) { var ms = SR._dragMulti; SR._dragMulti = null; return ms && ms.indexOf(id) >= 0 ? ms : [id]; };
    SR.selIds = function () { return Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number); };
    SR.dnd = {
      dropOnTask: function (id, targetId, date) { var ids = dragIds(id); undoable(ids.length > 1 ? ids.length + ' tasks moved' : 'Task moved', function () { ids.forEach(function (x) { if (x !== targetId) moveTask(x, targetId, date); }); }); },
      dropOnDay: function (id, date) { var ids = dragIds(id); undoable((ids.length > 1 ? ids.length + ' tasks moved to ' : 'Moved to ') + (date ? SR.fmtDeadline(date) : 'no date'), function () { ids.forEach(function (x) { patch(x, { date: date }); }); }); },
      dropOnPerson: function (id, name) { var ids = dragIds(id); undoable(name ? 'Assigned to ' + name : 'Unassigned', function () { ids.forEach(function (x) { patch(x, { owner: name }); }); }); },
      dropOnMine: function (id) { var ids = dragIds(id); undoable((ids.length > 1 ? ids.length + ' tasks' : 'Task') + ' assigned to you', function () { ids.forEach(function (x) { patch(x, { owner: me }); }); }); },
      dropOnClient: function (id, cid) { var ids = dragIds(id), c = SR.clientById(clients, cid); undoable((ids.length > 1 ? ids.length + ' tasks' : 'Task') + ' moved to ' + c.name, function () { ids.forEach(function (x) { patch(x, { clientId: cid, proj: c.type, step: undefined, ph: undefined, custom: true }); }); }); }
    };
    var addFromTemplate = function (tp) {
      var t = { id: seq, clientId: screen === 'client' ? activeClient : screen === 'front' ? activeFront : 'agency', name: tp.name, owner: tp.owner || '', how: tp.how || [], repeat: tp.repeat || '', date: SR.TODAY, subs: (tp.subs || []).map(function (n) { return { name: n, done: false }; }), note: tp.note || '' };
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
      [['home', 'Home'], ['clients', 'Clients'], ['calendar', 'Calendar'], ['finance', 'Finance'], ['drive', 'Drive']].forEach(function (n) { it.push({ g: 'Go to', label: n[1], sub: 'Page', fn: function () { setScreen(n[0]); setOpenId(null); } }); });
      it.push({ g: 'Actions', label: 'Open settings', fn: function () { setSettingsOpen(true); } });
      it.push({ g: 'Actions', label: 'Open automations and connections', fn: function () { setAutoOpen(true); } });
      it.push({ g: 'Actions', label: 'Onboard a new client', fn: startOnboard });
      it.push({ g: 'Actions', label: theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode', fn: function () { setTheme(theme === 'light' ? 'dark' : 'light'); } });
      it.push({ g: 'Actions', label: soundOn ? 'Turn the tick sound off' : 'Turn the tick sound on', fn: function () { var n = !soundOn; SR.setSound(n); setSoundOn(n); } });
      it.push({ g: 'Actions', label: 'Open the Sales dashboard', fn: function () { setScreen('sales'); setOpenId(null); } });
      clients.forEach(function (c) {
        it.push({ g: 'Clients', label: c.name, sub: c.region, color: c.color, fn: function () { openClient(c.id); } });
        edits.push({ g: 'Actions', label: 'Edit ' + c.name, sub: 'Client details', color: c.color, fn: function () { setEditId(c.id); } });
      });
      tasks.forEach(function (t) { var c = SR.clientById(clients, t.clientId); it.push({ g: 'Tasks', label: t.name, sub: c.name + (t.date ? ' · ' + SR.fmtDeadline(t.date) : ''), color: c.color, done: t.done, fn: function () { if (t.clientId && t.clientId !== 'agency') openClient(t.clientId); setOpenId(t.id); } }); });
      return it.concat(edits);
    };
    useEffect(function () {
      var kd = function (e) {
        var k = (e.key || '').toLowerCase();
        var tg0 = e.target, typ0 = tg0 && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg0.tagName) || tg0.isContentEditable);
        if (!typ0 && !e.metaKey && !e.ctrlKey && !e.altKey && !document.querySelector('.mdl-bg, .sr-pal') && SR.kb) {
          var rows = function () { return Array.prototype.slice.call(document.querySelectorAll('.task[data-tid]')); };
          var cur = function () { var r = rows(); for (var i = 0; i < r.length; i++) if (r[i].getAttribute('data-kb') === '1') return i; return -1; };
          var go = { h: 'home', m: 'home', c: 'calendar', s: 'sales' };
          if (SR._g && Date.now() - SR._g < 1200 && go[k]) { e.preventDefault(); SR._g = 0; SR.kb.go(go[k]); return; }
          if (k === 'g') { SR._g = Date.now(); return; }
          if (k === '?') { e.preventDefault(); SR.kb.help(); return; }
          if (k === '/') { e.preventDefault(); SR.kb.search(); return; }
          if (k === 'c') { e.preventDefault(); SR.kb.newTask(); return; }
          if (k === 'j' || k === 'k') { var r = rows(); if (!r.length) return; e.preventDefault(); var i = cur(); r.forEach(function (x) { x.removeAttribute('data-kb'); }); i = k === 'j' ? Math.min(r.length - 1, i + 1) : Math.max(0, i < 0 ? 0 : i - 1); r[i].setAttribute('data-kb', '1'); r[i].scrollIntoView({ block: 'nearest' }); return; }
          if (k === 'x' || k === 'e' || (k === 'enter' && tg0 === document.body)) { var r2 = rows(), j = cur(); if (j >= 0) { e.preventDefault(); var tid = +r2[j].getAttribute('data-tid'); if (k === 'x') SR.kb.toggle(tid); else SR.kb.open(tid); } return; }
          if (k === 'escape') rows().forEach(function (x) { x.removeAttribute('data-kb'); });
        }
        if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); setPalOpen(function (o) { return !o; }); }
        else if ((e.metaKey || e.ctrlKey) && k === 'z' && !e.shiftKey) {
          var tg = e.target, typing = tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable);
          var us = SR._undoStack || []; if (!typing && us.length) { e.preventDefault(); us.pop()(); }
        }
      };
      document.addEventListener('keydown', kd); return function () { document.removeEventListener('keydown', kd); };
    }, []);
    /* recurring tasks stay ticked until their next due day, then come back unticked (midnight in the browser's timezone) */
    useEffect(function () {
      var due = tasks.filter(function (t) { return t.done && t.next && t.next <= SR.TODAY; });
      if (!due.length) return;
      var ids = {}; due.forEach(function (t) { ids[t.id] = 1; });
      setTasks(function (ts) { return ts.map(function (t) { return ids[t.id] && t.done && t.next ? Object.assign({}, t, { done: false, doneDay: '', date: t.next, deadline: '', next: '', spent: 0, subs: (t.subs || []).map(function (s) { return Object.assign({}, s, { done: false }); }), slots: (t.slots || []).map(function (s) { return Object.assign({}, s, { done: false }); }) }) : t; }); });
    }, [clk, tasks.length]);
    useEffect(function () {
      var iv = setInterval(function () { if (!SR.tzManual) { var dz = SR.detectTz(); if (dz !== SR.tz) SR.tz = dz; } var t = SR.todayIn(SR.tz); if (t !== SR.TODAY) SR.TODAY = t; setClk(function (x) { return x + 1; }); }, 30000);
      return function () { clearInterval(iv); };
    }, []);
    /* sidebar */
    var navItem = function (on) { return 'min-height:30px;display:flex;align-items:center;gap:8px;padding:0 8px;border:0;border-radius:6px;font-family:inherit;font-size:14px;text-align:left;cursor:pointer;' + (on ? 'background:rgba(255,255,255,0.12);color:#FFF;font-weight:500' : 'background:transparent;color:#C9D2E0'); };
    var compact = navMin && vw > 860;
    var NAVI = { war: 'compass', home: 'house', clients: 'briefcase', calendar: 'clock', results: 'chart', finance: 'wallet', sales: 'trend', mytasks: 'check', drive: 'drive' };
    var logoOf = function (c) { if (c.logo) return c.logo; var d = String(c.domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim(); return d && d.indexOf('.') > 0 ? 'https://www.google.com/s2/favicons?sz=128&domain=' + encodeURIComponent(d) : ''; };
    var ini = function (n) { return String(n || '?').split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase(); };
    var toggleBtn = html`<button type="button" class="navtog" aria-label=${compact ? 'Expand the menu' : 'Tuck the menu in'} title=${compact ? 'Expand the menu' : 'Tuck the menu in'} onClick=${function () { if (navMin) setNavMin(false); else if (compact) { setNavAuto(false); setNavMin(false); } else setNavMin(true); }}>${compact ? '»' : '«'}</button>`;
    var favs = clients.filter(function (c) { return c.fav; });
    var myDue = tasks.filter(function (t) { return !t.done && t.owner === me && t.date && t.date <= SR.TODAY; }).length;
    var NAMES0 = { war: 'Battlefronts', home: 'Home', sales: 'Sales', mytasks: 'My tasks', clients: 'Clients', results: 'Results', finance: 'Finance', calendar: 'Calendar', drive: 'Drive' };
    var NAVKEYS = ['home', 'sales', 'clients', 'finance', 'calendar', 'drive'];
    var navOrder = function () { var o = (SR.uiprefs.order || []).filter(function (k) { return NAVKEYS.indexOf(k) > -1; }); NAVKEYS.forEach(function (k) { if (o.indexOf(k) < 0) o.push(k); }); return o; };
    var navMove = function (k, to) { var o = navOrder(), i = o.indexOf(k); if (i < 0) return; o.splice(i, 1); o.splice(Math.max(0, Math.min(o.length, to)), 0, k); SR.uiprefs.order = o; setUb(function (x) { return x + 1; }); };
    var navBtn = function (k) {
      var label = (SR.uiprefs.labels || {})[k] || NAMES0[k];
      var emo = (SR.uiprefs.icons || {})[k];
      var on = screen === k || (k === 'clients' && screen === 'client');
      var tdp = (k === 'mytasks' || k === 'home' || k === 'calendar' || k === 'war') ? {
        onDragOver: function (e) { if (SR._drag == null) return; e.preventDefault(); e.currentTarget.classList.add('tdrop'); if (k !== 'mytasks' && screen !== k && (!SR._spr || SR._spr.k !== k)) { if (SR._spr) clearTimeout(SR._spr.t); SR._spr = { k: k, t: setTimeout(function () { setScreen(k); setOpenId(null); SR._spr = null; }, 650) }; } },
        onDragLeave: function (e) { e.currentTarget.classList.remove('tdrop'); if (SR._spr && SR._spr.k === k) { clearTimeout(SR._spr.t); SR._spr = null; } },
        onDrop: function (e) { e.currentTarget.classList.remove('tdrop'); if (SR._spr) { clearTimeout(SR._spr.t); SR._spr = null; } if (SR._drag == null) return; e.preventDefault(); var id = SR._drag; SR._drag = null; if (k === 'mytasks') SR.dnd.dropOnMine(id); }
      } : {};
      var tdp0 = tdp, tdp2 = Object.assign({}, tdp0, {
        draggable: NAVKEYS.indexOf(k) > -1,
        onDragStart: function (e) { SR._dragN = k; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'nav:' + k); } catch (x) {} },
        onDragEnd: function () { SR._dragN = null; document.querySelectorAll('.dnav').forEach(function (n) { n.classList.remove('dnav'); }); },
        onDragOver: function (e) { if (SR._dragN) { e.preventDefault(); e.currentTarget.classList.add('dnav'); return; } if (tdp0.onDragOver) tdp0.onDragOver(e); },
        onDragLeave: function (e) { e.currentTarget.classList.remove('dnav'); if (tdp0.onDragLeave) tdp0.onDragLeave(e); },
        onDrop: function (e) { if (SR._dragN) { e.preventDefault(); e.currentTarget.classList.remove('dnav'); var f = SR._dragN; SR._dragN = null; if (f !== k) { var o = navOrder(); navMove(f, o.indexOf(k)); } return; } if (tdp0.onDrop) tdp0.onDrop(e); },
        onContextMenu: function (e) { if (NAVKEYS.indexOf(k) < 0) return; e.preventDefault(); setNavMenu({ k: k, x: e.clientX, y: e.clientY, pick: false }); },
        onDoubleClick: function (e) { if (NAVKEYS.indexOf(k) < 0 || compact) return; e.preventDefault(); setRenK(k); }
      });
      if (renK === k && !compact) return html`<div key=${k} style="padding:2px 4px"><input class="sr-navren" autofocus ref=${function (el) { if (el && !el._f) { el._f = 1; el.focus(); el.select(); } }} defaultValue=${label} onBlur=${function (e) { var v = e.target.value.trim(); if (v && v !== NAMES0[k]) SR.uiprefs.labels[k] = v; else delete SR.uiprefs.labels[k]; setRenK(null); }} onKeyDown=${function (e) { if (e.key === 'Enter') e.target.blur(); else if (e.key === 'Escape') { e.target.value = label; e.target.blur(); } }} /></div>`;
      return html`<button key=${k} type="button" ...${tdp2} title=${label} aria-label=${label} onClick=${function () { setScreen(k); setOpenId(null); }} style=${navItem(on) + (compact ? ';justify-content:center;padding:0;flex:1;width:100%' : ';flex:1;min-width:0')}>${compact ? (emo ? html`<span class="sr-ni-emo">${emo}</span>` : SR.Icon(NAVI[k], 18)) : html`<span class="sr-ni">${emo ? html`<span class="sr-ni-emo">${emo}</span>` : SR.Icon(NAVI[k], 16)}</span><span style="flex:1;min-width:0">${label}</span>`}${!compact && k === 'mytasks' && myDue ? html`<span class="sr-navcount">${myDue}</span>` : null}</button>`;
    };
    var logoImg = function (c, px) {
      var u = logoOf(c);
      return html`<span style=${'width:' + px + 'px;height:' + px + 'px;flex:none;position:relative;display:block'}>${u ? html`<img src=${u} alt="" width=${px} height=${px} style=${'width:' + px + 'px;height:' + px + 'px;object-fit:contain;display:block;border-radius:' + Math.round(px / 4) + 'px'} onError=${function (e) { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />` : null}<span style=${'width:' + px + 'px;height:' + px + 'px;border-radius:' + Math.round(px / 3.2) + 'px;align-items:center;justify-content:center;font-size:' + (px > 20 ? 11 : 10) + 'px;font-weight:700;color:#fff;background:' + c.color + ';display:' + (u ? 'none' : 'flex')}>${ini(c.name).charAt(0)}</span></span>`;
    };
    var shortN = function (n) { return String(n).replace(/\s+(Consulting|Services?)$/i, '').replace(/\s+for\s+Expats$/i, ''); };
    var clientRow = function (c, grp) {
      var on = screen === 'client' && activeClient === c.id; var askd = delId === c.id;
      var dp = {
        draggable: true,
        onDragStart: function (e) { SR._dragC = c.id; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'client:' + c.id); } catch (x) {} },
        onDragOver: function (e) { if (SR._drag != null && SR._dragC == null) { e.preventDefault(); setDropAt(function (o) { return o && o.id === c.id && o.g === grp && o.task ? o : { id: c.id, g: grp, task: true }; }); return; } if (SR._dragC == null) return; e.preventDefault(); var r = e.currentTarget.getBoundingClientRect(); var after = e.clientY > r.top + r.height / 2; setDropAt(function (o) { return o && o.id === c.id && o.after === after && o.g === grp ? o : { id: c.id, after: after, g: grp }; }); },
        onDragLeave: function () { setDropAt(function (o) { return o && o.id === c.id && o.g === grp ? null : o; }); },
        onDrop: function (e) { if (SR._drag != null && SR._dragC == null) { e.preventDefault(); e.stopPropagation(); var tid = SR._drag; SR._drag = null; setDropAt(null); SR.dnd.dropOnClient(tid, c.id); return; } e.preventDefault(); var d = SR._dragC; SR._dragC = null; setDropAt(null); if (d == null) return; var r = e.currentTarget.getBoundingClientRect(); moveClient(d, c.id, e.clientY > r.top + r.height / 2); },
        onDragEnd: function () { SR._dragC = null; setDropAt(null); }
      };
      var dcls = dropAt && dropAt.id === c.id && dropAt.g === grp ? (dropAt.task ? ' tdrop' : dropAt.after ? ' dbot' : ' dtop') : '';
      if (compact) return html`<div key=${grp + c.id} data-fk=${grp + c.id} class=${'sr-navrow' + dcls} ...${dp}><button type="button" title=${c.name} aria-label=${c.name} onClick=${function () { openClient(c.id); }} style=${navItem(on) + ';justify-content:center;padding:0;flex:1;min-height:36px;width:100%'}>${logoImg(c, 22)}</button></div>`;
      return html`<div key=${grp + c.id} data-fk=${grp + c.id} class=${'sr-navrow' + dcls} onContextMenu=${function (e) { SR.clientMenu(e, c); }} ...${dp}><button type="button" onClick=${function () { openClient(c.id); }} style=${navItem(on) + ';flex:1;min-width:0;min-height:28px'}><span class="sr-ib" style=${'background:' + c.color}>${ini(c.name)}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${shortN(c.name)}</span></button>
        <button type="button" class=${'sr-navfav' + (c.fav ? ' on' : '')} aria-label=${c.fav ? 'Remove from favorites' : 'Add to favorites'} title=${c.fav ? 'Remove from favorites' : 'Add to favorites'} onClick=${function () { toggleFav(c); }}><svg width="13" height="13" viewBox="0 0 24 24" fill=${c.fav ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg></button>
        <button type="button" class="sr-navmore" aria-label=${'Options for ' + c.name} title="Options" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); SR.clientMenu({ preventDefault: function () {}, stopPropagation: function () {}, clientX: r.right, clientY: r.bottom + 4 }, c); }}>⋯</button>
        <button type="button" class=${'sr-navdel' + (askd ? ' ask' : '')} aria-label=${'Delete ' + c.name} title="Delete client" onClick=${function () { if (askd) deleteClient(c.id); else { setDelId(c.id); setTimeout(function () { setDelId(function (x) { return x === c.id ? null : x; }); }, 3000); } }}>${askd ? 'Delete?' : SR.Icon('close', 13)}</button></div>`;
    };
    var sidebar = html`<nav aria-label="Main" ref=${navRef} class="sr-nav" style=${'flex:0 0 ' + (compact ? 56 : navW) + 'px;width:' + (compact ? 56 : navW) + 'px;max-width:' + (compact ? 56 : navW) + 'px;padding:14px ' + (compact ? 6 : 10) + 'px;background:var(--nav);color:#E8ECF2;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;overflow:hidden'}>
      <div class="sr-brand" style=${compact ? 'justify-content:center;flex-direction:column;gap:8px' : ''}><span class="sr-bmark">${SR.Logo(compact ? 26 : 22)}</span>${compact ? null : html`<b>Eclipse</b><span>Sarac Ramsay</span>`}${toggleBtn}</div>
      <div style="display:flex;flex-direction:column;gap:1px">${navOrder().map(navBtn)}</div>
      ${favs.length ? html`<div style="display:flex;flex-direction:column;gap:1px">${compact ? null : html`<div class="sr-navhd">Favorites</div>`}${favs.map(function (c) { return clientRow(c, 'f'); })}</div>` : null}
      <div style="display:flex;flex-direction:column;gap:1px">
        ${compact ? html`<div style="height:1px;background:var(--border);margin:2px 6px"></div>` : null}<button type="button" style=${compact ? 'display:none' : ''} class="sr-navhd sr-navhdb" aria-expanded=${clientsOpen} title=${clientsOpen ? 'Hide clients' : 'Show clients'} onClick=${function () { setClientsOpen(!clientsOpen); }}>Clients</button>
        ${clientsOpen ? html`${clients.map(function (c) { return clientRow(c, 'c'); })}${compact ? null : html`<button type="button" class="sr-onb" onClick=${startOnboard}>+ Onboard client</button>`}` : null}
      </div>
      ${compact ? null : html`<div style="display:flex;flex-direction:column;gap:1px"><div class="sr-navhd">Battlefronts</div>
        ${SR.customFronts().map(function (f) { var on = screen === 'front' && activeFront === f.id; return html`<div key=${f.id} class="sr-navrow" onDragOver=${function (e) { if (SR._drag != null) { e.preventDefault(); e.currentTarget.classList.add('tdrop'); } }} onDragLeave=${function (e) { e.currentTarget.classList.remove('tdrop'); }} onDrop=${function (e) { e.currentTarget.classList.remove('tdrop'); if (SR._drag == null) return; e.preventDefault(); var tid = SR._drag; SR._drag = null; SR.dnd.dropOnClient(tid, f.id); }}><button type="button" onClick=${function () { setActiveFront(f.id); setScreen('front'); setOpenId(null); }} style=${navItem(on) + ';flex:1;min-width:0;min-height:28px'}><span class="sr-ib" style=${'background:' + f.color + ';width:20px;height:20px;border-radius:6px;flex:none'}></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span></button><button type="button" class="sr-navdel" aria-label=${'Remove ' + f.name} title="Remove battlefront" onClick=${function () { delFront(f.id); }}>${SR.Icon('close', 13)}</button></div>`; })}
        ${newFront === null ? html`<button type="button" class="sr-onb" onClick=${function () { setNewFront(''); }}>+ New battlefront</button>` : html`<input class="sr-navren" autofocus placeholder="Name it, press Enter" value=${newFront} ref=${function (el) { if (el && !el._f) { el._f = 1; el.focus(); } }} onInput=${function (e) { setNewFront(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') { addFront(newFront); setNewFront(null); } else if (e.key === 'Escape') setNewFront(null); }} onBlur=${function () { if (newFront && newFront.trim()) addFront(newFront); setNewFront(null); }} />`}
      </div>`}
      <div class="sr-nfoot" style=${compact ? 'display:none' : ''}>${me} · ${saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Not saved, retrying' : (SR.store.mode === 'cloud' ? 'Saved' : 'Saved on this device')}</div>
      <div class="sr-nresize" style=${compact ? 'display:none' : ''} title="Drag to resize, double-click to reset" onDoubleClick=${function () { setNavW(232); try { localStorage.setItem('sr_navw', '232'); } catch (x) {} }} onMouseDown=${function (e) { e.preventDefault(); var x0 = e.clientX, w0 = navW, last = w0; document.body.style.cursor = 'ew-resize'; var mv = function (ev) { last = Math.max(200, Math.min(420, w0 + ev.clientX - x0)); setNavW(last); }; var up = function () { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); document.body.style.cursor = ''; try { localStorage.setItem('sr_navw', String(last)); } catch (x) {} }; document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); }}></div>
    </nav>`;

    var crumb = screen === 'client' ? 'Clients › ' + SR.clientById(clients, activeClient).name : { home: 'Home', clients: 'Clients', results: 'Results', finance: 'Finance', drive: 'Drive', onboard: 'New client', sales: 'Sales', calendar: 'Calendar', mytasks: 'My tasks', war: 'Battlefronts', front: 'Battlefronts › ' + ((SR.uiprefs.fronts && SR.uiprefs.fronts[activeFront]) || {}).name }[screen];
    if (screen !== 'client' && (SR.uiprefs.labels || {})[screen]) crumb = SR.uiprefs.labels[screen];
    var topbar = html`<div class="sr-top" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div style="font-size:13px;color:var(--muted)">${crumb}</div>
      <div style="display:flex;align-items:center;gap:8px">
      <${SR.Bell} notifs=${notifs} me=${me} setMe=${setMe} open=${bellOpen} setOpen=${setBellOpen} onOpenTask=${function (id) { if (id != null) { setBellOpen(false); setOpenId(id); } }} setNotifs=${setNotifs} onAuto=${function () { setBellOpen(false); setAutoOpen(true); }} />
      <button type="button" class="kbtn" onClick=${function () { setPalOpen(true); }} aria-label="Search and commands">Search <kbd>${/Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘' : 'Ctrl'} K</kbd></button>
      <button type="button" class="tb-av" aria-label="Your account and settings" title=${me} onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); var it = [{ head: me }, { label: 'Settings', fn: function () { setSettingsOpen(true); } }, { label: 'Edit profile', fn: function () { setProfOpen(true); } }, { label: 'Keyboard shortcuts', fn: function () { setHelpOpen(true); } }]; if (SR.store.mode === 'cloud') it.push({ sep: true }, { label: 'Sign out', danger: true, fn: function () { SR.store.signOut(); } }); SR.openMenuAt(r.right - 200, r.bottom + 6, it); }}>${SR.Avatar(me, 28)}</button>
      </div>
    </div>`;

    SR.kb = { toggle: toggle, open: openFn, go: function (sc) { setScreen(sc); setOpenId(null); }, help: function () { setHelpOpen(function (o) { return !o; }); }, search: function () { setPalOpen(true); }, newTask: function () { setScreen('home'); setOpenId(null); setTimeout(function () { var t = document.querySelector('textarea[aria-label="Add tasks"]'); if (t) { t.focus(); t.scrollIntoView({ block: 'center' }); } }, 60); } };
    var taskProps = { tasks: tasks, clients: clients, sel: selected, onToggle: toggle, onOpen: openFn, onSelect: onSelect, onClearSel: clearSel, onBulk: bulk, newTask: newTask, onNewTask: setNewTask, onAdd: addTask, qFront: screen === 'client' ? activeClient : screen === 'front' ? activeFront : qFront, onQFront: setQFront, lockFront: screen === 'client' || screen === 'front', qOwner: qOwner, onQOwner: setQOwner, autoOwner: screen === 'mytasks' ? me : (SR.TEAM.indexOf(who) >= 0 ? who : me), qNeed: qNeed, settling: settling, just: just, openId: openId };

    var body;
    if (screen === 'home') body = html`<${SR.Home} ...${taskProps} who=${who} setWho=${setWho} openClient=${openClient} me=${me} />`;
    else if (screen === 'war') body = html`<${SR.Battlefronts} tasks=${tasks} clients=${clients} me=${me} onQuick=${function (fid, nm) { var t = { id: seq, clientId: fid, name: nm, owner: me, date: SR.TODAY, subs: [], note: '' }; undoable('Task added', function () { setTasks(tasks.concat([t])); setSeq(seq + 1); }); }} onOpenClient=${openClient} onGo=${function (sc) { setScreen(sc); setOpenId(null); }} />`;
    else if (screen === 'front') { var AF = SR.uiprefs.fronts && SR.uiprefs.fronts[activeFront]; body = !AF ? html`<div style="padding:24px;color:var(--muted)">This battlefront was removed.</div>` : html`<div style="display:flex;flex-direction:column;gap:6px">
        <div><div style="font-size:13px;color:var(--muted)">Battlefront</div><div style="display:flex;align-items:center;gap:10px"><span style=${'width:14px;height:14px;border-radius:50%;background:' + AF.color}></span><h1 key=${AF.id} contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:32px;outline:none" onBlur=${function (e) { renFront(AF.id, e.currentTarget.textContent); }} onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>${AF.name}</h1></div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Tasks here are not tied to a client. Add one below, or drag any task onto this battlefront in the sidebar.</div></div>
        <${SR.TaskList} ...${taskProps} selected=${selected} tasks=${tasks.filter(function (t) { return t.clientId === AF.id && (!t.done || settling[t.id] || t.doneDay === SR.TODAY); })} flat=${false} dnd=${true} showClient=${false} qFront=${AF.id} lockFront=${true} />
      </div>`; }
    else if (screen === 'mytasks') body = html`<${SR.Home} ...${taskProps} who=${who} setWho=${setWho} openClient=${openClient} me=${me} />`;
    else if (screen === 'calendar') body = html`<${SR.CalendarPage} tasks=${tasks} clients=${clients} events=${events} setEvents=${setEvents} me=${me} gacc=${gacc} glist=${glist} gmsg=${gmsg} syncNow=${syncNow} gPrimary=${function (a) { SR.store.gPrimary(a).then(function () { toast('Primary account changed'); }, function (e) { toast(e.message); }); }} gDisconnect=${function (a) { SR.store.gDisconnect(a).then(function () { toast('Google account disconnected'); }, function (e) { toast(e.message); }); }} onOpen=${openFn} onToggle=${toggle} onPatch=${patch} onAddTask=${addTaskScheduled} onSchedule=${scheduleTasks} drawerOpen=${!!openId} justDone=${just} />`;
    else if (screen === 'clients') body = html`<${SR.Clients} tasks=${tasks} clients=${clients} openClient=${openClient} go=${startOnboard} />`;
    else if (screen === 'onboard') body = html`<${SR.Onboarding} draft=${draft} step=${step} proj=${proj} setProj=${setProj} setField=${setField} next=${onbNext} back=${onbBack} reset=${onbReset} doneClient=${doneClient} openClient=${openClient} />`;
    else if (screen === 'sales') body = html`<iframe class="sales-frame" title="Sales dashboard" src=${'./sales/index.html?v=' + (SR.BUILD || '1104m')}></iframe>`;
    else if (screen === 'finance') body = html`<${SR.Finance} clients=${clients} />`;
    else if (screen === 'drive') body = html`<${SR.Drive} />`;
    else if (screen === 'results') body = html`<${SR.Results} clients=${clients} resPick=${resPick} setResPick=${setResPick} period=${period} setPeriod=${setPeriod} imported=${imported} doImport=${function (id) { setImported(function (o) { var n = Object.assign({}, o); n[id] = true; return n; }); }} />`;
    else body = html`<${SR.ClientPage} proj=${projSel[activeClient]} setProj=${function (t) { setProjSel(function (o) { var n = Object.assign({}, o); n[activeClient] = t; return n; }); }} addProject=${addProject} setGoal=${setGoal} client=${SR.clientById(clients, activeClient)} tasks=${tasks} tab=${clientTab} setTab=${setClientTab} exp=${exp} toggleExp=${function (id, v) { setExp(function (e) { var n = Object.assign({}, e); n[id] = v; return n; }); }} rm=${rm} setRm=${setRm} ac=${ac} setAc=${setAc} onToggle=${toggle} onOpen=${openFn} goResults=${goResults} goLive=${goLive} sel=${selected} onSelect=${onSelect} openId=${openId} settling=${settling} just=${just} phaseSel=${phaseSel} setPhase=${setPhase} justLive=${justLive} addCustom=${addCustom} setTasks=${setTasks} setEdits=${setEdits} />`;

    var openTask = null; for (var i = 0; i < tasks.length; i++) if (tasks[i].id === openId) openTask = tasks[i];
    var pwNow = 392; try { pwNow = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--panelw'), 10) || 392; } catch (e) {}
    var dock = !!openTask && screen !== 'calendar' && (vw - (compact ? 64 : navW) - pwNow - 66) >= 720;
    var selCount = Object.keys(selected).filter(function (k) { return selected[k]; }).length;
    var where = '';
    if (openTask) {
      var oc = SR.clientById(clients, openTask.clientId), tpl = SR.TEMPLATES[openTask.proj || oc.type];
      if (openTask.maint || openTask.repeat) where = 'Ongoing';
      else if (tpl && openTask.step) tpl.phases.forEach(function (ph) { ph.steps.forEach(function (st) { if (st[0] === openTask.step) where = ph.name + ' · ' + st[1]; }); });
    }

    var ntOn = ['home', 'front', 'clients', 'client', 'onboard', 'war', 'finance', 'calendar', 'sales', 'drive'].indexOf(screen) > -1;
    return html`<div class=${'nsb' + (theme === 'dark' ? ' nsbd' : '') + (ntOn ? ' nt' + (theme === 'dark' ? ' ntd' : '') : '')} style="font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-wrap:wrap;align-items:stretch">
      ${sidebar}
      <main class=${"sr-main" + (screen === "sales" ? " on-sales" : "") + (dock ? " pdock" : "")} style=${"flex:999 1 640px;min-width:0;position:relative;box-sizing:border-box;padding:22px 34px 120px 34px"}>
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
      ${navMenu ? html`<div class="qas-bg" style="background:transparent;padding:0" onMouseDown=${function () { setNavMenu(null); }} onContextMenu=${function (e) { e.preventDefault(); setNavMenu(null); }}><div class="sr-navmenu" style=${'left:' + Math.min(navMenu.x, window.innerWidth - 220) + 'px;top:' + Math.min(navMenu.y, window.innerHeight - (navMenu.pick ? 260 : 190)) + 'px'} onMouseDown=${function (e) { e.stopPropagation(); }}>
        ${navMenu.pick ? html`<div style="font-size:12px;color:var(--muted);padding:4px 8px">Pick an icon</div><div class="sr-emo">${['🏠','🧭','📈','💼','💰','🕒','⭐','🎯','📌','🔥','🚀','📊','✅','📅','👥','🧠','💡','🛠️','🌍','☀️','🌙','⚡','🧾','📣'].map(function (em) { return html`<button type="button" key=${em} onClick=${function () { SR.uiprefs.icons[navMenu.k] = em; setNavMenu(null); }}>${em}</button>`; })}</div><button type="button" onClick=${function () { delete SR.uiprefs.icons[navMenu.k]; setNavMenu(null); }}>Use the default icon</button>`
        : html`<button type="button" onClick=${function () { var k = navMenu.k; setNavMenu(null); setRenK(k); }}>Rename</button><button type="button" onClick=${function () { setNavMenu(Object.assign({}, navMenu, { pick: true })); }}>Change icon</button><button type="button" onClick=${function () { var k = navMenu.k; setNavMenu(null); navMove(k, navOrder().indexOf(k) - 1); }}>Move up</button><button type="button" onClick=${function () { var k = navMenu.k; setNavMenu(null); navMove(k, navOrder().indexOf(k) + 1); }}>Move down</button><button type="button" onClick=${function () { delete SR.uiprefs.labels[navMenu.k]; delete SR.uiprefs.icons[navMenu.k]; setNavMenu(null); }}>Reset name and icon</button>`}
      </div></div>` : null}
      ${assignIds.length ? html`<${SR.QuickAssign} key=${assignIds.join(',')} ids=${assignIds} tasks=${tasks} clients=${clients} onClose=${function () { setAssignIds([]); }} onSet=${function (ids, o) { setTasks(function (ts) { return ts.map(function (t) { return ids.indexOf(t.id) > -1 ? Object.assign({}, t, o) : t; }); }); }} />` : null}
      ${false && queue.length && queue.indexOf(openId) >= 0 ? html`<div class="qbar" role="status"><span>Set up task <b>${queue.indexOf(openId) + 1}</b> of ${queue.length}</span><button type="button" onClick=${function () { qStep(-1); }} disabled=${queue.indexOf(openId) === 0}>Back</button><button type="button" class="go" onClick=${function () { qStep(1); }}>${queue.indexOf(openId) === queue.length - 1 ? 'Done' : 'Next'}</button><button type="button" aria-label="Stop" onClick=${function () { setQueue([]); }}>×</button></div>` : null}
      ${helpOpen ? html`<${SR.ShortcutHelp} onClose=${function () { setHelpOpen(false); }} />` : null}
      ${palOpen ? html`<${SR.Palette} items=${palItems()} onClose=${function () { setPalOpen(false); }} />` : null}
      ${toastMsg ? html`<div role="status" class="sr-toast">${SR.Icon('check', 15)} ${toastMsg}${toastUndo ? html`<button type="button" class="sr-undo" onClick=${function () { var f = toastUndo.fn; setToastMsg(''); setToastUndo(null); f(); }}>Undo</button>` : null}</div>` : null}
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
        Object.keys(k).forEach(function (n) { if (n.indexOf('seo:') === 0) { try { localStorage.setItem('srseo:' + n.slice(4), JSON.stringify(k[n])); } catch (e) {} } });
        ['periods', 'orgP', 'orgT', 'metaReal', 'acct', 'templates', 'warmap', 'game', 'fin', 'agoals', 'uiprefs'].forEach(function (n) { if (k[n] && SR[n]) { Object.keys(SR[n]).forEach(function (x) { delete SR[n][x]; }); Object.assign(SR[n], k[n]); } });
        var tasks = d.tasks; if (tasks && k.order) { var ix = {}; k.order.forEach(function (id, i) { ix[id] = i; }); tasks = tasks.slice().sort(function (a, b) { return (ix[a.id] == null ? 1e9 : ix[a.id]) - (ix[b.id] == null ? 1e9 : ix[b.id]); }); }
        if (tasks) { var MH = {}; Object.keys(SR.TEMPLATES || {}).forEach(function (tk) { ((SR.TEMPLATES[tk] || {}).milestones || []).forEach(function (m) { if (m[2]) MH[m[0] + ': ' + m[1]] = m[2]; }); }); tasks = tasks.map(function (t) { return t.milestone && MH[t.name] ? Object.assign({}, t, { how: MH[t.name] }) : t; }); }
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
    var box = function (c, wide) { return html`<div class=${'sr-boot nt' + (SR.getTheme() === 'dark' ? ' ntd' : '')}><div class="sr-bootc" style=${wide ? 'width:min(400px,92vw)' : ''}><div class="sr-bootbrand">${SR.Logo(40)}<div><b>Eclipse</b><span>Sarac Ramsay</span></div></div>${c}</div></div>`; };
    var say = function (m) { setErr(m); setBusy(false); };
    if (phase === 'boot') return box(html`<p>Loading…</p><div class="sr-skel"><i></i><i></i><i></i></div>`);
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
