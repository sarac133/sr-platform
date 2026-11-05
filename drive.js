/* Sarac Ramsay Eclipse: Drive. A Google Drive style browser. Starts blank, fills in once Google Drive is connected.
   Uses Google Identity Services (token flow) and the Drive v3 REST API straight from the browser. */
window.SR = window.SR || {};
(function (SR) {
  var html = SR.html, useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var API = 'https://www.googleapis.com/drive/v3/files';
  var SCOPE = 'https://www.googleapis.com/auth/drive';
  var FOLDER = 'application/vnd.google-apps.folder';
  var FIELDS = 'nextPageToken,files(id,name,mimeType,parents,modifiedTime,viewedByMeTime,size,starred,trashed,webViewLink,owners(displayName),shared,capabilities(canEdit))';
  var NEW_TYPES = [['Google Doc', 'application/vnd.google-apps.document'], ['Google Sheet', 'application/vnd.google-apps.spreadsheet'], ['Google Slides', 'application/vnd.google-apps.presentation']];

  var jget = function (s, k, d) { try { var v = s.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var jset = function (s, k, v) { try { s.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var getCid = function () { return ((window.SR_CONFIG || {}).GOOGLE_CLIENT_ID) || jget(localStorage, 'sr_gdrive_cid', '') || ''; };

  var kind = function (m) {
    if (m === FOLDER) return ['folder', '#5F6368', 'Folder'];
    if (m === 'application/vnd.google-apps.document') return ['doc', '#4285F4', 'Doc'];
    if (m === 'application/vnd.google-apps.spreadsheet') return ['sheet', '#0F9D58', 'Sheet'];
    if (m === 'application/vnd.google-apps.presentation') return ['slides', '#F4B400', 'Slides'];
    if (m === 'application/vnd.google-apps.form') return ['form', '#7248B9', 'Form'];
    if (m === 'application/pdf') return ['pdf', '#DB4437', 'PDF'];
    if (/^image\//.test(m || '')) return ['image', '#A142F4', 'Image'];
    if (/^video\//.test(m || '')) return ['video', '#DB4437', 'Video'];
    return ['file', '#80868B', 'File'];
  };
  var Ico = function (m, z) {
    var k = kind(m), c = k[1], s = z || 20;
    if (k[0] === 'folder') return html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill=${c} aria-hidden="true" style="flex:none"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg>`;
    var lines = k[0] === 'sheet' ? html`<path d="M8 11h8M8 14h8M8 17h8M12 9v10" stroke="#fff" stroke-width="1.4" fill="none"/>` : k[0] === 'slides' ? html`<rect x="8" y="10.5" width="8" height="5.5" rx="1" fill="none" stroke="#fff" stroke-width="1.5"/>` : k[0] === 'doc' ? html`<path d="M8 10h8M8 13h8M8 16h5" stroke="#fff" stroke-width="1.5" fill="none"/>` : html`<circle cx="12" cy="13" r="2.4" fill="#fff"/>`;
    return html`<svg width=${s} height=${s} viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><path d="M6 2h8l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill=${c}/><path d="M14 2l5 5h-4a1 1 0 01-1-1V2z" fill="#fff" fill-opacity=".45"/>${lines}</svg>`;
  };
  var fmtSize = function (n) { n = +n; if (!n) return '—'; var u = ['B', 'KB', 'MB', 'GB']; var i = Math.min(3, Math.floor(Math.log(n) / Math.log(1024))); return (n / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + u[i]; };
  var fmtDate = function (iso) {
    if (!iso) return '';
    var d = new Date(iso), now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  };
  var previewUrl = function (f) {
    var m = f.mimeType;
    if (m === 'application/vnd.google-apps.document') return 'https://docs.google.com/document/d/' + f.id + '/preview';
    if (m === 'application/vnd.google-apps.spreadsheet') return 'https://docs.google.com/spreadsheets/d/' + f.id + '/preview';
    if (m === 'application/vnd.google-apps.presentation') return 'https://docs.google.com/presentation/d/' + f.id + '/preview';
    if (m === 'application/vnd.google-apps.form') return '';
    return 'https://drive.google.com/file/d/' + f.id + '/preview';
  };
  var q = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); };

  var loadGis = function () {
    return new Promise(function (res, rej) {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) return res();
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('Could not load Google sign-in. Check your connection or ad blocker.')); };
      document.head.appendChild(s);
    });
  };

  var VIEWS = [['my', 'My Drive', 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z'], ['shared', 'Shared with me', 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 19c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 4'], ['recent', 'Recent', 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z'], ['starred', 'Starred', 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z'], ['trash', 'Trash', 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13']];
  var Svg = function (d, z) { return html`<svg width=${z || 16} height=${z || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d=${d}/></svg>`; };

  SR.Drive = function () {
    var cidS = useState(getCid()), cid = cidS[0], setCid = cidS[1];
    var tkS = useState(function () { var t = jget(sessionStorage, 'sr_gdrive_tok', null); return t && t.exp > Date.now() ? t.t : ''; }), tok = tkS[0], setTok = tkS[1];
    var vS = useState('my'), view = vS[0], setView = vS[1];
    var stS = useState([{ id: 'root', name: 'My Drive' }]), stack = stS[0], setStack = stS[1];
    var fS = useState([]), files = fS[0], setFiles = fS[1];
    var nS = useState(''), next = nS[0], setNext = nS[1];
    var lS = useState(false), loading = lS[0], setLoading = lS[1];
    var eS = useState(''), err = eS[0], setErr = eS[1];
    var sS = useState(''), sel = sS[0], setSel = sS[1];
    var gS = useState(jget(localStorage, 'sr_gdrive_grid', false)), grid = gS[0], setGrid = gS[1];
    var cxS = useState(null), ctx = cxS[0], setCtx = cxS[1];
    var mvS = useState(null), mv = mvS[0], setMv = mvS[1];
    var pvS = useState(null), pv = pvS[0], setPv = pvS[1];
    var dlS = useState(null), dlg = dlS[0], setDlg = dlS[1];
    var qS = useState(''), qv = qS[0], setQv = qS[1];
    var sqS = useState(''), sq = sqS[0], setSq = sqS[1];
    var dsS = useState(''), dropOn = dsS[0], setDropOn = dsS[1];
    var mgS = useState(''), msg = mgS[0], setMsg = mgS[1];
    var nwS = useState(false), nw = nwS[0], setNw = nwS[1];
    var cidIn = useRef(null);
    var folder = stack[stack.length - 1];
    var inSearch = !!sq;

    var say = function (t) { setMsg(t); clearTimeout(say._t); say._t = setTimeout(function () { setMsg(''); }, 3200); };
    var signOut = function (why) { try { sessionStorage.removeItem('sr_gdrive_tok'); } catch (e) {} setTok(''); setFiles([]); setNext(''); if (why) setErr(why); };

    var call = function (path, opt) {
      opt = opt || {};
      return fetch(API + path, { method: opt.method || 'GET', headers: Object.assign({ Authorization: 'Bearer ' + tok }, opt.body ? { 'Content-Type': 'application/json' } : {}), body: opt.body ? JSON.stringify(opt.body) : undefined }).then(function (r) {
        if (r.status === 401) { signOut('Your Google session ended. Connect again.'); throw new Error('auth'); }
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error((j.error && j.error.message) || ('Google said ' + r.status)); });
        return r.status === 204 ? {} : r.json();
      });
    };

    var query = function () {
      if (sq) return { q: "name contains '" + q(sq) + "' and trashed=false", o: 'folder,modifiedTime desc' };
      if (view === 'shared') return { q: 'sharedWithMe=true and trashed=false', o: 'folder,name' };
      if (view === 'recent') return { q: "trashed=false and mimeType!='" + FOLDER + "'", o: 'viewedByMeTime desc' };
      if (view === 'starred') return { q: 'starred=true and trashed=false', o: 'folder,name' };
      if (view === 'trash') return { q: 'trashed=true', o: 'folder,name' };
      return { q: "'" + folder.id + "' in parents and trashed=false", o: 'folder,name' };
    };
    var load = function (more) {
      if (!tok) return;
      var Q = query();
      setLoading(true); setErr('');
      var url = '?pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=' + encodeURIComponent(FIELDS) + '&orderBy=' + encodeURIComponent(Q.o) + '&q=' + encodeURIComponent(Q.q) + (more && next ? '&pageToken=' + encodeURIComponent(next) : '');
      call(url).then(function (j) { setFiles(function (o) { return more ? o.concat(j.files || []) : (j.files || []); }); setNext(j.nextPageToken || ''); setLoading(false); }).catch(function (e) { setLoading(false); if (e.message !== 'auth') setErr(e.message); });
    };
    useEffect(function () { setSel(''); setCtx(null); load(false); }, [tok, view, folder.id, sq]);
    useEffect(function () {
      if (!ctx) return; var h = function () { setCtx(null); };
      document.addEventListener('click', h); return function () { document.removeEventListener('click', h); };
    }, [ctx]);

    var connect = function () {
      var id = (cidIn.current ? cidIn.current.value : cid).trim();
      if (!id) { setErr('Paste your Google OAuth Client ID first.'); return; }
      setErr(''); jset(localStorage, 'sr_gdrive_cid', id); setCid(id);
      loadGis().then(function () {
        var c = window.google.accounts.oauth2.initTokenClient({ client_id: id, scope: SCOPE, callback: function (r) {
          if (r.error) { setErr('Google said: ' + (r.error_description || r.error)); return; }
          jset(sessionStorage, 'sr_gdrive_tok', { t: r.access_token, exp: Date.now() + (Number(r.expires_in || 3600) - 60) * 1000 });
          setTok(r.access_token);
        }, error_callback: function (e) { setErr('Sign-in was closed or blocked (' + (e && e.type || 'error') + ').'); } });
        c.requestAccessToken({ prompt: tok ? '' : 'select_account' });
      }).catch(function (e) { setErr(e.message); });
    };
    var disconnect = function () {
      try { if (tok && window.google && window.google.accounts) window.google.accounts.oauth2.revoke(tok, function () {}); } catch (e) {}
      signOut(''); say('Disconnected');
    };

    var patch = function (f, params, body, okMsg) {
      return call('/' + f.id + '?supportsAllDrives=true&fields=' + encodeURIComponent('id,name,parents,starred,trashed') + (params || ''), { method: 'PATCH', body: body || {} }).then(function (j) { if (okMsg) say(okMsg); return j; }).catch(function (e) { if (e.message !== 'auth') say(e.message); throw e; });
    };
    var moveTo = function (f, targetId, targetName) {
      var from = (f.parents || []).join(',');
      if (!targetId || (f.parents || []).indexOf(targetId) > -1 || f.id === targetId) { say('Already there'); return; }
      patch(f, '&addParents=' + encodeURIComponent(targetId) + (from ? '&removeParents=' + encodeURIComponent(from) : ''), {}, 'Moved to ' + targetName).then(function () { if (!inSearch && view === 'my') setFiles(function (o) { return o.filter(function (x) { return x.id !== f.id; }); }); else load(false); }).catch(function () {});
    };
    var star = function (f) { patch(f, '', { starred: !f.starred }, f.starred ? 'Removed star' : 'Starred').then(function () { if (view === 'starred') setFiles(function (o) { return o.filter(function (x) { return x.id !== f.id; }); }); else setFiles(function (o) { return o.map(function (x) { return x.id === f.id ? Object.assign({}, x, { starred: !f.starred }) : x; }); }); }).catch(function () {}); };
    var trash = function (f, on) { patch(f, '', { trashed: on }, on ? 'Moved to Trash' : 'Restored').then(function () { setFiles(function (o) { return o.filter(function (x) { return x.id !== f.id; }); }); }).catch(function () {}); };
    var rmForever = function (f) { call('/' + f.id + '?supportsAllDrives=true', { method: 'DELETE' }).then(function () { say('Deleted for good'); setFiles(function (o) { return o.filter(function (x) { return x.id !== f.id; }); }); }).catch(function (e) { if (e.message !== 'auth') say(e.message); }); };
    var emptyTrash = function () { call('/trash', { method: 'DELETE' }).then(function () { say('Trash emptied'); setFiles([]); }).catch(function (e) { if (e.message !== 'auth') say(e.message); }); };
    var create = function (name, mime) {
      var parent = (view === 'my' && !inSearch) ? folder.id : 'root';
      call('?supportsAllDrives=true&fields=' + encodeURIComponent('id,name,mimeType,parents,modifiedTime,webViewLink,owners(displayName)'), { method: 'POST', body: { name: name, mimeType: mime, parents: [parent] } }).then(function (j) { say('Created ' + name); setFiles(function (o) { return mime === FOLDER ? [j].concat(o) : o.concat([j]); }); if (mime !== FOLDER && j.webViewLink) window.open(j.webViewLink, '_blank', 'noopener'); }).catch(function (e) { if (e.message !== 'auth') say(e.message); });
    };
    var open = function (f) {
      if (f.mimeType === FOLDER) { setSq(''); setQv(''); setView('my'); setStack(function (s) { return view === 'my' && !inSearch ? s.concat([{ id: f.id, name: f.name }]) : [{ id: 'root', name: 'My Drive' }, { id: f.id, name: f.name }]; }); return; }
      var u = previewUrl(f);
      if (u) setPv({ f: f, url: u }); else if (f.webViewLink) window.open(f.webViewLink, '_blank', 'noopener');
    };
    var goView = function (v) { setSq(''); setQv(''); setView(v); setStack([{ id: 'root', name: 'My Drive' }]); };
    var goCrumb = function (i) { setSq(''); setQv(''); setView('my'); setStack(function (s) { return s.slice(0, i + 1); }); };

    var onDragStart = function (f) { return function (e) { try { e.dataTransfer.setData('text/plain', 'gd:' + f.id); e.dataTransfer.effectAllowed = 'move'; } catch (x) {} window.__gdDrag = f; }; };
    var dropProps = function (key, id, name) {
      return {
        onDragOver: function (e) { if (!window.__gdDrag) return; e.preventDefault(); if (dropOn !== key) setDropOn(key); },
        onDragLeave: function () { if (dropOn === key) setDropOn(''); },
        onDrop: function (e) { e.preventDefault(); var f = window.__gdDrag; window.__gdDrag = null; setDropOn(''); if (f && f.id !== id) moveTo(f, id, name); }
      };
    };

    /* --- Move to... picker --- */
    var mvLoad = function (st) {
      var cur = st[st.length - 1];
      setMv(function (m) { return Object.assign({}, m, { st: st, list: null }); });
      call('?pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=' + encodeURIComponent('files(id,name)') + '&orderBy=name&q=' + encodeURIComponent("'" + cur.id + "' in parents and mimeType='" + FOLDER + "' and trashed=false")).then(function (j) { setMv(function (m) { return m && m.st === st ? Object.assign({}, m, { list: j.files || [] }) : m; }); }).catch(function () {});
    };

    var rows = files;
    var connected = !!tok;
    var title = inSearch ? 'Results for "' + sq + '"' : view === 'my' ? folder.name : (VIEWS.filter(function (v) { return v[0] === view; })[0] || [])[1];

    var menuItems = function (f) {
      var it = [];
      var isTrash = view === 'trash';
      if (!isTrash) {
        it.push(['Open', function () { open(f); }]);
        if (f.webViewLink) it.push(['Open in Google ↗', function () { window.open(f.webViewLink, '_blank', 'noopener'); }]);
        it.push(['Move to…', function () { var st = [{ id: 'root', name: 'My Drive' }]; setMv({ f: f, st: st, list: null }); mvLoad(st); }]);
        it.push(['Rename', function () { setDlg({ k: 'rename', f: f, v: f.name }); }]);
        it.push([f.starred ? 'Remove star' : 'Add star', function () { star(f); }]);
        it.push(['Move to Trash', function () { trash(f, true); }, true]);
      } else {
        it.push(['Restore', function () { trash(f, false); }]);
        it.push(['Delete forever', function () { setDlg({ k: 'forever', f: f }); }, true]);
      }
      return it;
    };
    var openMenu = function (e, f) { e.preventDefault(); e.stopPropagation(); setSel(f.id); var r = e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null; var x = e.clientX || (r && r.left) || 0, y = e.clientY || (r && r.bottom) || 0; setCtx({ f: f, x: Math.min(x, window.innerWidth - 200), y: Math.min(y, window.innerHeight - 260) }); };

    /* --- UI --- */
    var rail = html`<div class="gd-rail">
      <div class="gd-newwrap">
        <button type="button" class="gd-new" disabled=${!connected} onClick=${function (e) { e.stopPropagation(); setNw(!nw); }}>${Svg('M12 5v14M5 12h14', 16)} New</button>
        ${nw ? html`<div class="gd-menu" style="left:0;top:44px" onClick=${function (e) { e.stopPropagation(); }}>
          <button type="button" onClick=${function () { setNw(false); setDlg({ k: 'folder', v: '' }); }}>${Ico(FOLDER, 16)} New folder</button>
          <div class="gd-sep"></div>
          ${NEW_TYPES.map(function (t) { return html`<button type="button" key=${t[0]} onClick=${function () { setNw(false); setDlg({ k: 'file', mime: t[1], label: t[0], v: 'Untitled ' + t[0].replace('Google ', '').toLowerCase() }); }}>${Ico(t[1], 16)} ${t[0]}</button>`; })}
        </div>` : null}
      </div>
      ${VIEWS.map(function (v) {
        var on = !inSearch && view === v[0];
        var dp = v[0] === 'my' ? dropProps('rail-my', 'root', 'My Drive') : {};
        return html`<button type="button" key=${v[0]} class=${'gd-nav' + (on ? ' on' : '') + (dropOn === 'rail-my' && v[0] === 'my' ? ' drop' : '')} onClick=${function () { goView(v[0]); }} ...${dp}>${Svg(v[2], 16)}<span>${v[1]}</span></button>`;
      })}
      <div class="gd-rfoot">${connected ? html`<button type="button" class="gd-link" onClick=${disconnect}>Disconnect Google Drive</button>` : html`<span>Not connected</span>`}</div>
    </div>`;

    var emptyConnected = !loading && !err && !rows.length;
    var emptyText = inSearch ? 'Nothing matches that search.' : view === 'trash' ? 'Trash is empty.' : view === 'starred' ? 'No starred files yet.' : view === 'shared' ? 'Nothing has been shared with you.' : view === 'recent' ? 'No recent files.' : 'This folder is empty.';

    var connectCard = html`<div class="gd-conn">
      <div class="gd-conn-ic">${Ico('application/vnd.google-apps.document', 34)}${Ico('application/vnd.google-apps.spreadsheet', 34)}${Ico('application/vnd.google-apps.presentation', 34)}</div>
      <h3>Connect Google Drive</h3>
      <p>Your Docs, Sheets, Slides and folders show up here. Open them, search them and move them around, all without leaving Eclipse.</p>
      ${cid ? null : html`<ol class="gd-steps">
        <li>In Google Cloud Console, turn on the <b>Google Drive API</b>.</li>
        <li>Create an <b>OAuth client ID</b> of type Web application. Add <b>${location.origin}</b> under Authorized JavaScript origins.</li>
        <li>Paste the Client ID below. You only do this once.</li>
      </ol>`}
      <div class="gd-conn-row"><input ref=${cidIn} class="gd-in" placeholder="Google OAuth Client ID" defaultValue=${cid} aria-label="Google OAuth Client ID" /><button type="button" class="gd-btn pri" onClick=${connect}>Connect</button></div>
      ${cid ? html`<button type="button" class="gd-link" onClick=${function () { try { localStorage.removeItem('sr_gdrive_cid'); } catch (e) {} setCid(''); }}>Use a different Client ID</button>` : null}
      ${err ? html`<div class="gd-err" role="alert">${err}</div>` : null}
    </div>`;

    var listHead = html`<div class="gd-lh"><span class="c-name">Name</span><span class="c-own">Owner</span><span class="c-mod">${view === 'recent' ? 'Last opened' : 'Last modified'}</span><span class="c-sz">Size</span><span class="c-act"></span></div>`;
    var row = function (f) {
      var isF = f.mimeType === FOLDER, on = sel === f.id;
      var dp = isF && view !== 'trash' ? dropProps('f' + f.id, f.id, f.name) : {};
      return html`<div key=${f.id} class=${'gd-row' + (on ? ' on' : '') + (dropOn === 'f' + f.id ? ' drop' : '')} draggable=${view !== 'trash'} onDragStart=${onDragStart(f)} onDragEnd=${function () { window.__gdDrag = null; setDropOn(''); }} ...${dp}
        onClick=${function (e) { e.stopPropagation(); setSel(f.id); }} onDoubleClick=${function () { if (view !== 'trash') open(f); }} onContextMenu=${function (e) { openMenu(e, f); }}>
        <span class="c-name">${Ico(f.mimeType, 20)}<span class="gd-nm" title=${f.name}>${f.name}</span>${f.starred ? html`<span class="gd-star" title="Starred">★</span>` : null}${f.shared ? html`<span class="gd-sh" title="Shared">${Svg('M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 19c0-3 3-5 6-5s6 2 6 5', 13)}</span>` : null}</span>
        <span class="c-own">${(f.owners && f.owners[0] && f.owners[0].displayName) || '—'}</span>
        <span class="c-mod">${fmtDate(view === 'recent' ? f.viewedByMeTime : f.modifiedTime)}</span>
        <span class="c-sz">${isF ? '—' : fmtSize(f.size)}</span>
        <span class="c-act"><button type="button" class="gd-dots" aria-label=${'Actions for ' + f.name} onClick=${function (e) { openMenu(e, f); }}>${Svg('M12 6h.01M12 12h.01M12 18h.01', 16)}</button></span>
      </div>`;
    };
    var card = function (f) {
      var isF = f.mimeType === FOLDER, on = sel === f.id;
      var dp = isF && view !== 'trash' ? dropProps('f' + f.id, f.id, f.name) : {};
      return html`<div key=${f.id} class=${'gd-card' + (on ? ' on' : '') + (dropOn === 'f' + f.id ? ' drop' : '')} draggable=${view !== 'trash'} onDragStart=${onDragStart(f)} onDragEnd=${function () { window.__gdDrag = null; setDropOn(''); }} ...${dp}
        onClick=${function (e) { e.stopPropagation(); setSel(f.id); }} onDoubleClick=${function () { if (view !== 'trash') open(f); }} onContextMenu=${function (e) { openMenu(e, f); }}>
        <div class="gd-thumb">${Ico(f.mimeType, 44)}</div>
        <div class="gd-cap">${Ico(f.mimeType, 16)}<span class="gd-nm" title=${f.name}>${f.name}</span><button type="button" class="gd-dots" aria-label=${'Actions for ' + f.name} onClick=${function (e) { openMenu(e, f); }}>${Svg('M12 6h.01M12 12h.01M12 18h.01', 15)}</button></div>
      </div>`;
    };

    var main = !connected ? html`<div class="gd-body gd-blank">${connectCard}</div>` : html`<div class="gd-body" onClick=${function () { setSel(''); }}>
      <div class="gd-crumbs">
        ${inSearch || view !== 'my' ? html`<span class="gd-h">${title}</span>` : stack.map(function (s, i) {
          var last = i === stack.length - 1;
          var dp = !last ? dropProps('c' + s.id, s.id, s.name) : {};
          return html`<span key=${s.id} class="gd-cr">${i ? html`<span class="gd-sl">›</span>` : null}<button type="button" class=${'gd-crb' + (last ? ' last' : '') + (dropOn === 'c' + s.id ? ' drop' : '')} onClick=${function () { if (!last) goCrumb(i); }} ...${dp}>${s.name}</button></span>`;
        })}
        <span style="flex:1"></span>
        ${view === 'trash' && rows.length ? html`<button type="button" class="gd-btn" onClick=${function () { setDlg({ k: 'empty' }); }}>Empty trash</button>` : null}
        <div class="gd-seg" role="group" aria-label="View">
          <button type="button" class=${!grid ? 'on' : ''} aria-label="List view" onClick=${function () { setGrid(false); jset(localStorage, 'sr_gdrive_grid', false); }}>${Svg('M4 6h16M4 12h16M4 18h16', 15)}</button>
          <button type="button" class=${grid ? 'on' : ''} aria-label="Grid view" onClick=${function () { setGrid(true); jset(localStorage, 'sr_gdrive_grid', true); }}>${Svg('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', 15)}</button>
        </div>
      </div>
      ${err ? html`<div class="gd-err" role="alert">${err} <button type="button" class="gd-link" onClick=${function () { load(false); }}>Try again</button></div>` : null}
      ${grid ? null : listHead}
      <div class=${grid ? 'gd-grid' : 'gd-list'}>
        ${loading && !rows.length ? html`<div class="gd-empty">Loading…</div>` : null}
        ${emptyConnected ? html`<div class="gd-empty">${emptyText}</div>` : null}
        ${rows.map(function (f) { return grid ? card(f) : row(f); })}
        ${next ? html`<div class="gd-more"><button type="button" class="gd-btn" disabled=${loading} onClick=${function () { load(true); }}>${loading ? 'Loading…' : 'Load more'}</button></div>` : null}
      </div>
    </div>`;

    var modal = null;
    if (dlg) {
      var okDlg = function () {
        var v = (dlg.v || '').trim();
        if (dlg.k === 'folder' && v) create(v, FOLDER);
        else if (dlg.k === 'file' && v) create(v, dlg.mime);
        else if (dlg.k === 'rename' && v && v !== dlg.f.name) patch(dlg.f, '', { name: v }, 'Renamed').then(function (j) { setFiles(function (o) { return o.map(function (x) { return x.id === dlg.f.id ? Object.assign({}, x, { name: j.name }) : x; }); }); }).catch(function () {});
        else if (dlg.k === 'forever') rmForever(dlg.f);
        else if (dlg.k === 'empty') emptyTrash();
        setDlg(null);
      };
      var txt = dlg.k === 'folder' || dlg.k === 'file' || dlg.k === 'rename';
      modal = html`<div class="gd-ov" onClick=${function () { setDlg(null); }}><div class="gd-dlg" role="dialog" aria-modal="true" onClick=${function (e) { e.stopPropagation(); }}>
        <h4>${dlg.k === 'folder' ? 'New folder' : dlg.k === 'file' ? 'New ' + dlg.label : dlg.k === 'rename' ? 'Rename' : dlg.k === 'empty' ? 'Empty trash?' : 'Delete forever?'}</h4>
        ${txt ? html`<input class="gd-in" autofocus value=${dlg.v} onInput=${function (e) { var v = e.target.value; setDlg(function (d) { return Object.assign({}, d, { v: v }); }); }} onKeyDown=${function (e) { if (e.key === 'Enter') okDlg(); else if (e.key === 'Escape') setDlg(null); }} ref=${function (el) { if (el && !el._f) { el._f = 1; el.focus(); el.select(); } }} />` : html`<p>${dlg.k === 'empty' ? 'Everything in Trash is deleted for good. This cannot be undone.' : '"' + dlg.f.name + '" is deleted for good. This cannot be undone.'}</p>`}
        <div class="gd-dact"><button type="button" class="gd-btn" onClick=${function () { setDlg(null); }}>Cancel</button><button type="button" class=${'gd-btn pri' + (dlg.k === 'forever' || dlg.k === 'empty' ? ' bad' : '')} onClick=${okDlg}>${dlg.k === 'rename' ? 'Save' : dlg.k === 'forever' || dlg.k === 'empty' ? 'Delete' : 'Create'}</button></div>
      </div></div>`;
    }

    var mvModal = null;
    if (mv) {
      var cur = mv.st[mv.st.length - 1];
      mvModal = html`<div class="gd-ov" onClick=${function () { setMv(null); }}><div class="gd-dlg wide" role="dialog" aria-modal="true" onClick=${function (e) { e.stopPropagation(); }}>
        <h4>Move "${mv.f.name}"</h4>
        <div class="gd-mvcr">${mv.st.map(function (s, i) { return html`<span key=${s.id}>${i ? ' › ' : ''}<button type="button" class="gd-link" onClick=${function () { mvLoad(mv.st.slice(0, i + 1)); }}>${s.name}</button></span>`; })}</div>
        <div class="gd-mvlist">
          ${mv.list === null ? html`<div class="gd-empty">Loading…</div>` : mv.list.length ? mv.list.filter(function (x) { return x.id !== mv.f.id; }).map(function (x) { return html`<button type="button" key=${x.id} class="gd-mvrow" onClick=${function () { mvLoad(mv.st.concat([{ id: x.id, name: x.name }])); }}>${Ico(FOLDER, 18)}<span>${x.name}</span></button>`; }) : html`<div class="gd-empty">No folders here.</div>`}
        </div>
        <div class="gd-dact"><button type="button" class="gd-btn" onClick=${function () { setMv(null); }}>Cancel</button><button type="button" class="gd-btn pri" onClick=${function () { var f = mv.f; setMv(null); moveTo(f, cur.id, cur.name); }}>Move here</button></div>
      </div></div>`;
    }

    var pvModal = pv ? html`<div class="gd-ov" onClick=${function () { setPv(null); }}><div class="gd-pv" role="dialog" aria-modal="true" aria-label=${'Preview of ' + pv.f.name} onClick=${function (e) { e.stopPropagation(); }}>
      <div class="gd-pvh">${Ico(pv.f.mimeType, 20)}<b>${pv.f.name}</b><span style="flex:1"></span>
        ${pv.f.webViewLink ? html`<a class="gd-btn pri" href=${pv.f.webViewLink} target="_blank" rel="noopener">Open in Google ↗</a>` : null}
        <button type="button" class="gd-btn" onClick=${function () { setPv(null); }}>Close</button></div>
      <iframe class="gd-frame" title=${pv.f.name} src=${pv.url}></iframe>
    </div></div>` : null;

    var ctxMenu = ctx ? html`<div class="gd-menu" style=${'position:fixed;left:' + ctx.x + 'px;top:' + ctx.y + 'px'} role="menu" onClick=${function (e) { e.stopPropagation(); }}>
      ${menuItems(ctx.f).map(function (m) { return html`<button type="button" key=${m[0]} class=${m[2] ? 'bad' : ''} role="menuitem" onClick=${function () { setCtx(null); m[1](); }}>${m[0]}</button>`; })}
    </div>` : null;

    return html`<div class="gd-page" onClick=${function () { setNw(false); }}>
      <div class="gd-top">
        <div class="gd-title" role="heading" aria-level="1">Drive</div>
        <div class="gd-search">${Svg('M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3', 15)}<input aria-label="Search in Drive" placeholder="Search in Drive" disabled=${!connected} value=${qv} onInput=${function (e) { setQv(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') setSq(qv.trim()); if (e.key === 'Escape') { setQv(''); setSq(''); } }} />${qv ? html`<button type="button" class="gd-x" aria-label="Clear search" onClick=${function () { setQv(''); setSq(''); }}>×</button>` : null}</div>
        ${msg ? html`<span class="gd-msg" role="status">${msg}</span>` : null}
      </div>
      <div class="gd">${rail}${main}</div>
      ${ctxMenu}${modal}${mvModal}${pvModal}
    </div>`;
  };
})(window.SR);
