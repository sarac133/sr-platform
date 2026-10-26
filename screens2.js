/* Sarac Ramsay — client page (Clear Ally design) + Results tracker */
window.SR = window.SR || {};
(function (SR) {
  var html = SR.html, useState = React.useState;
  var card = 'background:var(--card);border:1px solid var(--border);border-radius:12px';


  var PIC = { research: 'search', gresearch: 'target', build: 'layers', launch: 'play', mresearch: 'target', mbuild: 'layers', mlaunch: 'play', aeosetup: 'spark', ongoing: 'repeat' };
  var PC = ['#4F46E5', '#0891B2', '#059669', '#65A30D', '#D97706', '#EA580C', '#DC2626', '#DB2777', '#7C3AED', '#475569'];
  var SEC = { kw: ['#3B6FD4', 'search'], budget: ['#C77700', 'gauge'], access: ['#7C3AED', 'key'], copy: ['#BE185D', 'pen'], lp: ['#0E7490', 'globe'], track: ['#C77700', 'chart'], camp: ['#0369A1', 'grid'], pre: ['#D9480F', 'clip'], golive: ['#8A6D1F', 'flag'], metaset: ['#3B6FD4', 'grid'] };
  var secOf = function (id, fallbackIcon, fallbackColor) { return SEC[id] || [fallbackColor || '#3B6FD4', fallbackIcon || 'list']; };

  /* count-up number */
  SR.CountUp = function (p) {
    var st = useState(p.value), shown = st[0], setShown = st[1];
    var ref = React.useRef(p.value);
    React.useEffect(function () {
      var from = ref.current, to = p.value, t0 = null, raf;
      if (from === to) return;
      var step = function (ts) { if (t0 === null) t0 = ts; var k = Math.min(1, (ts - t0) / (p.ms || 800)); var e = 1 - Math.pow(1 - k, 3); setShown(from + (to - from) * e); if (k < 1) raf = requestAnimationFrame(step); else ref.current = to; };
      raf = requestAnimationFrame(step); return function () { cancelAnimationFrame(raf); ref.current = to; };
    }, [p.value]);
    return p.fmt ? p.fmt(shown) : Math.round(shown);
  };
  /* click-to-edit value (text, number, date or select) */
  SR.Editable = function (p) {
    /* native fields: always visible, save on change */
    var shown = p.value == null ? '' : p.value;
    var save = function (v) { p.onSave(p.type === 'number' ? (parseFloat(v) || 0) : v); };
    var field;
    if (p.type === 'select') field = html`<select class="nat-in" value=${shown} onChange=${function (e) { p.onSave(e.target.value); }}>${p.options.map(function (o) { return html`<option key=${o} value=${o}>${o}</option>`; })}</select>`;
    else field = html`<input key=${String(shown)} class="nat-in" type=${p.type || 'text'} defaultValue=${shown} placeholder=${p.placeholder || 'Add'} onBlur=${function (e) { if (e.target.value !== String(shown)) save(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') e.target.blur(); }} />`;
    return html`<span class=${'nat' + (p.type === 'number' ? ' num' : '')}>${p.prefix ? html`<em>${p.prefix}</em>` : null}${field}</span>`;
  };

  /* ---------- Local SEO workspace: the SEO platform, running inside the client page ---------- */
  /* Runs in a same-origin iframe. This shim stands in for the SEO platform's server: it keeps the data in this browser. */
  var SEO_CSS = 'html,body{overflow:hidden}.embed .sheetwrap{max-height:none}.embed .px.detail{position:absolute;top:var(--vt,0px);bottom:auto;height:var(--vh,100vh)}.embed .pxbw{position:absolute;bottom:auto;top:calc(var(--vt,0px) + var(--vh,100vh) - 96px);height:80px}#toast{position:absolute!important;bottom:auto!important;top:calc(var(--vt,0px) + var(--vh,100vh) - 70px)}.embed .wrap{max-width:none;padding:0 0 110px}.embed .tabs{border:0;gap:6px;margin:2px 0 18px}.embed .tab{border:1px solid var(--line);border-radius:99px;min-height:34px;padding:0 14px;font-size:13px}.embed .tab.on{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)}.embed .phase .pi{display:inline-flex;color:var(--pc)}';
  var SEO_JS = '\n;(function(){var ap=document.getElementById("app"),last=0;function post(){var h=Math.ceil(ap.getBoundingClientRect().height)+10;if(h!==last){last=h;parent.postMessage({sr:"h",h:h},"*");}}new ResizeObserver(post).observe(ap);addEventListener("load",post);addEventListener("message",function(e){var d=e.data;if(d&&d.sr==="v"){var st=document.documentElement.style;st.setProperty("--vt",d.t+"px");st.setProperty("--vh",d.h+"px");}});parent.postMessage({sr:"ready"},"*");setTimeout(post,300);})();\n;(function(){var N=["search","pin","gauge","clip","grid","spark","list","globe","radar","chart"];var r0=render;render=function(){r0();document.querySelectorAll(".phase").forEach(function(b,i){var d=b.querySelector(".dot");if(d){var s=document.createElement("span");s.className="pi";s.innerHTML=svg(N[i%N.length],16);d.replaceWith(s);}});};})();\n';
  var seoShim = function (cfg, DATA) {
    var P = 'srseo:', TABS = ['baseline', 'keywords', 'pages', 'citations', 'competitors', 'links', 'journal'];
    var g = function (k) { try { return JSON.parse(localStorage.getItem(P + k)); } catch (e) { return null; } };
    var put = function (k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };
    try { localStorage.setItem('token', 'local'); localStorage.setItem('theme', cfg.dark ? 'dark' : 'light'); } catch (e) {}
    var c = g('client:' + cfg.id);
    if (!c) { c = { id: cfg.id, name: cfg.name, domain: cfg.domain || '', service: cfg.service || '', city: cfg.city || '', start: cfg.start || new Date().toISOString().slice(0, 10), marks: {}, notes: '', updated: new Date().toISOString() }; put('client:' + cfg.id, c); }
    else if (cfg.domain && !c.domain) { c.domain = cfg.domain; put('client:' + cfg.id, c); }
    var json = function (d, st) { return Promise.resolve(new Response(JSON.stringify(d), { status: st || 200, headers: { 'content-type': 'application/json' } })); };
    var summary = function (x) { return { id: x.id, name: x.name, domain: x.domain, service: x.service, city: x.city, complete: Object.keys(x.marks).filter(function (k) { return /^\d/.test(k) && (x.marks[k].s === 'done' || x.marks[k].s === 'na'); }).length, updated: x.updated }; };
    var of = window.fetch.bind(window);
    window.fetch = function (u, o) {
      u = String(u); o = o || {}; var m = (o.method || 'GET').toUpperCase();
      if (/data\/work\.json$/.test(u)) return json(DATA.work);
      if (/data\/baseline\.json$/.test(u)) return json(DATA.baseline);
      if (u.indexOf('/api') !== 0) return of(u, o);
      var path = u.replace(/^\/api/, '').replace(/\/+$/, '') || '/', body = {}; try { body = o.body ? JSON.parse(o.body) : {}; } catch (e) {}
      c = g('client:' + cfg.id) || c;
      if (path === '/login') return json({ token: 'local' });
      if (path === '/clients' && m === 'GET') return json([summary(c)]);
      var d = path.match(/^\/clients\/([a-z0-9-]+)\/data(?:\/([a-z]+))?$/);
      if (d) {
        if (!d[2] && m === 'GET') { var out = {}; TABS.forEach(function (t) { out[t] = g('data:' + t) || { order: [], rows: {} }; }); return json(out); }
        if (d[2] && m === 'PUT') {
          var cur = g('data:' + d[2]) || { order: [], rows: {} };
          Object.keys(body.puts || {}).forEach(function (rid) { cur.rows[rid] = body.puts[rid]; });
          (body.dels || []).forEach(function (rid) { delete cur.rows[rid]; });
          if (Array.isArray(body.order)) cur.order = body.order;
          cur.order = cur.order.filter(function (x) { return cur.rows[x]; });
          put('data:' + d[2], cur); return json({ ok: true });
        }
      }
      var mm = path.match(/^\/clients\/([a-z0-9-]+)(\/mark|\/notes|\/meta)?$/);
      if (mm) {
        if (!mm[2] && m === 'GET') return json(c);
        if (!mm[2] && m === 'PUT') { ['name', 'domain', 'service', 'city'].forEach(function (k) { if (body[k] !== undefined) c[k] = String(body[k]).trim(); }); c.updated = new Date().toISOString(); put('client:' + cfg.id, c); return json(c); }
        if (mm[2] === '/mark' && m === 'POST') { if (body.status === 'done' || body.status === 'na') c.marks[body.key] = { s: body.status, t: new Date().toISOString() }; else delete c.marks[body.key]; c.updated = new Date().toISOString(); put('client:' + cfg.id, c); return json({ ok: true, marks: c.marks }); }
        if (mm[2] === '/meta' && m === 'POST') { c.meta = c.meta || {}; c.meta[body.key] = Object.assign({}, c.meta[body.key], body.patch); put('client:' + cfg.id, c); return json({ ok: true }); }
        if (mm[2] === '/notes' && m === 'PUT') { c.notes = String(body.notes || ''); put('client:' + cfg.id, c); return json({ ok: true }); }
      }
      return json({ error: 'Not found' }, 404);
    };
    location.hash = '#/c/' + cfg.id;
    document.documentElement.classList.add('embed');
  };
  SR.SeoWorkspace = function (p) {
    var c = p.client, B = SR.SEO_BUNDLE;
    var dark = document.documentElement.style.getPropertyValue('color-scheme') === 'dark';
    var id = (c.seoId || c.id || 'client').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40);
    var doc = React.useMemo(function () {
      var dom = ((SR.acct && SR.acct[c.id] && SR.acct[c.id].domain) || c.domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      var cfg = { id: id, name: c.name, domain: dom, city: c.region || '', service: 'Local SEO', start: c.start, dark: dark };
      var safe = function (o) { return JSON.stringify(o).replace(/<\//g, '<\\/'); };
      return '<!doctype html><html lang="en"' + (dark ? ' data-theme="dark"' : '') + '><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>' + B.css + SEO_CSS + '</style></head><body><div id="app"></div><div id="toast" role="status" aria-live="polite"></div>' +
        '<script>(' + seoShim.toString() + ')(' + safe(cfg) + ',' + safe({ work: B.work, baseline: B.baseline }) + ');<\/script>' +
        '<script>' + B.tabs.replace(/<\/script/g, '<\\/script') + '<\/script><script>' + B.app.replace(/route\(\);\s*\}\)\(\);\s*$/, function () { return B.embed + SEO_JS + '\nroute();\n})();'; }).replace(/<\/script/g, '<\\/script') + '<\/script></body></html>';
    }, [id, dark, c.name, c.domain, SR.acct && SR.acct[c.id] && SR.acct[c.id].domain]);
    var fr = React.useRef(null), hs = React.useState(900), ht = hs[0], setHt = hs[1];
    React.useEffect(function () {
      var f = fr.current;
      var sendV = function () { if (!f || !f.contentWindow) return; var r = f.getBoundingClientRect(); f.contentWindow.postMessage({ sr: 'v', t: Math.max(0, -r.top), h: window.innerHeight - Math.max(0, r.top) }, '*'); };
      var onMsg = function (e) { if (!f || e.source !== f.contentWindow || !e.data) return; if (e.data.sr === 'h') setHt(Math.max(420, e.data.h)); if (e.data.sr === 'h' || e.data.sr === 'ready') sendV(); };
      window.addEventListener('message', onMsg); window.addEventListener('scroll', sendV, true); window.addEventListener('resize', sendV);
      var iv = setInterval(sendV, 600);
      return function () { window.removeEventListener('message', onMsg); window.removeEventListener('scroll', sendV, true); window.removeEventListener('resize', sendV); clearInterval(iv); };
    }, [doc]);
    return html`<section style="display:flex;flex-direction:column;gap:8px">
      <iframe ref=${fr} key=${id + dark} title="SEO / AEO workspace" scrolling="no" srcDoc=${doc} style=${'width:100%;height:' + ht + 'px;border:0;background:transparent;display:block'}></iframe>
      <div style="font-size:12px;color:var(--muted)">Local SEO data is saved in this browser for now. A shared database comes later.</div>
    </section>`;
  };

  /* ---------- Account (everything editable) ---------- */
  SR.acct = SR.acct || {};
  var addM = function (ds, n) { var d = new Date(ds + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
  var dayDiff = function (a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000); };
  var fmtLong = function (d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
  var UPSELL = {
    gads: [['aeo', 'Add SEO / AEO', 'Get them mentioned in ChatGPT and Google AI answers, not only the ads.'], ['cro', 'Landing page conversion sprint', 'Test the page that every click lands on. A better rate cuts cost per lead.'], ['meta', 'Meta retargeting', 'Show ads to people who visited but did not enquire.'], ['seo', 'Local SEO', 'Own the map pack so the same keywords bring free leads.']],
    meta: [['gads', 'Add Google Ads', 'Capture people already searching for the service.'], ['creative', 'Monthly creative refresh', 'New video or image every month to fight ad fatigue.'], ['aeo', 'Add SEO / AEO', 'Visibility in AI answers.']],
    aeo: [['gads', 'Add Google Ads', 'Fast leads while organic builds up.'], ['content', 'More articles a week', 'Raise the content volume for faster visibility.'], ['reviews', 'Review system', 'More reviews help both AI answers and Google.']],
    seo: [['gads', 'Add Google Ads', 'Fast leads while rankings climb.'], ['reviews', 'Review system', 'Automate 5-star review requests.'], ['links', 'Link building', 'Local links and partnerships to lift authority.']]
  };
  SR.AccountTab = function (p) {
    var c = p.client, tasks = p.tasks;
    var fs = useState(0), setN = fs[1], force = function () { setN(function (x) { return x + 1; }); };
    var A = SR.acct[c.id];
    if (!A) {
      A = { contact: c.contact || '', email: c.email || '', phone: c.phone || '', region: c.region || '', updates: c.updates || 'Weekly', owner: c.owner || SR.TEAM[0] || '', retainer: c.retainer || 0, setup: c.setup || 0, term: c.term || '3 months', start: c.start || SR.TODAY, renewal: '', notice: '', billing: '', signed: '', remindOn: true, remindDays: 30, upsell: {}, payments: [] };
      var tm = parseInt(A.term) || 3;
      for (var i = 0; i < tm; i++) { var dd = addM(A.start, i); A.payments.push({ id: i + 1, date: dd, amount: (+A.retainer) + (i === 0 ? (+A.setup) : 0), note: i === 0 ? 'Set-up + month 1' : 'Month ' + (i + 1), paid: dd <= SR.TODAY }); }
      SR.acct[c.id] = A;
    }
    var projs = c.projects || [c.type];
    A.pf = A.pf || {};
    projs.forEach(function (t, i) { if (!A.pf[t]) A.pf[t] = i === 0 ? { fee: +A.retainer || 0, setup: +A.setup || 0, mode: 'Main service' } : { fee: 0, setup: 0, mode: 'Upsell add-on' }; });
    A.retainer = projs.reduce(function (t, k) { return t + (+A.pf[k].fee || 0); }, 0);
    A.setup = projs.reduce(function (t, k) { return t + (+A.pf[k].setup || 0); }, 0);
    var setPf = function (t, k) { return function (v) { A.pf[t][k] = v; if (k !== 'mode') { var tot = projs.reduce(function (a, q) { return a + (+A.pf[q].fee || 0); }, 0); A.payments.forEach(function (q) { if (!q.paid && /^Month \d+/.test(q.note)) q.amount = tot; }); } force(); }; };
    var set = function (k) { return function (v) { A[k] = v; force(); }; };
    var money = function (v) { return SR.money(+v || 0); };
    var termM = parseInt(A.term) || 3;
    var end = A.renewal || addM(A.start, termM);
    var daysLeft = dayDiff(SR.TODAY, end);
    var pays = A.payments.slice().sort(function (x, y) { return x.date.localeCompare(y.date); });
    var eff = function (q) { return q.paid ? 'paid' : (q.date < SR.TODAY ? 'overdue' : 'scheduled'); };
    var ltv = pays.filter(function (q) { return q.paid; }).reduce(function (t, q) { return t + (+q.amount || 0); }, 0);
    var contractVal = (+A.setup) + (+A.retainer) * termM;
    var next = pays.filter(function (q) { return !q.paid; })[0];
    var lastPaid = pays.filter(function (q) { return q.paid; }).slice(-1)[0];
    var remDate = SR.addDays(end, -(+A.remindDays || 30)), toRem = dayDiff(SR.TODAY, remDate);
    var months = pays.filter(function (q) { return q.paid; }).length;
    var stat = function (icon, color, label, valueEl, sub, i) { return html`<div class="stat" style=${'--sc:' + color + ';animation-delay:' + (i * 70) + 'ms'}><span class="ic">${SR.Icon(icon, 20)}</span><div class="k">${label}</div><div class="v">${valueEl}</div><div class="s">${sub}</div></div>`; };
    var row = function (icon, label, content) { return html`<div class="arow"><span class="ai">${SR.Icon(icon, 16)}</span><span style="flex:1"><span class="lk">${label}</span>${content}</span></div>`; };
    var ed = function (k, o) { return html`<${SR.Editable} value=${A[k]} onSave=${set(k)} type=${o && o.type} options=${o && o.options} prefix=${o && o.prefix} />`; };
    var accessTasks = tasks.filter(function (t) { return t.step === 'access'; });
    var chipClr = { paid: 'var(--green)', overdue: 'var(--red)', scheduled: 'var(--muted)' };
    var pf = useState({ date: SR.TODAY, amount: A.retainer, note: '', paid: true }), form = pf[0], setForm = pf[1];
    var up = UPSELL[c.type] || UPSELL.gads;
    var UPS = ['idea', 'pitched', 'won', 'no'], UL = { idea: 'Idea', pitched: 'Pitched', won: 'Won', no: 'Not now' };
    return html`<div style="display:flex;flex-direction:column;gap:18px;max-width:1000px">
      <div class="acc-grid">
        ${stat('coin', '#C9A84C', 'Pays us / month', html`<${SR.CountUp} value=${+A.retainer} fmt=${money} />`, (projs.length > 1 ? projs.length + ' projects · ' : '') + 'Set-up ' + money(A.setup), 0)}
        ${stat('trend', '#4CC38A', 'Lifetime value so far', html`<${SR.CountUp} value=${ltv} fmt=${money} />`, months + ' payment' + (months === 1 ? '' : 's') + ' received', 1)}
        ${stat('doc', '#3B6FD4', 'Contract value', html`<${SR.CountUp} value=${contractVal} fmt=${money} />`, termM + ' month minimum', 2)}
        ${stat('calendar', '#BE185D', 'Contract ends', fmtLong(end).replace(/ \d{4}$/, ''), daysLeft > 0 ? daysLeft + ' days left' : 'Past the minimum term', 3)}
      </div>
      <section class="acard"><h3>${SR.Icon('wallet', 18)} Projects and fees</h3>
        <div class="pfrow pfhead"><span>Project</span><span>How we charge</span><span>Monthly fee</span><span>Set-up fee</span></div>
        ${projs.map(function (t) { var T = SR.TEMPLATES[t], f = A.pf[t]; return html`<div class="pfrow" key=${t}>
          <span class="pfn"><i style=${'background:' + (T.color || '#C9A84C')}></i>${T.label}</span>
          <${SR.Editable} value=${f.mode} type="select" options=${['Main service', 'Upsell add-on', 'Charged separately', 'Included free']} onSave=${setPf(t, 'mode')} />
          <${SR.Editable} value=${f.fee} type="number" prefix="$" onSave=${setPf(t, 'fee')} />
          <${SR.Editable} value=${f.setup} type="number" prefix="$" onSave=${setPf(t, 'setup')} /></div>`; })}
        <div class="pfrow pftot"><span>Total</span><span></span><span>${money(A.retainer)} / month</span><span>${money(A.setup)}</span></div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px">Set a project to $0 when it is an add-on we give free. Changing a fee also updates the unpaid "Month" payments below.</div>
      </section>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:18px">
        <section class="acard"><h3>${SR.Icon('coin', 18)} Invoice status</h3>
          ${next ? html`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div><div class="lk" style="font-size:12px;color:var(--muted)">Next invoice</div><div style="font-size:26px;font-weight:700">${fmtLong(next.date)}</div><div style="font-size:14px;color:var(--muted)">${money(next.amount)} · ${next.note}</div></div>
            <div style="text-align:right"><span style=${'display:inline-block;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;border:1px solid ' + chipClr[eff(next)] + ';color:' + chipClr[eff(next)]}>${eff(next) === 'overdue' ? 'Overdue ' + Math.abs(dayDiff(SR.TODAY, next.date)) + ' days' : 'Due in ' + dayDiff(SR.TODAY, next.date) + ' days'}</span>
              <div style="margin-top:10px"><button type="button" class="sr-open" onClick=${function () { next.paid = true; force(); }}>Mark paid</button></div></div></div>` : html`<div style="font-size:15px;color:var(--green);font-weight:600">All invoices paid.</div>`}
          <div style="font-size:12px;color:var(--muted);margin-top:12px">${lastPaid ? 'Last payment ' + money(lastPaid.amount) + ' on ' + fmtLong(lastPaid.date) + '.' : 'No payment received yet.'}</div>
        </section>
        <section class="acard"><h3>${SR.Icon('clock', 18)} Renewal reminder</h3>
          <div style="font-size:26px;font-weight:700">${fmtLong(end)}</div>
          <div style=${'margin-top:8px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600;border:1px solid ' + (A.remindOn && toRem <= 0 ? 'var(--gold)' : 'var(--line)') + ';background:' + (A.remindOn && toRem <= 0 ? 'var(--goldBg)' : 'var(--card2)') + ';color:' + (A.remindOn && toRem <= 0 ? 'var(--gold)' : 'var(--muted)')}>${!A.remindOn ? 'Reminder is off.' : toRem <= 0 ? 'Time to start the renewal talk. Send a results recap and the renewal offer.' : 'Reminder on ' + fmtLong(remDate) + ' (in ' + toRem + ' days).'}</div>
          <div style="display:flex;gap:12px;align-items:center;margin-top:12px;flex-wrap:wrap;font-size:13px;color:var(--muted)">
            <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" checked=${A.remindOn} onChange=${function (e) { A.remindOn = e.target.checked; force(); }} /> Remind me</label>
            <label style="display:flex;gap:6px;align-items:center">Before the end<select class="sr-datein" style="min-height:30px" value=${A.remindDays} onChange=${function (e) { A.remindDays = +e.target.value; force(); }}>${[30, 45, 60, 90].map(function (x) { return html`<option key=${x} value=${x}>${x} days</option>`; })}</select></label></div>
        </section>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:18px">
        <section class="acard"><h3>${SR.Icon('shield', 18)} Agreement and terms</h3>
          ${row('doc', 'Retainer / month (all projects)', html`<span class="nat-ro">${money(A.retainer)}</span>`)}
          ${row('wallet', 'Set-up fees (all projects)', html`<span class="nat-ro">${money(A.setup)}</span>`)}
          ${row('repeat', 'Minimum term', ed('term', { type: 'select', options: ['1 month', '3 months', '6 months', '12 months', 'Rolling monthly'] }))}
          ${row('calendar', 'Start date', ed('start', { type: 'date' }))}
          ${row('calendar', 'Renews / ends (blank = start + term)', html`<${SR.Editable} value=${A.renewal} type="date" onSave=${set('renewal')} />`)}
          ${row('clock', 'Notice period', ed('notice'))}
          ${row('wallet', 'Billing', ed('billing'))}
          ${row('check', 'Contract signed', ed('signed'))}
        </section>
        <section class="acard"><h3>${SR.Icon('users', 18)} Contact</h3>
          ${row('users', 'Main contact', ed('contact'))}
          ${row('pin', 'Website', ed('domain'))}
          ${row('mail', 'Email', ed('email'))}
          ${row('phone', 'Phone', ed('phone'))}
          ${row('pin', 'Market', ed('region'))}
          ${row('repeat', 'Client updates', ed('updates', { type: 'select', options: ['Weekly', 'Fortnightly', 'Monthly'] }))}
          ${row('users', 'Account owner', ed('owner', { type: 'select', options: SR.TEAM.slice() }))}
        </section>
      </div>
      <section class="acard"><h3>${SR.Icon('coin', 18)} Payments</h3>
        ${pays.map(function (q) {
          return html`<div class="prow" key=${q.id}>
            <${SR.Editable} value=${q.date} type="date" onSave=${function (v) { q.date = v || q.date; force(); }} />
            <${SR.Editable} value=${q.note} onSave=${function (v) { q.note = v; force(); }} />
            <${SR.Editable} value=${q.amount} type="number" prefix="$" onSave=${function (v) { q.amount = v; force(); }} />
            <select class="sr-datein" style=${'min-height:32px;font-size:13px;color:' + chipClr[eff(q)]} value=${q.paid ? 'paid' : 'unpaid'} onChange=${function (e) { q.paid = e.target.value === 'paid'; force(); }}><option value="paid">Paid</option><option value="unpaid">${eff(q) === 'overdue' ? 'Overdue' : 'Scheduled'}</option></select>
            <button type="button" class="sr-x" aria-label="Delete payment" onClick=${function () { A.payments = A.payments.filter(function (z) { return z.id !== q.id; }); force(); }}>${SR.Icon('close', 14)}</button></div>`;
        })}
        <div class="rform" style="margin-top:14px;align-items:end">
          <label>Date<input type="date" value=${form.date} onChange=${function (e) { setForm(Object.assign({}, form, { date: e.target.value })); }} /></label>
          <label>Amount ($)<input type="number" value=${form.amount} onChange=${function (e) { setForm(Object.assign({}, form, { amount: e.target.value })); }} /></label>
          <label>Note<input type="text" value=${form.note} placeholder="e.g. Month 4" onChange=${function (e) { setForm(Object.assign({}, form, { note: e.target.value })); }} /></label>
          <label>Status<select value=${form.paid ? 'paid' : 'unpaid'} onChange=${function (e) { setForm(Object.assign({}, form, { paid: e.target.value === 'paid' })); }}><option value="paid">Paid</option><option value="unpaid">Not paid yet</option></select></label>
          <button type="button" class="logbtn" style="min-height:38px;font-size:14px" onClick=${function () { A.payments.push({ id: Date.now(), date: form.date, amount: +form.amount || 0, note: form.note || 'Payment', paid: form.paid }); setForm(Object.assign({}, form, { note: '' })); force(); }}>${SR.Icon('plus', 16)} Log payment</button>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:10px">Edit any date, note or amount right in the row. Edits stay until you refresh the page; they are not saved anywhere yet.</div>
      </section>
      <section class="acard"><h3>${SR.Icon('spark', 18)} Upsell ideas</h3>
        ${up.map(function (x) {
          var cur = A.upsell[x[0]] || 'idea';
          return html`<div class="arow" key=${x[0]}><span class="ai">${SR.Icon(cur === 'won' ? 'check' : 'spark', 16)}</span><span style="flex:1"><b style="font-size:14px">${x[1]}</b><span class="lk" style="margin-top:2px">${x[2]}</span></span>
            <button type="button" class=${'badge' + (cur === 'won' ? ' on' : '')} style="cursor:pointer;background:none;font-family:inherit" onClick=${function () { A.upsell[x[0]] = UPS[(UPS.indexOf(cur) + 1) % UPS.length]; force(); }}>${UL[cur]}</button></div>`;
        })}
        <div style="font-size:12px;color:var(--muted);margin-top:10px">Click the tag to move an idea along: Idea, Pitched, Won, Not now.</div>
      </section>
      <section class="acard"><h3>${SR.Icon('key', 18)} Access we have</h3>
        ${accessTasks.length ? html`<div class="mchips">${accessTasks.map(function (t) { return html`<div key=${t.id} class=${'mchip' + (t.done ? ' paid' : '')} style="flex-direction:row;padding:8px 12px">${SR.Icon(t.done ? 'check' : 'lock', 15)}<span>${t.name.replace(/^(Make sure( we have)?|Get) /, '')}</span></div>`; })}</div>` : html`<div style="font-size:14px;color:var(--muted)">Access tasks appear here for projects that have them.</div>`}
      </section>
    </div>`;
  };

  /* ---------- objective card (static: what we promised; results come from the Results page) ---------- */
  SR.GoalCard = function (p) {
    var c = p.client, G = p.goal || {}, L = p.latest, goal = +G.target || 0, unit = G.unit || 'leads';
    var ed = useState(false), editing = ed[0], setEditing = ed[1];
    var dr = useState({}), draft = dr[0], setDraft = dr[1];
    var cur = Object.assign({ text: G.text || '', target: goal, unit: unit }, draft);
    var upd = function (k, conv) { return function (e) { var d = Object.assign({}, draft); d[k] = conv ? (parseFloat(e.target.value) || 0) : e.target.value; setDraft(d); }; };
    var save = function () { p.onGoal(Object.assign({}, G, cur)); setEditing(false); setDraft({}); };
    var cancel = function () { setEditing(false); setDraft({}); };
    var K = null; Object.keys(KINDS).forEach(function (k) { if (KINDS[k].name === p.label) K = KINDS[k]; }); K = K || KINDS.gads;
    return html`<section class="wgrid gcard" style=${'--k:' + (p.color || K.color)}>
      <div class="wg-top"><span class="wg-chip"><span class="wg-ic">${SR.Icon(K.icon, 16)}</span>${K.name}</span><span class="wg-sub">The promise</span>
        <span style="margin-left:auto">${editing ? html`<span class="o-btns"><button type="button" class="o-save" onClick=${save}>Save</button><button type="button" class="o-cancel" onClick=${cancel}>Cancel</button></span>`
          : html`<button type="button" class="m-edit-btn" onClick=${function () { setEditing(true); }}>${SR.Icon('pencil', 12)} Edit</button>`}</span></div>
      <div class="gc-body">
        <div class="gc-big">
          ${editing ? html`<span class="o-edit"><input class="o-numin" type="number" aria-label="Target" defaultValue=${cur.target || ''} onInput=${upd('target', true)} /><select class="o-selin" aria-label="Counted in" defaultValue=${cur.unit} onChange=${upd('unit')}>${['leads', 'calls', 'sales', 'bookings', '%'].map(function (u) { return html`<option key=${u} value=${u}>${u}</option>`; })}</select></span>`
            : html`<b>${goal || '—'}</b><span class="u">${unit === '%' ? '%' : unit + ' a month'}</span>`}
        </div>
        <div class="gc-txt">
          ${editing ? html`<input class="o-titlein" type="text" aria-label="What we promised" defaultValue=${cur.text} onInput=${upd('text')} placeholder="What we promised, e.g. 30 leads a month" />`
            : html`<h2 class="gc-title">${G.text || '+ Add what we promised'}</h2>`}
          <div class="gc-now">${L ? html`<span>Latest: <b>${L.value}</b> of ${L.target} ${unit} · ${L.label}</span> <span class=${'hchip ' + (L.ok ? 'ok' : 'bad')}>${L.ok ? 'On track' : 'Behind'}</span>` : html`<span class="u">Nothing logged yet</span>`}
            <button type="button" class="m-link" style="margin:0" onClick=${function () { p.goResults(p.gkey); }}>${L ? 'Open the results' : 'Log the first period'} ›</button></div>
        </div>
      </div>
      ${p.supports && p.supports.length ? html`<div class="o-sup gc-sup">${p.supports.map(function (x) { return html`<span key=${x[0]} class="o-chip"><span>${x[0]}</span><b>${x[1]}</b></span>`; })}</div>` : null}
    </section>`;
  };

  /* ---------- Add your own tasks: one at a time or a pasted list, in any stage and in Ongoing ---------- */
  SR.AddCustom = function (p) {
    var o = useState(false), open = o[0], setOpen = o[1];
    var m = useState('one'), mode = m[0], setMode = m[1];
    var n = useState(''), name = n[0], setName = n[1];
    var b = useState(''), bulk = b[0], setBulk = b[1];
    var w = useState((p.first ? p.opts[0] : p.opts[p.opts.length - 1])[0]), where = w[0], setWhere = w[1];
    var key = p.opts.map(function (x) { return x[0]; }).join('|');
    if (p.opts.every(function (x) { return x[0] !== where; })) { where = p.opts[p.opts.length - 1][0]; }
    var names = mode === 'one' ? (name.trim() ? [name.trim()] : []) : bulk.split(/\r?\n/).map(function (l) { return l.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/, '').trim(); }).filter(Boolean);
    var go = function () {
      if (!names.length) return;
      p.onAdd(names.map(function (nm) { return p.make(nm, where); }));
      setName(''); setBulk(''); if (mode === 'one') { var el = document.getElementById('ac-name'); if (el) el.focus(); } else setOpen(false);
    };
    if (!open) return html`<button type="button" class="ac-open" onClick=${function () { setOpen(true); }}>+ Add your own task</button>`;
    return html`<div class="ac-box">
      <div class="ac-top"><div class="sr-seg-row" role="group" aria-label="How to add">
        <button type="button" class=${'ac-m' + (mode === 'one' ? ' on' : '')} onClick=${function () { setMode('one'); }}>One task</button>
        <button type="button" class=${'ac-m' + (mode === 'bulk' ? ' on' : '')} onClick=${function () { setMode('bulk'); }}>Paste a list</button></div>
        <button type="button" class="ac-x" aria-label="Close" onClick=${function () { setOpen(false); }}>×</button></div>
      <div class="ac-row">
        ${mode === 'one'
          ? html`<input id="ac-name" class="ac-in" type="text" placeholder="Write the task and press Enter" value=${name} onInput=${function (e) { setName(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') go(); }} />`
          : html`<textarea id="ac-bulk" class="ac-in" rows="6" placeholder="One task per line. Numbers and dashes at the start are ignored." value=${bulk} onInput=${function (e) { setBulk(e.target.value); }}></textarea>`}
        ${p.opts.length > 1 ? html`<label class="ac-sel"><span>${p.label}</span><select value=${where} onChange=${function (e) { setWhere(e.target.value); }}>${p.opts.map(function (x) { return html`<option key=${x[0]} value=${x[0]}>${x[1]}</option>`; })}</select></label>` : null}
      </div>
      <div class="ac-foot"><span>${names.length ? names.length + ' task' + (names.length > 1 ? 's' : '') + ' ready' : ''}</span>
        <button type="button" class="ac-go" disabled=${!names.length} onClick=${go}>Add ${names.length > 1 ? names.length + ' tasks' : 'task'}</button></div>
    </div>`;
  };

  /* ---------- CLIENT PAGE ---------- */
  SR.ClientPage = function (p) {
    var c = p.client;
    var projs = c.projects || [c.type];
    var pt = p.proj && projs.indexOf(p.proj) > -1 ? p.proj : c.type, tp = SR.TEMPLATES[pt];
    var pk = pt === c.type ? c.id : c.id + ':' + pt;
    var addOpen = useState(false), menu = addOpen[0], setMenu = addOpen[1];
    var tab = p.tab, setTab = function (t) { p.setTab(t); };
    var rm = p.rm, ac = p.ac;
    var tasks = p.tasks.filter(function (t) { return t.clientId === c.id && (t.proj || c.type) === pt; });

    /* setup progress */
    var byStep = function (sid) { return tasks.filter(function (t) { return t.step === sid; }); };
    var stepDone = function (sid) { var ts = byStep(sid); return ts.length ? ts.every(function (t) { return t.done; }) : true; };
    var allSteps = 0, doneSteps = 0;
    tp.phases.forEach(function (ph) { ph.steps.forEach(function (s) { allSteps++; if (stepDone(s[0])) doneSteps++; }); });
    var setupComplete = doneSteps === allSteps;
    var live = SR.isLive(c, pt);
    var latestOf = function () {
      var pid = pk, goalU = (((c.pg || {})[pt]) || {}).unit;
      var r1 = function (x) { return Math.round(x * 10) / 10; };
      if (pt === 'gads') { var P = SR.periods && SR.periods[c.id]; if (P && P.length) { var l = SR.adsCalc(P[P.length - 1]), tg = SR.adsTarget(pt === c.type ? (c.math || {}) : {}), tc = tg.conv * l.days / 30; if (tc) return { value: r1(l.conv), target: r1(tc), label: P[P.length - 1].label, ok: l.conv >= tc * 0.97 }; } }
      if (pt === 'seo' || pt === 'aeo') { var O = SR.orgP && SR.orgP[pid], T = SR.orgT && SR.orgT[pid], k = goalU === '%' ? 'ai' : 'leads'; if (O && O.length && T && T[k]) { var lo = O[O.length - 1]; if (lo[k] != null) return { value: r1(lo[k]), target: r1(T[k]), label: lo.label, ok: lo[k] >= T[k] * 0.97 }; } }
      return null;
    };
    var supportsOf = function () { if (tp.kind !== 'ads' || pt !== c.type) return null; var M = c.math || {}; if (!M.cvr) return null; var m = SR.projectMath(pt, M); return [['Clicks a day', SR.n0(m.clicksDay)], ['Cost per lead', SR.money(m.cpl)], ['Monthly budget', SR.money(m.monthly)]]; };
    var goalOf = (c.pg || {})[pt] || (pt === c.type ? (tp.kind === 'ads' ? { text: c.promise, target: (c.math || {}).leads || 0, unit: 'leads' } : tp.kind === 'seo' ? { text: c.promise, target: 0, unit: 'leads' } : { text: c.promise, target: (c.math || {}).vis || 0, unit: '%' }) : { text: '', target: 0, unit: 'leads' });

    /* accordion groups */
    var groups = tp.phases.map(function (ph, gi) {
      var tot = 0, dn = 0;
      var steps = ph.steps.map(function (s) {
        var stl = p.settling || {}; var fin = function (t) { return t.done && !stl[t.id]; };
        var ts = byStep(s[0]).slice().sort(function (a, b) { return (fin(a) ? 1 : 0) - (fin(b) ? 1 : 0); });
        var sd = ts.length ? ts.every(function (t) { return t.done; }) : true;
        ts.forEach(function (t) { tot++; if (t.done) dn++; });
        var sc = secOf(s[0], s[3], ph.color); return { id: s[0], name: s[1], done: sd, tasks: ts, icon: sc[1], color: sc[0] };
      });
      return { ph: Object.assign({}, ph, { color: PC[gi % PC.length] }), steps: steps, tot: tot, dn: dn, complete: dn === tot && tot > 0 };
    });
    var ongoing = tasks.filter(function (t) { return t.repeat || t.maint; });

    var seg = function (on) { return 'min-height:36px;padding:0 18px;border:0;border-radius:7px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;' + (on ? 'background:var(--accentBg);color:var(--accent)' : 'background:transparent;color:var(--muted)'); };
    var tabBtn = function (key, lbl) { return html`<button key=${key} type="button" onClick=${function () { setTab(key); }} aria-pressed=${tab === key ? 'true' : 'false'} style=${seg(tab === key)}>${lbl}</button>`; };

    /* ---- Overview: promise + progress + accordion tasks ---- */
    var overview = function () {
      if (pt === 'seo') return html`<div style="display:flex;flex-direction:column;gap:18px"><${SR.GoalCard} key=${pk} client=${c} goal=${goalOf} gkey=${pk} label=${tp.label} color=${tp.color} latest=${latestOf()} supports=${supportsOf()} onGoal=${function (g) { p.setGoal(c.id, pt, g); }} goResults=${p.goResults} /><${SR.SeoWorkspace} client=${c} /></div>`;
            var promiseBlock = html`<${SR.GoalCard} key=${pk} client=${c} goal=${goalOf} gkey=${pk} label=${tp.label} color=${tp.color} latest=${latestOf()} supports=${supportsOf()} onGoal=${function (g) { p.setGoal(c.id, pt, g); }} goResults=${p.goResults} />`;

      var ask = null;
      var setupTasks = tasks.filter(function (t) { return t.step && !t.maint; });
      var setupDone = setupTasks.filter(function (t) { return t.done; }).length;
      var planned = (function () { var d = new Date((c.start || SR.TODAY) + 'T00:00:00'); return new Date(d.getTime() + tp.days * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); })();
      var progress = null;

      /* phases list + sections (same layout as the Local SEO platform) */
      var ongoingTasks = tasks.filter(function (t) { return t.repeat || t.maint; });
      var ONG = { id: 'ongoing', name: 'Ongoing', color: PC[Math.min(groups.length, 9)], scope: 'Recurring checks and milestones' };
      var dueNow = ongoingTasks.filter(function (t) { return !t.done && !t.milestone && t.date && t.date <= SR.TODAY; }).length;
      var firstOpen = groups.filter(function (g) { return !g.complete; })[0];
      var cur = (p.phaseSel && p.phaseSel[pk]) || (live ? 'ongoing' : (firstOpen ? firstOpen.ph.id : groups[groups.length - 1].ph.id));
      var just = p.just || {};
      var rowFor = function (t, clr, num) {
        return html`<${SR.TaskRow} key=${t.id} task=${t} num=${num} selected=${!!(p.sel && p.sel[t.id])} active=${p.openId === t.id} just=${!!just[t.id]}
          onToggle=${p.onToggle} onOpen=${p.onOpen} onSelect=${p.onSelect} />`;
      };
      var phaseBtn = function (id, n, name, color, label, pct, extra) {
        return html`<button key=${id} type="button" class=${'phase' + (cur === id ? ' on' : '') + (extra && extra.lock ? ' lock' : '') + (extra && extra.newly ? ' newly' : '')} style=${'--pc:' + color} onClick=${function () { p.setPhase(pk, id); }} aria-pressed=${cur === id ? 'true' : 'false'}>
          <span class="l"><span class="pi">${SR.Icon(PIC[id] || 'list', 16)}</span><span class="nm">${n}. ${name}</span>${extra && extra.lock ? SR.Icon('lock', 14) : null}<span class="ct" style=${extra && extra.done ? 'color:var(--green)' : ''}>${label}</span></span>
          ${pct != null ? html`<span class="pbar"><i style=${'width:' + pct + '%'}></i></span>` : null}
        </button>`;
      };
      var phaseList = html`<div class="phases" role="group" aria-label="Phases">
        ${groups.map(function (g, gi) {
          var pct = g.tot ? Math.round(g.dn / g.tot * 100) : 0;
          return phaseBtn(g.ph.id, gi + 1, g.ph.name, g.ph.color, g.dn + '/' + g.tot, pct, { done: g.complete });
        })}
        ${live ? phaseBtn('ongoing', groups.length + 1, 'Ongoing', ONG.color, dueNow ? dueNow + ' due' : ongoingTasks.length + ' tasks', null, { newly: p.justLive === pk }) : phaseBtn('ongoing', groups.length + 1, 'Ongoing', ONG.color, 'Locked', null, { lock: true })}
      </div>`;

      var secHead = function (icon, name, color, d, t) {
        return html`<div class="sub" style=${'--sc:' + color}>${SR.Icon(icon, 18)}<span>${name}</span><span class="n">${d}/${t}</span></div>`;
      };
      var panel;
      if (cur === 'ongoing') {
        var order = SR.CADENCES.concat(['Milestones']);
        var og = order.map(function (label) {
          var ts = ongoingTasks.filter(function (t) { return label === 'Milestones' ? t.milestone : (!t.milestone && t.repeat === label); }).sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
          return { label: label, tasks: ts };
        }).filter(function (x) { return x.tasks.length; });
        var on = groups.length + 1, k = 0;
        panel = html`<div class="list swap" key="ongoing">
          <div class="listhead"><h3>${on}. Ongoing</h3><span>${live ? 'Each task comes back on its own schedule' : 'Starts when every setup task is done'}</span></div>
          <div class="listcard">
          ${live ? null : html`<div class="lockbox">${SR.Icon('lock', 20)}<div>The every 3 days, weekly, monthly and every 90 days checklists are added automatically after Go live is ticked.</div></div>`}
          ${og.map(function (x) {
            var isM = x.label === 'Milestones', dn = x.tasks.filter(function (t) { return t.done; }).length;
            return html`<div key=${x.label}>
              ${secHead(isM ? 'flag' : 'repeat', isM ? 'Milestones' : x.label, isM ? '#8A6D1F' : ['#0E7490', '#3B6FD4', '#7C3AED', '#C77700', '#BE185D'][SR.CADENCES.indexOf(x.label) % 5], dn, x.tasks.length)}
              ${x.tasks.map(function (t) { k++; return rowFor(t, ONG.color, on + '.' + k); })}</div>`;
          })}
          <${SR.AddCustom} first=${true} label="Repeats" opts=${['Weekly', 'Daily', 'Every 3 days', 'Fortnightly', 'Monthly', 'Every 90 days'].map(function (cd) { return [cd, cd]; }).concat([['Milestone', 'One-off milestone']])} onAdd=${p.addCustom}
            make=${function (nm, rep) { return rep === 'Milestone' ? { clientId: c.id, proj: pt, name: nm, milestone: true, maint: true, date: '', custom: true, how: [] } : { clientId: c.id, proj: pt, name: nm, repeat: rep, maint: true, custom: true, how: [] }; }} />
          </div>
        </div>`;
      } else {
        var gi = Math.max(0, groups.findIndex(function (x) { return x.ph.id === cur; }));
        var g = groups[gi], k2 = 0, flat = g.ph.id === 'research';
        panel = html`<div class="list swap" key=${g.ph.id}>
          <div class="listhead"><h3>${gi + 1}. ${g.ph.name}</h3><span>${g.dn}/${g.tot} done</span></div>
          <div class="listcard">
          ${flat ? html`<div class="sgrp" style=${'--sc:' + g.ph.color}>${(function () { var stl = p.settling || {}, all = []; g.steps.forEach(function (st) { st.tasks.forEach(function (t) { all.push(t); }); }); var fin = function (t) { return t.done && !stl[t.id] ? 1 : 0; }; var idx = function (t) { return all.indexOf(t); }; return all.slice().sort(function (a, b) { return fin(a) - fin(b) || idx(a) - idx(b); }); })().map(function (t) { k2++; return rowFor(t, g.ph.color, (gi + 1) + '.' + k2); })}</div>`
            : g.steps.map(function (st, si) {
              var d = st.tasks.filter(function (t) { return t.done; }).length;
              return html`<div key=${si} class="sgrp" style=${'--sc:' + st.color}>${secHead(st.icon, st.name, st.color, d, st.tasks.length)}${st.tasks.map(function (t) { k2++; return rowFor(t, g.ph.color, (gi + 1) + '.' + k2); })}</div>`;
            })}
          <${SR.AddCustom} label="Section" opts=${(flat ? g.steps.slice(-1) : g.steps).map(function (st) { return [st.id, st.name]; })} onAdd=${p.addCustom}
            make=${function (nm, step) { return { clientId: c.id, proj: pt, name: nm, ph: g.ph.id, step: step, custom: true, deadline: '', how: [] }; }} />
          </div>
        </div>`;
      }

      return html`<div style="display:flex;flex-direction:column;gap:20px">
        ${promiseBlock}${ask}${progress}
        <section style="padding:6px 2px 0">
          <h2 style="margin:0;font-size:18px">Tasks</h2>
          <div class="work">${phaseList}${panel}</div>
        </section>
      </div>`;
    };

    var account = function () { return html`<${SR.AccountTab} client=${c} tasks=${tasks} />`; };

    var missing = SR.PROJ_TYPES.filter(function (t) { return projs.indexOf(t) < 0 && !(t === 'seo' && projs.indexOf('aeo') > -1); });
    var projItems = function (type) {
      return [
        { label: 'Open ' + SR.TEMPLATES[type].label, fn: function () { p.setProj(type); setTab('overview'); } },
        { label: 'Edit client details', fn: function () { SR.act.edit(c.id); } },
        { label: 'Reset tasks to the defaults', fn: function () { SR.act.resetProject(c.id, type); } },
        { sep: true },
        { label: 'Delete project', hint: projs.length < 2 ? 'needs 2+ projects' : '', danger: true, disabled: projs.length < 2, fn: function () { SR.act.delProject(c.id, type); } }
      ];
    };
    var ptab = function (type) {
      var T = SR.TEMPLATES[type], on = tab === 'overview' && pt === type;
      return html`<span class="ptw" key=${type}><button type="button" class=${'ptab' + (on ? ' on' : '')} style=${'--pc:' + (T.color || '#C9A84C')} onContextMenu=${function (e) { SR.openMenu(e, projItems(type)); }} onClick=${function () { p.setProj(type); setTab('overview'); setMenu(false); }}><i></i>${T.label}</button>${on ? html`<button type="button" class="ptm" aria-label=${'Options for the ' + T.label + ' project'} title="Project options" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); SR.openMenuAt(r.left, r.bottom + 4, projItems(type)); }}>⋯</button>` : null}</span>`;
    };
    var pill = pt === 'seo' ? null : html`<span style=${'font-size:12px;font-weight:700;padding:4px 10px;border-radius:12px;' + (live ? 'color:var(--green);background:var(--greenBg)' : 'color:var(--gold);background:var(--goldBg)')}>${live ? 'Maintenance' : (setupComplete ? 'Ready to go live' : 'Setup & launch · ' + doneSteps + ' of ' + allSteps)}</span>`;
    return html`<div style="display:flex;flex-direction:column;gap:18px">
      <div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style=${'width:12px;height:12px;border-radius:4px;background:' + c.color}></span><span style="font-size:13px;color:var(--muted)">${(c.contact || 'No contact') + ' · ' + c.region}</span>${tab === 'overview' ? pill : null}</div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:6px"><h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:34px" onContextMenu=${function (e) { SR.clientMenu(e, c); }}>${c.name}</h1><button type="button" class="edbtn" onClick=${function () { SR.act.edit(c.id); }}>${SR.Icon('pen', 14)} Edit client</button></div></div>
      <div class="ptabs" role="tablist">
        ${projs.map(ptab)}
        <span class="padd">
          <button type="button" class="ptab plus" aria-label="Add a project" aria-expanded=${menu ? 'true' : 'false'} onClick=${function () { setMenu(!menu); }}>${SR.Icon('plus', 16)}${missing.length ? '' : ''}</button>
          ${menu ? html`<div class="pmenu" role="menu">${missing.length ? html`<div class="pm0">Add a project</div>${missing.map(function (t) { var T = SR.TEMPLATES[t]; return html`<button key=${t} type="button" role="menuitem" style=${'--pc:' + (T.color || '#C9A84C')} onClick=${function () { setMenu(false); p.addProject(c.id, t); }}><i></i>${T.label}</button>`; })}` : html`<div class="pm0">All project types added</div>`}</div>` : null}
        </span>
        <span style="flex:1"></span>
        <button type="button" class=${'ptab acct' + (tab === 'account' ? ' on' : '')} style="--pc:var(--accent)" onClick=${function () { setTab('account'); setMenu(false); }}>${SR.Icon('shield', 15)} Account</button>
      </div>
      ${tab === 'account' ? account() : overview()}
    </div>`;
  };



  /* ---------- CSV import (Google Ads and Meta Ads exports) ---------- */
  SR.metaReal = SR.metaReal || {};
  SR.parseCSV = function (text) {
    text = String(text).replace(/^﻿/, '');
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); }).slice(0, 8), best = ',', bc = -1;
    [',', ';', '\t'].forEach(function (d) { var c = lines.reduce(function (a, l) { return a + l.split(d).length - 1; }, 0); if (c > bc) { bc = c; best = d; } });
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === best) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  };
  SR.csvPeriods = function (rows, kind) {
    var norm = function (x) { return String(x || '').toLowerCase().replace(/\s+/g, ' ').trim(); };
    var hi = -1, k;
    for (k = 0; k < Math.min(rows.length, 12); k++) { var n = rows[k].map(norm); if (n.length >= 3 && n.some(function (c) { return /^(clicks|link clicks|impr\.?|impressions)/.test(c); })) { hi = k; break; } }
    if (hi < 0) return { error: 'I could not find the header row. The file needs columns like Impressions, Clicks and Cost (or Amount spent).' };
    var H = rows[hi].map(norm);
    var find = function (tests) { for (var t = 0; t < tests.length; t++) { for (var j = 0; j < H.length; j++) if (tests[t](H[j])) return j; } return -1; };
    var col = {
      date: find([function (h) { return h === 'day' || h === 'date' || h === 'week' || h === 'reporting starts' || h === 'start date' || h === 'day start'; }]),
      imp: find([function (h) { return h === 'impr.' || h === 'impressions'; }]),
      clicks: find(kind === 'meta' ? [function (h) { return h === 'link clicks'; }, function (h) { return h === 'clicks' || h === 'clicks (all)'; }] : [function (h) { return h === 'clicks'; }]),
      spend: find([function (h) { return h === 'cost' || h === 'spend' || h === 'amount spent' || h.indexOf('amount spent') === 0 || h.indexOf('cost (') === 0; }]),
      conv: find(kind === 'meta' ? [function (h) { return h === 'leads' || h === 'results'; }, function (h) { return h.indexOf('leads') === 0 || h.indexOf('results') === 0; }] : [function (h) { return h === 'conversions' || h === 'conv.'; }, function (h) { return h.indexOf('conversions') === 0; }]),
      freq: find([function (h) { return h === 'frequency'; }])
    };
    if (col.clicks < 0 || col.spend < 0) return { error: 'The file needs at least a Clicks column and a Cost or Amount spent column.' };
    var num = function (v) { var x = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isNaN(x) ? 0 : x; };
    var iso = function (dt) { return dt.getUTCFullYear() + '-' + ('0' + (dt.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + dt.getUTCDate()).slice(-2); };
    var pd = function (str) {
      str = String(str || '').trim(); var m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      var d = new Date(str); if (isNaN(d.getTime())) return null; return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    };
    var wk = function (dt) { var dow = (dt.getUTCDay() + 6) % 7; return new Date(dt.getTime() - dow * 86400000); };
    var groups = {}, order = [], used = 0;
    rows.slice(hi + 1).forEach(function (r, ri) {
      var first = String(r[0] || '').trim();
      if (/^total|^grand total|^--/i.test(first) || r.length < 3) return;
      var dt = col.date >= 0 ? pd(r[col.date]) : null;
      var key, start;
      if (col.date >= 0 && dt) { start = wk(dt); key = iso(start); }
      else if (col.date < 0) { key = 'row' + ri; start = null; }
      else return;
      if (!groups[key]) { groups[key] = { key: key, start: start, label: start ? 'Week of ' + start.getUTCDate() + ' ' + start.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }) : (first || 'Period ' + (order.length + 1)), imp: 0, clicks: 0, spend: 0, conv: 0, fsum: 0, fn: 0, days: 7 }; order.push(key); }
      var g = groups[key]; g.imp += col.imp >= 0 ? num(r[col.imp]) : 0; g.clicks += num(r[col.clicks]); g.spend += num(r[col.spend]); g.conv += col.conv >= 0 ? num(r[col.conv]) : 0;
      if (col.freq >= 0) { g.fsum += num(r[col.freq]); g.fn++; }
      used++;
    });
    if (!used) return { error: 'No data rows found under the header.' };
    var out = order.map(function (k) { var g = groups[k]; g.freq = g.fn ? Math.round(g.fsum / g.fn * 100) / 100 : null; return g; });
    out.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });
    return { periods: out, cols: col };
  };
  SR.CsvButton = function (p) {
    var er = useState(''), err = er[0], setErr = er[1];
    var onFile = function (e) {
      var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { var out = SR.csvPeriods(SR.parseCSV(rd.result), p.kind); if (out.error) { setErr(out.error); return; } setErr(''); p.onData(out.periods, f.name); };
      rd.onerror = function () { setErr('I could not read that file.'); };
      rd.readAsText(f);
    };
    return html`<span style="display:inline-flex;flex-direction:column;align-items:flex-start"><label class="edbtn" style="min-height:38px">${SR.Icon('plus', 14)} Import CSV<input type="file" accept=".csv,text/csv,.tsv,text/plain" onChange=${onFile} style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none" aria-label=${'Import a ' + (p.kind === 'meta' ? 'Meta Ads' : 'Google Ads') + ' CSV export'} /></label>${err ? html`<span class="csvnote" role="alert" style="color:var(--red);max-width:260px">${err}</span>` : null}</span>`;
  };

  /* ---------- Google Ads results: targets + logged periods ---------- */
  SR.periods = SR.periods || { clear: [
    { label: 'Week 1', days: 7, imp: 5200, clicks: 210, spend: 430, cr: 2.1, close: 8, avg: 8000, margin: 20, comm: 10 },
    { label: 'Week 2', days: 7, imp: 5600, clicks: 238, spend: 470, cr: 2.4, close: 9, avg: 8000, margin: 20, comm: 10 },
    { label: 'Week 3', days: 7, imp: 6100, clicks: 262, spend: 505, cr: 2.8, close: 10, avg: 8000, margin: 20, comm: 10 }
  ] };
  SR.adsCalc = function (i) {
    var cl = i.clicks, conv = cl * i.cr / 100, cust = conv * i.close / 100, rev = cust * i.avg, profit = rev * i.margin / 100 - i.spend;
    return { imp: i.imp, clicks: cl, cpd: cl / i.days, ctr: i.imp ? cl / i.imp * 100 : 0, cpc: cl ? i.spend / cl : 0, spend: i.spend, cr: i.cr, conv: conv, cpa: conv ? i.spend / conv : 0, close: i.close, avg: i.avg, rev: rev, roas: i.spend ? rev / i.spend : 0, margin: i.margin, profit: profit, comm: i.comm, commAmt: profit > 0 ? profit * i.comm / 100 : 0, days: i.days };
  };
  SR.adsTarget = function (M) {
    var cr = M.cvr || 0, clicks = cr ? (M.leads || 0) / (cr / 100) : 0, imp = M.ctr ? clicks / (M.ctr / 100) : 0;
    return SR.adsCalc({ imp: imp, clicks: clicks, spend: clicks * (M.cpc || 0), cr: cr, close: M.close || 0, avg: M.deal || 0, margin: M.margin || 0, comm: M.comm || 0, days: 30 });
  };
  var MET = [
    ['Traffic', [['imp', 'Impressions', 'n', 1, 1, 1], ['clicks', 'Clicks / page views', 'n', 1, 1, 1], ['cpd', 'Clicks / day', 'n1', 1, 0, 0], ['ctr', 'CTR', 'p', 1, 0, 0], ['cpc', 'CPC', 'm2', -1, 0, 0]]],
    ['Spend', [['spend', 'Ad spend', 'm', 0, 1, 1]]],
    ['Conversion', [['cr', 'Conversion rate', 'p', 1, 0, 1], ['conv', 'Conversions / leads', 'n1', 1, 1, 0], ['cpa', 'Cost / conversion', 'm', -1, 0, 0]]],
    ['Sales', [['close', 'Close rate', 'p', 1, 0, 1], ['avg', 'Avg $ per customer / sale', 'm', 1, 0, 1], ['rev', 'Total revenue', 'm', 1, 1, 0]]],
    ['Return', [['roas', 'Client ROAS', 'x', 1, 0, 0], ['margin', 'Client profit margin', 'p', 1, 0, 1], ['profit', 'Total profit', 'm', 1, 1, 0], ['comm', 'Your commission %', 'p', 0, 0, 1], ['commAmt', 'Your commission $', 'm', 1, 1, 0]]]
  ];
  var HINT = { ctr: 'Ad doesn’t stand out, isn’t relevant to the search, offer isn’t interesting enough, or targeting is too broad.', cpc: 'Low quality score, bids too high, broad match leaking, or competitors pushing the price.', cr: 'Not enough social proof, CTA isn’t clear, too much info too fast, or the page is weak on mobile.', close: 'Lead quality, slow follow-up on the client side, or keywords bringing in browsers.', cpa: 'Fix CPC or conversion rate first.', roas: 'Check cost per conversion and close rate.', avg: 'Attracting small deals. Check the keywords and the offer.', conv: 'Not enough volume. Budget, bids or search volume.', clicks: 'Not enough clicks. Budget, bids or search volume.' };
  var fm = function (k, v) { if (v == null || isNaN(v)) return '—'; if (k === 'n') return Math.round(v).toLocaleString('en-US'); if (k === 'n1') return (Math.round(v * 10) / 10).toLocaleString('en-US'); if (k === 'p') return (Math.round(v * 10) / 10) + '%'; if (k === 'x') return (Math.round(v * 100) / 100) + 'x'; if (k === 'm2') return '$' + v.toFixed(2); return '$' + Math.round(v).toLocaleString('en-US'); };
  /* ---------- week-by-week grid, shared by Google Ads, Meta Ads and SEO / AEO ---------- */
  var KINDS = {
    gads: { name: 'Google Ads', sub: 'People searching. Clicks turn into leads.', color: '#4F86C6', icon: 'search', unit: 'Week by week' },
    meta: { name: 'Meta Ads', sub: 'People scrolling. The creative decides the cost per lead.', color: '#C9774F', icon: 'eye', unit: 'Week by week' },
    seo: { name: 'SEO / AEO', sub: 'Slow build. Read it once a month.', color: '#2FA79C', icon: 'globe', unit: 'Month by month' }
  };
  var state3 = function (better, v, t) { if (!better || !t || v == null || isNaN(v)) return ''; var r = v / t; if (better > 0) return r >= 0.97 ? 'good' : r >= 0.85 ? 'near' : 'bad'; return r <= 1.03 ? 'good' : r <= 1.15 ? 'near' : 'bad'; };
  SR.WeekGrid = function (p) {
    var K = KINDS[p.kind] || KINDS.gads, sym = { good: '✓', near: '~', bad: '✕' }, nc = 2 + p.periods.length;
    var cs = useState(-1), ask = cs[0], setAsk = cs[1];
    return html`<section class=${'wgrid' + (p.joined ? ' joined' : '')} style=${'--k:' + K.color}>
      <div class="wg-top"><span class="wg-chip"><span class="wg-ic">${SR.Icon(K.icon, 16)}</span>${K.name}</span><span class="wg-sub">${K.sub}</span><span class="wg-key"><b class="gr">✓</b> on target <b class="am">~</b> near <b class="rd">✕</b> off target</span></div>
      <div class="wg-scroll"><table class="wg-table"><caption class="sr-only">${K.name} results, target against each period</caption>
        <thead><tr><th scope="col">${K.unit}</th><th scope="col">Target</th>${p.periods.map(function (l, i) { return html`<th key=${i} scope="col"><span class="wg-pl">${l}</span>${p.onEdit ? html`<span class="wg-act">${ask === i ? html`<button type="button" class="danger" aria-label=${'Confirm delete ' + l} onClick=${function () { setAsk(-1); p.onDelete(i); }}>Delete?</button><button type="button" onClick=${function () { setAsk(-1); }}>Keep</button>` : html`<button type="button" aria-label=${'Edit ' + l} onClick=${function () { p.onEdit(i); }}>Edit</button><button type="button" aria-label=${'Delete ' + l} onClick=${function () { setAsk(i); }}>Delete</button>`}</span>` : null}</th>`; })}</tr></thead>
        <tbody>${p.groups.map(function (g) { return [html`<tr class="wg-g" key=${'g' + g.title}><th scope="colgroup" colSpan=${nc}>${g.title}</th></tr>`].concat(g.rows.map(function (r) {
          return html`<tr key=${g.title + r.label}><th scope="row">${r.label}</th><td class="tg">${r.target}</td>${r.cells.map(function (c, i) { return html`<td key=${i} class=${c.s ? 's-' + c.s : ''}>${c.s ? html`<span class="sy" aria-hidden="true">${sym[c.s]}</span>` : null}${c.text}${c.s ? html`<span class="sr-only">${c.s === 'good' ? ', on target' : c.s === 'near' ? ', near target' : ', off target'}</span>` : null}</td>`; })}</tr>`;
        })); })}</tbody></table></div>
      ${p.attention && p.attention.length ? html`<div class="wg-foot"><b>Needs attention:</b> ${p.attention.map(function (a) { return html`<span key=${a.label} class="wg-att"><b class="rd">${a.label} ${a.value}</b> ${a.hint}</span>`; })}</div>` : null}
      ${p.note ? html`<div class="wg-foot wg-note">${p.note}</div>` : null}
      ${p.foot ? html`<div class="wg-foot">${p.foot}</div>` : null}
    </section>`;
  };

  /* ---------- trend panel: pick a metric, see actual vs target over the periods ---------- */
  SR.TrendPanel = function (p) {
    var st = useState(p.metrics[0].key), key = st[0];
    var m = p.metrics.filter(function (x) { return x.key === key; })[0] || p.metrics[0];
    var n = p.periods.length, vals = m.vals, tgs = m.targets;
    var W = 760, H = 250, pl = 54, pr = 20, pt = 18, pb = 34;
    var all = vals.concat(tgs).filter(function (x) { return x != null && !isNaN(x); });
    var mx = Math.max.apply(null, all.concat([1])) * 1.15;
    var X = function (i) { return pl + (n === 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (n - 1)); };
    var Y = function (v) { return H - pb - (v / mx) * (H - pt - pb); };
    var line = function (arr) { return arr.map(function (v, i) { return v == null || isNaN(v) ? null : X(i).toFixed(0) + ',' + Y(v).toFixed(0); }).filter(Boolean).join(' '); };
    var li = vals.length - 1, last = vals[li], prev = vals[li - 1], tl = tgs[li];
    var ch = prev != null && prev !== 0 && last != null ? (last - prev) / Math.abs(prev) * 100 : null;
    var good = ch == null ? null : m.better ? (ch * m.better > 0) : null;
    var streak = 0; for (var i = li; i > 0; i--) { var d = vals[i] - vals[i - 1]; if (m.better && d * m.better > 0) streak++; else break; }
    var vs = tl && last != null ? Math.round((last / tl - 1) * 100) : null;
    var tgood = vs == null ? null : (m.better >= 0 ? vs >= -3 : vs <= 3);
    var grid = [0, 0.5, 1].map(function (f) { return mx / 1.15 * f; });
    return html`<section class="trend">
      <div class="tr-top"><div class="tr-chips" role="group" aria-label="Metric">${p.metrics.map(function (x) { return html`<button key=${x.key} type="button" class=${'tr-chip' + (x.key === m.key ? ' on' : '')} aria-pressed=${x.key === m.key ? 'true' : 'false'} onClick=${function () { st[1](x.key); }}>${x.label}</button>`; })}</div>
        <span class="tr-range">${n} period${n === 1 ? '' : 's'}</span></div>
      <div class="tr-body">
        <div class="tr-chart"><svg viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label=${m.label + ' by period, actual against target'}>
          ${grid.map(function (g, i) { return html`<g key=${i}><line x1=${pl} x2=${W - pr} y1=${Y(g)} y2=${Y(g)} stroke="var(--line)" /><text x=${pl - 8} y=${Y(g) + 4} text-anchor="end" font-size="13" fill="var(--muted)">${m.fmt(g)}</text></g>`; })}
          ${tgs.some(function (x) { return x; }) ? html`<polyline points=${line(tgs)} fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="6 5" />` : null}
          <polyline points=${line(vals)} fill="none" stroke="#5A93C9" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
          ${vals.map(function (v, i) { return v == null || isNaN(v) ? null : html`<g key=${i}><circle cx=${X(i)} cy=${Y(v)} r=${i === li ? 6 : 4.5} fill="#5A93C9" />${i === li ? html`<text x=${X(i)} y=${Y(v) - 12} text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">${m.fmt(v)}</text>` : null}</g>`; })}
          ${p.periods.map(function (l, i) { return html`<text key=${i} x=${X(i)} y=${H - 10} text-anchor="middle" font-size="13" fill="var(--muted)">${l}</text>`; })}
        </svg>
          <div class="tr-leg"><span><i style="background:#5A93C9"></i>Actual</span><span><i style="background:var(--gold)"></i>Target</span></div></div>
        <div class="tr-side">
          <div class="tr-card"><div class="tl">WHAT CHANGED</div>
            ${ch == null ? html`<div class="u">Log one more period to see the change.</div>` : html`<div><b class=${good == null ? '' : (good ? 'gr' : 'rd')}>${good == null ? 'Changed' : (good ? 'Improving' : 'Slipping')}</b> <span class="u">${m.label} ${m.fmt(prev)} to ${m.fmt(last)} (${ch > 0 ? '+' : ''}${Math.round(ch)}%).${streak > 1 ? ' Better ' + streak + ' periods in a row.' : ''}</span></div>`}
            ${vs == null ? null : html`<div style="margin-top:6px"><b class=${tgood ? 'gr' : 'rd'}>${vs > 0 ? '+' : ''}${vs}%</b> <span class="u">vs target ${m.fmt(tl)}</span></div>`}</div>
          <div class="tr-card"><div class="tl">NEEDS ATTENTION</div>
            ${p.attention && p.attention.length ? p.attention.map(function (a) { return html`<div key=${a.label} style="margin-top:4px"><b class="rd">${a.label} ${a.value}</b> <span class="u">${a.hint}</span></div>`; }) : html`<div class="u">Everything is meeting its target.</div>`}</div>
          ${p.extra ? html`<div class="tr-card">${p.extra}</div>` : null}
        </div>
      </div>
    </section>`;
  };

  SR.GadsResults = function (p) {
    var c = p.client, M = c.math || {};
    var st = useState(0), tick = st[0], setTick = st[1];
    var fs = useState(false), showForm = fs[0], setShowForm = fs[1];
    var es = useState(null), editI = es[0], setEditI = es[1];
    var ls = SR.periods[c.id] = SR.periods[c.id] || [];
    var T = SR.adsTarget(M);
    var last = ls[ls.length - 1];
    var f0 = last || { label: 'Week 1', days: 7, imp: '', clicks: '', spend: '', cr: M.cvr || '', close: M.close || '', avg: M.deal || '', margin: M.margin || '', comm: M.comm || '' };
    var dr = useState(null), draft = dr[0] || Object.assign({}, f0, { label: 'Week ' + (ls.length + 1) }), setDraft = dr[1];
    var set = function (k) { return function (e) { var d = Object.assign({}, draft); d[k] = e.target.value; setDraft(d); }; };
    var calc = ls.map(SR.adsCalc);
    var tgt = function (key, days) { var pro = ['imp', 'clicks', 'spend', 'conv', 'rev', 'profit', 'commAmt'].indexOf(key) >= 0; return pro ? T[key] * days / 30 : T[key]; };
    var verdict = function (better, v, t) { if (!better || !t) return ''; var r = v / t; return better > 0 ? (r >= 0.97 ? 'good' : 'bad') : (r <= 1.03 ? 'good' : 'bad'); };
    var L = calc[calc.length - 1], P = calc[calc.length - 2];
    var flat = []; MET.forEach(function (g) { g[1].forEach(function (m) { flat.push(m); }); });
    var behind = L ? flat.filter(function (m) { return HINT[m[0]] && verdict(m[3], L[m[0]], tgt(m[0], L.days)) === 'bad'; }) : [];
    var cards = [['clicks', 'Clicks'], ['conv', 'Conversions'], ['cr', 'Conversion rate'], ['cpc', 'CPC'], ['spend', 'Ad spend'], ['cpa', 'Cost / conversion'], ['roas', 'Client ROAS'], ['profit', 'Total profit']];
    var meta = {}; flat.forEach(function (m) { meta[m[0]] = m; });
    var convMax = Math.max.apply(null, calc.map(function (x) { return x.conv; }).concat(calc.map(function (x) { return tgt('conv', x.days); }), [1]));
    var trend = L && P ? (L.cpa <= P.cpa ? 'Improving: cost per conversion is down' : 'Slipping: cost per conversion is up') : '';
    var save = function () {
      var n = {}; Object.keys(draft).forEach(function (k) { n[k] = k === 'label' ? draft.label : parseFloat(draft[k]) || 0; }); n.days = n.days || 7;
      if (editI != null && ls[editI]) ls[editI] = n; else ls.push(n);
      setDraft(null); setShowForm(false); setEditI(null); setTick(tick + 1);
    };
    var openNew = function () { if (showForm && editI == null) { setShowForm(false); return; } setEditI(null); setDraft(null); setShowForm(true); };
    var openEdit = function (i) { setEditI(i); setDraft(Object.assign({}, ls[i])); setShowForm(true); };
    var doImport = function (per, fname) {
      var run = function () { ls.length = 0; per.forEach(function (x) { ls.push({ label: x.label, days: x.days || 7, imp: Math.round(x.imp), clicks: Math.round(x.clicks), spend: Math.round(x.spend * 100) / 100, cr: x.clicks ? Math.round(x.conv / x.clicks * 10000) / 100 : 0, close: M.close || 0, avg: M.deal || 0, margin: M.margin || 0, comm: M.comm || 0 }); }); setTick(tick + 1); };
      if (SR.undoable) SR.undoable('Imported ' + per.length + ' period' + (per.length === 1 ? '' : 's') + ' from ' + fname, run); else run();
    };
    var cancel = function () { setDraft(null); setShowForm(false); setEditI(null); };
    var del = function (i) { ls.splice(i, 1); if (editI != null) cancel(); setTick(tick + 1); };
    var inp = function (k, lbl, step) { return html`<label key=${k}>${lbl}<input type="number" step=${step || 'any'} value=${draft[k] === undefined ? '' : draft[k]} onChange=${set(k)} /></label>`; };
    var hs = 'padding:10px 12px;font-size:12px';
    return html`<div style="display:flex;flex-direction:column;gap:0">
      <section style=${card + ';border-radius:14px 14px 0 0;border-bottom:0;border-top:4px solid #4F86C6;padding:18px 22px;display:flex;flex-wrap:wrap;gap:16px 24px;justify-content:space-between;align-items:center'}>
        <div style="flex:1 1 260px"><div style="font-size:13px;color:var(--muted)">${c.name} · Google Ads</div><h2 style="margin:4px 0 0;font-family:'Playfair Display',Georgia,serif;font-size:26px">${c.promise}</h2></div>
        <div style="text-align:right"><div style="font-size:34px;font-weight:700;color:var(--accent)">${L ? Math.round(L.conv * 10) / 10 : '—'} <span style="color:var(--text)">/ ${L ? Math.round(tgt('conv', L.days) * 10) / 10 : (M.leads || '—')}</span></div><div style="font-size:12px;color:var(--muted)">leads, ${L ? 'latest period (' + ls[ls.length - 1].label + ')' : 'no period logged yet'}</div></div>
        <span style="display:inline-flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><${SR.CsvButton} kind="gads" onData=${doImport} /><button type="button" class="logbtn" style="min-height:38px;font-size:14px" onClick=${openNew}>${SR.Icon('plus', 16)} Log a period</button></span>
        ${showForm ? html`<div style="flex:1 1 100%;padding:16px;background:var(--card2);border:1px solid var(--line);border-radius:12px">
          <div style="font-size:14px;font-weight:700;margin-bottom:10px">${editI != null ? 'Edit ' + (ls[editI] ? ls[editI].label : 'period') : 'Log a new period'}</div>
          <div class="rform">
            <label>Period name<input type="text" value=${draft.label} onChange=${set('label')} /></label>
            <label>Length<select value=${draft.days} onChange=${set('days')}><option value="7">1 week</option><option value="14">2 weeks</option><option value="30">1 month</option></select></label>
            ${inp('imp', 'Impressions')}${inp('clicks', 'Clicks')}${inp('spend', 'Ad spend ($)')}${inp('cr', 'Conversion rate (%)')}${inp('close', 'Close rate (%)')}${inp('avg', 'Avg $ per sale')}${inp('margin', 'Client profit margin (%)')}${inp('comm', 'Your commission (%)')}
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:10px">CTR, CPC, clicks a day, conversions, cost per conversion, revenue, ROAS, profit and your commission are worked out for you.</div>
          <div style="display:flex;gap:10px;margin-top:12px;align-items:center"><button type="button" class="logbtn" style="min-height:40px;font-size:14px" onClick=${save}>${editI != null ? 'Save changes' : 'Save period'}</button><button type="button" class="tr-chip" onClick=${cancel}>Cancel</button></div></div>` : null}
      </section>
      ${L ? html`<${SR.WeekGrid} kind="gads" joined=${true} periods=${ls.map(function (x) { return x.label; })} onEdit=${openEdit} onDelete=${del}
        note=${c.id === 'clear' ? 'Sample numbers: these periods are made up to show the layout. Targets come from onboarding.' : null}
        groups=${MET.map(function (g) { return { title: g[0], rows: g[1].map(function (m) { return { label: m[1], target: fm(m[2], T[m[0]]), cells: calc.map(function (x) { return { text: fm(m[2], x[m[0]]), s: state3(m[3], x[m[0]], tgt(m[0], x.days)) }; }) }; }) }; })}
        attention=${behind.map(function (m) { return { label: m[1], value: fm(m[2], L[m[0]]), hint: HINT[m[0]] }; })}
        foot="Total profit = revenue × client margin − ad spend. Your commission is a share of that profit." />` : html`<section style=${card + ';border-radius:0 0 14px 14px;padding:22px;font-size:14px;color:var(--muted)'}>Nothing logged yet. Targets come from onboarding. Import a CSV export or log your first period to fill the grid.</section>`}
    </div>`;
  };


  /* ---------- SEO / AEO results: targets + logged periods ---------- */
  SR.orgP = SR.orgP || {}; SR.orgT = SR.orgT || {};
  var OM = [['calls', 'Calls from Google Business Profile', 1, 'n'], ['leads', 'Website leads', 1, 'n'], ['rank', 'Avg GMB rank', -1, 'r'], ['heat', 'Heatmap: % of cells in top 3', 1, 'p'], ['rev', 'New reviews', 1, 'n'], ['ai', 'AI visibility (%)', 1, 'p'], ['clicks', 'Organic clicks', 1, 'n'], ['imp', 'Impressions', 1, 'n'], ['pos', 'Avg position in Google', -1, 'r'], ['top10', 'Keywords in top 10', 1, 'n'], ['sov', 'AI share of voice (%)', 1, 'p'], ['pm', 'Prompts mentioning the client', 1, 'n'], ['art', 'Articles published', 1, 'n']];
  var OHINT = { calls: 'Profile is thin: add services, photos, posts and Q&A, and check categories.', leads: 'Pages do not convert: check calls to action, speed and the contact form.', rank: 'Rankings are weak: look at citations, reviews and on-page for the main keyword.', heat: 'Local visibility is patchy: build citations and reviews around the weak areas.', rev: 'Not enough new reviews: send the review link after every job.', ai: 'AI answers do not mention the client: add FAQ content and track the prompts in Peec AI.', clicks: 'Few visits from Google: improve titles and descriptions, publish more, and fix pages that rank 5 to 15.', pos: 'Pages rank low: strengthen on-page for the main keywords and build links.', top10: 'Too few keywords on page 1: push the pages sitting on positions 11 to 20.', sov: 'Competitors are cited more: get cited on the sources AI already uses.', pm: 'Few prompts mention the client: write the answers to those prompts.', art: 'Behind on publishing: the content plan is slipping.' };
  var ofm = function (k, v) { if (v == null || v === '' || isNaN(v)) return '—'; if (k === 'r') return (Math.round(v * 10) / 10).toString(); if (k === 'p') return (Math.round(v * 10) / 10) + '%'; return Math.round(v).toLocaleString('en-US'); };
  SR.OrgResults = function (p) {
    var c = p.client, G = p.goal || {};
    var st = useState(0), tick = st[0], setTick = st[1];
    var fs = useState(false), showForm = fs[0], setShowForm = fs[1];
    var es = useState(null), editI = es[0], setEditI = es[1];
    var ls = SR.orgP[p.pid] = SR.orgP[p.pid] || [];
    var T = SR.orgT[p.pid] = SR.orgT[p.pid] || { calls: 0, leads: (G.unit === 'leads' ? G.target : 0) || 0, rank: 0, heat: 0, rev: 0, ai: (G.unit === '%' ? G.target : 0) || 0 };
    var dr = useState(null), draft = dr[0] || { label: 'Month ' + (ls.length + 1) }, setDraft = dr[1];
    var L = ls[ls.length - 1], P0 = ls[ls.length - 2];
    var verdict = function (better, v, t) { if (!t || v == null) return ''; var r = v / t; return better > 0 ? (r >= 0.97 ? 'good' : 'bad') : (r <= 1.03 ? 'good' : 'bad'); };
    var behind = L ? OM.filter(function (m) { return T[m[0]] && verdict(m[2], L[m[0]], T[m[0]]) === 'bad'; }) : [];
    var save = function () { var n = { label: draft.label || 'Month ' + (ls.length + 1) }; OM.forEach(function (m) { n[m[0]] = parseFloat(draft[m[0]]); if (isNaN(n[m[0]])) n[m[0]] = null; }); if (editI != null && ls[editI]) ls[editI] = n; else ls.push(n); setDraft(null); setShowForm(false); setEditI(null); setTick(tick + 1); };
    var openNew = function () { if (showForm && editI == null) { setShowForm(false); return; } setEditI(null); setDraft(null); setShowForm(true); };
    var openEdit = function (i) { var d = { label: ls[i].label }; OM.forEach(function (m) { d[m[0]] = ls[i][m[0]] == null ? '' : ls[i][m[0]]; }); setEditI(i); setDraft(d); setShowForm(true); };
    var cancel = function () { setDraft(null); setShowForm(false); setEditI(null); };
    var del = function (i) { ls.splice(i, 1); if (editI != null) cancel(); setTick(tick + 1); };
    var setT = function (k) { return function (v) { T[k] = v; setTick(tick + 1); }; };
    var barKey = 'leads', bmax = Math.max.apply(null, ls.map(function (x) { return x[barKey] || 0; }).concat([T[barKey] || 0, 1]));
    var tb = useState(false), tbl = tb[0], setTbl = tb[1];
    var big = G.unit === '%' ? 'ai' : 'leads';
    var bigM = OM.filter(function (m) { return m[0] === big; })[0];
    return html`<div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;flex-direction:column;gap:0">
      <section style=${card + ';border-radius:14px 14px 0 0;border-bottom:0;border-top:4px solid #2FA79C;padding:18px 22px;display:flex;flex-wrap:wrap;gap:16px 24px;justify-content:space-between;align-items:center'}>
        <div style="flex:1 1 260px"><div style="font-size:13px;color:var(--muted)">${c.name} · SEO / AEO</div><h2 style="margin:4px 0 0;font-family:'Playfair Display',Georgia,serif;font-size:26px">${G.text || c.promise || 'Set the goal on the client page'}</h2></div>
        <div style="text-align:right"><div style="font-size:34px;font-weight:700;color:var(--accent)">${L ? ofm(bigM[3], L[big]) : '—'} <span style="color:var(--text)">/ ${T[big] ? ofm(bigM[3], T[big]) : '—'}</span></div><div style="font-size:12px;color:var(--muted)">${bigM[1].toLowerCase()}, ${L ? 'latest period (' + L.label + ')' : 'no period logged yet'}</div></div>
        <button type="button" class="logbtn" style="min-height:38px;font-size:14px" onClick=${openNew}>${SR.Icon('plus', 16)} Log a period</button>
        ${showForm ? html`<div style="flex:1 1 100%;padding:16px;background:var(--card2);border:1px solid var(--line);border-radius:12px">
          <div style="font-size:14px;font-weight:700;margin-bottom:10px">${editI != null ? 'Edit ' + (ls[editI] ? ls[editI].label : 'period') : 'Log a new period'}</div>
          <div class="rform">
          <label>Period name<input type="text" value=${draft.label} onChange=${function (e) { setDraft(Object.assign({}, draft, { label: e.target.value })); }} /></label>
          ${OM.map(function (m) { return html`<label key=${m[0]}>${m[1]}<input type="number" step="any" value=${draft[m[0]] === undefined ? '' : draft[m[0]]} onChange=${function (e) { var d = Object.assign({}, draft); d[m[0]] = e.target.value; setDraft(d); }} /></label>`; })}
          </div><div style="display:flex;gap:10px;margin-top:12px;align-items:center"><button type="button" class="logbtn" style="min-height:40px;font-size:14px" onClick=${save}>${editI != null ? 'Save changes' : 'Save period'}</button><button type="button" class="tr-chip" onClick=${cancel}>Cancel</button></div></div>` : null}
      </section>
      ${L ? html`<${SR.WeekGrid} kind="seo" joined=${true} periods=${ls.map(function (x) { return x.label; })} onEdit=${openEdit} onDelete=${del}
        groups=${[['Traffic from Google', ['clicks', 'imp', 'pos', 'top10']], ['Google Business Profile', ['calls', 'rank', 'heat', 'rev']], ['AI answers', ['ai', 'sov', 'pm']], ['Results and work done', ['leads', 'art']]].map(function (g) { return { title: g[0], rows: g[1].map(function (k) { var m = OM.filter(function (o) { return o[0] === k; })[0]; return { label: m[1], target: T[k] ? ofm(m[3], T[k]) : 'Set', cells: ls.map(function (x) { return { text: ofm(m[3], x[k]), s: state3(m[2], x[k], T[k]) }; }) }; }) }; })}
        attention=${behind.map(function (m) { return { label: m[1], value: ofm(m[3], L[m[0]]), hint: OHINT[m[0]] }; })}
        foot="For average rank a lower number is better. Set the targets with the button below." />` : html`<section style=${card + ';border-radius:0 0 14px 14px;padding:22px;font-size:14px;color:var(--muted)'}>Nothing logged yet. Set the targets, then log your first period. The Baseline tab on the SEO / AEO project holds the starting numbers.</section>`}
      </div>
      <section style=${card + ';padding:14px 22px'}>
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2 style="margin:0;font-size:17px">Targets</h2>
          <button type="button" class="tr-chip" onClick=${function () { setTbl(!tbl); }}>${tbl ? 'Hide targets' : 'Set targets'} ${tbl ? '▴' : '▾'}</button></div>
        ${tbl ? html`<div><div style="overflow-x:auto;margin-top:12px"><table class="rtable"><thead><tr><th scope="col">Metric</th><th scope="col">Target</th>${ls.map(function (x, i) { return html`<th key=${i} scope="col">${x.label}</th>`; })}</tr></thead>
          <tbody>${OM.map(function (m) { return html`<tr key=${m[0]}><td class="l">${m[1]}</td><td><${SR.Editable} value=${T[m[0]] || ''} type="number" placeholder="Set" onSave=${setT(m[0])} /></td>${ls.map(function (x, i) { return html`<td key=${i} class=${verdict(m[2], x[m[0]], T[m[0]])}>${ofm(m[3], x[m[0]])}</td>`; })}</tr>`; })}</tbody></table></div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px">Green meets the target, red misses it by more than 3%. For average rank a lower number is better. Numbers are kept in this browser for now.</div></div>` : null}
      </section>
    </div>`;
  };

  /* ---------- RESULTS TRACKER ---------- */
  SR.Results = function (p) {
    var pick = p.resPick, period = p.period, imported = p.imported;
    var projects = [];
    p.clients.forEach(function (c) { (c.projects || [c.type]).forEach(function (t, i) { var prim = t === c.type; var T = SR.TEMPLATES[t]; projects.push({ id: prim ? c.id : c.id + ':' + t, cid: c.id, name: c.name, proj: T.label, color: c.color, type: t, prim: prim }); }); });
    if (!projects.length) projects = [{ id: 'clear', cid: 'clear', name: 'Clear Ally', proj: 'Google Ads', color: '#4F86C6', type: 'gads', prim: true }];
    var cur = null; for (var i = 0; i < projects.length; i++) if (projects[i].id === pick) cur = projects[i];
    if (!cur) cur = projects[0];
    var client0 = SR.clientById(p.clients, cur.cid), client = cur.prim ? client0 : Object.assign({}, client0, { math: {}, promise: ((client0.pg || {})[cur.type] || {}).text || '' });
    var seg = function (on) { return 'min-height:36px;padding:0 16px;border:0;border-radius:7px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;' + (on ? 'background:var(--accentBg);color:var(--accent)' : 'background:transparent;color:var(--muted)'); };

    var listPane = html`<section aria-label="Projects" style=${card + ';flex:1 1 230px;min-width:0;padding:8px;display:flex;flex-direction:column;gap:2px'}>
      ${projects.map(function (r) { var on = r.id === pick; return html`<button key=${r.id} type="button" onClick=${function () { p.setResPick(r.id); }} aria-pressed=${on ? 'true' : 'false'} style=${'display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:8px 12px;border:0;border-left:4px solid ' + r.color + ';border-radius:8px;font-family:inherit;color:var(--text);cursor:pointer;background:' + (on ? 'color-mix(in srgb,' + r.color + ' 20%,var(--card))' : 'color-mix(in srgb,' + r.color + ' 7%,transparent)')}>
        <span style=${'width:12px;height:12px;border-radius:4px;flex:none;background:' + r.color}></span><span style="flex:1;display:flex;flex-direction:column;text-align:left"><span style="font-size:14px;font-weight:600">${r.name}</span><span style="font-size:12px;color:var(--muted)">${r.proj}</span></span></button>`; })}
    </section>`;

    var detail;
    if (cur.type === 'seo' || cur.type === 'aeo') {
      detail = html`<${SR.OrgResults} key=${cur.id} client=${client} pid=${cur.id} goal=${(client0.pg || {})[cur.type] || (cur.prim ? { text: client0.promise, target: 0, unit: 'leads' } : {})} />`;
    } else if (false) {
      detail = html`<section style=${card + ';padding:20px 22px;display:flex;flex-direction:column;gap:12px'}>
        <h2 style="margin:0;font-size:17px">${cur.name} · AEO</h2>
        <div style="font-size:14px;color:var(--muted)">Target from the promise: ${client.promise || '20% AI visibility'}. Weekly readings import from Peec AI.</div>
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">${[['AI visibility', '[x]%'], ['Share of voice', '[x]%'], ['Prompts mentioned', '[x]/[y]'], ['Leads from AI', '[x]']].map(function (b, i) { return html`<div key=${i} style="background:var(--card2);border-radius:10px;padding:12px"><div style="font-size:12px;color:var(--muted)">${b[0]}</div><div style="font-size:22px;font-weight:700">${b[1]}</div></div>`; })}</div>
      </section>`;
    } else if (cur.type === 'gads') {
      detail = html`<${SR.GadsResults} key=${cur.id} client=${client} />`;
    } else {
      var M = client.math || {}, type = cur.type;
      var m = SR.projectMath(type, M);
      var T = { imp: m.imprMonth, clk: m.clicksDay * 30.4, ctr: M.ctr || 0, cpc: M.cpc || 0, cpm: M.cpm || 0, spend: m.monthly, conv: M.leads || 0, cvr: M.cvr || 0, cpa: m.cpl };
      var targets = type === 'gads'
        ? [['Clicks a day', SR.n0(m.clicksDay)], ['Leads a month', SR.n0(M.leads || 0)], ['Cost per lead', m.cpl ? SR.money(m.cpl) : '—'], ['Monthly budget', SR.money(m.monthly)]]
        : [['Leads a month', SR.n0(M.leads || 0)], ['Cost per lead', m.cpl ? SR.money(m.cpl) : '—'], ['Monthly budget', SR.money(m.monthly)], ['Target CTR', (M.ctr || 0) + '%']];
      var real = !!SR.metaReal[cur.id];
      var D = SR.metaReal[cur.id] || SR.RESULTS_SAMPLE[cur.id] || SR.RESULTS_SAMPLE.clear;
      var nW = D.imp.length;
      var bi = period === 'bi', fr = bi ? 14 / 30 : 7 / 30;
      var periods = []; for (var wi = 0; wi < nW; wi += bi ? 2 : 1) periods.push(bi && wi + 1 < nW ? [wi, wi + 1] : [wi]);
      var isImp = real || !!imported[cur.id];
      var agg = function (key, idx) { return idx.reduce(function (a, i2) { return a + D[key][i2]; }, 0); };
      var calc = function (kind, idx) {
        if (kind === 'sum') return null;
        var im = agg('imp', idx), ck = agg('clk', idx), sp = agg('spend', idx), cv = agg('conv', idx);
        return kind === 'ctr' ? ck / im * 100 : kind === 'cpc' ? sp / ck : kind === 'cpm' ? sp / im * 1000 : kind === 'cvr' ? cv / ck * 100 : sp / cv;
      };
      var rows = type === 'gads'
        ? [['Impressions', 'imp', 'sum', 1], ['Clicks', 'clk', 'sum', 1], ['CTR', 'ctr', 'ctr', 1], ['CPC', 'cpc', 'cpc', -1], ['Spend', 'spend', 'sum', 0], ['Conversions', 'conv', 'sum', 1], ['Conversion rate', 'cvr', 'cvr', 1], ['Cost / conversion', 'cpa', 'cpa', -1]]
        : [['Impressions', 'imp', 'sum', 1], ['CPM', 'cpm', 'cpm', -1], ['Clicks', 'clk', 'sum', 1], ['CTR', 'ctr', 'ctr', 1], ['Spend', 'spend', 'sum', 0], ['Leads', 'conv', 'sum', 1], ['Conversion rate', 'cvr', 'cvr', 1], ['Cost / lead', 'cpa', 'cpa', -1]];
      var fmt = function (kind, v, key) { if (v == null || isNaN(v)) return '—'; if (kind === 'ctr' || kind === 'cvr') return (Math.round(v * 100) / 100) + '%'; if (kind === 'cpc' || kind === 'cpm' || kind === 'cpa' || key === 'spend') return '$' + (v < 10 ? (Math.round(v * 100) / 100).toFixed(2) : Math.round(v).toLocaleString('en-US')); return Math.round(v).toLocaleString('en-US'); };
      var flags = {};
      var cellBase = 'padding:10px 12px;border-top:1px solid var(--line);text-align:right;white-space:nowrap;';
      var hs = 'padding:10px 12px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);text-align:right;font-weight:700;white-space:nowrap';
      detail = html`<div style="display:flex;flex-direction:column;gap:16px">
        <section style=${card + ';padding:16px 22px;display:flex;flex-wrap:wrap;gap:24px;align-items:center'}>
          <div style="flex:1 1 200px"><h2 style="margin:0;font-size:16px">${cur.name} · ${cur.proj}</h2><div style="font-size:12px;color:var(--muted);margin-top:2px">Targets from the project math set at onboarding</div></div>
          ${targets.map(function (t, i) { return html`<div key=${i}><div style="font-size:12px;color:var(--muted)">${t[0]}</div><div style="font-size:20px;font-weight:700">${t[1]}</div></div>`; })}
        </section>
        <section style=${card + ';padding:18px 22px'}>
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2 style="margin:0;font-size:17px">Actual vs target</h2>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><div role="group" aria-label="Period" style="display:inline-flex;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:3px;gap:3px"><button type="button" onClick=${function () { p.setPeriod('week'); }} aria-pressed=${!bi ? 'true' : 'false'} style=${seg(!bi)}>Weekly</button><button type="button" onClick=${function () { p.setPeriod('bi'); }} aria-pressed=${bi ? 'true' : 'false'} style=${seg(bi)}>Bi-weekly</button></div>
            <${SR.CsvButton} kind="meta" onData=${function (per, fname) { var run = function () { SR.metaReal[cur.id] = { labels: per.map(function (x) { return x.label; }), imp: per.map(function (x) { return x.imp; }), clk: per.map(function (x) { return x.clicks; }), spend: per.map(function (x) { return x.spend; }), conv: per.map(function (x) { return x.conv; }), freq: per.some(function (x) { return x.freq != null; }) ? per.map(function (x) { return x.freq == null ? 0 : x.freq; }) : undefined }; p.doImport(cur.id); }; if (SR.undoable) SR.undoable('Imported ' + per.length + ' period' + (per.length === 1 ? '' : 's') + ' from ' + fname, run); else run(); }} />
            ${real ? null : html`<button type="button" onClick=${function () { p.doImport(cur.id); }} style="min-height:38px;padding:0 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer">${isImp ? '↻ Reload sample' : 'Load sample data'}</button>`}</div></div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">${real ? 'Imported from your CSV export. Green meets the target, red misses it.' : isImp ? 'Sample import: 4 weeks of made-up numbers. Green meets the target, red misses it.' : 'Nothing imported yet. Import a CSV export from Meta Ads Manager, or load sample data.'}</div>
          ${(function () {
             var lab = { 'Clicks': 'Link clicks', 'CTR': 'Link CTR', 'Cost / lead': 'Cost per lead' };
             var byL = {}; rows.forEach(function (r) { byL[r[0]] = r; });
             var mk = function (name) {
               var r = byL[name]; var tval = r[2] === 'sum' ? T[r[1]] * fr : T[r[1]];
               return { label: lab[name] || name, target: fmt(r[2], tval, r[1]), cells: periods.map(function (idx) { if (!isImp) return { text: '—', s: '' }; var v = r[2] === 'sum' ? agg(r[1], idx) : calc(r[2], idx); return { text: fmt(r[2], v, r[1]), s: state3(r[3], v, tval) }; }) };
             };
             var av = function (label, key, tv, better, kind, tlabel) {
               return { label: label, target: tlabel, cells: periods.map(function (idx) { if (!isImp || !D[key]) return { text: '—', s: '' }; var v = idx.reduce(function (a2, i2) { return a2 + D[key][i2]; }, 0) / idx.length; return { text: kind === 'p' ? (Math.round(v * 10) / 10) + '%' : (Math.round(v * 10) / 10).toString(), s: state3(better, v, tv) }; }) };
             };
             return html`<${SR.WeekGrid} kind="meta" periods=${periods.map(function (pp, i) { return D.labels ? (bi ? D.labels[pp[0]].replace('Week of', pp.length > 1 ? '2 weeks from' : 'Week of') : D.labels[pp[0]]) : (bi ? 'Weeks ' + (i * 2 + 1) + '–' + (i * 2 + 2) : 'Week ' + (i + 1)); })}
               groups=${[{ title: 'Delivery', rows: ['Impressions', 'CPM', 'Spend'].map(mk).concat([av('Frequency', 'freq', 2, -1, 'f', 'Under 2')]) }, { title: 'Attention', rows: ['Clicks', 'CTR'].map(mk).concat([av('Video hook rate', 'hook', 30, 1, 'p', '30%')]) }, { title: 'Results', rows: ['Leads', 'Cost / lead', 'Conversion rate'].map(mk).concat([av('Qualified lead %', 'qual', 50, 1, 'p', '50%')]) }, { title: 'Tracking', rows: [av('Event Match Quality', 'emq', 6, 1, 'f', '6 or more')] }]}
               foot="Targets for frequency, hook rate, qualified lead % and Event Match Quality are starting defaults. Breakeven cost per lead is the line. Testing means do nothing: only turn off ads above it after the test ends." />`;
           })()}
        </section>
        ${isImp && (flags.ctr || flags.cvr) ? html`<section style="background:var(--goldBg);border:1px solid var(--gold);border-radius:12px;padding:16px 20px">
          ${flags.ctr ? html`<div style="margin-bottom:10px"><h3 style="margin:0 0 6px;font-size:15px;color:var(--gold)">CTR is under target. Check:</h3>${['Ad doesn’t stand out', 'Ad isn’t relevant to the search', 'Offer isn’t interesting enough', 'Targeting is off'].map(function (x, i) { return html`<div key=${i} style="font-size:14px;padding:2px 0">☐ ${x}</div>`; })}</div>` : null}
          ${flags.cvr ? html`<div><h3 style="margin:0 0 6px;font-size:15px;color:var(--gold)">Conversion rate is under target. Check:</h3>${['Not enough social proof', 'CTA isn’t clear enough', 'Too much info too fast', 'Page is weak on mobile'].map(function (x, i) { return html`<div key=${i} style="font-size:14px;padding:2px 0">☐ ${x}</div>`; })}</div>` : null}
        </section>` : null}
      </div>`;
    }

    return html`<div style="display:flex;flex-direction:column;gap:18px">
      <div><h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:32px">Results</h1><p style="margin:6px 0 0;font-size:14px;color:var(--muted)">Targets come from the project math. Actuals come from the ad account.</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start">${listPane}<div style="flex:999 1 600px;min-width:0">${detail}</div></div>
    </div>`;
  };
})(window.SR);
