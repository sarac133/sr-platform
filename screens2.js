/* Sarac Ramsay — client page (Clear Ally design) + Results tracker */
window.SR = window.SR || {};
(function (SR) {
  var html = SR.html, useState = React.useState;
  var card = 'background:var(--card);border:1px solid var(--border);border-radius:7px';


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
  var SEO_CSS = '.leftcol .phase{padding:6px 10px;gap:0}.leftcol .phases{gap:1px}.leftcol{flex:0 0 280px;display:flex;flex-direction:column;gap:18px;min-width:0}.leftcol .phases{flex:none;width:auto}.rlabel{font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--muted);padding:0 12px 8px}.toolrail{border-top:1px solid var(--line);padding-top:14px}.toolgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.toolb{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);font:inherit;font-size:13px;font-weight:500;cursor:pointer;min-height:36px}.toolb:hover{background:var(--soft);border-color:var(--line2)}.toolb.on{background:var(--soft);border-color:var(--accent)}.toolb .tbadge{margin-left:0;font-size:11px}.toolstrip{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 14px}.toolstrip .rlabel{padding:0 6px 0 0}.toolstrip .toolb{min-height:32px;padding:5px 12px;border-radius:16px}.tabs.railmode .tab[data-k]:not([data-k=dash]):not([data-k=work]):not(.on){display:none}.tabs{align-items:center}.tabs .tab[data-k]:not([data-k=dash]):not([data-k=work]){font-size:13px;font-weight:500;padding:5px 10px;min-height:30px;border:0!important;background:none!important;border-radius:8px;box-shadow:none!important}.tabs .tab[data-k]:not([data-k=dash]):not([data-k=work]):hover{background:var(--soft)!important;color:var(--ink)}.tabs .tab[data-k]:not([data-k=dash]):not([data-k=work]).on{background:var(--soft)!important;color:var(--ink)}.tabs .tab[data-k=access]{margin-left:18px;position:relative}.tabs .tab[data-k=access]:before{content:"";position:absolute;left:-9px;top:7px;bottom:7px;width:1px;background:var(--line2)}.tab .tbadge{font-size:11px}.fadd{display:flex;align-items:center;gap:8px;border:1px dashed var(--line2);border-radius:10px;padding:2px 12px;margin-bottom:12px;background:var(--panel)}.fadd:focus-within{border:1px solid var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}.fplus{color:var(--muted);font-size:20px}.fadd .fin,.fadd .fin:focus,.fadd .fin:focus-visible{border:0!important;outline:none!important;box-shadow:none!important;background:none!important}.fin{flex:1;background:none;color:var(--ink);font:inherit;font-size:15px;padding:12px 0;min-width:0}.fhint{font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:1px 6px;opacity:0}.fadd:focus-within .fhint{opacity:1}.wtool{display:flex;align-items:center;gap:10px;margin:0 0 12px}.wseg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}.wseg button{border:0;background:none;color:var(--muted);padding:7px 14px;font:inherit;font-weight:600;cursor:pointer}.wseg button.on{background:var(--soft);color:var(--ink)}.wchip{border:1px solid var(--line);border-radius:16px;background:none;color:var(--muted);padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}.wchip.on{background:var(--soft);color:var(--ink);border-color:var(--line2)}.work.hidedone .task.fin{display:none}.work.mapmode .phases{display:none}.work.mapmode .list{flex:1 1 420px}.ring{width:24px;height:24px;flex:none}.ring circle{fill:none;stroke-width:3.5;stroke-linecap:round}.ring .rb{stroke:var(--line)}.phase .l{display:flex;align-items:center;gap:8px}.phase .l>span:nth-child(2){flex:1}.task .id.yours{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#B7791F;border:1px solid #E0A33A88;border-radius:8px;padding:0 6px;width:auto}.jmap{border:1px solid #6B5535;border-radius:12px;overflow:hidden;margin-bottom:14px}.jmap svg{display:block;width:100%;height:auto}.jstop{cursor:pointer;outline:0}.jstop:hover circle,.jstop:focus-visible circle{stroke:#16233B}.jl{font:700 14px Georgia,serif;fill:#3B2D18;paint-order:stroke;stroke:#F1E5C9;stroke-width:4px}.jn{font:700 12px system-ui;fill:#fff}.jhere{font:700 10px system-ui;letter-spacing:.12em;fill:#6B5535}' + '.tabord,.viewbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}.ordchip{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line2);border-radius:8px;padding:2px 4px;font-size:13px;background:var(--panel)}.ordchip span{padding:0 6px}.ordchip button,.blkbar button{border:0;background:transparent;cursor:pointer;color:var(--accent-ink);font-weight:700;border-radius:5px;min-width:24px;min-height:24px}.ordchip button:hover:not(:disabled),.blkbar button:hover:not(:disabled){background:var(--soft)}.ordchip button:disabled,.blkbar button:disabled{opacity:.3;cursor:default}.blkbar{display:flex;justify-content:space-between;align-items:center;margin:-4px -4px 10px;padding:4px 8px;border-radius:8px;background:var(--soft);font-size:12px}.blkgone{opacity:.45}.work.nobars .phase .bar{display:none}.work.nocnt .phase .muted{display:none}.work.noid .task .id{display:none}html,body{overflow:hidden}.embed .sheetwrap{max-height:none}.embed .px.detail{position:absolute;top:var(--vt,0px);bottom:auto;height:var(--vh,100vh)}.embed .pxbw{position:absolute;bottom:auto;top:calc(var(--vt,0px) + var(--vh,100vh) - 16px);height:auto;transform:translateY(-100%)}.embed .pxbulk{width:min(980px,100%);flex-wrap:wrap}.embed .pxbd{display:inline-flex!important;flex-direction:row!important;align-items:center;white-space:nowrap;gap:8px}.embed .pxbd span{display:inline!important;position:static!important;font-size:13px}.embed .pxbd input{width:128px;min-width:0}.embed .pxbsel{max-width:150px}#toast{position:absolute!important;bottom:auto!important;top:calc(var(--vt,0px) + var(--vh,100vh) - 70px)}.embed .wrap{max-width:none;padding:0 0 110px}.embed .tabs{border:0;gap:6px;margin:2px 0 18px}.embed .tab{border:1px solid var(--line);border-radius:6px;min-height:34px;padding:0 14px;font-size:13px}.embed .tab.on{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)}.embed .phase .pi{display:inline-flex;color:var(--pc)}.colchip{display:inline-flex;align-items:center;gap:4px}.editp{padding:14px;margin-bottom:12px}.erow .pxsel{align-self:flex-start;max-width:260px}.erow .eord{display:flex;flex-direction:column;gap:2px}.erow .eord .pxx[disabled]{opacity:.3;cursor:default}.editbar{display:flex;align-items:center;gap:14px;justify-content:space-between;padding:12px 16px;border:1px solid var(--accent);background:var(--accent-soft);border-radius:8px;font-size:14px;line-height:1.45;margin-bottom:12px}.editbar .btn{flex:none}.erow{display:flex;gap:10px;align-items:flex-start;padding:10px 4px;border-top:1px solid var(--line)}.erow .ebody{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}.erow .pxin{width:100%;box-sizing:border-box}.erow .ehow{font-size:13px;resize:vertical}.erow.gone{opacity:.55}.erow .edel{width:30px;height:30px}.edsec{display:flex;align-items:center;gap:10px;padding:8px 4px 2px}.edsec .pxin{max-width:420px;font-weight:600}.ddt{box-shadow:inset 0 2px 0 var(--accent,#4C7BD9)}.ddb{box-shadow:inset 0 -2px 0 var(--accent,#4C7BD9)}[data-dd]{cursor:grab}.ddgrip{color:var(--muted);padding:0 4px;user-select:none;font-size:14px;text-align:center}';
  var SEO_JS = '\n;(function(){var ap=document.getElementById("app"),last=0;function post(){var h=Math.ceil(ap.getBoundingClientRect().height)+10;if(h!==last){last=h;parent.postMessage({sr:"h",h:h},"*");}}new ResizeObserver(post).observe(ap);addEventListener("load",post);addEventListener("message",function(e){var d=e.data;if(d&&d.sr==="v"){var st=document.documentElement.style;st.setProperty("--vt",d.t+"px");st.setProperty("--vh",d.h+"px");}});parent.postMessage({sr:"ready"},"*");setTimeout(post,300);})();\n;(function(){var N=["search","pin","gauge","clip","grid","spark","list","globe","radar","chart"];var r0=render;render=function(){r0();document.querySelectorAll(".phase").forEach(function(b,i){var d=b.querySelector(".dot");if(d){var s=document.createElement("span");s.className="pi";s.innerHTML=svg(N[i%N.length],16);d.replaceWith(s);}});};})();\n';
  SEO_CSS += '.numstrip{margin:0 0 12px;border:1px solid var(--line);border-radius:10px;background:var(--card,#fff)}.numstrip summary{cursor:pointer;padding:8px 12px;font-size:13px;font-weight:600;color:var(--muted);list-style:none}.numstrip summary::-webkit-details-marker{display:none}.numstrip summary:before{content:"\\25B8";display:inline-block;margin-right:6px;transition:transform .15s}.numstrip[open] summary:before{transform:rotate(90deg)}.numbody{padding:0 14px 12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));column-gap:28px}.numbody>.muted{grid-column:1/-1}.backwork{border:0;background:none;font:inherit;font-size:13px;font-weight:600;color:var(--accent,#4F46E5);cursor:pointer;padding:4px 8px;margin-right:6px;border-radius:6px}.backwork:hover{background:rgba(127,127,127,.12)}.howpop{position:fixed;z-index:9999;background:var(--panel);color:var(--ink);border:1px solid var(--line2);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.16);padding:10px 12px;font-size:13px;line-height:1.45;max-height:70vh;overflow:auto}.howpop .hpt{font-weight:600;margin-bottom:6px;color:var(--ink)}.howpop .links a{display:flex;justify-content:space-between;gap:10px;padding:4px 6px;border-radius:5px;color:var(--ink);text-decoration:none}.howpop .links a:hover{background:var(--soft)}.howpop .steps{margin:0;padding-left:18px}.howpop .steps,.howpop .steps li,.howpop a{font-size:13px!important;line-height:1.45}.howpop .steps li{margin:3px 0}.howpop .links{margin-top:8px}';
  SEO_CSS += '.tabs{display:none!important}.seo-shell{display:flex;gap:22px;align-items:flex-start;margin-top:6px}.sh-main{flex:1 1 0;min-width:0}.sh-main .work{display:flex;gap:18px;align-items:flex-start}.sh-main .work>nav.phases{display:none}.sh-main .work>.list{flex:1 1 0;min-width:0}.sh-main .work>.detail{flex:0 0 360px}.leftcol{flex:0 0 270px}.leftcol .phase .pname{cursor:text}.leftcol .phase.on{background:var(--soft)}.numcard{border-top:1px solid var(--line);padding-top:14px}.numcard .kv{font-size:13px;padding:5px 12px}.numcard .muted:last-child{font-size:12px;padding:6px 12px}.rhint{font-size:11.5px;color:var(--muted);padding:0 12px}.toolb.newt{color:var(--muted);border-style:dashed}input.inl{font:inherit;color:inherit;background:var(--panel);border:1px solid var(--accent);border-radius:5px;padding:1px 5px;outline:none;min-width:70px}.toolb[draggable=true]{cursor:grab}@media(max-width:900px){.seo-shell{flex-direction:column}.leftcol{flex:none;width:100%}.sh-main .work{flex-direction:column}.sh-main .work>.detail{flex:none;width:100%}}';
  SEO_CSS += '.leftcol .phase .rb{stroke:color-mix(in srgb,var(--pc) 30%,transparent)}.leftcol .phase{border-radius:8px}.leftcol .phase.on{background:color-mix(in srgb,var(--pc) 14%,transparent)}.leftcol .phase:hover{background:color-mix(in srgb,var(--pc) 8%,transparent)}.leftcol .phase .pnum{color:var(--pc);font-weight:700}.leftcol .phase.on .pname{font-weight:600}.pic{position:relative;width:26px;height:26px;flex:none;margin-right:8px;display:inline-block}.pic .ring{width:26px;height:26px}.pem{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:11px}.leftcol .rlabel .wchip{font-size:11px;padding:2px 8px;font-weight:500;letter-spacing:0;text-transform:none}';
  SEO_CSS += 'body{font-size:14px}.task{border-radius:6px;border-left:0;min-height:30px;gap:0}.task:hover{background:var(--soft)}.cb{padding:5px 4px 5px 8px}.cb span{width:16px;height:16px;border-radius:4px;border-width:1.5px;font-size:10px}.tx{padding:4px 10px 4px 4px;gap:8px}.id{font-size:11px;font-weight:500;width:26px;flex:0 0 26px}.tx .t{font-size:14px;line-height:1.35}.pill.hw{padding:1px 8px;font-size:11px;font-weight:600;margin-right:6px}.sub{margin:12px 0 2px;padding:5px 8px;border-radius:0;font-size:12px;border-left:0!important;background:transparent!important;border-bottom:1px solid var(--line);color:var(--muted)}.list>.card{border:0;background:transparent;padding:0}.list h2{font-size:20px}.leftcol .phase{padding:4px 8px;border-radius:6px}.card{border-radius:8px}.btn{border-radius:6px}.wchip,.fadd{border-radius:6px}.toolb{border-radius:6px;min-height:30px;padding:4px 9px}.sh-main .work{gap:14px}';
  var seoShim = function (cfg, DATA) {
    var P = 'srseo:', TABS = ['baseline', 'keywords', 'pages', 'citations', 'competitors', 'links', 'journal'];
    var g = function (k) { try { return JSON.parse(localStorage.getItem(P + k)); } catch (e) { return null; } };
    var put = function (k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} try { parent.postMessage({ sr: 'seo', key: k, value: v }, '*'); } catch (e) {} };
    /* every client has its own tables. They used to share one set, so the old shared data is handed to Lifestyle Insurance, where it was typed in. */
    var dk = function (t) { return 'data:' + cfg.id + ':' + t; };
    if (cfg.id === 'life') TABS.forEach(function (t) { if (g(dk(t)) == null && g('data:' + t)) put(dk(t), g('data:' + t)); });
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
        if (!d[2] && m === 'GET') { var out = {}; TABS.forEach(function (t) { out[t] = g(dk(t)) || { order: [], rows: {} }; }); return json(out); }
        if (d[2] && m === 'PUT') {
          var cur = g(dk(d[2])) || { order: [], rows: {} };
          Object.keys(body.puts || {}).forEach(function (rid) { cur.rows[rid] = body.puts[rid]; });
          (body.dels || []).forEach(function (rid) { delete cur.rows[rid]; });
          if (Array.isArray(body.order)) cur.order = body.order;
          cur.order = cur.order.filter(function (x) { return cur.rows[x]; });
          put(dk(d[2]), cur); return json({ ok: true });
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
  /* Tasks layer for the SEO Work tab. Runs inside the SEO iframe, after the app and the embed layer.
     Adds: your own tasks on any phase (one or a pasted list), a Frequency setting on any task, repeating tasks that stay done until due again (reset at midnight, viewer's timezone), and the same task options as the dashboard panel. */
  var seoTasksLayer = function () {
    var CAD = { 'Daily': 1, 'Every 3 days': 3, 'Weekly': 7, 'Fortnightly': 14, 'Monthly': 'm1', 'Every 90 days': 90, 'Quarterly': 'm3' };
    var REPS = ['Daily', 'Every 3 days', 'Weekly', 'Fortnightly', 'Monthly', 'Every 90 days'];
    var ymd = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    var meta = function (k) { return ((S.client && S.client.meta) || {})[k] || {}; };
    var dur = function (m) { m = Math.max(0, Math.round(m || 0)); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : ''); };
    var cadOf = function (it) {
      var m = meta(it.id).rep; if (m !== undefined && m !== null && m !== '') return m === 'Does not repeat' ? '' : m;
      if (it.rep) return it.rep === 'Does not repeat' ? '' : it.rep;
      if (it.custom) return '';
      var x = /^(Daily|Weekly|Fortnightly|Monthly|Quarterly)\b/.exec(it.text || ''); return x ? x[1] : '';
    };
    var dueOf = function (cad, t) {
      var n = CAD[cad]; if (!n) return ''; var d = new Date(t); d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (typeof n === 'string') { var mo = +n.slice(1), day = d.getDate(); d = new Date(d.getFullYear(), d.getMonth() + mo, 1); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); }
      else d.setDate(d.getDate() + n);
      return ymd(d);
    };
    var fmt = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };
    var tasksPhase = function () { return (S.work || []).find(function (p) { var n = p._oname || p.name; return n === 'Ongoing' || n === 'Tasks'; }); };
    var edits = function () {
      var e = meta('_edits');
      return { items: e.items || {}, gone: e.gone || {}, sec: e.sec || {}, ph: e.ph || {}, secGone: e.secGone || {}, mv: e.mv || {}, ord: e.ord || {}, newPh: e.newPh || [], phGone: e.phGone || {}, addSec: e.addSec || {}, cols: e.cols || {}, tabsRen: e.tabsRen || {}, tabsGone: e.tabsGone || {}, tabs: e.tabs || [], tabOrd: e.tabOrd || [], dash: Object.assign({ ord: [], col: {}, gone: {}, kv: {} }, e.dash), view: e.view || {},
        acc: Object.assign({ gone: {}, ren: {}, add: [] }, e.acc), base: Object.assign({ gone: {}, ren: {}, add: [], secRen: {}, addSec: [] }, e.base) };
    };
    var customs = function () { return (((S.client || {}).meta || {})._custom || {}).list || []; };
    var phN = function (c) { var t = tasksPhase(); return c.ph !== undefined ? c.ph : (t ? t.n : 0); };
    var allItems = function () { var out = []; (S.work || []).forEach(function (p) { (p._base || p.items).forEach(function (it) { if (it.kind !== 's') out.push(it); }); }); customs().forEach(function (c) { out.push({ id: c.id, text: c.text, rep: c.rep, custom: true }); }); return out; };
    var expire = function () {
      if (!S.client || !S.work) return false;
      var today = ymd(new Date()), changed = false;
      allItems().forEach(function (it) {
        var cad = cadOf(it); if (!cad) return;
        var m = S.client.marks[it.id]; if (!m || m.s !== 'done') return;
        if (!m.t) m.t = new Date().toISOString();
        var due = dueOf(cad, m.t);
        if (due && due <= today) { delete S.client.marks[it.id]; changed = true; api('/clients/' + S.client.id + '/mark', 'POST', { key: it.id, status: null }).catch(function () {}); }
      });
      return changed;
    };
    var prep = function () {
      if (!S.client || !S.work) return;
      S.work.forEach(function (p) { if (!p._orig) { p._orig = p.items.slice(); p._oname = p.name === 'Ongoing' ? 'Tasks' : p.name; } });
      var tp = tasksPhase(), ed = edits(), edit = !!S.edit;
      S.work.forEach(function (p) {
        p.name = (ed.ph[p.n] || p._oname) + (edit && ed.phGone[p.n] ? ' (hidden)' : '');
        var isT = p === tp;
        var sink = function (it) { return !edit && it.kind !== 's' && isFin(it.id) && (isT || cadOf(it)) ? 1 : 0; };
        var base = p._orig.filter(function (it) { return edit || it.kind === 's' || !ed.gone[it.id]; }).map(function (it) {
          if (it.kind === 's') return Object.assign({}, it, { text: ed.sec[it.text] || it.text, _o: it.text });
          var e = ed.items[it.id], g = ed.gone[it.id];
          return (e || g) ? Object.assign({}, it, e ? { text: e.text || it.text, how: e.how || it.how } : {}, g ? { _gone: true } : {}) : it;
        });
        p._base = base;
        var chunks = [], cur = { head: null, key: '', rows: [] };
        base.forEach(function (it) { if (it.kind === 's') { chunks.push(cur); cur = { head: it, key: it._o, rows: [] }; } else cur.rows.push(it); });
        chunks.push(cur);
        (ed.addSec[p.n] || []).forEach(function (a) { chunks.push({ head: { kind: 's', text: ed.sec[a.id] || a.text, _o: a.id, _custom: true }, key: a.id, rows: [] }); });
        var byKey = {}; chunks.forEach(function (c) { if (c.head) byKey[c.key] = c; });
        chunks.forEach(function (c) { c.rows = c.rows.filter(function (it) { var t = ed.mv[it.id]; if (t && byKey[t] && byKey[t] !== c) { byKey[t].rows.push(it); return false; } return true; }); });
        var rest = [];
        customs().filter(function (c) { return phN(c) === p.n; }).forEach(function (c) {
          var it = { kind: 't', id: c.id, text: c.text, rep: c.rep, how: c.how || [], links: [], custom: true, sec: c.sec };
          if (c.sec && byKey[c.sec]) byKey[c.sec].rows.push(it); else rest.push(it);
        });
        var ord = ed.ord[p.n] || [], oi = function (it) { var i = ord.indexOf(it.id); return i < 0 ? 1e6 : i; };
        var order = function (rows) { return rows.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return sink(a[0]) - sink(b[0]) || oi(a[0]) - oi(b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; }); };
        var out = [];
        chunks.forEach(function (c) {
          var sg = c.head && ed.secGone[c.key]; if (sg && !edit) return;
          if (c.head) out.push(sg ? Object.assign({}, c.head, { _gone: true }) : c.head);
          out = out.concat(order(c.rows));
        });
        if (rest.length) out = out.concat([{ kind: 's', text: 'Your tasks', _o: '__your', _virtual: true }], order(rest));
        p.items = out;
      });
    };
    var setM = function (keys, patch) {
      S.client.meta = S.client.meta || {};
      keys.forEach(function (k) { S.client.meta[k] = Object.assign({}, S.client.meta[k], patch); });
      render();
      keys.forEach(function (k) { api('/clients/' + S.client.id + '/meta', 'POST', { key: k, patch: patch }).catch(function (e) { toast('Could not save. ' + e.message); }); });
    };
    var save = function (list) {
      S.client.meta = S.client.meta || {}; S.client.meta._custom = { list: list };
      return api('/clients/' + S.client.id + '/meta', 'POST', { key: '_custom', patch: { list: list } }).catch(function (e) { toast('Could not save. ' + e.message); });
    };
    var repOpts = function (cur, none) { return '<option value="Does not repeat" ' + (!cur ? 'selected' : '') + '>Does not repeat</option>' + REPS.map(function (r) { return '<option ' + (r === cur ? 'selected' : '') + '>' + r + '</option>'; }).join(''); };
    var addBox = function () {
      return '<div class="fadd"><span class="fplus" aria-hidden="true">+</span><input class="fin" data-fa="line" autocomplete="off" placeholder="Add a task to this phase, or paste a list" aria-label="Add a task to this phase"><span class="fhint">Enter</span></div>';
    };
    var cleanLines = function (txt) {
      var ls = String(txt || '').split(/\r?\n/).map(function (l) { return l.replace(/^\s*(?:[-*+\u2022]\s*)?(?:\[[ xX]?\]\s*)?/, '').replace(/^\s*\d+[.)]\s+/, '').trim(); }).filter(Boolean);
      var first = ls.map(function (l) { var m = /^([A-Za-z][A-Za-z0-9 ]{1,20}?)\s[-\u2013]\s+\S/.exec(l); return m ? m[1].toLowerCase() : ''; });
      if (ls.length > 1 && first[0] && first.every(function (f) { return f === first[0]; })) ls = ls.map(function (l) { return l.replace(/^[^-\u2013]*?\s[-\u2013]\s+/, ''); });
      return ls.map(function (l) { return l.charAt(0).toUpperCase() + l.slice(1); });
    };
    var addLines = function (txt) {
      var lines = cleanLines(txt); if (!lines.length || !S.work || !S.work[S.phase]) return 0;
      var list = customs().slice(), ph = S.work[S.phase].n;
      lines.forEach(function (l, j) { list.push({ id: 'c' + Date.now().toString(36) + j, text: l, rep: 'Does not repeat', ph: ph, sec: '' }); });
      save(list); render(); toast(lines.length > 1 ? lines.length + ' tasks added' : 'Task added');
      setTimeout(function () { var el = document.querySelector('[data-fa="line"]'); if (el) el.focus(); }, 30);
      return lines.length;
    };
    var gcal = function (t, m, c) {
      var d = m.date.replace(/-/g, ''), n = new Date(+m.date.slice(0, 4), +m.date.slice(5, 7) - 1, +m.date.slice(8, 10) + 1), e = ymd(n).replace(/-/g, '');
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(t.text + ' · ' + c.name) + '&dates=' + d + '/' + e;
    };
    var extra = function (t, m) {
      var cad = cadOf(t), spent = m.spent || 0, est = m.est || 0, subs = m.subs || [], sd = subs.filter(function (s) { return s.done; }).length;
      var chip = function (label, on, attrs) { return '<button class="' + (on ? 'on' : '') + '" ' + attrs + '>' + label + '</button>'; };
      return '<div class="pxs"><div class="pxl">Frequency</div><select class="pxsel" style="width:100%" data-cf="rep">' + repOpts(cad) + '</select><div class="pxsub">' + (cad ? 'When ticked it stays done until it is due again, then comes back at midnight.' : 'One time task.') + '</div></div>' +
        '<div class="pxs"><div class="pxl">Attack time</div><input type="time" class="pxin full" data-cf="time" value="' + esc(m.time || '') + '"><div class="pxsub">Exact time you plan to start, e.g. 09:00 or 14:30.</div></div>' +
        '<div class="pxs"><div class="pxl">Time</div><div class="pxsub">Duration, and how much is already done.</div><div class="pxchips">' + [15, 30, 60, 120, 240].map(function (x) { return chip(dur(x), est === x, 'data-ct="est" data-v="' + x + '"'); }).join('') + '</div>' +
        '<div style="height:6px;border-radius:6px;background:var(--line);overflow:hidden;margin:8px 0 4px"><i style="display:block;height:100%;width:' + (est ? Math.min(100, Math.round(spent / est * 100)) : 0) + '%;background:var(--accent)"></i></div>' +
        '<div class="pxsub"><b>' + dur(spent) + '</b> done' + (est ? ' of ' + dur(est) : '') + '</div><div class="pxchips">' + [[15, '+15m'], [30, '+30m'], [60, '+1h'], [-15, '-15m']].map(function (x) { return chip(x[1], false, 'data-ct="log" data-v="' + x[0] + '"'); }).join('') + '</div></div>' +
        (m.date ? '<div class="pxs"><a class="btn" style="text-decoration:none;display:inline-block" href="' + esc(gcal(t, m, S.client)) + '" target="_blank" rel="noopener">Add to Google Calendar ↗</a></div>' : '') +
        '<div class="pxs"><div class="pxl">Subitems <span class="pxsub" style="text-transform:none;letter-spacing:0">' + (subs.length ? sd + ' of ' + subs.length + ' done' : 'None yet') + '</span></div>' +
        subs.map(function (s, i) { return '<div class="row" style="gap:8px;padding:4px 0"><button class="cb sm ' + (s.done ? 'done' : '') + '" data-ct="subt" data-i="' + i + '" aria-label="' + esc(s.name) + '"><span>' + (s.done ? '✓' : '') + '</span></button><span style="flex:1;' + (s.done ? 'text-decoration:line-through;opacity:.6' : '') + '">' + esc(s.name) + '</span><button class="pxx" data-ct="subx" data-i="' + i + '" aria-label="Remove subitem">✕</button></div>'; }).join('') +
        '<input type="text" class="pxin full" data-cf="sub" placeholder="+ Add subitem, press Enter"></div>';
    };
    var saveEd = function (patch) {
      S.client.meta = S.client.meta || {};
      if (!S._restoring) { var us = S._edUndo = S._edUndo || []; us.push(JSON.stringify(S.client.meta._edits || {})); if (us.length > 30) us.shift(); } var ed = Object.assign({}, S.client.meta._edits, patch); S.client.meta._edits = ed;
      return api('/clients/' + S.client.id + '/meta', 'POST', { key: '_edits', patch: ed }).catch(function (e) { toast('Could not save. ' + e.message); });
    };
    var rid = function (pre) { return pre + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };
    window.__ED = { edits: edits, saveEd: saveEd, rid: rid };
    var inp = function (attrs, val, cls, style) { return '<input class="pxin ' + (cls || '') + '" type="text" ' + attrs + ' value="' + esc(val) + '"' + (style ? ' style="' + style + '"' : '') + '>'; };
    var editCard = function (p) {
      var rows = '', secs = p.items.filter(function (i) { return i.kind === 's' && !i._virtual; });
      var sopts = function (cur) { return '<option value="">Move to section...</option>' + secs.map(function (s) { return '<option value="' + esc(s._o) + '"' + (s._o === cur ? ' selected' : '') + '>' + esc(s.text) + '</option>'; }).join(''); };
      var curSec = '';
      p.items.forEach(function (it, ix) {
        if (it.kind === 's') {
          curSec = it._o;
          if (it._virtual) { rows += '<div class="sub edsec"><span>Your tasks</span></div>'; return; }
          rows += '<div class="sub edsec">' + inp('data-ed="sec" data-o="' + esc(it._o) + '" aria-label="Section name"', it.text) +
            (it._gone ? '<button class="btn small" data-ed="secrestore" data-o="' + esc(it._o) + '">Restore section</button>' : '<button class="btn small" data-ed="secdel" data-o="' + esc(it._o) + '">Delete section</button>') + '</div>';
          return;
        }
        var prevS = p.items[ix - 1] && p.items[ix - 1].kind === 's', nextS = !p.items[ix + 1] || p.items[ix + 1].kind === 's';
        rows += '<div class="erow' + (it._gone ? ' gone' : '') + '" data-dt="task" data-id="' + esc(it.id) + '"><span class="eord"><span class="ddgrip" draggable="true" data-dd="task" data-id="' + esc(it.id) + '" title="Drag to reorder">⋮⋮</span><button class="pxx" data-ed="up" data-k="' + esc(it.id) + '" aria-label="Move up"' + (prevS ? ' disabled' : '') + '>↑</button><button class="pxx" data-ed="down" data-k="' + esc(it.id) + '" aria-label="Move down"' + (nextS ? ' disabled' : '') + '>↓</button></span>' +
          '<div class="ebody">' + inp('data-ed="text" data-k="' + esc(it.id) + '" aria-label="Task name"' + (it._gone ? ' disabled' : ''), it.text) +
          '<textarea class="pxin ehow" rows="' + Math.max(2, Math.min(7, (it.how || []).length + 1)) + '" data-ed="how" data-k="' + esc(it.id) + '" placeholder="How to do it. One step per line." aria-label="How to do it"' + (it._gone ? ' disabled' : '') + '>' + esc((it.how || []).map(function (h) { return typeof h === 'string' ? h : (h && h.text) || ''; }).join('\n')) + '</textarea>' +
          (secs.length && !it._gone ? '<select class="pxsel" data-ed="mv" data-k="' + esc(it.id) + '" aria-label="Move to section">' + sopts('') + '</select>' : '') + '</div>' +
          (it._gone ? '<button class="btn small" data-ed="restore" data-k="' + esc(it.id) + '">Restore</button>' : '<button class="pxx edel" data-ed="del" data-k="' + esc(it.id) + '" aria-label="Delete task" title="Delete task">✕</button>') + '</div>';
      });
      return '<div class="card" style="padding:10px">' + (rows || '<div class="muted" style="padding:12px">Nothing in this phase yet. Add a section or a task.</div>') + '</div>';
    };
    var spanOf = function (h, start) { var re = /<(\/?)div\b/g, d = 0, m; re.lastIndex = start; while ((m = re.exec(h))) { d += m[1] ? -1 : 1; if (d === 0) { return h.indexOf('>', m.index) + 1; } } return -1; };
    var _wv = workView;
    workView = function () {
      var p = S.work && S.work[S.phase]; if (!p || !S.client) return _wv();
      expire(); prep();
      var out = _wv(), today = ymd(new Date());
      if (S.edit) {
        var cs = out.indexOf('<div class="card" style="padding:8px">'), ce = cs < 0 ? -1 : spanOf(out, cs), edz = edits();
        var gonePh = !!edz.phGone[p.n], isCustPh = !!p.custom;
        var actions = '<div class="row" style="gap:8px;margin-bottom:10px;flex-wrap:wrap"><button class="btn" data-ed="secadd">+ Add section</button>' +
          '<button class="btn" data-ed="' + (gonePh ? 'phrestore' : 'phhide') + '">' + (gonePh ? 'Restore this phase' : 'Hide this phase') + '</button>' +
          (isCustPh ? '<button class="btn" data-ed="phdel">' + (S.confirmDel === 'ph' + p.n ? 'Click again to delete' : 'Delete this phase') + '</button>' : '') + '</div>';
        if (cs >= 0 && ce > 0) out = out.slice(0, cs) + actions + addBox() + editCard(p) + out.slice(ce);
        out = out.replace(/(<h2 style="font-size:24px">)\d+\. [^<]*(<\/h2>)/, '$1' + p.n + '. ' + inp('data-ed="ph" data-n="' + p.n + '" aria-label="Phase name"', edz.ph[p.n] || p._oname, '', 'font-size:20px;font-weight:700;max-width:420px;display:inline-block') + '$2');
        out = out.replace('</nav>', '<button class="btn" style="margin-top:8px;width:100%" data-ed="phadd">+ Add phase</button></nav>');
        return out;
      }
      out = out.replace('<button class="btn" data-ct="open">+ Add your own task</button>', '<button class="btn" data-ct="open">+ Add your own task</button> <button class="btn" data-ed="start">Edit checklist and process</button>');
      p.items.forEach(function (it) {
        if (it.kind === 's') return;
        var cad = cadOf(it), m = S.client.marks[it.id], bits = [], explicit = it.custom || meta(it.id).rep;
        if (explicit && cad) bits.push(cad);
        if (cad && m && m.s === 'done') { var due = dueOf(cad, m.t || new Date().toISOString()); if (due && due > today) bits.push('back ' + fmt(due)); }
        if (bits.length) { var tt = '<span class="tt">' + esc(it.text) + '</span>'; out = out.replace(tt, tt + '<span class="pill gray">' + esc(bits.join(' · ')) + '</span>'); }
        if (it.custom) out = out.replace('<span class="id">' + it.id + '</span>', '<span class="id">+</span>');
      });
      out = out.replace('<div class="card" style="padding:8px">', addBox() + '<div class="card" style="padding:8px">');
      var sel = S.sel && allItems().find(function (x) { return x.id === S.sel; });
      if (sel) {
        var m2 = meta(sel.id), mark = '<div class="pxs"><div class="pxl">Notes</div>';
        out = out.replace(mark, extra(sel, m2) + mark);
        if (sel.custom) out = out.replace('<div class="pxf">', '<div class="pxf"><button class="pxna" data-ct="del">Delete task</button>');
      }
      return out;
    };
    /* focus list + journey map, tools tabs kept quiet */
    var _wv3 = workView;
    var journey = function () {
      var W = 1100, H = 250, n = S.work.length, pts = S.work.map(function (p, i) { return { x: 100 + i * ((W - 200) / Math.max(1, n - 1)), y: H / 2 + Math.sin(i * 1.15) * 62 }; });
      var d = 'M' + pts[0].x + ',' + pts[0].y; for (var i = 1; i < n; i++) { var a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2; d += ' C' + mx + ',' + a.y + ' ' + mx + ',' + b.y + ' ' + b.x + ',' + b.y; }
      var cur = S.work.findIndex(function (p) { var c = counts(p); return c.done < c.total; }); if (cur < 0) cur = n - 1;
      var hills = [0, 1, 2, 3, 4, 5].map(function (k) { return '<ellipse cx="' + (110 + k * 190) + '" cy="' + (k % 2 ? 40 : 215) + '" rx="' + (62 + k * 6) + '" ry="30" fill="none" stroke="#8B6E43" stroke-opacity=".28"/><ellipse cx="' + (110 + k * 190) + '" cy="' + (k % 2 ? 40 : 215) + '" rx="' + (34 + k * 4) + '" ry="15" fill="none" stroke="#8B6E43" stroke-opacity=".28"/>'; }).join('');
      var stops = S.work.map(function (p, i) {
        var c = counts(p), pc = c.total ? c.done / c.total : 0, r = 17 + Math.min(8, c.total / 6), pt = pts[i], on = i === S.phase, col = PC[i % PC.length], up = i % 2 === 0, nm = p.name.length > 18 ? p.name.slice(0, 17) + '…' : p.name;
        return '<g class="jstop' + (on ? ' on' : '') + '" data-a="phase" data-k="' + i + '" tabindex="0" role="button" aria-label="' + esc(p.name) + ', ' + c.done + ' of ' + c.total + ' done"><circle cx="' + pt.x + '" cy="' + pt.y + '" r="' + r + '" fill="' + col + '" fill-opacity="' + (0.35 + pc * 0.65) + '" stroke="' + (on ? '#16233B' : '#F6ECD3') + '" stroke-width="' + (on ? 4 : 3) + '"/><text class="jn" x="' + pt.x + '" y="' + (pt.y + 4) + '" text-anchor="middle">' + c.done + '/' + c.total + '</text><text class="jl" x="' + pt.x + '" y="' + (pt.y + (up ? -r - 8 : r + 17)) + '" text-anchor="middle">' + esc(nm) + '</text>' + (c.total && pc === 1 ? '<path d="M' + (pt.x + r - 4) + ',' + (pt.y - r + 2) + ' v-22 l17,5 l-17,5z" fill="#3FA56A" stroke="#16233B"/>' : '') + '</g>';
      }).join('');
      return '<div class="jmap"><svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Journey map of phases"><defs><radialGradient id="jpp" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#F1E5C9"/><stop offset="1" stop-color="#D2BE93"/></radialGradient></defs><rect width="' + W + '" height="' + H + '" fill="url(#jpp)"/>' + hills +
        '<path d="' + d + '" fill="none" stroke="#F6ECD3" stroke-width="11" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#16233B" stroke-width="3.2" stroke-dasharray="9 7" stroke-linecap="round"/>' + stops +
        '<circle cx="' + pts[cur].x + '" cy="' + pts[cur].y + '" r="' + (26 + Math.min(8, counts(S.work[cur]).total / 6)) + '" fill="none" stroke="#E0A33A" stroke-width="3" stroke-dasharray="4 4" pointer-events="none"/><text x="' + pts[cur].x + '" y="' + (pts[cur].y + (cur % 2 === 0 ? 56 : -50)) + '" text-anchor="middle" class="jhere" pointer-events="none">YOU ARE HERE</text><rect x="3" y="3" width="' + (W - 6) + '" height="' + (H - 6) + '" fill="none" stroke="#6B5535" stroke-width="3"/></svg></div>';
    };
    workView = function () {
      var out = _wv3();
      if (S.edit || !S.client || !S.work || !S.work[S.phase]) return out;
      var mode = S.wv || (function () { try { return localStorage.getItem('srwv') || 'list'; } catch (e) { return 'list'; } })(), hide = !!S.hideDone, C = 2 * Math.PI * 10;
      var nav = S.work.map(function (q, i) {
        var c = counts(q), pc = c.total ? c.done / c.total : 0, col = PC[i % PC.length];
        return '<button class="phase ' + (i === S.phase ? 'on' : '') + '" style="--pc:' + col + '" data-a="phase" data-k="' + i + '"><span class="l"><svg class="ring" viewBox="0 0 26 26" aria-hidden="true"><circle class="rb" cx="13" cy="13" r="10"/><circle cx="13" cy="13" r="10" stroke="' + col + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C * (1 - pc) + '" transform="rotate(-90 13 13)"/></svg><span>' + q.n + '. ' + esc(q.name) + '</span><span class="muted" style="font-size:12px;font-weight:600">' + c.done + '/' + c.total + '</span></span></button>';
      }).join('');
      out = out.replace(/<nav class="phases"[^>]*>[\s\S]*?<\/nav>/, '<nav class="phases" aria-label="Phases">' + nav + '</nav>');
      out = out.split('<span class="id">+</span>').join('<span class="id yours">yours</span>');
      out = out.replace('<div class="work">', '<div class="work' + '' + (hide ? ' hidedone' : '') + '">');
      var tool = '<div class="wtool"><button class="wchip ' + (hide ? 'on' : '') + '" data-wv="hide" aria-pressed="' + hide + '">Hide done</button></div>';
      return out;
    };
    var _r = render;
    render = function () { expire(); _r(); };
    window.addEventListener('message', function (e) { if (e.data && e.data.sr === 'edit') { S.edit = !S.edit; render(); } });
    /* ---- everything editable: tabs, columns, baseline metrics, access items, phases, sections, new tables ---- */
    var TABS0 = TABS.map(function (t) { return t.slice(); }), SH0 = SHEET_TABS.slice(), ACC0 = ACCESS.map(function (a) { return a.slice(); });
    var applyAll = function () {
      if (!S.client) return;
      var ed = edits(), edit = !!S.edit, SP = window.__SPECS;
      TABS.length = 0; SHEET_TABS.length = 0;
      TABS0.forEach(function (t) { var g = ed.tabsGone[t[0]]; if (t[0] === 'dash' || (g && !edit)) return; TABS.push([t[0], (ed.tabsRen[t[0]] || t[1]) + (g ? ' (hidden)' : '')]); });
      SH0.forEach(function (k) { if (!(ed.tabsGone[k] && !edit)) SHEET_TABS.push(k); });
      ed.tabs.forEach(function (t) { TABS.push([t.id, t.title]); SHEET_TABS.push(t.id); });
      if (ed.tabOrd.length) { var rank = function (id) { var i = ed.tabOrd.indexOf(id); return i < 0 ? 999 : i; }, keep = TABS.map(function (t, i) { return [t, i]; }); keep.sort(function (a, b) { return rank(a[0][0]) - rank(b[0][0]) || a[1] - b[1]; }); var sorted = keep.map(function (x) { return x[0]; }); TABS.length = 0; sorted.forEach(function (t) { TABS.push(t); }); }
      if (!TABS.some(function (t) { return t[0] === S.tab; })) S.tab = 'work';
      if (SP) Object.keys(SP).forEach(function (tab) {
        var sp = SP[tab]; if (!sp._c0) { sp._c0 = sp.cols.slice(); sp._t0 = sp.title; }
        var ce = ed.cols[tab] || {};
        sp.cols = sp._c0.filter(function (c) { return c.first || !(ce.gone || {})[c.k]; }).map(function (c) { return (ce.ren || {})[c.k] ? Object.assign({}, c, { label: ce.ren[c.k] }) : c; }).concat((ce.add || []).map(function (a) { return { k: a.k, label: a.label, w: 170 }; }));
        if (ce.ord && ce.ord.length) { var rk = function (c) { var i = ce.ord.indexOf(c.k); return c.first ? -1 : (i < 0 ? 9999 : i); }, ix = sp.cols.map(function (c, i) { return [c, i]; }); ix.sort(function (a, b) { return rk(a[0]) - rk(b[0]) || a[1] - b[1]; }); sp.cols = ix.map(function (x) { return x[0]; }); }
        sp.title = ed.tabsRen[tab] || sp._t0;
      });
      ACCESS.length = 0;
      ACC0.forEach(function (a) { if (ed.acc.gone[a[0]] && !edit) return; ACCESS.push([a[0], (ed.acc.ren[a[0]] || a[1]) + (ed.acc.gone[a[0]] ? ' (hidden)' : '')]); });
      (ed.acc.add || []).forEach(function (a) { ACCESS.push([a.id, a.text]); });
      ACCESS.forEach(function (a) { if (!ACC_ICON[a[0]]) ACC_ICON[a[0]] = ['#475569', 'list']; });
      if (S.baselineDef) {
        if (!S._b0) S._b0 = S.baselineDef.slice();
        var be = ed.base, secOf = null, out = [], addAt = {};
        (be.add || []).forEach(function (m) { (addAt[m.sec || ''] = addAt[m.sec || ''] || []).push(m); });
        var flush = function () { (addAt[secOf || ''] || []).forEach(function (m) { out.push({ id: m.id, label: m.label, where: m.where || '', freq: m.freq || 'Monthly' }); }); delete addAt[secOf || '']; };
        S._b0.forEach(function (m) {
          if (m.section) { flush(); secOf = m.section; out.push({ section: be.secRen[m.section] || m.section, _o: m.section }); return; }
          if (be.gone[m.id] && !edit) return;
          var r = be.ren[m.id] || {}; out.push({ id: m.id, label: r.label || m.label, where: r.where !== undefined ? r.where : m.where, freq: r.freq || m.freq, _gone: !!be.gone[m.id] });
        });
        flush(); Object.keys(addAt).forEach(function (k) { secOf = k; flush(); });
        (be.addSec || []).forEach(function (s2) { out.push({ section: s2.label, _o: s2.id }); (be.add || []).filter(function (m) { return m.sec === s2.id; }).forEach(function (m) { out.push({ id: m.id, label: m.label, where: m.where || '', freq: m.freq || 'Monthly' }); }); });
        S.baselineDef = out;
      }
      if (S.work) {
        if (!S._w0) S._w0 = S.work.slice(); S._wc = S._wc || {};
        var maxN = Math.max.apply(null, S._w0.map(function (p) { return p.n; })), list = S._w0.slice();
        ed.newPh.forEach(function (np, i) { var ex = S._wc[np.id]; if (!ex) { ex = S._wc[np.id] = { n: maxN + 1 + i, name: np.name, items: [], custom: true, _oname: np.name, _id: np.id }; } ex.n = maxN + 1 + i; list.push(ex); });
        S.work = list.filter(function (p) { return edit || !ed.phGone[p.n]; });
        if (S.phase >= S.work.length) S.phase = 0;
      }
    };
    var _cv = clientView;
    clientView = function () {
      applyAll(); _cv();
      if (!S.client) return;
      var w = document.querySelector('.wrap'), tb = document.querySelector('.tabs');
      var ed2 = edits();
      var wk = document.querySelector('.wrap .work');
      if (wk) { if (ed2.view.nobars) wk.classList.add('nobars'); if (ed2.view.nocnt) wk.classList.add('nocnt'); if (ed2.view.noid) wk.classList.add('noid'); }
      if (tb && w && S.work && !document.querySelector('.seo-shell')) {
        tb.style.display = 'none';
        var nodes = []; for (var nn = tb.nextElementSibling; nn; nn = nn.nextElementSibling) nodes.push(nn);
        var main = document.createElement('div'); main.className = 'sh-main'; nodes.forEach(function (n2) { main.appendChild(n2); });
        var inWork = S.tab === 'work', CC = 62.83;
        var PI = ['🔎', '📍', '🛠️', '📄', '🧩', '⭐', '📚', '🔗', '🤖', '✅'];
        var phh = S.work.map(function (q, i) {
          var c2 = counts(q), pc = c2.total ? c2.done / c2.total : 0, col = PC[i % PC.length];
          return '<button class="phase ' + (inWork && i === S.phase ? 'on' : '') + '" style="--pc:' + col + '" data-a="phase" data-k="' + i + '" data-ph="' + q.n + '"><span class="l"><span class="pic"><svg class="ring" viewBox="0 0 26 26" aria-hidden="true"><circle class="rb" cx="13" cy="13" r="10"/><circle cx="13" cy="13" r="10" stroke="' + col + '" stroke-dasharray="' + CC + '" stroke-dashoffset="' + CC * (1 - pc) + '" transform="rotate(-90 13 13)"/></svg></span><span><span class="pnum">' + q.n + '. </span><span class="pname">' + esc(q.name) + '</span></span><span class="muted" style="font-size:12px;font-weight:600">' + c2.done + '/' + c2.total + '</span></span></button>';
        }).join('');
        var tls = TABS.filter(function (t) { return t[0] !== 'work' && t[0] !== 'dash'; }).map(function (t) {
          var bd = t[0] === 'baseline' && Sheets.dashStats().due.need ? '<span class="tbadge">' + Sheets.dashStats().due.need + '</span>' : '';
          return '<button class="toolb' + (S.tab === t[0] ? ' on' : '') + '" draggable="true" data-a="tab" data-k="' + t[0] + '"><span class="tname">' + esc(t[1]) + '</span>' + bd + '</button>';
        }).join('');
        var nums = '';
        try { var tmpn = document.createElement('div'); tmpn.innerHTML = dashView(); var ncard = tmpn.querySelectorAll('.two > div > .card')[3]; if (ncard) { var nh = ncard.querySelector('h2'); if (nh) nh.remove(); nums = ncard.innerHTML; } } catch (x) {}
        var lc2 = document.createElement('div'); lc2.className = 'leftcol';
        lc2.innerHTML = '<div><div class="rlabel" style="display:flex;align-items:center;justify-content:space-between">PHASES<button class="wchip' + (S.hideDone ? ' on' : '') + '" data-wv="hide" aria-pressed="' + !!S.hideDone + '">Hide done</button></div><nav class="phases" aria-label="Phases">' + phh + '</nav></div><div class="toolrail"><div class="rlabel">TOOLS</div><div class="toolgrid">' + tls + '<button class="toolb newt" data-ed="newtab" title="New table">+ Table</button></div></div>' + (nums ? '<div class="numcard"><div class="rlabel">NUMBERS</div>' + nums + '</div>' : '') + '<div class="rhint">Double-click a name to rename it. Drag tools to reorder.</div>';
        var shell = document.createElement('div'); shell.className = 'seo-shell'; shell.appendChild(lc2); shell.appendChild(main); tb.insertAdjacentElement('afterend', shell);
      }
      var two = document.querySelector('.wrap .two');
      if (S.tab === 'dash' && two) {
        var cards = Array.prototype.slice.call(two.querySelectorAll(':scope > div > .card'));
        if (cards.length === 5) {
          var IDS = ['progress', 'focus', 'phases', 'numbers', 'links'], NAMES = { progress: 'Progress bar', focus: 'Focus', phases: 'Phases', numbers: 'Numbers', links: 'Quick links' }, byId = {};
          cards.forEach(function (c, i) { byId[IDS[i]] = c; c.setAttribute('data-blk', IDS[i]); });
          var dc = ed2.dash, colOf = function (id) { return dc.col[id] || (IDS.indexOf(id) < 3 ? 'l' : 'r'); };
          var order = dc.ord.filter(function (id) { return byId[id]; }); IDS.forEach(function (id) { if (order.indexOf(id) < 0) order.push(id); });
          var colsEl = two.querySelectorAll(':scope > div'), L = colsEl[0], R = colsEl[1];
          order.forEach(function (id) {
            var c = byId[id], gone = !!dc.gone[id];
            if (gone && !S.edit) { c.remove(); return; }
            (colOf(id) === 'l' ? L : R).appendChild(c);
            if (gone) c.classList.add('blkgone');
            if (S.edit) {
              var colIds = order.filter(function (x) { return colOf(x) === colOf(id); }), ci = colIds.indexOf(id);
              c.setAttribute('data-dt', 'blk'); c.setAttribute('data-id', id); c.insertAdjacentHTML('afterbegin', '<div class="blkbar" draggable="true" data-dd="blk" data-id="' + id + '"><b>⋮⋮ ' + NAMES[id] + (gone ? ' (hidden)' : '') + '</b><span>' +
                '<button data-ed="blkmv" data-b="' + id + '" data-d="-1"' + (ci === 0 ? ' disabled' : '') + ' aria-label="Move up">↑</button><button data-ed="blkmv" data-b="' + id + '" data-d="1"' + (ci === colIds.length - 1 ? ' disabled' : '') + ' aria-label="Move down">↓</button>' +
                '<button data-ed="blkcol" data-b="' + id + '" aria-label="Move to the other column">' + (colOf(id) === 'l' ? '→' : '←') + '</button>' +
                '<button data-ed="' + (gone ? 'blkshow' : 'blkhide') + '" data-b="' + id + '">' + (gone ? 'Show' : 'Hide') + '</button></span></div>');
            }
          });
          var nc = byId.numbers; if (nc) Array.prototype.slice.call(nc.querySelectorAll('.kv')).forEach(function (kv) {
            var lab = (kv.querySelector('.muted') || {}).textContent || '', gone = !!dc.kv[lab];
            if (gone && !S.edit) { kv.remove(); return; }
            if (gone) kv.classList.add('blkgone');
            if (S.edit) kv.insertAdjacentHTML('beforeend', '<button class="pxx" data-ed="' + (gone ? 'kvshow' : 'kvhide') + '" data-k="' + esc(lab) + '" aria-label="' + (gone ? 'Show row' : 'Hide row') + '" style="margin-left:8px">' + (gone ? '+' : '✕') + '</button>');
          });
        }
      }
    };
    var tabPanel = function (tab) {
      var ed = edits(), SP = window.__SPECS, cust = ed.tabs.find(function (t) { return t.id === tab; }), name = cust ? cust.title : (ed.tabsRen[tab] || (SP && SP[tab] ? SP[tab]._t0 : (TABS0.find(function (t) { return t[0] === tab; }) || [0, tab])[1]));
      var cols = cust ? cust.cols : (SP && SP[tab] ? SP[tab].cols : null), gone = !!ed.tabsGone[tab];
      var h = '<div class="card editp"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><b>This table</b>' + inp('data-ed="tabname" data-t="' + tab + '" aria-label="Table name"', name, '', 'max-width:280px');
      h += cust ? '<button class="btn small" data-ed="tabdel" data-t="' + tab + '">' + (S.confirmDel === tab ? 'Click again to delete the table and its data' : 'Delete table') + '</button>' : '<button class="btn small" data-ed="' + (gone ? 'tabrestore' : 'tabhide') + '" data-t="' + tab + '">' + (gone ? 'Restore table' : 'Hide table') + '</button>';
      h += '</div>';
      if (cols) {
        h += '<div class="pxl" style="margin:12px 0 6px">Columns</div><div class="row" style="gap:8px;flex-wrap:wrap">' + cols.map(function (c) { return '<span class="colchip">' + inp('data-ed="colren" data-t="' + tab + '" data-k="' + esc(c.k) + '" aria-label="Column name"', c.label, '', 'width:150px') + (c.first ? '' : '<button class="pxx" data-ed="coldel" data-t="' + tab + '" data-k="' + esc(c.k) + '" aria-label="Delete column">✕</button>') + '</span>'; }).join('') +
          '<span class="colchip"><input class="pxin" id="newcol" type="text" placeholder="New column name" style="width:150px"><button class="btn small" data-ed="coladd" data-t="' + tab + '">+ Add column</button></span></div>';
      }
      return h + '</div>';
    };
    var cxTable = function (t) {
      var head = '<tr><th class="rn" style="left:0;z-index:4"></th>' + t.cols.map(function (c) { return '<th style="min-width:170px">' + esc(c.label) + '</th>'; }).join('') + '<th style="width:34px"></th></tr>';
      var rows = (t.rows.length ? t.rows : []).map(function (r, i) { return '<tr><td class="rn">' + (i + 1) + '</td>' + t.cols.map(function (c) { return '<td><input class="cell" data-cx="' + t.id + '" data-r="' + r.id + '" data-k="' + c.k + '" value="' + esc((r.v || {})[c.k] || '') + '" autocomplete="off" aria-label="' + esc(c.label) + '"></td>'; }).join('') + '<td style="width:34px"><button class="delx" data-ed="cxdel" data-t="' + t.id + '" data-r="' + r.id + '" aria-label="Delete row">✕</button></td></tr>'; }).join('');
      return '<div class="sheetbar"><h2 style="font-size:22px">' + esc(t.title) + '</h2></div><div class="sheetwrap"><table class="sheet"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div><div class="row addrow"><button class="btn" data-ed="cxadd" data-t="' + t.id + '">+ Add 5 rows</button></div>';
    };
    var baseEditor = function () {
      var ed = edits(), rows = '', secs = S.baselineDef.filter(function (m) { return m.section; });
      S.baselineDef.forEach(function (m) {
        if (m.section) { rows += '<div class="sub edsec">' + inp('data-ed="bsec" data-o="' + esc(m._o || m.section) + '" aria-label="Section name"', m.section) + '<button class="btn small" data-ed="bmadd" data-o="' + esc(m._o || '') + '">+ Add metric</button></div>'; return; }
        rows += '<div class="erow' + (m._gone ? ' gone' : '') + '"><div class="ebody">' + inp('data-ed="bm" data-f="label" data-k="' + m.id + '" aria-label="Metric"' + (m._gone ? ' disabled' : ''), m.label) +
          '<div class="row" style="gap:8px">' + inp('data-ed="bm" data-f="where" data-k="' + m.id + '" placeholder="Where to find it" aria-label="Where to find it"' + (m._gone ? ' disabled' : ''), m.where || '', '', 'flex:1') +
          '<select class="pxsel" data-ed="bm" data-f="freq" data-k="' + m.id + '"' + (m._gone ? ' disabled' : '') + '>' + ['Monthly', 'Weekly', 'Every 2 months', 'Quarterly', 'One-off'].map(function (f) { return '<option' + (f === m.freq ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></div></div>' +
          (m._gone ? '<button class="btn small" data-ed="bmrestore" data-k="' + m.id + '">Restore</button>' : '<button class="pxx edel" data-ed="bmdel" data-k="' + m.id + '" aria-label="Delete metric">✕</button>') + '</div>';
      });
      return '<div class="sheetbar"><h2 style="font-size:22px">Baseline and monthly results</h2></div><div class="card" style="padding:10px">' + rows + '<div class="row" style="padding:10px"><button class="btn" data-ed="bsecadd">+ Add section</button></div></div>';
    };
    var _sr = Sheets.render;
    Sheets.render = function (tab) {
      var ed = edits(), cust = ed.tabs.find(function (t) { return t.id === tab; });
      if (!S.edit) return cust ? cxTable(cust) : _sr(tab);
      var pnl = tab === 'journal' || cust || window.__SPECS ? tabPanel(tab) : '';
      if (cust) return pnl + cxTable(cust);
      if (tab === 'baseline') return pnl + baseEditor();
      return pnl + _sr(tab);
    };
    var _av = accessView;
    accessView = function () {
      if (!S.edit) return _av();
      var ed = edits();
      return '<div class="card" style="max-width:720px"><h2 style="font-size:18px;margin-bottom:8px">Access and setup</h2>' + ACCESS.map(function (a) { var added = ed.acc.add.some(function (x) { return x.id === a[0]; }), g = ed.acc.gone[a[0]], t = g ? a[1].replace(/ \(hidden\)$/, '') : a[1];
        return '<div class="erow' + (g ? ' gone' : '') + '"><div class="ebody">' + inp('data-ed="acc" data-k="' + a[0] + '" aria-label="Item"' + (g ? ' disabled' : ''), t) + '</div>' + (g ? '<button class="btn small" data-ed="accrestore" data-k="' + a[0] + '">Restore</button>' : '<button class="pxx edel" data-ed="accdel" data-k="' + a[0] + '" aria-label="Delete item">✕</button>') + '</div>'; }).join('') +
        '<div class="row" style="padding:10px 0"><button class="btn" data-ed="accadd">+ Add item</button></div></div>';
    };
    var wph = function () { return S.work && S.work[S.phase]; };
    var phItems = function () { var p = wph(); return p ? p.items : []; };
    var act = {
      start: function () { S.edit = true; },
      done: function () { S.edit = false; },
      del: function (d, ed) { var k = d.k; if (customs().some(function (c) { return c.id === k; })) { if (S.sel === k) S.sel = null; save(customs().filter(function (c) { return c.id !== k; })); } else { var g = Object.assign({}, ed.gone); g[k] = true; saveEd({ gone: g }); } },
      restore: function (d, ed) { var g = Object.assign({}, ed.gone); delete g[d.k]; saveEd({ gone: g }); },
      up: function (d, ed) { mvOrd(d.k, -1, ed); }, down: function (d, ed) { mvOrd(d.k, 1, ed); },
      secadd: function (d, ed) { var p = wph(), a = Object.assign({}, ed.addSec); a[p.n] = (a[p.n] || []).concat([{ id: rid('s'), text: 'New section' }]); saveEd({ addSec: a }); },
      secdel: function (d, ed) {
        var p = wph(), o = d.o, a = Object.assign({}, ed.addSec);
        if ((a[p.n] || []).some(function (x) { return x.id === o; })) { a[p.n] = a[p.n].filter(function (x) { return x.id !== o; }); save(customs().filter(function (c) { return c.sec !== o; })); saveEd({ addSec: a }); }
        else { var g = Object.assign({}, ed.secGone); g[o] = true; saveEd({ secGone: g }); }
      },
      secrestore: function (d, ed) { var g = Object.assign({}, ed.secGone); delete g[d.o]; saveEd({ secGone: g }); },
      phadd: function (d, ed) { saveEd({ newPh: ed.newPh.concat([{ id: rid('p'), name: 'New phase' }]) }); S.phase = (S.work ? S.work.length : 0); S._goLast = true; },
      phhide: function (d, ed) { var p = wph(), g = Object.assign({}, ed.phGone); g[p.n] = true; saveEd({ phGone: g }); },
      phrestore: function (d, ed) { var p = wph(), g = Object.assign({}, ed.phGone); delete g[p.n]; saveEd({ phGone: g }); },
      phdel: function (d, ed) { var p = wph(); if (S.confirmDel !== 'ph' + p.n) { S.confirmDel = 'ph' + p.n; return; } S.confirmDel = ''; saveEd({ newPh: ed.newPh.filter(function (x) { return x.id !== p._id; }) }); save(customs().filter(function (c) { return phN(c) !== p.n; })); delete S._wc[p._id]; S.phase = 0; },
      newtab: function (d, ed) { var id = 't' + Math.random().toString(36).replace(/[^a-z]/g, '').slice(0, 8) + 'x'; saveEd({ tabs: ed.tabs.concat([{ id: id, title: 'New table', cols: [{ k: 'a', label: 'Column 1' }, { k: 'b', label: 'Column 2' }, { k: 'c', label: 'Column 3' }], rows: [1, 2, 3, 4, 5].map(function () { return { id: rid('r'), v: {} }; }) }]) }); S.tab = id; },
      tabhide: function (d, ed) { var g = Object.assign({}, ed.tabsGone); g[d.t] = true; saveEd({ tabsGone: g }); S.tab = 'work'; },
      tabrestore: function (d, ed) { var g = Object.assign({}, ed.tabsGone); delete g[d.t]; saveEd({ tabsGone: g }); },
      tabdel: function (d, ed) { if (S.confirmDel !== d.t) { S.confirmDel = d.t; return; } S.confirmDel = ''; saveEd({ tabs: ed.tabs.filter(function (t) { return t.id !== d.t; }) }); S.tab = 'work'; },
      coladd: function (d, ed) {
        var v = (document.getElementById('newcol') || {}).value || ''; v = v.trim(); if (!v) { toast('Type a column name first'); return; }
        var cust = ed.tabs.find(function (t) { return t.id === d.t; });
        if (cust) saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { cols: t.cols.concat([{ k: rid('k'), label: v }]) }) : t; }) });
        else { var c = Object.assign({}, ed.cols), ce = Object.assign({ gone: {}, ren: {}, add: [] }, c[d.t]); ce.add = ce.add.concat([{ k: rid('x'), label: v }]); c[d.t] = ce; saveEd({ cols: c }); }
      },
      coldel: function (d, ed) {
        var cust = ed.tabs.find(function (t) { return t.id === d.t; });
        if (cust) saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { cols: t.cols.filter(function (c) { return c.k !== d.k; }) }) : t; }) });
        else { var c = Object.assign({}, ed.cols), ce = Object.assign({ gone: {}, ren: {}, add: [] }, c[d.t]); if (ce.add.some(function (a) { return a.k === d.k; })) ce.add = ce.add.filter(function (a) { return a.k !== d.k; }); else { ce.gone = Object.assign({}, ce.gone); ce.gone[d.k] = true; } c[d.t] = ce; saveEd({ cols: c }); }
      },
      cxadd: function (d, ed) { saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { rows: t.rows.concat([1, 2, 3, 4, 5].map(function () { return { id: rid('r'), v: {} }; })) }) : t; }) }); },
      cxdel: function (d, ed) { saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { rows: t.rows.filter(function (r) { return r.id !== d.r; }) }) : t; }) }); },
      accadd: function (d, ed) { var a = Object.assign({}, ed.acc); a.add = (a.add || []).concat([{ id: rid('ax'), text: 'New access item' }]); saveEd({ acc: a }); },
      accdel: function (d, ed) { var a = Object.assign({}, ed.acc); if ((a.add || []).some(function (x) { return x.id === d.k; })) a.add = a.add.filter(function (x) { return x.id !== d.k; }); else { a.gone = Object.assign({}, a.gone); a.gone[d.k] = true; } saveEd({ acc: a }); },
      accrestore: function (d, ed) { var a = Object.assign({}, ed.acc); a.gone = Object.assign({}, a.gone); delete a.gone[d.k]; saveEd({ acc: a }); },
      bmadd: function (d, ed) { var b = Object.assign({}, ed.base); b.add = (b.add || []).concat([{ id: rid('bx'), label: 'New metric', where: '', freq: 'Monthly', sec: d.o || '' }]); saveEd({ base: b }); },
      bmdel: function (d, ed) { var b = Object.assign({}, ed.base); if ((b.add || []).some(function (x) { return x.id === d.k; })) b.add = b.add.filter(function (x) { return x.id !== d.k; }); else { b.gone = Object.assign({}, b.gone); b.gone[d.k] = true; } saveEd({ base: b }); },
      bmrestore: function (d, ed) { var b = Object.assign({}, ed.base); b.gone = Object.assign({}, b.gone); delete b.gone[d.k]; saveEd({ base: b }); },
      tabmv: function (d, ed) { var ids = TABS.map(function (t) { return t[0]; }), i = ids.indexOf(d.t), j = i + (+d.d); if (i < 0 || j < 0 || j >= ids.length) return; var t = ids[i]; ids[i] = ids[j]; ids[j] = t; saveEd({ tabOrd: ids }); },
      viewtog: function (d, ed) { var v = Object.assign({}, ed.view); if (v[d.v]) delete v[d.v]; else v[d.v] = true; saveEd({ view: v }); },
      blkmv: function (d, ed) { var IDS = ['progress', 'focus', 'phases', 'numbers', 'links'], dc = ed.dash, order = dc.ord.filter(function (x) { return IDS.indexOf(x) >= 0; }); IDS.forEach(function (x) { if (order.indexOf(x) < 0) order.push(x); }); var col = function (x) { return dc.col[x] || (IDS.indexOf(x) < 3 ? 'l' : 'r'); }, same = order.filter(function (x) { return col(x) === col(d.b); }), i = same.indexOf(d.b), o = same[i + (+d.d)]; if (!o) return; var a = order.indexOf(d.b), b = order.indexOf(o); order[a] = o; order[b] = d.b; saveEd({ dash: Object.assign({}, dc, { ord: order }) }); },
      blkcol: function (d, ed) { var IDS = ['progress', 'focus', 'phases', 'numbers', 'links'], dc = ed.dash, c = Object.assign({}, dc.col), cur = c[d.b] || (IDS.indexOf(d.b) < 3 ? 'l' : 'r'); c[d.b] = cur === 'l' ? 'r' : 'l'; saveEd({ dash: Object.assign({}, dc, { col: c }) }); },
      blkhide: function (d, ed) { var g = Object.assign({}, ed.dash.gone); g[d.b] = true; saveEd({ dash: Object.assign({}, ed.dash, { gone: g }) }); },
      blkshow: function (d, ed) { var g = Object.assign({}, ed.dash.gone); delete g[d.b]; saveEd({ dash: Object.assign({}, ed.dash, { gone: g }) }); },
      kvhide: function (d, ed) { var g = Object.assign({}, ed.dash.kv); g[d.k] = true; saveEd({ dash: Object.assign({}, ed.dash, { kv: g }) }); },
      kvshow: function (d, ed) { var g = Object.assign({}, ed.dash.kv); delete g[d.k]; saveEd({ dash: Object.assign({}, ed.dash, { kv: g }) }); },
      bsecadd: function (d, ed) { var b = Object.assign({}, ed.base); b.addSec = (b.addSec || []).concat([{ id: rid('bs'), label: 'New section' }]); saveEd({ base: b }); }
    };
    var mvOrd = function (id, dir, ed) {
      var p = wph(); if (!p) return; var its = p.items, i = its.findIndex(function (x) { return x.id === id; }), o = its[i + dir];
      if (i < 0 || !o || o.kind === 's') return;
      var ids = its.filter(function (x) { return x.kind !== 's'; }).map(function (x) { return x.id; }), a = ids.indexOf(id), b = ids.indexOf(o.id), t = ids[a]; ids[a] = ids[b]; ids[b] = t;
      var ord = Object.assign({}, ed.ord); ord[p.n] = ids; saveEd({ ord: ord });
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ed]'); if (!b || !S.client || !act[b.dataset.ed]) return; e.stopPropagation(); e.preventDefault();
      act[b.dataset.ed](b.dataset, edits()); render();
      if (S._goLast) { S._goLast = false; S.phase = S.work.length - 1; render(); }
    }, true);
    var ddDrop = {
      tab: function (dr, tg, after, ed) { var ids = TABS.map(function (t) { return t[0]; }).filter(function (x) { return x !== dr; }), i = ids.indexOf(tg); if (i < 0) return; ids.splice(after ? i + 1 : i, 0, dr); saveEd({ tabOrd: ids }); },
      blk: function (dr, tg, after, ed) { var IDS = ['progress', 'focus', 'phases', 'numbers', 'links'], dc = ed.dash, order = dc.ord.filter(function (x) { return IDS.indexOf(x) >= 0; }); IDS.forEach(function (x) { if (order.indexOf(x) < 0) order.push(x); }); var col = function (x) { return dc.col[x] || (IDS.indexOf(x) < 3 ? 'l' : 'r'); }; order = order.filter(function (x) { return x !== dr; }); var i = order.indexOf(tg); if (i < 0) return; order.splice(after ? i + 1 : i, 0, dr); var c = Object.assign({}, dc.col); c[dr] = col(tg); saveEd({ dash: Object.assign({}, dc, { ord: order, col: c }) }); },
      task: function (dr, tg, after, ed) { var p = wph(); if (!p) return; var ids = p.items.filter(function (x) { return x.kind !== 's'; }).map(function (x) { return x.id; }); var di = ids.findIndex(function (x) { return String(x) === dr; }); if (di < 0) return; var dv = ids[di]; ids.splice(di, 1); var ti = ids.findIndex(function (x) { return String(x) === tg; }); if (ti < 0) return; ids.splice(after ? ti + 1 : ti, 0, dv); var ord = Object.assign({}, ed.ord); ord[p.n] = ids; saveEd({ ord: ord }); }
    };
    var ddClear = function () { document.querySelectorAll('.ddt,.ddb').forEach(function (x) { x.classList.remove('ddt', 'ddb'); }); };
    document.addEventListener('dragstart', function (e) { var h = e.target.closest && e.target.closest('[data-dd]'); if (!h || !S.edit) return; S._dd = { k: h.dataset.dd, id: h.dataset.id }; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'dd'); } catch (x) {} }, true);
    document.addEventListener('dragend', function () { S._dd = null; ddClear(); }, true);
    document.addEventListener('dragover', function (e) { var d = S._dd; if (!d) return; var t = e.target.closest('[data-dt="' + d.k + '"]'); if (!t) return; e.preventDefault(); var r = t.getBoundingClientRect(), after = d.k === 'tab' ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2; ddClear(); if (t.dataset.id !== d.id) t.classList.add(after ? 'ddb' : 'ddt'); }, true);
    document.addEventListener('drop', function (e) { var d = S._dd; if (!d) return; var t = e.target.closest('[data-dt="' + d.k + '"]'); if (!t) return; e.preventDefault(); e.stopPropagation(); var r = t.getBoundingClientRect(), after = d.k === 'tab' ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2; S._dd = null; ddClear(); if (t.dataset.id !== d.id && ddDrop[d.k]) { ddDrop[d.k](d.id, t.dataset.id, after, edits()); render(); } }, true);
    document.addEventListener('keydown', function (e) {
      if (!((e.metaKey || e.ctrlKey) && (e.key || '').toLowerCase() === 'z' && !e.shiftKey) || !S.edit || !S.client) return;
      var tg = e.target; if (tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable)) return;
      var us = S._edUndo || []; if (!us.length) return; e.preventDefault();
      var prev = JSON.parse(us.pop()); S._restoring = true; S.client.meta = S.client.meta || {}; S.client.meta._edits = prev;
      api('/clients/' + S.client.id + '/meta', 'POST', { key: '_edits', patch: prev }).catch(function () {}); S._restoring = false; render(); toast('Undone');
    });
    var chg = {
      ph: function (v, d, ed) { var ph = Object.assign({}, ed.ph); if (v) ph[d.n] = v; else delete ph[d.n]; saveEd({ ph: ph }); },
      sec: function (v, d, ed) { var sc = Object.assign({}, ed.sec); if (v) sc[d.o] = v; else delete sc[d.o]; saveEd({ sec: sc }); },
      text: function (v, d, ed, t) { if (!v) return true; fld('text', v, d, ed); }, how: function (v, d, ed, t) { fld('how', t.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean), d, ed); },
      mv: function (v, d, ed) { if (!v) return; var cu = customs().find(function (c) { return c.id === d.k; }); if (cu) save(customs().map(function (c) { return c.id === d.k ? Object.assign({}, c, { sec: v }) : c; })); else { var m = Object.assign({}, ed.mv); m[d.k] = v; saveEd({ mv: m }); } },
      tabname: function (v, d, ed) { if (!v) return true; var cust = ed.tabs.find(function (t) { return t.id === d.t; }); if (cust) saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { title: v }) : t; }) }); else { var r = Object.assign({}, ed.tabsRen); r[d.t] = v; saveEd({ tabsRen: r }); } },
      colren: function (v, d, ed) { if (!v) return true; var cust = ed.tabs.find(function (t) { return t.id === d.t; }); if (cust) saveEd({ tabs: ed.tabs.map(function (t) { return t.id === d.t ? Object.assign({}, t, { cols: t.cols.map(function (c) { return c.k === d.k ? Object.assign({}, c, { label: v }) : c; }) }) : t; }) }); else { var c = Object.assign({}, ed.cols), ce = Object.assign({ gone: {}, ren: {}, add: [] }, c[d.t]); if (ce.add.some(function (a) { return a.k === d.k; })) ce.add = ce.add.map(function (a) { return a.k === d.k ? Object.assign({}, a, { label: v }) : a; }); else { ce.ren = Object.assign({}, ce.ren); ce.ren[d.k] = v; } c[d.t] = ce; saveEd({ cols: c }); } },
      acc: function (v, d, ed) { if (!v) return true; var a = Object.assign({}, ed.acc); if ((a.add || []).some(function (x) { return x.id === d.k; })) a.add = a.add.map(function (x) { return x.id === d.k ? Object.assign({}, x, { text: v }) : x; }); else { a.ren = Object.assign({}, a.ren); a.ren[d.k] = v; } saveEd({ acc: a }); },
      bm: function (v, d, ed) { var b = Object.assign({}, ed.base), f = d.f; if ((b.add || []).some(function (x) { return x.id === d.k; })) b.add = b.add.map(function (x) { if (x.id !== d.k) return x; var n = Object.assign({}, x); n[f] = v; return n; }); else { b.ren = Object.assign({}, b.ren); var r = Object.assign({}, b.ren[d.k]); r[f] = v; b.ren[d.k] = r; } saveEd({ base: b }); },
      bsec: function (v, d, ed) { if (!v) return true; var b = Object.assign({}, ed.base); if ((b.addSec || []).some(function (x) { return x.id === d.o; })) b.addSec = b.addSec.map(function (x) { return x.id === d.o ? Object.assign({}, x, { label: v }) : x; }); else { b.secRen = Object.assign({}, b.secRen); b.secRen[d.o] = v; } saveEd({ base: b }); }
    };
    var fld = function (kind, val, d, ed) {
      var cu = customs().find(function (c) { return c.id === d.k; });
      if (cu) save(customs().map(function (c) { if (c.id !== d.k) return c; var n = Object.assign({}, c); n[kind] = val; return n; }));
      else { var it = Object.assign({}, ed.items), cur = Object.assign({}, it[d.k]); cur[kind] = val; it[d.k] = cur; saveEd({ items: it }); }
    };
    document.addEventListener('change', function (e) {
      var t = e.target, d = t.dataset || {};
      if (d.cx) { e.stopPropagation(); var ed0 = edits(); saveEd({ tabs: ed0.tabs.map(function (x) { return x.id !== d.cx ? x : Object.assign({}, x, { rows: x.rows.map(function (r) { if (r.id !== d.r) return r; var v = Object.assign({}, r.v); v[d.k] = t.value; return Object.assign({}, r, { v: v }); }) }); }) }); return; }
      if (!d.ed || !S.client || !chg[d.ed]) return; e.stopPropagation();
      var skip = chg[d.ed](t.value.trim(), d, edits(), t); render();
    }, true);
    ['keydown', 'keyup', 'keypress', 'input'].forEach(function (ev) { document.addEventListener(ev, function (e) { var d = e.target.dataset || {}; if (d.ed || d.cx) { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); } }, true); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ct]'); if (!b || !S.client) return; e.stopPropagation();
      var a = b.dataset.ct, v = +b.dataset.v, i = +b.dataset.i, k = S.sel, m = k ? meta(k) : {};
      if (a === 'open') { S.ctOpen = true; render(); var t = document.querySelector('[data-ct-in="text"]'); if (t) t.focus(); }
      else if (a === 'close') { S.ctOpen = false; S.ctText = ''; render(); }
      else if (a === 'add') {
        var lines = (S.ctText || '').split('\n').map(function (l) { return l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim(); }).filter(Boolean);
        if (!lines.length) { toast('Type a task first'); return; }
        var rep = S.ctRep || 'Does not repeat', list = customs().slice(), ph = S.work[S.phase].n;
        lines.forEach(function (l, j) { list.push({ id: 'c' + Date.now().toString(36) + j, text: l, rep: rep, ph: ph, sec: S.ctSec || '' }); });
        S.ctOpen = false; S.ctText = ''; S.ctRep = ''; S.ctSec = ''; save(list); render(); toast(lines.length > 1 ? lines.length + ' tasks added' : 'Task added');
      }
      else if (a === 'del') { var id = S.sel; S.sel = null; delete S.client.marks[id]; save(customs().filter(function (c) { return c.id !== id; })); api('/clients/' + S.client.id + '/mark', 'POST', { key: id, status: null }).catch(function () {}); render(); }
      else if (a === 'est' && k) setM([k], { est: m.est === v ? 0 : v });
      else if (a === 'log' && k) setM([k], { spent: Math.max(0, (m.spent || 0) + v) });
      else if (a === 'subt' && k) setM([k], { subs: (m.subs || []).map(function (s, j) { return j === i ? { name: s.name, done: !s.done } : s; }) });
      else if (a === 'subx' && k) setM([k], { subs: (m.subs || []).filter(function (s, j) { return j !== i; }) });
    }, true);
    document.addEventListener('input', function (e) { var f = e.target.dataset && e.target.dataset.ctIn; if (f === 'text') { S.ctText = e.target.value; var b = document.querySelector('[data-ct="add"]'); if (b) { var n = S.ctText.split('\n').filter(function (l) { return l.trim(); }).length; b.textContent = n > 1 ? 'Add ' + n + ' tasks' : 'Add task'; } } }, true);
    document.addEventListener('change', function (e) {
      var d = e.target.dataset || {}; if (d.ctIn === 'rep') { S.ctRep = e.target.value; e.stopPropagation(); return; } if (d.ctIn === 'sec') { S.ctSec = e.target.value; e.stopPropagation(); return; }
      if (!S.client || !S.sel) return;
      if (d.cf === 'rep') { e.stopPropagation(); setM([S.sel], { rep: e.target.value }); }
      else if (d.cf === 'time') { e.stopPropagation(); setM([S.sel], { time: e.target.value }); }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target.dataset || e.target.dataset.cf !== 'sub' || !S.sel) return;
      e.preventDefault(); var v = e.target.value.trim(); if (!v) return;
      setM([S.sel], { subs: (meta(S.sel).subs || []).concat([{ name: v, done: false }]) });
      var n = document.querySelector('[data-cf="sub"]'); if (n) n.focus();
    }, true);
    document.addEventListener('keydown', function (e) { var t = e.target; if (!t || !t.dataset || t.dataset.fa !== 'line') return; e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey && t.value.trim()) { e.preventDefault(); var v = t.value; t.value = ''; addLines(v); } }, true);
    document.addEventListener('paste', function (e) { var t = e.target; if (!t || !t.dataset || t.dataset.fa !== 'line') return; var tx = (e.clipboardData || window.clipboardData).getData('text') || ''; if (/\n/.test(tx.trim())) { e.preventDefault(); e.stopPropagation(); addLines(tx); } }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-wv]'); if (!b || !S.client) return; e.stopPropagation();
      var v = b.dataset.wv;
      if (v === 'hide') S.hideDone = !S.hideDone; else { S.wv = v; try { localStorage.setItem('srwv', v); } catch (x) {} }
      render();
    }, true);
    /* ---- rename by double-click, drag tools to reorder (Notion style) ---- */
    var inlineEdit = function (el, cur, onSave) {
      if (!el || document.querySelector('input.inl')) return;
      var r = el.getBoundingClientRect(), inp = document.createElement('input'); inp.className = 'inl'; inp.value = cur;
      inp.style.cssText = 'position:fixed;z-index:9999;left:' + (r.left - 4) + 'px;top:' + (r.top - 3) + 'px;width:' + Math.max(140, r.width + 24) + 'px;height:' + (r.height + 6) + 'px;box-sizing:border-box';
      document.body.appendChild(inp); inp.focus(); inp.select();
      var done = false, fin = function (ok) { if (done) return; done = true; var v = inp.value.trim(); inp.remove(); if (ok && v && v !== cur) onSave(v); };
      inp.addEventListener('blur', function () { fin(true); });
      inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); fin(true); } else if (e.key === 'Escape') fin(false); });
    };
    var lastClk = { k: '', t: 0 };
    var renameTarget = function (kind, key) {
      if (kind === 'ph') { var el = document.querySelector('.leftcol .phase[data-ph="' + key + '"] .pname'); if (!el) return; inlineEdit(el, el.textContent, function (v) { var ed = edits(), o = Object.assign({}, ed.ph); o[+key] = v; saveEd({ ph: o }); render(); }); }
      else if (kind === 'tool') { var el2 = document.querySelector('.leftcol .toolb[data-k="' + key + '"] .tname'); if (!el2) return; inlineEdit(el2, el2.textContent, function (v) { var ed = edits(), o = Object.assign({}, ed.tabsRen); o[key] = v; saveEd({ tabsRen: o }); render(); }); }
      else if (kind === 'task') { var row = document.querySelector('.task .tx[data-k="' + key + '"] .tt'); if (!row) return; inlineEdit(row, row.textContent, function (v) { var cs = customs(); if (cs.some(function (c) { return c.id === key; })) save(cs.map(function (c) { return c.id === key ? Object.assign({}, c, { text: v }) : c; })); else { var ed = edits(), it = Object.assign({}, ed.items), prev = it[key] || {}; it[key] = Object.assign({}, prev, { text: v }); saveEd({ items: it }); } render(); }); }
    };
    document.addEventListener('click', function (e) {
      if (!S.client) return; var t = e.target, kind = '', key = '';
      var pb = t.closest && t.closest('.leftcol .phase'); if (pb) { if (S.tab !== 'work') S.tab = 'work'; kind = 'ph'; key = pb.getAttribute('data-ph'); }
      else { var tb2 = t.closest && t.closest('.leftcol .toolb[data-k]'); if (tb2) { kind = 'tool'; key = tb2.getAttribute('data-k'); } else { var tx = t.closest && t.closest('.task .tx[data-k]'); if (tx && t.closest('.tt')) { kind = 'task'; key = tx.getAttribute('data-k'); } } }
      if (!kind) { lastClk = { k: '', t: 0 }; return; }
      var id = kind + ':' + key, now = Date.now();
      if (lastClk.k === id && now - lastClk.t < 450) { lastClk = { k: '', t: 0 }; setTimeout(function () { renameTarget(kind, key); }, 60); }
      else lastClk = { k: id, t: now };
    }, true);
    var tdrag = null;
    document.addEventListener('dragstart', function (e) { var b = e.target.closest && e.target.closest('.leftcol .toolb[data-k]'); if (!b) return; tdrag = b.getAttribute('data-k'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'tool:' + tdrag); } catch (x) {} }, true);
    document.addEventListener('dragover', function (e) { if (tdrag && e.target.closest && e.target.closest('.leftcol .toolb[data-k]')) e.preventDefault(); }, true);
    document.addEventListener('drop', function (e) {
      var b = e.target.closest && e.target.closest('.leftcol .toolb[data-k]'); if (!tdrag || !b) return; e.preventDefault();
      var d = tdrag; tdrag = null; var tg = b.getAttribute('data-k'), ids = TABS.map(function (t) { return t[0]; }).filter(function (x) { return x !== d; }), i = ids.indexOf(tg); if (i < 0 || d === tg) return; var r = b.getBoundingClientRect(); ids.splice(e.clientX > r.left + r.width / 2 ? i + 1 : i, 0, d); saveEd({ tabOrd: ids }); render();
    }, true);
    var hp = null, hpT = 0, hpPin = false;
    var hpClose = function () { if (hp) { hp.remove(); hp = null; } hpPin = false; };
    var hpShow = function (pill) {
      var id = pill.getAttribute('data-k') || (pill.closest('.tx') && pill.closest('.tx').getAttribute('data-k')); if (!id || !S.client) return;
      var t = findTask(id); if (!t) return;
      if (hp && hp.getAttribute('data-k') === id) return; hpClose();
      var tl = taskLinks(t, S.client);
      hp = document.createElement('div'); hp.className = 'howpop'; hp.setAttribute('data-k', id);
      hp.innerHTML = '<div class="hpt">' + esc(t.text) + '</div>' + howHtml(t) + (tl.length ? linkList(tl) : '');
      document.body.appendChild(hp);
      var r = pill.getBoundingClientRect(), w = Math.min(360, window.innerWidth - 24);
      hp.style.width = w + 'px'; hp.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left - 20)) + 'px';
      var h = hp.offsetHeight, top = r.bottom + 6; if (top + h > window.innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6; hp.style.top = Math.max(8, top) + 'px';
      hp.addEventListener('mouseenter', function () { clearTimeout(hpT); }); hp.addEventListener('mouseleave', function () { if (!hpPin) hpT = setTimeout(hpClose, 250); });
    };
    var isHow = function (e) { var b = e.target.closest && e.target.closest('.task .hw, .task .tx .pill'); return b && b.textContent.trim() === 'How' ? b : null; };
    var findTask = function (id) { var out = null; (S.work || []).forEach(function (ph) { if (out) return; try { out = tasksOf(ph).find(function (q) { return q.id === id; }) || null; } catch (x) {} }); return out; };
    window.addEventListener('click', function (e) {
      var b = isHow(e);
      if (b) { e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault(); if (hp && hpPin) { hpClose(); return; } hpShow(b); hpPin = true; return; }
      if (hp && !e.target.closest('.howpop')) hpClose();
    }, true);
    document.addEventListener('mouseover', function (e) { var b = isHow(e); if (b) { clearTimeout(hpT); hpShow(b); } }, true);
    document.addEventListener('mouseout', function (e) { var b = isHow(e); if (b && !hpPin) { clearTimeout(hpT); hpT = setTimeout(hpClose, 250); } }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hpClose(); }, true);
    window.addEventListener('scroll', function () { if (hp && !hpPin) hpClose(); }, true);
    setInterval(function () { if (expire()) render(); }, 20000);
  };

  SEO_CSS += '.gridbar{display:flex;flex-direction:column;gap:6px;margin:0 0 8px}.gbtns{display:flex;flex-wrap:wrap;gap:6px}.gbtn{border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;font-size:12.5px;font-weight:500;border-radius:6px;padding:4px 10px;min-height:28px;cursor:pointer}.gbtn:hover:not(:disabled){background:var(--soft);border-color:var(--line2)}.gbtn:disabled{opacity:.4;cursor:default}.fxrow{display:flex;align-items:center;border:1px solid var(--line);border-radius:6px;background:var(--panel);overflow:hidden}.fxname{min-width:74px;padding:5px 10px;font-size:12.5px;font-weight:600;color:var(--muted);border-right:1px solid var(--line);text-align:center}.fxl{padding:0 8px;font-style:italic;font-weight:600;color:var(--muted);font-size:13px}.fxin{flex:1;min-width:0;border:0;outline:none;background:transparent;color:var(--ink);font:inherit;font-size:13.5px;padding:6px 8px}.fxin:disabled{opacity:.5}table.sheet td.gs{background:color-mix(in srgb,var(--accent) 24%,var(--panel))!important}table.sheet td.gs .cell{background:transparent}table.sheet td.ga{outline:2px solid var(--accent);outline-offset:-2px}table.sheet th.gh,table.sheet td.rn.gh{background:color-mix(in srgb,var(--accent) 22%,var(--soft))!important;color:var(--ink)}table.sheet th{cursor:pointer;user-select:none}table.sheet td.rn{cursor:pointer;user-select:none}table.sheet td.fx .cell{color:var(--accent)}body.gdrag{user-select:none}.gren{width:100%;font:inherit;font-weight:600;border:1px solid var(--accent);border-radius:4px;padding:2px 4px;background:var(--panel);color:var(--ink)}.gmenu{position:absolute;z-index:99999;min-width:200px;background:var(--panel);color:var(--ink);border:1px solid var(--line2);border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.18);padding:4px}.gmenu button{display:block;width:100%;text-align:left;border:0;background:none;color:inherit;font:inherit;font-size:13px;padding:6px 10px;border-radius:5px;cursor:pointer}.gmenu button:hover{background:var(--soft)}.gmenu button.bad{color:var(--bad)}.gsep{height:1px;background:var(--line);margin:4px 2px}.gl{display:inline-block;min-width:16px;margin-right:6px;color:var(--faint);font-weight:700;font-size:11px}';
  SEO_JS += '\n;(' + seoTasksLayer.toString() + ')();\n';
  if (SR.colResizer) SEO_JS += '\n;(' + SR.colResizer.toString() + ')(document);\n';
  if (SR.seoGrid) SEO_JS += '\n;(' + SR.seoGrid.toString() + ')();\n';
  SR.seoEdit = function () {
    var f = document.querySelector('iframe[title="SEO / AEO workspace"]');
    if (f && f.contentWindow) f.contentWindow.postMessage({ sr: 'edit' }, '*'); else SR._seoEditPending = true;
  };
  SR.SeoWorkspace = function (p) {
    var c = p.client, B = SR.SEO_BUNDLE;
    var dark = document.documentElement.style.getPropertyValue('color-scheme') === 'dark';
    var id = (c.seoId || c.id || 'client').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40);
    var doc = React.useMemo(function () {
      var dom = ((SR.acct && SR.acct[c.id] && SR.acct[c.id].domain) || c.domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      var plat = (function () { try { var cs = getComputedStyle(document.querySelector('.nsb') || document.documentElement), g = function (n) { return cs.getPropertyValue(n).trim(); }; var v = { bg: g('--bg'), card: g('--card'), card2: g('--card2'), border: g('--border'), text: g('--text'), muted: g('--muted'), accent: g('--accent'), accentBg: g('--accentBg'), pill: g('--pillBg'), pillInk: g('--pillInk'), cb: g('--cbline'), gold: g('--gold'), goldBg: g('--goldBg'), red: g('--red') }; if (!v.bg) return ''; return 'html,html[data-theme=dark]{--bg:' + v.bg + ';--panel:' + v.card + ';--soft:' + v.card2 + ';--line:' + v.border + ';--line2:' + v.border + ';--ink:' + v.text + ';--muted:' + v.muted + ';--faint:' + v.muted + ';--accent:' + v.accent + ';--accent-ink:' + v.text + ';--accent-soft:' + v.accentBg + ';--on-accent:#fff;--btn-bg:' + v.accent + ';--btn-ink:#fff;--pill-bg:' + v.pill + ';--pill-ink:' + v.pillInk + ';--cbline:' + v.cb + ';--focus:' + v.accent + ';--amber-bg:' + v.goldBg + ';--amber-ink:' + v.gold + ';--gray-bg:' + v.card2 + ';--gray-ink:' + v.muted + ';--bad:' + v.red + ';--calc:' + v.card2 + '}'; } catch (x) { return ''; } })();
      var cfg = { id: id, name: c.name, domain: dom, city: c.region || '', service: 'Local SEO', start: c.start, dark: dark };
      var safe = function (o) { return JSON.stringify(o).replace(/<\//g, '<\\/'); };
      return '<!doctype html><html lang="en"' + (dark ? ' data-theme="dark"' : '') + '><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>' + B.css + SEO_CSS + plat + '</style></head><body><div id="app"></div><div id="toast" role="status" aria-live="polite"></div>' +
        '<script>(' + seoShim.toString() + ')(' + safe(cfg) + ',' + safe({ work: B.work, baseline: B.baseline }) + ');<\/script>' +
        '<script>' + B.tabs.replace('return { setup, render, dashStats', 'window.__SPECS = SPECS; window.__SX = { D, rowOf, realize, markDirty, send, setValue, refreshRow, idsOf, uid, num, blank, pad, padRows }; return { setup, render, dashStats').replace(/<\/script/g, '<\\/script') + '<\/script><script>' + B.app.replace(/route\(\);\s*\}\)\(\);\s*$/, function () { return B.embed + SEO_JS + '\nroute();\n})();'; }).replace(/<\/script/g, '<\\/script') + '<\/script></body></html>';
    }, [id, dark, SR.getAccent(), c.name, c.domain, SR.acct && SR.acct[c.id] && SR.acct[c.id].domain]);
    var fr = React.useRef(null), hs = React.useState(900), ht = hs[0], setHt = hs[1];
    React.useEffect(function () {
      var f = fr.current;
      var sendV = function () { if (!f || !f.contentWindow) return; var r = f.getBoundingClientRect(); f.contentWindow.postMessage({ sr: 'v', t: Math.max(0, -r.top), h: window.innerHeight - Math.max(0, r.top) }, '*'); };
      var onMsg = function (e) { if (!f || e.source !== f.contentWindow || !e.data) return; if (e.data.sr === 'ready' && SR._seoEditPending) { SR._seoEditPending = false; f.contentWindow.postMessage({ sr: 'edit' }, '*'); } if (e.data.sr === 'seo' && e.data.key) { try { SR.store.saveKV('seo:' + e.data.key, e.data.value); } catch (x) {} return; } if (e.data.sr === 'h') setHt(Math.max(420, e.data.h)); if (e.data.sr === 'h' || e.data.sr === 'ready') sendV(); };
      window.addEventListener('message', onMsg); window.addEventListener('scroll', sendV, true); window.addEventListener('resize', sendV);
      var iv = setInterval(sendV, 600);
      return function () { window.removeEventListener('message', onMsg); window.removeEventListener('scroll', sendV, true); window.removeEventListener('resize', sendV); clearInterval(iv); };
    }, [doc]);
    return html`<section style="display:flex;flex-direction:column;gap:8px">
      <iframe ref=${fr} key=${id + dark} title="SEO / AEO workspace" scrolling="no" srcDoc=${doc} style=${'width:100%;height:' + ht + 'px;border:0;background:transparent;display:block'}></iframe>
      <div style="font-size:12px;color:var(--muted)">Each client has its own baseline and tables. Saved with the rest of your data.</div>
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
            <div style="text-align:right"><span style=${'display:inline-block;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid ' + chipClr[eff(next)] + ';color:' + chipClr[eff(next)]}>${eff(next) === 'overdue' ? 'Overdue ' + Math.abs(dayDiff(SR.TODAY, next.date)) + ' days' : 'Due in ' + dayDiff(SR.TODAY, next.date) + ' days'}</span>
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
  SR.ClientAdd = function (p) {
    var st = useState(''), text = st[0], setText = st[1], rs = useState('Once'), rep = rs[0], setRep = rs[1], tr = React.useRef(''), rr = React.useRef('Once'); rr.current = rep;
    var go = function () {
      var names = SR.parseTaskLines(tr.current, [], []).filter(function (x) { return x.include !== false && !x.done; }).map(function (x) { return x.name; });
      if (!names.length) return; p.onAdd(names.map(function (nm) { return p.make(nm, rr.current); })); tr.current = ''; setText('');
    };
    return html`<div class="cadd"><${SR.QuickAdd} value=${text} clients=${[]} onChange=${function (v) { tr.current = v; setText(v); }} onAdd=${function () { go(); }} />
      <label class="cadd-rep">Repeats <select class="nsel" value=${rep} onChange=${function (e) { setRep(e.target.value); }}>${p.opts.map(function (o) { return html`<option key=${o[0]} value=${o[0]}>${o[1]}</option>`; })}</select></label></div>`;
  };
  SR.AddCustom = function (p) {
    var o = useState(false), open = o[0], setOpen = o[1];
    var m = useState('one'), mode = m[0], setMode = m[1];
    var n = useState(''), name = n[0], setName = n[1];
    var b = useState(''), bulk = b[0], setBulk = b[1];
    var w = useState((p.first ? p.opts[0] : p.opts[p.opts.length - 1])[0]), where = w[0], setWhere = w[1];
    var key = p.opts.map(function (x) { return x[0]; }).join('|');
    if (p.opts.every(function (x) { return x[0] !== where; })) { where = p.opts[p.opts.length - 1][0]; }
    var names = mode === 'one' ? (name.trim() ? [name.trim()] : []) : SR.parseTaskLines(bulk, [], []).filter(function (x) { return !x.done; }).map(function (x) { return x.name; });
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
    /* edit mode: per client, per project overrides of the default checklist */
    var edS = useState(null), editFor = edS[0], setEditFor = edS[1], edit = editFor === pk;
    var delS = useState(''), delSec = delS[0], setDelSec = delS[1];
    var ddH = useState(null), ddS = ddH[0], setDdS = ddH[1];
    var colH = useState(function () { try { return JSON.parse(localStorage.getItem('sr_secol')) || {}; } catch (e) { return {}; } }), colS = colH[0], setColS = colH[1];
    var isCol = function (k) { return !!colS[k]; };
    var togCol = function (k, v) { setColS(function (o) { var n = Object.assign({}, o); if (v === undefined ? !n[k] : v) n[k] = 1; else delete n[k]; try { localStorage.setItem('sr_secol', JSON.stringify(n)); } catch (e) {} return n; }); };
    var E = (c.edits || {})[pt] || {}, ePh = E.ph || {}, eSt = E.st || {}, eGone = E.gone || {}, eAdd = E.add || {};
    var phs = tp.phases.map(function (ph) {
      var st = ph.steps.filter(function (s) { return !eGone[s[0]]; }).map(function (s) { return [s[0], eSt[s[0]] || s[1], s[2], s[3]]; })
        .concat((eAdd[ph.id] || []).map(function (a) { return [a.id, eSt[a.id] || a.name, [], 'list']; }));
      var so = (E.sord || {})[ph.id]; if (so) st = st.slice().sort(function (a, b) { var i = so.indexOf(a[0]), j = so.indexOf(b[0]); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); });
      return Object.assign({}, ph, { name: ePh[ph.id] || ph.name, steps: st });
    });
    var setE = function (fn) { if (p.setEdits) p.setEdits(c.id, pt, fn); };
    var updT = function (id, patch) { p.setTasks(function (ts) { return ts.map(function (x) { return x.id === id ? Object.assign({}, x, patch) : x; }); }); };
    var sk = function (t) { return [t.ph === 'research' ? '' : (t.step || ''), t.ph || '', t.repeat || '', t.milestone ? 1 : 0].join('|'); };
    var U = function (msg, fn) { if (SR.undoable) SR.undoable(msg, fn); else fn(); };
    var moveT = function (t, dir) { U('Task moved', function () {
      p.setTasks(function (ts) {
        var sib = ts.filter(function (x) { return x.clientId === t.clientId && (x.proj || c.type) === (t.proj || c.type) && sk(x) === sk(t); });
        var i = sib.findIndex(function (x) { return x.id === t.id; }), o = sib[i + dir]; if (!o) return ts;
        var a = ts.findIndex(function (x) { return x.id === t.id; }), b = ts.findIndex(function (x) { return x.id === o.id; });
        var out = ts.slice(); var tmp = out[a]; out[a] = out[b]; out[b] = tmp; return out;
      });
    }); };
    var delT = function (t) { U('Task deleted', function () { p.setTasks(function (ts) { return ts.filter(function (x) { return x.id !== t.id; }); }); }); };
    /* drag to reorder: a grip on each row; same section reorders, another section moves the task there */
    var ddProps = function (kind, id, fn) {
      return { onDragOver: function (e) { var d = SR._dde; if (!d || d.kind !== kind) return; e.preventDefault(); var r = e.currentTarget.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2; setDdS(function (o) { return o && o.kind === kind && o.id === id && o.after === after ? o : { kind: kind, id: id, after: after }; }); },
        onDragLeave: function () { setDdS(function (o) { return o && o.kind === kind && o.id === id ? null : o; }); },
        onDrop: function (e) { var d = SR._dde; if (!d || d.kind !== kind) return; e.preventDefault(); e.stopPropagation(); var r = e.currentTarget.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2; SR._dde = null; setDdS(null); if (d.id !== id) fn(d.id, id, after); } };
    };
    var ddCls = function (kind, id) { return ddS && ddS.kind === kind && ddS.id === id ? (ddS.after ? ' dbot' : ' dtop') : ''; };
    var grip = function (kind, id, sel) {
      return html`<span class="dd-grip" draggable="true" title="Drag to reorder" aria-label="Drag to reorder" onDragStart=${function (e) { SR._dde = { kind: kind, id: id }; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'dd'); var row = e.currentTarget.closest(sel); if (row) e.dataTransfer.setDragImage(row, 12, 12); } catch (x) {} }} onDragEnd=${function () { SR._dde = null; setDdS(null); }}>⋮⋮</span>`;
    };
    var dropTask = function (dragId, targetId, after) {
      U('Task moved', function () { p.setTasks(function (ts) {
        var d = null, g = null; ts.forEach(function (x) { if (x.id === dragId) d = x; if (x.id === targetId) g = x; });
        if (!d || !g || d.clientId !== g.clientId || (d.proj || c.type) !== (g.proj || c.type)) return ts;
        var n = d;
        if (sk(d) !== sk(g)) { if (!(d.step && g.step && !d.repeat && !g.repeat)) return ts; n = Object.assign({}, d, { step: g.step, ph: g.ph }); }
        var rest = ts.filter(function (x) { return x.id !== dragId; }); var i = rest.findIndex(function (x) { return x.id === targetId; }); if (i < 0) return ts;
        rest.splice(after ? i + 1 : i, 0, n); return rest;
      }); });
    };
    var dropSec = function (dragSid, targetSid, after) {
      var ph = null; phs.forEach(function (x) { if (x.steps.some(function (s) { return s[0] === dragSid; }) && x.steps.some(function (s) { return s[0] === targetSid; })) ph = x; });
      if (!ph) return;
      var ids = ph.steps.map(function (s) { return s[0]; }).filter(function (x) { return x !== dragSid; }); var i = ids.indexOf(targetSid); ids.splice(after ? i + 1 : i, 0, dragSid);
      U('Section moved', function () { setE(function (o) { var so = Object.assign({}, o.sord); so[ph.id] = ids; return Object.assign({}, o, { sord: so }); }); });
    };
    var removeSec = function (sid) { U('Section deleted', function () {
      p.setTasks(function (ts) { return ts.filter(function (x) { return !(x.clientId === c.id && (x.proj || c.type) === pt && x.step === sid); }); });
      setE(function (o) {
        var gone = Object.assign({}, o.gone), add = Object.assign({}, o.add);
        Object.keys(add).forEach(function (k) { add[k] = add[k].filter(function (a) { return a.id !== sid; }); });
        gone[sid] = true; return Object.assign({}, o, { gone: gone, add: add });
      });
    }); };
    var addSec = function (phid) {
      var id = 'x' + Date.now().toString(36);
      setE(function (o) { var add = Object.assign({}, o.add); add[phid] = (add[phid] || []).concat([{ id: id, name: 'New section' }]); return Object.assign({}, o, { add: add }); });
    };
    var blurOnEnter = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };

    /* setup progress */
    var byStep = function (sid) { return tasks.filter(function (t) { return t.step === sid; }); };
    var stepDone = function (sid) { var ts = byStep(sid); return ts.length ? ts.every(function (t) { return t.done; }) : true; };
    var allSteps = 0, doneSteps = 0;
    phs.forEach(function (ph) { ph.steps.forEach(function (s) { allSteps++; if (stepDone(s[0])) doneSteps++; }); });
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
    var groups = phs.map(function (ph, gi) {
      var tot = 0, dn = 0;
      var steps = ph.steps.map(function (s) {
        var stl = p.settling || {}; var fin = function (t) { return t.done && !stl[t.id]; };
        var ts = byStep(s[0]).slice(); if (!edit) ts.sort(function (a, b) { return (fin(a) ? 1 : 0) - (fin(b) ? 1 : 0); });
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
      var ongoingTasks = tasks.filter(function (t) { return t.repeat || t.maint || (t.custom && !t.ph && !t.step); });
      var just = p.just || {};
      var editRow = function (t) {
        return html`<div class=${'erow dd-row' + ddCls('task', t.id)} key=${t.id} ...${ddProps('task', t.id, dropTask)}>
          <span class="eord">${grip('task', t.id, '.erow')}<button type="button" aria-label="Move up" onClick=${function () { moveT(t, -1); }}>↑</button><button type="button" aria-label="Move down" onClick=${function () { moveT(t, 1); }}>↓</button></span>
          <div class="ebody">
            <input class="ein" type="text" defaultValue=${t.name} aria-label="Task name" onBlur=${function (e) { var v = e.target.value.trim(); if (v && v !== t.name) updT(t.id, { name: v }); else e.target.value = t.name; }} onKeyDown=${blurOnEnter} />
            <textarea class="ehow" rows=${Math.max(2, Math.min(7, (t.how || []).length + 1))} placeholder="How to do it. One step per line." aria-label="How to do it" defaultValue=${(t.how || []).join('\n')} onBlur=${function (e) { var v = e.target.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean); if (v.join('\n') !== (t.how || []).join('\n')) updT(t.id, { how: v }); }}></textarea>
          </div>
          <button type="button" class="edel" aria-label=${'Delete ' + t.name} title="Delete task" onClick=${function () { delT(t); }}>×</button>
        </div>`;
      };
      var rowFor = function (t, clr, num) {
        if (edit) return editRow(t);
        return html`<${SR.TaskRow} key=${t.id} task=${t} num=${num} selected=${!!(p.sel && p.sel[t.id])} active=${p.openId === t.id} just=${!!just[t.id]}
          onToggle=${p.onToggle} onOpen=${p.onOpen} onSelect=${p.onSelect} />`;
      };
      var secHead = function (icon, name, color, d, t, sid, canDel, ck) {
        if (edit && sid) return html`<div class=${'sub edsec dd-row' + ddCls('sec', sid)} style=${'--sc:' + color} ...${ddProps('sec', sid, dropSec)}>${grip('sec', sid, '.edsec')}${SR.Icon(icon, 18)}
          <input class="ein" type="text" defaultValue=${name} aria-label="Section name" onBlur=${function (e) { var v = e.target.value.trim(); if (v && v !== name) setE(function (o) { var st = Object.assign({}, o.st); st[sid] = v; return Object.assign({}, o, { st: st }); }); else e.target.value = name; }} onKeyDown=${blurOnEnter} />
          ${canDel ? html`<button type="button" class=${'edelsec' + (delSec === sid ? ' sure' : '')} onClick=${function () { if (delSec !== sid) { setDelSec(sid); return; } setDelSec(''); removeSec(sid); }}>${delSec === sid ? 'Delete section and its tasks?' : 'Delete section'}</button>` : null}</div>`;
        var shut = ck && isCol(ck);
        return html`<div class=${'sub subtog' + (shut ? ' shut' : '')} style=${'--sc:' + color} role="button" tabindex="0" aria-expanded=${shut ? 'false' : 'true'} onClick=${function () { if (ck) togCol(ck); }} onKeyDown=${function (e) { if (ck && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); togCol(ck); } }}
          onContextMenu=${function (e) { if (!ck) return; SR.openMenu(e, [{ label: shut ? 'Expand section' : 'Collapse section', fn: function () { togCol(ck); } }, { label: 'Collapse all sections', fn: function () { var n = {}; groups.forEach(function (g) { g.steps.forEach(function (s) { n[pk + '/' + s.id] = 1; }); }); setColS(n); try { localStorage.setItem('sr_secol', JSON.stringify(n)); } catch (x) {} } }, { label: 'Expand all sections', fn: function () { setColS({}); try { localStorage.removeItem('sr_secol'); } catch (x) {} } }, { sep: true }, { label: 'Edit checklist and process', fn: function () { if (pt === 'seo') { SR.seoEdit && SR.seoEdit(c.id); } else setEditFor(pk); } }]); }}><span class="chv">${shut ? '▸' : '▾'}</span>${SR.Icon(icon, 18)}<span>${name}</span><span class="n">${d}/${t}</span></div>`;
      };
      var tasksBlock = function (on, clr) {
        var order = ['One-off'].concat(SR.CADENCES, ['Milestones']);
        var og = order.map(function (label) {
          var ts = ongoingTasks.filter(function (t) { return label === 'Milestones' ? t.milestone : label === 'One-off' ? (!t.milestone && !t.repeat) : (!t.milestone && t.repeat === label); }).sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.date || '').localeCompare(b.date || ''); });
          return { label: label, tasks: ts };
        }).filter(function (x) { return x.tasks.length; });
        var k = 0;
        return html`<div class="tasksblock">
          <${SR.ClientAdd} first=${true} label="Repeats" opts=${[['Once', 'Does not repeat']].concat(['Weekly', 'Daily', 'Every 3 days', 'Fortnightly', 'Monthly', 'Every 90 days'].map(function (cd) { return [cd, cd]; }), [['Milestone', 'One-off milestone']])} onAdd=${p.addCustom}
            make=${function (nm, rep) { return rep === 'Milestone' ? { clientId: c.id, proj: pt, name: nm, milestone: true, maint: true, date: '', custom: true, how: [] } : rep === 'Once' ? { clientId: c.id, proj: pt, name: nm, custom: true, how: [] } : { clientId: c.id, proj: pt, name: nm, repeat: rep, maint: true, custom: true, how: [] }; }} />
          ${og.map(function (x) {
            var isM = x.label === 'Milestones', isO = x.label === 'One-off', dn = x.tasks.filter(function (t) { return t.done; }).length;
            return html`<div key=${x.label}>
              ${secHead(isM ? 'flag' : isO ? 'check' : 'repeat', isM ? 'Milestones' : x.label, isM ? '#8A6D1F' : isO ? '#4B5563' : ['#0E7490', '#3B6FD4', '#7C3AED', '#C77700', '#BE185D', '#0F766E'][SR.CADENCES.indexOf(x.label) % 6], dn, x.tasks.length, undefined, undefined, pk + '/ong/' + x.label)}
              ${x.tasks.map(function (t) { k++; var r = rowFor(t, clr, on + '.' + k); return edit || !isCol(pk + '/ong/' + x.label) ? r : null; })}</div>`;
          })}
        </div>`;
      };
      var seoTasks = function () { return tasksBlock(1, tp.color); };
    var overview = function () {
      if (pt === 'seo') return html`<div style="display:flex;flex-direction:column;gap:18px"><${SR.SeoWorkspace} client=${c} /></div>`;
            var promiseBlock = html`<${SR.GoalCard} key=${pk} client=${c} goal=${goalOf} gkey=${pk} label=${tp.label} color=${tp.color} latest=${latestOf()} supports=${supportsOf()} onGoal=${function (g) { p.setGoal(c.id, pt, g); }} goResults=${p.goResults} />`;

      var ask = null;
      var setupTasks = tasks.filter(function (t) { return t.step && !t.maint; });
      var setupDone = setupTasks.filter(function (t) { return t.done; }).length;
      var planned = (function () { var d = new Date((c.start || SR.TODAY) + 'T00:00:00'); return new Date(d.getTime() + tp.days * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); })();
      var progress = null;

      /* phases list + sections (same layout as the Local SEO platform) */
      var ONG = { id: 'ongoing', name: 'Tasks', color: PC[Math.min(groups.length, 9)], scope: 'Recurring checks, milestones and your own tasks' };
      var dueNow = ongoingTasks.filter(function (t) { return !t.done && !t.milestone && t.date && t.date <= SR.TODAY; }).length;
      var firstOpen = groups.filter(function (g) { return !g.complete; })[0];
      var cur = (p.phaseSel && p.phaseSel[pk]) || (live ? 'ongoing' : (firstOpen ? firstOpen.ph.id : groups[groups.length - 1].ph.id));
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
        ${live ? phaseBtn('ongoing', groups.length + 1, 'Tasks', ONG.color, dueNow ? dueNow + ' due' : ongoingTasks.length + ' tasks', null, { newly: p.justLive === pk }) : phaseBtn('ongoing', groups.length + 1, 'Tasks', ONG.color, 'Locked', null, { lock: true })}
      </div>`;

      var mkPanel = function (cur) {
      var panel;
      if (cur === 'ongoing') {
        var on = groups.length + 1;
        panel = html`<div class="list swap" key="ongoing">
          <div class="listhead"><h3>${on}. Tasks</h3><span>${live ? '' : 'Starts when every setup task is done'}</span></div>
          <div class="listcard">
          ${live ? null : html`<div class="lockbox">${SR.Icon('lock', 20)}<div>The every 3 days, weekly, monthly and every 90 days checklists are added automatically after Go live is ticked. You can still add your own tasks below.</div></div>`}
          ${tasksBlock(on, ONG.color)}
          </div>
        </div>`;
      } else {
        var gi = Math.max(0, groups.findIndex(function (x) { return x.ph.id === cur; }));
        var g = groups[gi], k2 = 0, flat = g.ph.id === 'research';
        panel = html`<div class="list swap" key=${g.ph.id}>
          <div class="listhead">${edit ? html`<h3 style="display:flex;align-items:center;gap:8px;flex:1">${gi + 1}.<input class="ein ephase" type="text" defaultValue=${g.ph.name} aria-label="Phase name" onBlur=${function (e) { var v = e.target.value.trim(); if (v && v !== g.ph.name) setE(function (o) { var ph = Object.assign({}, o.ph); ph[g.ph.id] = v; return Object.assign({}, o, { ph: ph }); }); else e.target.value = g.ph.name; }} onKeyDown=${blurOnEnter} /></h3>` : html`<h3>${gi + 1}. ${g.ph.name}</h3>`}<span>${g.dn}/${g.tot} done</span></div>
          <div class="listcard">
          <${SR.AddCustom} label="Section" opts=${(flat ? g.steps.slice(-1) : g.steps).map(function (st) { return [st.id, st.name]; })} onAdd=${p.addCustom}
            make=${function (nm, step) { return { clientId: c.id, proj: pt, name: nm, ph: g.ph.id, step: step, custom: true, deadline: '', how: [] }; }} />
          ${flat ? html`<div class="sgrp" style=${'--sc:' + g.ph.color}>${(function () { var stl = p.settling || {}, all = []; g.steps.forEach(function (st) { st.tasks.forEach(function (t) { all.push(t); }); }); var fin = function (t) { return t.done && !stl[t.id] ? 1 : 0; }; var idx = function (t) { return all.indexOf(t); }; return all.slice().sort(function (a, b) { return fin(a) - fin(b) || idx(a) - idx(b); }); })().map(function (t) { k2++; return rowFor(t, g.ph.color, (gi + 1) + '.' + k2); })}</div>`
            : g.steps.map(function (st, si) {
              var d = st.tasks.filter(function (t) { return t.done; }).length;
              return html`<div key=${st.id} class="sgrp" style=${'--sc:' + st.color}>${secHead(st.icon, st.name, st.color, d, st.tasks.length, st.id, true, pk + '/' + st.id)}${edit || !isCol(pk + '/' + st.id) ? st.tasks.map(function (t) { k2++; return rowFor(t, g.ph.color, (gi + 1) + '.' + k2); }) : null}</div>`;
            })}
          ${edit && !flat ? html`<button type="button" class="ac-open" onClick=${function () { addSec(g.ph.id); }}>+ Add a section</button>` : null}
          </div>
        </div>`;
      }
      return panel;
      };
      var panel = mkPanel(cur), setupBlock = null;
      if (live && groups.length) {
        var sc = cur === 'ongoing' ? groups[0].ph.id : cur, keepCur = cur;
        cur = sc;
        var setList = html`<div class="phases" role="group" aria-label="Setup phases">${groups.map(function (g, gi) { var pct = g.tot ? Math.round(g.dn / g.tot * 100) : 0; return phaseBtn(g.ph.id, gi + 1, g.ph.name, g.ph.color, g.dn + '/' + g.tot, pct, { done: g.complete }); })}</div>`;
        var setPanel = mkPanel(sc);
        cur = keepCur;
        var onN = groups.length + 1;
        panel = html`<div class="list swap" key="ongoing"><div class="listcard">${tasksBlock(onN, ONG.color)}</div></div>`;
        setupBlock = html`<details class="ntoggle"><summary><span class="car" style="margin-right:8px">›</span> Setup and launch <span style="color:var(--muted);font-weight:400;margin-left:8px">${doneSteps} of ${allSteps} done</span><span class="ntag g" style="margin-left:auto">${groups.every(function (g) { return g.complete; }) ? 'Launched' : 'Live'}</span></summary><div class="work" style="margin-top:12px">${setList}${setPanel}</div></details>`;
      }

      return html`<div style="display:flex;flex-direction:column;gap:20px">
        ${ask}${progress}
        ${edit ? html`<div class="editbar"><span><b>Editing the checklist.</b> Rename phases and sections, change task names and how-to steps, move tasks up or down, delete or add anything. Changes save as you go and apply to this client only.</span><button type="button" onClick=${function () { setEditFor(null); }}>Done editing</button></div>` : null}
        <section style="padding:6px 2px 0">
          ${!groups.length ? panel : live ? html`<div class="ntwo"><div style="min-width:0"><h2 style="margin:0 0 6px;font-size:18px">Tasks</h2>${panel}</div><div style="min-width:0"><h2 style="margin:0 0 10px;font-size:18px">Setup</h2>${setupBlock}<p style="font-size:13px;color:var(--muted);margin:10px 2px 0">Open it to see the research, build and launch steps.</p></div></div>` : html`<h2 style="margin:0 0 6px;font-size:18px">Tasks</h2><div class="work">${phaseList}${panel}</div>`}
        </section>
      </div>`;
    };

    var account = function () { return html`<${SR.AccountTab} client=${c} tasks=${tasks} />`; };

    var missing = SR.PROJ_TYPES.filter(function (t) { return projs.indexOf(t) < 0 && !(t === 'seo' && projs.indexOf('aeo') > -1); });
    var projItems = function (type) {
      return [
        { label: 'Open ' + SR.TEMPLATES[type].label, fn: function () { p.setProj(type); setTab('overview'); } },
        { label: 'Edit client details', fn: function () { SR.act.edit(c.id); } },
        ].concat(SR.isCustom(type) ? [{ label: 'Rename project', fn: function () { var nm = window.prompt('Project name', SR.TEMPLATES[type].label); if (nm && nm.trim()) { SR.uiprefs.customProj[type].label = nm.trim(); if (SR.uiBump) SR.uiBump(); } } }] : []).concat([
        { label: (editFor === (type === c.type ? c.id : c.id + ':' + type) ? 'Done editing the checklist' : 'Edit checklist and process'), fn: function () { var k = type === c.type ? c.id : c.id + ':' + type; p.setProj(type); setTab('overview'); if (type === 'seo') { SR.seoEdit && SR.seoEdit(c.id); } else setEditFor(editFor === k ? null : k); } },
        { label: 'Reset tasks to the defaults', fn: function () { SR.act.resetProject(c.id, type); } },
        { sep: true },
        { label: 'Save checklist as a template', fn: function () { SR.act.saveTemplate(c.id, type); } }
      ]).concat((function () {
        var all = Object.keys(SR.templates || {}).map(function (k) { return SR.templates[k]; }).filter(function (x) { return x.type === type; });
        if (!all.length) return [];
        return [{ head: 'Apply a saved template' }].concat(all.map(function (x) { return { label: x.name, hint: (x.tasks || []).length + ' tasks', fn: function () { SR.act.applyTemplate(c.id, type, x.id); } }; }))
          .concat([{ head: 'Remove a template' }]).concat(all.map(function (x) { return { label: x.name, danger: true, fn: function () { SR.act.delTemplate(x.id); } }; }));
      })()).concat([
        { sep: true },
        { label: 'Delete project', hint: projs.length < 2 ? 'needs 2+ projects' : '', danger: true, disabled: projs.length < 2, fn: function () { SR.act.delProject(c.id, type); } }
      ]);
    };
    var ptab = function (type) {
      var T = SR.TEMPLATES[type], on = tab === 'overview' && pt === type;
      return html`<span class="ptw" key=${type}><button type="button" class=${'ptab' + (on ? ' on' : '')} style=${'--pc:' + (T.color || '#C9A84C')} onContextMenu=${function (e) { SR.openMenu(e, projItems(type)); }} onClick=${function () { p.setProj(type); setTab('overview'); setMenu(false); }}><i></i>${T.label}</button>${on ? html`<button type="button" class="ptm" aria-label=${'Options for the ' + T.label + ' project'} title="Project options" onClick=${function (e) { var r = e.currentTarget.getBoundingClientRect(); SR.openMenuAt(r.left, r.bottom + 4, projItems(type)); }}>⋯</button>` : null}</span>`;
    };
    var money0 = function (n) { return SR.money ? SR.money(n) : '$' + n; };
    var pill = pt === 'seo' ? null : html`<span style=${'font-size:12px;font-weight:700;padding:4px 10px;border-radius:7px;' + (live ? 'color:var(--green);background:var(--greenBg)' : 'color:var(--gold);background:var(--goldBg)')}>${live ? 'Maintenance' : (setupComplete ? 'Ready to go live' : 'Setup & launch · ' + doneSteps + ' of ' + allSteps)}</span>`;
    return html`<div style="display:flex;flex-direction:column;gap:18px">
      <div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span class="nav" style=${'width:44px;height:44px;border-radius:10px;font-size:16px;background:' + c.color}>${c.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()}</span><h1 style="margin:0" onContextMenu=${function (e) { SR.clientMenu(e, c); }}>${c.name}</h1><button type="button" class="edbtn" onClick=${function () { SR.act.edit(c.id); }}>${SR.Icon('pen', 14)} Edit client</button></div>
        ${(function () { var H = SR.clientHealth(c, p.tasks || tasks), A = H.A, fee = A ? (+A.retainer || 0) : (c.retainer || 0), L = SR.HLAB[H.h];
          var row = function (k, v) { return html`<div class="nprop"><span>${k}</span><span>${v}</span></div>`; };
          return html`<div class="nprops" style="margin-top:14px">${row('Contact', (c.contact || 'No contact') + (c.region ? ', ' + c.region : ''))}${row('Owner', html`<span class="ntag b">${c.owner || 'Unassigned'}</span>`)}${row('Health', html`<span class=${'ntag ' + L[1]}>${L[0]}</span>`)}${row('Pays us', money0(fee) + ' a month' + (H.end ? ', ends ' + SR.fmtDay(H.end) : ''))}${tab === 'overview' && pt !== 'seo' ? row('Status', html`<span class=${'ntag ' + (live ? 'g' : 'y')}>${live ? 'Maintenance' : (setupComplete ? 'Ready to go live' : 'Setup and launch, ' + doneSteps + ' of ' + allSteps)}</span>`) : null}</div>`; })()}
      </div>
      <div class="ptabs" role="tablist">
        ${projs.map(ptab)}
        <span class="padd">
          <button type="button" class="ptab plus" aria-label="Add a project" aria-expanded=${menu ? 'true' : 'false'} onClick=${function () { setMenu(!menu); }}>${SR.Icon('plus', 16)}${missing.length ? '' : ''}</button>
          ${menu ? html`<div class="pmenu" role="menu"><div class="pm0">New custom project</div><form class="pmnew" onSubmit=${function (e) { e.preventDefault(); var nm = String(e.currentTarget.elements.n.value || '').trim(); if (!nm) return; var cp = (SR.uiprefs.customProj = SR.uiprefs.customProj || {}), id = 'cp_' + Date.now().toString(36), n0 = Object.keys(cp).length; cp[id] = { label: nm, color: SR.CP_COLORS[n0 % SR.CP_COLORS.length] }; setMenu(false); p.addProject(c.id, id); }}><input name="n" class="cal-in" style="margin:0" placeholder="Name it, then Enter" aria-label="Custom project name" /></form>
          ${missing.length ? html`<div class="pm0">Add a project</div>${missing.map(function (t) { var T = SR.TEMPLATES[t]; return html`<button key=${t} type="button" role="menuitem" style=${'--pc:' + (T.color || '#C9A84C')} onClick=${function () { setMenu(false); p.addProject(c.id, t); }}><i></i>${T.label}</button>`; })}` : html`<div class="pm0">All templates added</div>`}</div>` : null}
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
      <section style=${card + ';border-radius:8px 14px 0 0;border-bottom:0;border-top:4px solid #4F86C6;padding:18px 22px;display:flex;flex-wrap:wrap;gap:16px 24px;justify-content:space-between;align-items:center'}>
        <div style="flex:1 1 260px"><div style="font-size:13px;color:var(--muted)">${c.name} · Google Ads</div><h2 style="margin:4px 0 0;font-family:'DM Sans',system-ui,sans-serif;font-size:26px">${c.promise}</h2></div>
        <div style="text-align:right"><div style="font-size:34px;font-weight:700;color:var(--accent)">${L ? Math.round(L.conv * 10) / 10 : '—'} <span style="color:var(--text)">/ ${L ? Math.round(tgt('conv', L.days) * 10) / 10 : (M.leads || '—')}</span></div><div style="font-size:12px;color:var(--muted)">leads, ${L ? 'latest period (' + ls[ls.length - 1].label + ')' : 'no period logged yet'}</div></div>
        <span style="display:inline-flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><${SR.CsvButton} kind="gads" onData=${doImport} /><button type="button" class="logbtn" style="min-height:38px;font-size:14px" onClick=${openNew}>${SR.Icon('plus', 16)} Log a period</button></span>
        ${showForm ? html`<div style="flex:1 1 100%;padding:16px;background:var(--card2);border:1px solid var(--line);border-radius:7px">
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
      <section style=${card + ';border-radius:8px 14px 0 0;border-bottom:0;border-top:4px solid #2FA79C;padding:18px 22px;display:flex;flex-wrap:wrap;gap:16px 24px;justify-content:space-between;align-items:center'}>
        <div style="flex:1 1 260px"><div style="font-size:13px;color:var(--muted)">${c.name} · SEO / AEO</div><h2 style="margin:4px 0 0;font-family:'DM Sans',system-ui,sans-serif;font-size:26px">${G.text || c.promise || 'Set the goal on the client page'}</h2></div>
        <div style="text-align:right"><div style="font-size:34px;font-weight:700;color:var(--accent)">${L ? ofm(bigM[3], L[big]) : '—'} <span style="color:var(--text)">/ ${T[big] ? ofm(bigM[3], T[big]) : '—'}</span></div><div style="font-size:12px;color:var(--muted)">${bigM[1].toLowerCase()}, ${L ? 'latest period (' + L.label + ')' : 'no period logged yet'}</div></div>
        <button type="button" class="logbtn" style="min-height:38px;font-size:14px" onClick=${openNew}>${SR.Icon('plus', 16)} Log a period</button>
        ${showForm ? html`<div style="flex:1 1 100%;padding:16px;background:var(--card2);border:1px solid var(--line);border-radius:7px">
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
        ${isImp && (flags.ctr || flags.cvr) ? html`<section style="background:var(--goldBg);border:1px solid var(--gold);border-radius:7px;padding:16px 20px">
          ${flags.ctr ? html`<div style="margin-bottom:10px"><h3 style="margin:0 0 6px;font-size:15px;color:var(--gold)">CTR is under target. Check:</h3>${['Ad doesn’t stand out', 'Ad isn’t relevant to the search', 'Offer isn’t interesting enough', 'Targeting is off'].map(function (x, i) { return html`<div key=${i} style="font-size:14px;padding:2px 0">☐ ${x}</div>`; })}</div>` : null}
          ${flags.cvr ? html`<div><h3 style="margin:0 0 6px;font-size:15px;color:var(--gold)">Conversion rate is under target. Check:</h3>${['Not enough social proof', 'CTA isn’t clear enough', 'Too much info too fast', 'Page is weak on mobile'].map(function (x, i) { return html`<div key=${i} style="font-size:14px;padding:2px 0">☐ ${x}</div>`; })}</div>` : null}
        </section>` : null}
      </div>`;
    }

    return html`<div style="display:flex;flex-direction:column;gap:18px">
      <div><h1 style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:32px">Results</h1><p style="margin:6px 0 0;font-size:14px;color:var(--muted)">Targets come from the project math. Actuals come from the ad account.</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start">${listPane}<div style="flex:999 1 600px;min-width:0">${detail}</div></div>
    </div>`;
  };

  /* ---------- Battlefronts: the war map (parchment) ---------- */
  SR.Battlefronts = function (p) {
    var R = React, html = SR.html, useState = R.useState;
    var sl = useState('agency'), selId = sl[0], setSel = sl[1];
    var ck = useState(0), tick = ck[0], setTick = ck[1];
    var ly = useState('health'), layer = ly[0], setLayer = ly[1];
    var ms = useState(''), msDraft = ms[0], setMsDraft = ms[1];
    var qk = useState(''), quick = qk[0], setQuick = qk[1];
    var T0 = SR.TODAY, fronts = SR.fronts(p.clients), W = 1200, H = 720, cx = W / 2, cy = H / 2;
    var hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
    var stats = function (f) {
      var ts = p.tasks.filter(function (t) { return t.clientId === f.id; }), open = ts.filter(function (t) { return !t.done; });
      var over = open.filter(function (t) { return SR.isLate(t, T0); }).length, done = ts.length - open.length;
      var health = !open.length ? 'calm' : over >= 3 || over / open.length > 0.4 ? 'red' : over ? 'amber' : 'green';
      return { total: ts.length, open: open.length, over: over, done: done, pct: ts.length ? Math.round(done / ts.length * 100) : 0, health: health, due: open.filter(function (t) { return t.date === T0; }).length };
    };
    var COL = { green: '#4E8F4A', amber: '#C98A1E', red: '#B5382E', calm: '#7B735F' }, INK = '#4B3A22', NAVY = '#16233B';
    var cl = p.clients, n = cl.length, pos = {};
    pos.agency = { x: cx, y: cy, r: 74 }; pos.sales = { x: W - 130, y: 110, r: 62 }; pos.marketing = { x: 130, y: 110, r: 62 };
    cl.forEach(function (c, i) {
      var ang = (i / Math.max(n, 1)) * Math.PI * 2 + Math.PI * 0.55 + (hash(c.id) - 0.5) * 0.25, ring = 235 + hash(c.id + 'r') * 70;
      pos[c.id] = { x: Math.max(80, Math.min(W - 80, cx + Math.cos(ang) * ring * 1.45)), y: Math.max(80, Math.min(H - 70, cy + Math.sin(ang) * ring * 0.95)), r: 40 + Math.min(22, (c.retainer || 0) / 100) };
    });
    var ids = Object.keys(pos), pinned = { agency: 1, sales: 1, marketing: 1 };
    for (var it = 0; it < 60; it++) ids.forEach(function (a) { ids.forEach(function (b) { if (a >= b) return; var A = pos[a], B = pos[b], dx = B.x - A.x, dy = (B.y - A.y) * 1.25, d = Math.sqrt(dx * dx + dy * dy) || 1, min = A.r + B.r + 46; if (d < min) { var f = (min - d) / 2, fx = dx / d * f, fy = dy / d * f / 1.25, fa = pinned[a] ? 0 : 1, fb = pinned[b] ? 0 : 1, t = fa + fb || 1; A.x -= fx * 2 * fa / t; A.y -= fy * 2 * fa / t; B.x += fx * 2 * fb / t; B.y += fy * 2 * fb / t; [A, B].forEach(function (q) { q.x = Math.max(90, Math.min(W - 90, q.x)); q.y = Math.max(80, Math.min(H - 70, q.y)); }); } }); });
    var blob = function (id, x, y, r) {
      var pts = [], k = 11; for (var i = 0; i < k; i++) { var a = i / k * Math.PI * 2, rr = r * (0.82 + hash(id + i) * 0.4); pts.push([x + Math.cos(a) * rr * 1.18, y + Math.sin(a) * rr * 0.92]); }
      var d = 'M' + ((pts[0][0] + pts[k - 1][0]) / 2).toFixed(1) + ',' + ((pts[0][1] + pts[k - 1][1]) / 2).toFixed(1);
      for (var j = 0; j < k; j++) { var a1 = pts[j], b1 = pts[(j + 1) % k]; d += ' Q' + a1[0].toFixed(1) + ',' + a1[1].toFixed(1) + ' ' + ((a1[0] + b1[0]) / 2).toFixed(1) + ',' + ((a1[1] + b1[1]) / 2).toFixed(1); }
      return d + 'Z';
    };
    var sel = fronts.filter(function (f) { return f.id === selId; })[0] || fronts[0], ss = stats(sel), plan = SR.warmap[sel.id] || {}, steps = plan.steps || [];
    var setPlan = function (o) { SR.warmap[sel.id] = Object.assign({}, SR.warmap[sel.id] || {}, o); setTick(tick + 1); };
    var dirs = [['push', 'Push'], ['hold', 'Hold'], ['fix', 'Fix first'], ['grow', 'Grow'], ['exit', 'Wind down']];
    var secured = function (f) { var st = (SR.warmap[f.id] || {}).steps || []; return st.length > 0 && st.every(function (x) { return x.done; }); };
    var totals = fronts.reduce(function (a, f) { var s = stats(f); a.open += s.open; a.over += s.over; a[s.health]++; if (secured(f)) a.sec++; if ((SR.warmap[f.id] || {}).target) a.set++; return a; }, { open: 0, over: 0, green: 0, amber: 0, red: 0, calm: 0, sec: 0, set: 0 });
    var mrr = cl.reduce(function (a, c) { return a + (c.retainer || 0); }, 0);
    var seltasks = p.tasks.filter(function (t) { return t.clientId === sel.id && !t.done; }).sort(function (a, b) { return String(a.date || '9999').localeCompare(String(b.date || '9999')); }).slice(0, 5);
    var isClient = cl.some(function (c) { return c.id === sel.id; });
    var addStep = function () { var t = msDraft.trim(); if (!t) return; setPlan({ steps: steps.concat([{ t: t, done: false }]) }); setMsDraft(''); };
    var tickStep = function (i) {
      var was = steps[i].done, next = steps.map(function (x, k) { return k === i ? { t: x.t, done: !x.done } : x; });
      setPlan({ steps: next });
      if (!was) { if (next.every(function (x) { return x.done; })) setTimeout(function () { SR.fx('Front secured', 'big'); SR.toast('Front secured: ' + sel.name); }, 250); }
    };
    /* the route from the selected front to its objective */
    var route = null;
    (function () {
      var A = pos[sel.id], best = null, bs = -1;
      [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180].forEach(function (deg) { [260, 340].forEach(function (L) { [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (k) {
        var ang = (k * 45 + deg) * Math.PI / 180, fx = A.x + Math.cos(ang) * (L + A.r), fy = A.y + Math.sin(ang) * (L + A.r) * 0.75;
        if (fx < 130 || fx > W - 130 || fy < 120 || fy > H - 110) return;
        var md = 9999; ids.forEach(function (id) { if (id === sel.id) return; var q = pos[id], dd = Math.sqrt(Math.pow((fx - q.x) / 1.2, 2) + Math.pow(fy - q.y, 2)) - q.r; if (dd < md) md = dd; });
        var sc = md + L * 0.05; if (sc > bs) { bs = sc; best = { x: fx, y: fy }; } }); }); });
      var F = best || { x: Math.max(130, Math.min(W - 130, A.x + 200)), y: Math.max(120, Math.min(H - 110, A.y - 150)) }, dx = F.x - A.x, dy = F.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      var S = { x: A.x + ux * A.r * 0.5, y: A.y + uy * A.r * 0.5 }, C = { x: (S.x + F.x) / 2 - uy * 90, y: (S.y + F.y) / 2 + ux * 90 };
      var at = function (t) { var m = 1 - t; return { x: m * m * S.x + 2 * m * t * C.x + t * t * F.x, y: m * m * S.y + 2 * m * t * C.y + t * t * F.y }; };
      route = { S: S, C: C, F: F, at: at, d: 'M' + S.x.toFixed(1) + ',' + S.y.toFixed(1) + ' Q' + C.x.toFixed(1) + ',' + C.y.toFixed(1) + ' ' + F.x.toFixed(1) + ',' + F.y.toFixed(1) };
    })();
    var doneN = steps.filter(function (x) { return x.done; }).length, prog = steps.length ? doneN / steps.length : 0, me = route.at(Math.max(0.02, prog));
    var trees = []; for (var tI = 0; tI < 46; tI++) { var tx = 30 + hash('tx' + tI) * (W - 60), ty = 30 + hash('ty' + tI) * (H - 60), ok = true; ids.forEach(function (id) { var q = pos[id], ddx = (tx - q.x) / 1.2, ddy = (ty - q.y); if (Math.sqrt(ddx * ddx + ddy * ddy) < q.r + 26) ok = false; }); if (ok) trees.push([tx, ty]); }
    var peak = function (x, y, sz, k) { return html`<g key=${k} class="wm-mt"><path d=${'M' + (x - sz) + ',' + y + ' L' + x + ',' + (y - sz * 1.15) + ' L' + (x + sz) + ',' + y + 'Z'} /><path d=${'M' + x + ',' + (y - sz * 1.15) + ' L' + (x + sz) + ',' + y + ' L' + (x + sz * 0.1) + ',' + y + 'Z'} class="sh" /></g>`; };
    var lines = fronts.filter(function (f) { return f.id !== 'agency'; }).map(function (f) { var a = pos.agency, b = pos[f.id]; return html`<line key=${f.id} x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} class="wm-supply" />`; });
    var pinVal = function (f, s) { return layer === 'money' ? (f.retainer ? '$' + (f.retainer >= 1000 ? (f.retainer / 1000).toFixed(1).replace('.0', '') + 'k' : f.retainer) : '-') : layer === 'late' ? s.over : s.open; };
    var pinCol = function (f, s) { return layer === 'money' ? (f.retainer ? '#4E8F4A' : '#7B735F') : layer === 'late' ? (s.over ? '#B5382E' : '#7B735F') : COL[s.health]; };
    var tcard = function (x, y, w, tag, txt, k, cls) { var tw = Math.max(w, Math.min(300, txt.length * 7.4 + 28)); return html`<g key=${k} class=${'wm-card ' + (cls || '')} transform=${'translate(' + x + ',' + y + ')'}><rect width=${tw} height="44" rx="5" /><text x="12" y="17" class="tg">${tag}</text><text x="12" y="34" class="tx">${txt.length > 40 ? txt.slice(0, 39) + '…' : txt}</text></g>`; };
    return html`<div class="wm" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap"><div><div style="font-size:13px;color:var(--muted)">All fronts of the business</div><h1 style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:32px">Battlefronts</h1></div>
        <div class="viewsw" role="group" aria-label="Map layer">${[['health', 'Health'], ['money', 'Revenue'], ['late', 'Overdue']].map(function (v) { return html`<button key=${v[0]} type="button" aria-pressed=${layer === v[0] ? 'true' : 'false'} class=${layer === v[0] ? 'on' : ''} onClick=${function () { setLayer(v[0]); }}>${v[1]}</button>`; })}</div></div>
      <div class="wm-stats">${[['Fronts', fronts.length, ''], ['MRR', '$' + mrr.toLocaleString('en-US'), ''], ['Open tasks', totals.open, ''], ['Overdue', totals.over, totals.over ? 'red' : ''], ['Secured', totals.sec + '/' + fronts.length, 'green'], ['With an objective', totals.set + '/' + fronts.length, totals.set < fronts.length ? 'amber' : 'green']].map(function (c) { return html`<div key=${c[0]} class=${'wm-stat ' + c[2]}><b>${c[1]}</b><span>${c[0]}</span></div>`; })}</div>
      <div class="wm-wrap">
        <div class="wm-map"><svg viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label="Map of all battlefronts" preserveAspectRatio="xMidYMid meet">
          <defs><radialGradient id="wmp" cx="50%" cy="48%" r="75%"><stop offset="0%" stop-color="#F1E5C9" /><stop offset="70%" stop-color="#E8D8B5" /><stop offset="100%" stop-color="#D2BE93" /></radialGradient>
            <pattern id="wmg" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" class="wm-gl" /></pattern>
            <filter id="wmn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .09 0" /></filter></defs>
          <rect width=${W} height=${H} fill="url(#wmp)" /><rect width=${W} height=${H} fill="url(#wmg)" /><rect width=${W} height=${H} filter="url(#wmn)" />
          <path d=${'M0,' + (H * 0.36) + ' C220,' + (H * 0.28) + ' 330,' + (H * 0.5) + ' 560,' + (H * 0.44) + ' S900,' + (H * 0.62) + ' ' + W + ',' + (H * 0.55)} class="wm-river" />
          ${ids.map(function (id) { var q = pos[id]; return [1.9, 1.55, 1.25].map(function (m, k) { return html`<path key=${id + k} d=${blob(id + 'c' + k, q.x, q.y, q.r * m)} class="wm-contour" />`; }); })}
          ${trees.map(function (t, k) { return html`<g key=${'t' + k} class="wm-tree" transform=${'translate(' + t[0].toFixed(0) + ',' + t[1].toFixed(0) + ')'}><circle r="5" /><rect x="-0.8" y="4" width="1.6" height="4" /></g>`; })}
          ${lines}
          ${fronts.map(function (f) {
            var ps = pos[f.id], s = stats(f), on = f.id === sel.id, pl = SR.warmap[f.id] || {}, sec = secured(f), fog = !pl.target, dir = pl.dir, c = f.color || '#8F99AA';
            var peaks = Math.min(3, 1 + Math.floor(s.open / 20));
            return html`<g key=${f.id} class=${'wm-t' + (on ? ' on' : '') + (fog ? ' fog' : '')} tabindex="0" role="button" aria-label=${f.name + ', ' + s.open + ' open, ' + s.over + ' overdue' + (sec ? ', secured' : '')} onClick=${function () { setSel(f.id); }} onKeyDown=${function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(f.id); } }}>
              <path d=${blob(f.id, ps.x, ps.y, ps.r)} fill=${c} fill-opacity=".28" stroke=${on ? NAVY : INK} stroke-width=${on ? 3 : 1.4} stroke-dasharray=${fog ? '5 4' : ''} />
              ${[0, 1, 2].slice(0, peaks).map(function (k) { return peak(ps.x + (k - (peaks - 1) / 2) * 24, ps.y - ps.r * 0.28 - (k === 1 ? 8 : 0), 11 + (k === 1 ? 4 : 0), k); })}
              <circle cx=${ps.x} cy=${ps.y + 8} r=${14 + Math.min(6, String(pinVal(f, s)).length)} fill=${pinCol(f, s)} class="wm-pin" /><text x=${ps.x} y=${ps.y + 13} text-anchor="middle" class="wm-n">${pinVal(f, s)}</text>
              ${s.over && layer !== 'late' ? html`<g><circle cx=${ps.x + ps.r * 0.78} cy=${ps.y - ps.r * 0.5} r="11" fill=${COL.red} class="wm-pin" /><text x=${ps.x + ps.r * 0.78} y=${ps.y - ps.r * 0.5 + 4} text-anchor="middle" class="wm-n sm">${s.over}</text></g>` : null}
              ${sec ? html`<g transform=${'translate(' + (ps.x - ps.r * 0.8) + ',' + (ps.y - ps.r * 0.6) + ')'}><path d="M0 14V-14" stroke=${INK} stroke-width="2" /><path d="M0 -14 L22 -8 L0 -2Z" fill="#C98A1E" stroke=${INK} /></g>` : null}
              <text x=${ps.x} y=${ps.y + ps.r + 22} text-anchor="middle" class="wm-lbl">${f.name.length > 22 ? f.name.slice(0, 21) + '…' : f.name}</text>
              ${dir || fog ? html`<text x=${ps.x} y=${ps.y + ps.r + 37} text-anchor="middle" class=${'wm-dir' + (fog && !dir ? ' q' : '')}>${dir ? (dirs.filter(function (d) { return d[0] === dir; })[0] || ['', ''])[1].toUpperCase() : 'SET AN OBJECTIVE'}</text>` : null}
            </g>`; })}
          <g class="wm-route">
            <path d=${route.d} class="wm-rt-halo" /><path d=${route.d} class="wm-rt" />
            ${steps.map(function (st, i) { var q = route.at((i + 1) / (steps.length + 1)); return html`<g key=${'s' + i} class=${'wm-ms' + (st.done ? ' done' : '')} transform=${'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ')'}><circle r="8" /><text y="-14" text-anchor="middle">${st.t.length > 24 ? st.t.slice(0, 23) + '…' : st.t}</text></g>`; })}
            <g transform=${'translate(' + route.F.x.toFixed(1) + ',' + route.F.y.toFixed(1) + ')'}><circle r="15" class="wm-goalglow" /><circle r="6" class="wm-goal" /><path d="M0 -4 V-38" stroke=${NAVY} stroke-width="2.5" /><path d="M0 -38 L26 -31 L0 -24Z" fill=${doneN && doneN === steps.length ? '#4E8F4A' : '#C98A1E'} stroke=${NAVY} /></g>
            <circle cx=${me.x} cy=${me.y} r="10" class="wm-me" /><circle cx=${me.x} cy=${me.y} r="4.5" fill="#C98A1E" />
          </g>
          ${tcard(Math.max(8, Math.min(W - 260, route.S.x - 30)), (route.S.y > H - 210 ? route.S.y - 120 : route.S.y + 30), 150, 'YOU ARE HERE', plan.here || 'Write where this front stands', 'h', 'here')}
          ${tcard(Math.max(8, Math.min(W - 290, route.F.x - 130)), Math.max(8, route.F.y - 92), 190, 'OBJECTIVE', plan.target || 'Set an objective', 'o', 'obj')}
          <g transform=${'translate(' + (W - 80) + ',' + (H - 84) + ')'} class="wm-comp"><circle r="30" fill="none" /><path d="M0 -26 L6 0 L0 26 L-6 0Z" /><path d="M-26 0 L0 -6 L26 0 L0 6Z" opacity=".5" /><text y="-35" text-anchor="middle">N</text></g>
          <rect x="5" y="5" width=${W - 10} height=${H - 10} class="wm-frame" />
        </svg>
        <div class="wm-key"><span><i style="background:#4E8F4A"></i>Holding</span><span><i style="background:#C98A1E"></i>Overdue work</span><span><i style="background:#B5382E"></i>Losing ground</span><span><i style="background:#7B735F"></i>Quiet</span><span>Dashed outline = no objective yet. Flag = secured.</span></div></div>
        <aside class="wm-side" aria-label=${sel.name}>
          <div style="display:flex;align-items:center;gap:10px"><span style=${'width:12px;height:12px;border-radius:3px;background:' + (sel.color || '#8F99AA')}></span><h2 style="margin:0;font-size:20px;font-family:'DM Sans',system-ui,sans-serif;flex:1">${sel.name}</h2>${secured(sel) ? html`<span class="wm-seal">SECURED</span>` : null}</div>
          <div class="wm-kv"><div><b>${ss.open}</b><span>open</span></div><div class=${ss.over ? 'bad' : ''}><b>${ss.over}</b><span>overdue</span></div><div><b>${ss.due}</b><span>today</span></div><div><b>${ss.pct}%</b><span>done</span></div></div>
          ${isClient && sel.retainer ? html`<div class="wm-line">$${sel.retainer}/month${sel.owner ? ' · ' + sel.owner : ''}${sel.region ? ' · ' + sel.region : ''}</div>` : null}
          <label class="wm-f">Direction<div class="wm-dirs">${dirs.map(function (d) { return html`<button key=${d[0]} type="button" aria-pressed=${plan.dir === d[0] ? 'true' : 'false'} class=${plan.dir === d[0] ? 'on' : ''} onClick=${function () { setPlan({ dir: plan.dir === d[0] ? '' : d[0] }); }}>${d[1]}</button>`; })}</div></label>
          <label class="wm-f">You are here<input class="cal-in" type="text" placeholder="e.g. Ads, but no steady leads" value=${plan.here || ''} onChange=${function (e) { setPlan({ here: e.target.value }); }} /></label>
          <label class="wm-f">Objective<input class="cal-in" type="text" placeholder="e.g. 30 qualified leads a month" value=${plan.target || ''} onChange=${function (e) { setPlan({ target: e.target.value }); }} /></label>
          <label class="wm-f">Reach it by<input class="cal-in" type="date" value=${plan.by || ''} onChange=${function (e) { setPlan({ by: e.target.value }); }} /></label>
          <div class="wm-f"><span>Route · ${doneN}/${steps.length} waypoints</span>
            ${steps.map(function (st, i) { return html`<div key=${i} class=${'wm-step' + (st.done ? ' done' : '')}><input type="checkbox" checked=${st.done} aria-label=${'Waypoint ' + st.t} onChange=${function () { tickStep(i); }} /><span>${st.t}</span><button type="button" aria-label="Remove waypoint" onClick=${function () { setPlan({ steps: steps.filter(function (x, k) { return k !== i; }) }); }}>×</button></div>`; })}
            <input class="cal-in" type="text" placeholder="+ Add a waypoint, press Enter" value=${msDraft} onChange=${function (e) { setMsDraft(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter') { e.preventDefault(); addStep(); } }} style="margin:0;font-weight:400" /></div>
          <label class="wm-f">Notes<textarea class="cal-in" rows="3" placeholder="Plan, risks, who does what" value=${plan.note || ''} onChange=${function (e) { setPlan({ note: e.target.value }); }} style="resize:vertical;margin:0;font-weight:400"></textarea></label>
          <div class="wm-f"><span>Next up</span>${seltasks.length ? seltasks.map(function (t) { return html`<div key=${t.id} class="wm-task"><span class=${t.date && t.date < T0 ? 'bad' : ''}>${t.date ? SR.fmtDeadline(t.date) : 'No date'}</span>${t.name}</div>`; }) : html`<div class="wm-line">Nothing open.</div>`}
            <input class="cal-in" type="text" placeholder=${'+ Task for ' + sel.name + ', press Enter'} value=${quick} onChange=${function (e) { setQuick(e.target.value); }} onKeyDown=${function (e) { if (e.key === 'Enter' && quick.trim()) { e.preventDefault(); p.onQuick(sel.id, quick.trim()); setQuick(''); } }} style="margin:6px 0 0;font-weight:400" /></div>
          ${isClient ? html`<button type="button" class="ar-go" onClick=${function () { p.onOpenClient(sel.id); }}>Open ${sel.name}</button>` : sel.id === 'sales' ? html`<button type="button" class="ar-go" onClick=${function () { p.onGo('sales'); }}>Open Sales</button>` : null}
        </aside>
      </div>
    </div>`;
  };

  /* ===== Finance: spend, pots, money in (Wise CSV import) ===== */
  SR.fin = SR.fin || {};
  (function () {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var fm = function (v) { v = Number(v) || 0; return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
    var MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mlabel = function (mo) { return MN[+mo.slice(5, 7) - 1] + ' ' + mo.slice(0, 4); };
    var dlabel = function (d) { return d ? MS[+d.slice(5, 7) - 1] + ' ' + (+d.slice(8, 10)) : ''; };
    var shift = function (mo, n) { var y = +mo.slice(0, 4), m = +mo.slice(5, 7) - 1 + n; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return y + '-' + pad(m + 1); };
    var CATS = [['Sales tools', 'target', ''], ['Outreach', 'mail', 'b'], ['Calling', 'phone', 'o'], ['Website', 'globe', 'n'], ['Equipment', 'layers', 'n'], ['Other', 'coin', 'n']];
    var catOf = function (n) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === n) return CATS[i]; return CATS[5]; };
    var SPLITC = ['#3B6FD4', '#6FBF3B', '#C77700', '#8B5CF6', '#0891B2', '#9AA3B2'];

    var ensure = function () {
      var F = SR.fin;
      F.spends = F.spends || []; F.income = F.income || []; F.seq = F.seq || 1;
      if (!F.pots) F.pots = [
        { id: 'p1', name: 'Tax and VAT', icon: 'doc', goal: 0, bal: 0, rt: 'none', rv: 0 },
        { id: 'p2', name: 'Buffer', icon: 'shield', goal: 0, bal: 0, rt: 'none', rv: 0 },
        { id: 'p3', name: 'Tools and software', icon: 'layers', goal: 0, bal: 0, rt: 'none', rv: 0 }
      ];
      return F;
    };
    var chargesIn = function (s, mo) {
      var y = +mo.slice(0, 4), m = +mo.slice(5, 7), last = new Date(y, m, 0).getDate(), first = mo + '-01', out = [];
      var st = s.start || first;
      if (s.kind === 'one') return st.slice(0, 7) === mo ? [st] : [];
      if (s.every === 'week') { var dw = new Date(st + 'T12:00:00').getDay(); for (var d = 1; d <= last; d++) { var dt = mo + '-' + pad(d); if (dt >= st && new Date(dt + 'T12:00:00').getDay() === dw) out.push(dt); } }
      else if (s.every === 'year') { if (+st.slice(5, 7) === m && st.slice(0, 7) <= mo) out.push(mo + '-' + pad(Math.min(+st.slice(8, 10), last))); }
      else if (st.slice(0, 7) <= mo) out.push(mo + '-' + pad(Math.min(+st.slice(8, 10) || 1, last)));
      return out.filter(function (d) { return !s.end || d <= s.end; });
    };
    var monthlyCost = function (s) { var a = Number(s.amt) || 0; return s.every === 'year' ? a / 12 : s.every === 'week' ? a * 52 / 12 : a; };
    var nextCharge = function (s, today) {
      if (s.kind === 'one') return s.start >= today ? s.start : '';
      var mo = today.slice(0, 7);
      for (var i = 0; i < 14; i++) { var ds = chargesIn(s, shift(mo, i)).filter(function (d) { return d >= today; }); if (ds.length) return ds[0]; }
      return '';
    };
    var setAside = function (pt, inc) { return pt.rt === 'pct' ? inc * (Number(pt.rv) || 0) / 100 : pt.rt === 'fix' ? (Number(pt.rv) || 0) : 0; };
    var parseCsv = function (txt) {
      var rows = [], row = [], cur = '', q = false, i, c;
      txt = String(txt || '').replace(/^﻿/, '');
      for (i = 0; i < txt.length; i++) {
        c = txt[i];
        if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
        else if (c === '"') q = true;
        else if (c === ',') { row.push(cur); cur = ''; }
        else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(function (x) { return x !== ''; })) rows.push(row); row = []; }
        else cur += c;
      }
      row.push(cur); if (row.some(function (x) { return x !== ''; })) rows.push(row);
      return rows;
    };
    var wiseDate = function (s) {
      s = String(s || '').trim().slice(0, 10);
      var m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/); if (m) return m[3] + '-' + pad(+m[2]) + '-' + pad(+m[1]);
      m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? s : '';
    };
    var parseWise = function (txt, clients, have) {
      var rows = parseCsv(txt); if (rows.length < 2) return { rows: [], err: 'No rows found. Paste or choose a Wise statement CSV.' };
      var H = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
      var col = function () { for (var a = 0; a < arguments.length; a++) { var k = H.indexOf(arguments[a]); if (k >= 0) return k; } return -1; };
      var ci = { id: col('transferwise id', 'id', 'wise id'), date: col('date', 'date time', 'created on', 'finished on'), amt: col('amount'), cur: col('currency'), desc: col('description'), ref: col('payment reference', 'reference'), payer: col('payer name', 'sender name', 'payee name', 'merchant') };
      if (ci.date < 0 || ci.amt < 0) return { rows: [], err: 'Could not find the Date and Amount columns. Use the CSV from Wise, Statements.' };
      var out = [];
      rows.slice(1).forEach(function (r) {
        var amt = parseFloat(String(r[ci.amt] || '').replace(/[^0-9.\-]/g, '')); if (!(amt > 0)) return;
        var d = wiseDate(r[ci.date]); if (!d) return;
        var wid = ci.id >= 0 ? String(r[ci.id] || '').trim() : '';
        var payer = ci.payer >= 0 ? r[ci.payer] || '' : '', desc = ci.desc >= 0 ? r[ci.desc] || '' : '', ref = ci.ref >= 0 ? r[ci.ref] || '' : '';
        var hay = (payer + ' ' + desc + ' ' + ref).toLowerCase(), cid = '';
        clients.forEach(function (c) { if (cid) return; var nm = String(c.name || '').toLowerCase(); var w = nm.split(/\s+/)[0]; if (nm && (hay.indexOf(nm) >= 0 || (w.length >= 4 && hay.indexOf(w) >= 0))) cid = c.id; });
        out.push({ wid: wid || ('csv:' + d + ':' + amt + ':' + (payer || desc).slice(0, 20)), date: d, amt: amt, cur: ci.cur >= 0 ? String(r[ci.cur] || '').trim() : '', client: cid, note: (payer || desc || ref).slice(0, 80), dup: !!have[wid || ('csv:' + d + ':' + amt + ':' + (payer || desc).slice(0, 20))] });
      });
      return { rows: out, err: out.length ? '' : 'No incoming payments found in this file.' };
    };

    var inp = 'width:100%;box-sizing:border-box;min-height:38px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:var(--card);color:var(--text);font-family:inherit;font-size:14px';
    var lab = 'display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:5px';

    SR.Finance = function (p) {
      var F = ensure(), clients = p.clients || [];
      var st = useState(0), setTick = st[1], tick = st[0];
      var bump = function () { setTick(function (x) { return x + 1; }); };
      var today = SR.TODAY || new Date().toISOString().slice(0, 10);
      var ms = useState(today.slice(0, 7)), mo = ms[0], setMo = ms[1];
      var ts = useState('all'), tab = ts[0], setTab = ts[1];
      var mdS = useState(null), md = mdS[0], setMd = mdS[1];
      var close = function () { setMd(null); };
      var cname = function (id) { for (var i = 0; i < clients.length; i++) if (clients[i].id === id) return clients[i].name; return ''; };
      var nid = function (pre) { F.seq = (F.seq || 1) + 1; return pre + F.seq + Math.random().toString(36).slice(2, 5); };

      var inc = F.income.filter(function (x) { return x.date && x.date.slice(0, 7) === mo; });
      var moneyIn = inc.reduce(function (a, x) { return a + (Number(x.amt) || 0); }, 0);
      var lines = []; F.spends.forEach(function (s) { chargesIn(s, mo).forEach(function (d) { lines.push({ s: s, d: d }); }); });
      var spendTot = lines.reduce(function (a, l) { return a + (Number(l.s.amt) || 0); }, 0);
      var aside = F.pots.reduce(function (a, pt) { return a + setAside(pt, moneyIn); }, 0);
      var free = moneyIn - spendTot - aside;
      var recs = F.spends.filter(function (s) { return s.kind !== 'one'; });
      var subTot = recs.reduce(function (a, s) { return a + monthlyCost(s); }, 0);
      var potsHeld = F.pots.reduce(function (a, pt) { return a + (Number(pt.bal) || 0); }, 0);
      var shown = F.spends.filter(function (s) { return tab === 'all' ? true : tab === 'rec' ? s.kind !== 'one' : s.kind === 'one'; });
      var byClient = {}; inc.forEach(function (x) { var k = x.client || ''; byClient[k] = (byClient[k] || 0) + (Number(x.amt) || 0); });
      var clientRows = Object.keys(byClient).map(function (k) { return { k: k, n: k ? cname(k) || 'Client' : 'Other', v: byClient[k] }; }).sort(function (a, b) { return b.v - a.v; });
      var where = recs.map(function (s) { return { n: s.name, v: monthlyCost(s) }; }).sort(function (a, b) { return b.v - a.v; });
      if (where.length > 5) { var rest = where.slice(5).reduce(function (a, x) { return a + x.v; }, 0); where = where.slice(0, 5); where.push({ n: 'Other', v: rest }); }
      var whereTot = where.reduce(function (a, x) { return a + x.v; }, 0);

      var ic = function (name, cls) { return html`<span class=${'fin-ic' + (cls ? ' ' + cls : '')}>${SR.Icon(name, 18)}</span>`; };
      var btn = function (label, fn, primary) { return html`<button type="button" class=${'fin-btn' + (primary ? ' pri' : '')} onClick=${fn}>${label}</button>`; };

      /* ---- modals ---- */
      var Modal = function (title, body, foot) {
        return html`<div class="fin-scrim" onMouseDown=${function (e) { if (e.target === e.currentTarget) close(); }}><div class="fin-mod" role="dialog" aria-label=${title}>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b style="font-size:17px">${title}</b><button type="button" class="fin-x" aria-label="Close" onClick=${close}>${SR.Icon('close', 15)}</button></div>
          ${body}<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px;align-items:center">${foot}</div></div></div>`;
      };
      var setM = function (k, v) { setMd(function (o) { var n = Object.assign({}, o); n.f = Object.assign({}, o.f); n.f[k] = v; return n; }); };
      var field = function (label, node) { return html`<div style="margin-bottom:12px"><label style=${lab}>${label}</label>${node}</div>`; };
      var delBtn = function (what, fn) { return md.ask ? html`<button type="button" class="fin-btn dng" onClick=${fn}>Yes, delete</button>` : html`<button type="button" class="fin-btn" style="margin-right:auto" onClick=${function () { setMd(function (o) { return Object.assign({}, o, { ask: true }); }); }}>${'Delete ' + what}</button>`; };

      var modal = null;
      if (md && md.t === 'spend') {
        var f = md.f, rec = f.kind !== 'one';
        var saveSp = function () {
          var amt = parseFloat(f.amt); if (!String(f.name || '').trim() || !(amt > 0)) { SR.toast && SR.toast('Add a name and an amount'); return; }
          var o = { id: f.id || nid('s'), name: String(f.name).trim(), amt: amt, kind: rec ? 'rec' : 'one', every: rec ? (f.every || 'month') : '', start: f.start || today, cat: f.cat || 'Other', pot: f.pot || '', note: f.note || '', end: f.end || '' };
          if (f.id) F.spends = F.spends.map(function (x) { return x.id === f.id ? o : x; }); else F.spends = F.spends.concat([o]);
          close(); bump();
        };
        var delSp = function () { var old = F.spends; F.spends = old.filter(function (x) { return x.id !== f.id; }); close(); bump(); SR.toast && SR.toast('Spend deleted', function () { F.spends = old; bump(); }); };
        var prev = []; if (rec && parseFloat(f.amt) > 0) { var tmp = { kind: 'rec', every: f.every || 'month', start: f.start || today, amt: parseFloat(f.amt), end: f.end || '' }; for (var pm = 0; pm < 14 && prev.length < 3; pm++) chargesIn(tmp, shift(today.slice(0, 7), pm)).forEach(function (d) { if (d >= today && prev.length < 3) prev.push(d); }); }
        modal = Modal(f.id ? 'Edit spend' : 'Add spend', html`<div>
          <div class="fin-seg" style="margin-bottom:14px"><button type="button" class=${rec ? 'on' : ''} onClick=${function () { setM('kind', 'rec'); }}>Recurring subscription</button><button type="button" class=${!rec ? 'on' : ''} onClick=${function () { setM('kind', 'one'); }}>One-off payment</button></div>
          <div class="fin-g2">${field('Name', html`<input style=${inp} placeholder="Apollo" value=${f.name || ''} onInput=${function (e) { setM('name', e.target.value); }} autofocus />`)}${field('Amount ($)', html`<input style=${inp} type="number" min="0" step="0.01" placeholder="99" value=${f.amt == null ? '' : f.amt} onInput=${function (e) { setM('amt', e.target.value); }} />`)}</div>
          <div class="fin-g2">${rec ? field('Repeats', html`<select style=${inp} value=${f.every || 'month'} onChange=${function (e) { setM('every', e.target.value); }}><option value="month">Monthly</option><option value="year">Yearly</option><option value="week">Weekly</option></select>`) : null}${field(rec ? 'First charge' : 'Date paid', html`<input style=${inp} type="date" value=${f.start || today} onInput=${function (e) { setM('start', e.target.value); }} />`)}</div>
          <div class="fin-g2">${field('Category', html`<select style=${inp} value=${f.cat || 'Other'} onChange=${function (e) { setM('cat', e.target.value); }}>${CATS.map(function (c) { return html`<option key=${c[0]} value=${c[0]}>${c[0]}</option>`; })}</select>`)}${field('Paid from pot', html`<select style=${inp} value=${f.pot || ''} onChange=${function (e) { setM('pot', e.target.value); }}><option value="">None</option>${F.pots.map(function (pt) { return html`<option key=${pt.id} value=${pt.id}>${pt.name}</option>`; })}</select>`)}</div>
          ${rec ? field('Ends (optional)', html`<input style=${inp} type="date" value=${f.end || ''} onInput=${function (e) { setM('end', e.target.value); }} />`) : null}
          ${field('Note (optional)', html`<input style=${inp} placeholder="What it is for" value=${f.note || ''} onInput=${function (e) { setM('note', e.target.value); }} />`)}
          ${rec && prev.length ? html`<div class="fin-prev"><b>Next charges</b>${prev.map(function (d, i) { return html`<div key=${i}><span>${dlabel(d)}</span><span>${fm(parseFloat(f.amt))}</span></div>`; })}<div style="font-weight:700"><span>Per year</span><span>${fm(monthlyCost({ amt: parseFloat(f.amt), every: f.every || 'month' }) * 12)}</span></div></div>` : null}
        </div>`, html`${f.id ? delBtn('spend', delSp) : null}${btn('Cancel', close)}${btn('Save', saveSp, true)}`);
      } else if (md && md.t === 'income') {
        var g = md.f;
        var saveIn = function () {
          var amt = parseFloat(g.amt); if (!(amt > 0) || !g.date) { SR.toast && SR.toast('Add a date and an amount'); return; }
          var o = { id: g.id || nid('i'), date: g.date, amt: amt, client: g.client || '', note: g.note || '', wid: g.wid || '', cur: g.cur || '' };
          if (g.id) F.income = F.income.map(function (x) { return x.id === g.id ? o : x; }); else F.income = F.income.concat([o]);
          if (o.date.slice(0, 7) !== mo) setMo(o.date.slice(0, 7));
          close(); bump();
        };
        var delIn = function () { var old = F.income; F.income = old.filter(function (x) { return x.id !== g.id; }); close(); bump(); SR.toast && SR.toast('Payment deleted', function () { F.income = old; bump(); }); };
        modal = Modal(g.id ? 'Edit payment' : 'Add money in', html`<div>
          <div class="fin-g2">${field('Date received', html`<input style=${inp} type="date" value=${g.date} onInput=${function (e) { setM('date', e.target.value); }} />`)}${field('Amount ($)', html`<input style=${inp} type="number" min="0" step="0.01" value=${g.amt == null ? '' : g.amt} onInput=${function (e) { setM('amt', e.target.value); }} autofocus />`)}</div>
          ${field('Client', html`<select style=${inp} value=${g.client || ''} onChange=${function (e) { setM('client', e.target.value); }}><option value="">Other</option>${clients.map(function (c) { return html`<option key=${c.id} value=${c.id}>${c.name}</option>`; })}</select>`)}
          ${field('Note (optional)', html`<input style=${inp} placeholder="Invoice number or what it was for" value=${g.note || ''} onInput=${function (e) { setM('note', e.target.value); }} />`)}
        </div>`, html`${g.id ? delBtn('payment', delIn) : null}${btn('Cancel', close)}${btn('Save', saveIn, true)}`);
      } else if (md && md.t === 'pot') {
        var q = md.f;
        var savePot = function () {
          if (!String(q.name || '').trim()) { SR.toast && SR.toast('Name the pot'); return; }
          var o = { id: q.id || nid('p'), name: String(q.name).trim(), icon: q.icon || 'coin', goal: parseFloat(q.goal) || 0, bal: parseFloat(q.bal) || 0, rt: q.rt || 'none', rv: parseFloat(q.rv) || 0 };
          if (q.id) F.pots = F.pots.map(function (x) { return x.id === q.id ? o : x; }); else F.pots = F.pots.concat([o]);
          close(); bump();
        };
        var delPot = function () { var old = F.pots, oldS = F.spends; F.pots = old.filter(function (x) { return x.id !== q.id; }); F.spends = oldS.map(function (s) { return s.pot === q.id ? Object.assign({}, s, { pot: '' }) : s; }); close(); bump(); SR.toast && SR.toast('Pot deleted', function () { F.pots = old; F.spends = oldS; bump(); }); };
        modal = Modal(q.id ? 'Edit pot' : 'New pot', html`<div>
          ${field('Name', html`<input style=${inp} placeholder="Owner pay" value=${q.name || ''} onInput=${function (e) { setM('name', e.target.value); }} autofocus />`)}
          <div class="fin-g2">${field('Held now ($)', html`<input style=${inp} type="number" min="0" step="0.01" value=${q.bal == null ? '' : q.bal} onInput=${function (e) { setM('bal', e.target.value); }} />`)}${field('Goal ($, optional)', html`<input style=${inp} type="number" min="0" step="1" value=${q.goal || ''} onInput=${function (e) { setM('goal', e.target.value); }} />`)}</div>
          <div class="fin-g2">${field('Monthly rule', html`<select style=${inp} value=${q.rt || 'none'} onChange=${function (e) { setM('rt', e.target.value); }}><option value="none">No rule</option><option value="pct">% of money in</option><option value="fix">Fixed amount each month</option></select>`)}${q.rt === 'pct' || q.rt === 'fix' ? field(q.rt === 'pct' ? 'Percent' : 'Amount ($)', html`<input style=${inp} type="number" min="0" step="0.01" value=${q.rv == null ? '' : q.rv} onInput=${function (e) { setM('rv', e.target.value); }} />`) : null}</div>
        </div>`, html`${q.id ? delBtn('pot', delPot) : null}${btn('Cancel', close)}${btn('Save', savePot, true)}`);
      } else if (md && md.t === 'move') {
        var pt0 = md.pot;
        var doMove = function (sign) { var a = parseFloat(md.amt); if (!(a > 0)) return; F.pots = F.pots.map(function (x) { return x.id === pt0.id ? Object.assign({}, x, { bal: Math.max(0, (Number(x.bal) || 0) + sign * a) }) : x; }); close(); bump(); };
        modal = Modal(pt0.name, html`<div>${field('Amount ($)', html`<input style=${inp} type="number" min="0" step="0.01" value=${md.amt || ''} onInput=${function (e) { var v = e.target.value; setMd(function (o) { return Object.assign({}, o, { amt: v }); }); }} autofocus />`)}<div style="font-size:13px;color:var(--muted)">Held now: ${fm(pt0.bal)}. This only changes the number tracked here. Move the real money in Wise.</div></div>`, html`${btn('Take out', function () { doMove(-1); })}${btn('Add money', function () { doMove(1); }, true)}`);
      } else if (md && md.t === 'import') {
        var have = {}; F.income.forEach(function (x) { if (x.wid) have[x.wid] = 1; });
        var parsed = md.text ? parseWise(md.text, clients, have) : { rows: [], err: '' };
        var rows = md.rows || parsed.rows;
        var pick = function (i, v) { setMd(function (o) { var rr = (o.rows || parsed.rows).map(function (r, k) { return k === i ? Object.assign({}, r, { client: v }) : r; }); return Object.assign({}, o, { rows: rr }); }); };
        var onFile = function (e) { var fl = e.target.files && e.target.files[0]; if (!fl) return; var rd = new FileReader(); rd.onload = function () { var t = String(rd.result || ''); var pr = parseWise(t, clients, have); setMd(function (o) { return Object.assign({}, o, { text: t, rows: pr.rows }); }); }; rd.readAsText(fl); };
        var onPaste = function (e) { var t = e.target.value; var pr = parseWise(t, clients, have); setMd(function (o) { return Object.assign({}, o, { text: t, rows: pr.rows }); }); };
        var fresh = rows.filter(function (r) { return !r.dup; });
        var doImp = function () { var add = fresh.map(function (r) { return { id: nid('i'), date: r.date, amt: r.amt, client: r.client, note: r.note, wid: r.wid, cur: r.cur }; }); F.income = F.income.concat(add); F.lastSync = new Date().toISOString(); if (add.length) setMo(add.map(function (a) { return a.date; }).sort().pop().slice(0, 7)); close(); bump(); SR.toast && SR.toast(add.length + (add.length === 1 ? ' payment imported' : ' payments imported')); };
        modal = Modal('Import from Wise', html`<div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px">In Wise, open Statements, pick the balance and dates, and download CSV. Choose the file here or paste it. Payments already imported are skipped, so you can import the same month twice.</div>
          <input type="file" accept=".csv,text/csv" onChange=${onFile} style="margin-bottom:10px;font-size:13px" />
          <textarea placeholder="Or paste the CSV here" style=${inp + ';min-height:70px;padding:8px 10px;font-family:monospace;font-size:12px'} value=${md.text || ''} onInput=${onPaste}></textarea>
          ${parsed.err && md.text ? html`<div style="color:var(--red);font-size:13px;margin-top:8px">${parsed.err}</div>` : null}
          ${rows.length ? html`<div class="fin-imp"><div class="fin-impr h"><span>Date</span><span>From</span><span>Client</span><span style="text-align:right">Amount</span></div>${rows.map(function (r, i) { return html`<div key=${i} class="fin-impr" style=${r.dup ? 'opacity:.45' : ''}><span>${dlabel(r.date)}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title=${r.note}>${r.note || 'Payment'}${r.dup ? ' (already in)' : ''}</span><select style="min-height:30px;font-size:12px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text);max-width:100%" value=${r.client} disabled=${r.dup} onChange=${function (e) { pick(i, e.target.value); }}><option value="">Other</option>${clients.map(function (c) { return html`<option key=${c.id} value=${c.id}>${c.name}</option>`; })}</select><span style="text-align:right;font-weight:600">${fm(r.amt)}${r.cur && r.cur !== 'USD' ? ' ' + r.cur : ''}</span></div>`; })}</div>` : null}
        </div>`, html`${btn('Cancel', close)}${fresh.length ? btn('Import ' + fresh.length + ' payment' + (fresh.length === 1 ? '' : 's'), doImp, true) : null}`);
      }

      /* ---- page ---- */
      var kpi = function (cls, icn, ic2, label, val, sub) { return html`<div class=${'fin-card fin-kpi' + (cls ? ' ' + cls : '')}>${ic(icn, ic2)}<div style="min-width:0"><span class="fin-lb"><${SR.Ed} id=${"finance.k." + label} def=${label} /></span><b>${val}</b><span class="fin-sub">${sub}</span></div></div>`; };
      var openSpend = function (s) { setMd({ t: 'spend', f: s ? Object.assign({}, s) : { kind: 'rec', every: 'month', start: today, cat: 'Sales tools', pot: F.pots[2] ? F.pots[2].id : '' } }); };
      var openIncome = function (x) { setMd({ t: 'income', f: x ? Object.assign({}, x) : { date: mo === today.slice(0, 7) ? today : mo + '-01', client: '' } }); };
      var openPot = function (pt) { setMd({ t: 'pot', f: pt ? Object.assign({}, pt) : { rt: 'none', icon: 'coin' } }); };
      var empty = !F.spends.length && !F.income.length;
      var syncTxt = F.lastSync ? 'Wise import ' + dlabel(F.lastSync.slice(0, 10)) : 'Import a Wise CSV';

      return html`<div class="fin">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px">
          <div><${SR.Ed} tag="h1" id="finance.title" def="Finance" style="margin:0;font-family:'DM Sans',system-ui,sans-serif;font-size:32px" ph="Add a title" /><${SR.Ed} tag="p" id="finance.desc" def="What comes in, what we spend on tools, and what we set aside." ph="Add a description" style="margin:6px 0 0;font-size:14px;color:var(--muted)" /></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="fin-mnav"><button type="button" aria-label="Previous month" onClick=${function () { setMo(shift(mo, -1)); }}>‹</button><span>${mlabel(mo)}</span><button type="button" aria-label="Next month" onClick=${function () { setMo(shift(mo, 1)); }}>›</button></div>
            ${btn('Import from Wise', function () { setMd({ t: 'import', text: '' }); })}${btn('+ Income', function () { openIncome(); })}${btn('+ Spend', function () { openSpend(); }, true)}
          </div>
        </div>
        <div class="fin-kpis">
          ${kpi('', 'trend', 'g', 'Money in', fm(moneyIn), syncTxt)}
          ${kpi('', 'wallet', 'o', 'Spend', fm(spendTot), lines.length + ' charge' + (lines.length === 1 ? '' : 's') + ' in ' + MS[+mo.slice(5, 7) - 1])}
          ${kpi('', 'shield', '', 'Set aside in pots', fm(aside), 'By your monthly rules')}
          ${kpi('hl', 'coin', 'g', 'Free to pay out', fm(free), 'After spend and pots')}
        </div>
        <div class="fin-cols">
          <div class="fin-main">
            <div class="fin-card" style="overflow:hidden">
              <div class="fin-ch"><b><${SR.Ed} id="finance.h1" def="Spend and tools" /></b><div class="fin-seg sm">${[['all', 'All'], ['rec', 'Recurring'], ['one', 'One-off']].map(function (t) { return html`<button key=${t[0]} type="button" class=${tab === t[0] ? 'on' : ''} onClick=${function () { setTab(t[0]); }}>${t[1]}</button>`; })}</div></div>
              <div style="overflow-x:auto"><div class="fin-tbl">
                <div class="fin-tr h"><span>Name</span><span>Repeats</span><span>Next charge</span><span>Pot</span><span style="text-align:right">Amount</span></div>
                ${shown.map(function (s) {
                  var c = catOf(s.cat), nx = nextCharge(s, today), pt = null; F.pots.forEach(function (x) { if (x.id === s.pot) pt = x; });
                  return html`<button key=${s.id} type="button" class="fin-tr" onClick=${function () { openSpend(s); }}>
                    <span class="fin-nm">${ic(c[1], c[2])}<span><b>${s.name}</b><em>${s.cat}${s.note ? ' · ' + s.note : ''}</em></span></span>
                    <span><span class=${'fin-chip' + (s.kind === 'one' ? ' one' : '')}>${s.kind === 'one' ? 'One-off' : s.every === 'year' ? 'Yearly' : s.every === 'week' ? 'Weekly' : 'Monthly'}</span></span>
                    <span>${s.kind === 'one' ? (nx ? dlabel(nx) : 'Paid ' + dlabel(s.start)) : nx ? dlabel(nx) : 'Ended'}</span>
                    <span>${pt ? html`<span class="fin-tag">${pt.name}</span>` : html`<span style="color:var(--muted)">None</span>`}</span>
                    <span style="text-align:right;font-weight:700">${fm(s.amt)}</span></button>`;
                })}
                ${!shown.length ? html`<div style="padding:20px 18px;color:var(--muted);font-size:14px">${F.spends.length ? 'Nothing in this view.' : 'No spend yet.'} <button type="button" class="fin-link" onClick=${function () { openSpend(); }}>+ Add spend</button></div>` : null}
                ${recs.length ? html`<div class="fin-tr tot"><span>Monthly cost of subscriptions</span><span></span><span></span><span></span><span style="text-align:right">${fm(subTot)}</span></div>` : null}
              </div></div>
            </div>
            <div class="fin-card" style="overflow:hidden;margin-top:16px">
              <div class="fin-ch"><b><${SR.Ed} id="finance.h2" def="Money in" />, ${mlabel(mo)}</b><button type="button" class="fin-link" onClick=${function () { openIncome(); }}>+ Add payment</button></div>
              ${inc.slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; }).map(function (x) {
                return html`<button key=${x.id} type="button" class="fin-pay" onClick=${function () { openIncome(x); }}><span class="fin-av">${(cname(x.client) || 'O').slice(0, 2).toUpperCase()}</span><span style="flex:1;min-width:0;text-align:left"><b>${cname(x.client) || 'Other'}</b><em>${dlabel(x.date)}${x.note ? ' · ' + x.note : ''}</em></span><b>${fm(x.amt)}${x.cur && x.cur !== 'USD' ? ' ' + x.cur : ''}</b></button>`;
              })}
              ${!inc.length ? html`<div style="padding:18px;color:var(--muted);font-size:14px">No payments this month. Import the Wise CSV or add one by hand.</div>` : null}
            </div>
          </div>
          <div class="fin-side">
            <div class="fin-card" style="padding:18px">
              <div class="fin-ch" style="padding:0 0 12px"><b><${SR.Ed} id="finance.h3" def="Where it goes" /></b><span style="font-size:12px;color:var(--muted)">per month</span></div>
              ${whereTot > 0 ? html`<div class="fin-split">${where.map(function (w, i) { return html`<i key=${i} style=${'width:' + (w.v / whereTot * 100) + '%;background:' + SPLITC[i % 6]}></i>`; })}</div>
              <div style="margin-top:10px">${where.map(function (w, i) { return html`<div key=${i} class="fin-lg"><span><span class="fin-dot" style=${'background:' + SPLITC[i % 6]}></span>${w.n}</span><b>${fm(w.v)}</b></div>`; })}</div>` : html`<div style="font-size:14px;color:var(--muted)">Add a subscription to see the split.</div>`}
            </div>
            <div class="fin-card" style="padding:18px;margin-top:16px">
              <div class="fin-ch" style="padding:0 0 6px"><b><${SR.Ed} id="finance.h4" def="Pots" /></b><span style="display:flex;gap:12px;align-items:center"><span style="font-size:12px;color:var(--muted)">Held ${fm(potsHeld)}</span><button type="button" class="fin-link" onClick=${function () { openPot(); }}>+ New pot</button></span></div>
              ${F.pots.map(function (pt) {
                var pc = pt.goal > 0 ? Math.min(100, (pt.bal || 0) / pt.goal * 100) : 0, ru = pt.rt === 'pct' ? pt.rv + '% of money in' : pt.rt === 'fix' ? fm(pt.rv) + ' each month' : 'No rule yet';
                var paid = F.spends.filter(function (s) { return s.pot === pt.id && s.kind !== 'one'; }).length;
                return html`<div key=${pt.id} class="fin-pot">${ic(pt.icon || 'coin', '')}<div style="flex:1;min-width:0">
                  <div style="display:flex;justify-content:space-between;gap:8px"><button type="button" class="fin-pn" onClick=${function () { openPot(pt); }}>${pt.name}</button><b>${fm(pt.bal)}</b></div>
                  ${pt.goal > 0 ? html`<div class="fin-bar"><i style=${'width:' + pc + '%'}></i></div>` : null}
                  <div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted);margin-top:4px"><span>${ru}${setAside(pt, moneyIn) > 0 ? ', ' + fm(setAside(pt, moneyIn)) + ' this month' : ''}${pt.goal > 0 ? '. Goal ' + fm(pt.goal) : ''}${paid ? '. Pays ' + paid + ' subscription' + (paid === 1 ? '' : 's') : ''}</span><button type="button" class="fin-link" onClick=${function () { setMd({ t: 'move', pot: pt, amt: '' }); }}>Adjust</button></div></div></div>`;
              })}
            </div>
            <div class="fin-card" style="padding:18px;margin-top:16px">
              <div class="fin-ch" style="padding:0 0 6px"><b><${SR.Ed} id="finance.h5" def="Money in by client" /></b></div>
              ${clientRows.length ? clientRows.map(function (r) { return html`<div key=${r.k} class="fin-cl"><span class="fin-av">${r.n.slice(0, 2).toUpperCase()}</span><span style="flex:1">${r.n}</span><b>${fm(r.v)}</b></div>`; }) : html`<div style="font-size:14px;color:var(--muted)">Nothing yet this month.</div>`}
            </div>
          </div>
        </div>
        <${SR.Blocks} id="finance" />
        ${modal}
      </div>`;
    };
  })();


  /* ---------- BATTLEFRONTS: the system view (clients orbit the agency) + the old map ---------- */
  SR.agoals = SR.agoals || {};
  var SYS_MRR_GOAL = 12000;
  var mixHex = function (h, t, a) { h = String(h || '#888888').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); var n = parseInt(h, 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255, T = t === 'w' ? 255 : 0; return 'rgb(' + Math.round(r + (T - r) * a) + ',' + Math.round(g + (T - g) * a) + ',' + Math.round(b + (T - b) * a) + ')'; };
  var arcPath = function (x, y, r, frac) { var a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * Math.max(0.001, Math.min(0.999, frac)); return 'M' + (x + Math.cos(a0) * r) + ' ' + (y + Math.sin(a0) * r) + ' A' + r + ' ' + r + ' 0 ' + (frac > 0.5 ? 1 : 0) + ' 1 ' + (x + Math.cos(a1) * r) + ' ' + (y + Math.sin(a1) * r); };
  var STARS = (function () { var s = 7, o = []; for (var i = 0; i < 90; i++) { s = (s * 9301 + 49297) % 233280; var x = s / 233280; s = (s * 9301 + 49297) % 233280; var y = s / 233280; s = (s * 9301 + 49297) % 233280; o.push([x * 2000, y * 1300, 0.8 + (s / 233280) * 1.6, 0.25 + (s / 233280) * 0.5]); } return o; })();

  var shortName = function (n) { return String(n).replace(/\s+(Consulting|Services?)$/i, '').replace(/\s+for\s+Expats$/i, ''); };
  var ceSave = function (e, fn, keep) { var v = String(e.currentTarget.textContent || '').replace(/\s+/g, ' ').trim(); if (v || keep) fn(v); else e.currentTarget.textContent = ''; };

  SR.Battlefronts = function (p) {
    var useState = React.useState, mrrLive = SR.useMrr(), money = SR.money;
    var tk = useState(0), setTick = tk[1], tick = function () { setTick(function (x) { return x + 1; }); };
    if (!SR.agoals.list) SR.agoals.list = [{ id: 'g1', t: 'Hire 1 part-time SEO specialist', due: 'Feb 28', p: 20 }, { id: 'g2', t: 'Open Dubai with 2 clients', due: 'Mar 31', p: 15 }];
    if (!SR.agoals.mrr) SR.agoals.mrr = { target: SYS_MRR_GOAL, due: 'Dec 31' };
    var goals = SR.agoals.list, MG = SR.agoals.mrr, TARGET = +MG.target || SYS_MRR_GOAL;
    var rows = (p.clients || []).map(function (c) {
      var H = SR.clientHealth(c, p.tasks || []), A = H.A, fee = A ? (+A.retainer || 0) : (+c.retainer || 0);
      var why = H.payOver ? H.payOver + ' payment' + (H.payOver > 1 ? 's' : '') + ' overdue' : H.over ? H.over + ' overdue task' + (H.over > 1 ? 's' : '') : (H.dl != null && H.dl <= 45 && H.dl >= -3) ? 'Contract ends in ' + Math.max(0, H.dl) + ' days' : '';
      var next = H.payOver ? 'Chase the payment' : H.over ? 'Clear the overdue tasks' : why ? 'Talk about renewing' : '';
      return { c: c, H: H, fee: fee, why: why, next: next };
    });
    var sum = rows.reduce(function (t, r) { return t + r.fee; }, 0), mrr = mrrLive == null ? sum : mrrLive, pct = Math.max(0, Math.min(100, Math.round(mrr / TARGET * 100)));
    var attn = rows.filter(function (r) { return r.H.h !== 'ok'; }).sort(function (a, b) { return (a.H.h === 'risk' ? 0 : 1) - (b.H.h === 'risk' ? 0 : 1); });
    var renew = rows.filter(function (r) { return r.H.dl != null && r.H.dl >= 0 && r.H.dl <= 90; }).sort(function (a, b) { return a.H.dl - b.H.dl; });
    var tag = function (h) { var m = { ok: ['On track', 'var(--greenBg)', 'var(--green)'], watch: ['Watch', 'var(--goldBg)', 'var(--gold)'], risk: ['At risk', 'var(--redBg)', 'var(--red)'] }[h] || ['', '', '']; return html`<span style=${'background:' + m[1] + ';color:' + m[2] + ';border-radius:4px;padding:1px 8px;font-size:12px;font-weight:500;white-space:nowrap'}>${m[0]}</span>`; };
    var card = 'border:1px solid var(--border);border-radius:10px;padding:14px 16px;min-width:0';
    var upG = function (id, o) { SR.agoals.list = goals.map(function (g) { return g.id === id ? Object.assign({}, g, o) : g; }); tick(); };
    var rowBtn = function (r, extra) { return html`<button key=${r.c.id} type="button" class="bf-row" onClick=${function () { p.onOpenClient && p.onOpenClient(r.c.id); }}><span class="sr-ib" style=${'background:' + (r.c.color || '#888') + ';width:22px;height:22px;border-radius:6px;flex:none'}></span><b>${r.c.name}</b><span class="bf-sub">${extra}</span>${r.H ? tag(r.H.h) : null}</button>`; };
    return html`<div class="bf">
      <${SR.Ed} tag="h1" id="war.title" def="Battlefronts" style="margin:0;font-size:32px" ph="Add a title" />
      <${SR.Ed} tag="p" id="war.desc" def="Your weekly check-in. Where income stands, who needs you this week, and what is coming up." style="color:var(--muted);margin:4px 0 20px" ph="Add a description" />
      <div class="bf-top">
        <div style=${card}>
          <div class="bf-lb">Monthly income</div>
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:28px">${money(mrr)}</b><span style="color:var(--muted);font-size:13px">of $<input aria-label="Monthly income goal" type="number" class="bf-in" value=${TARGET} onChange=${function (e) { SR.agoals.mrr = Object.assign({}, MG, { target: Math.max(1, +e.target.value || SYS_MRR_GOAL) }); tick(); }} /></span></div>
          <div class="bf-bar"><i style=${'width:' + pct + '%'}></i></div>
          <div style="font-size:12.5px;color:var(--muted)">${pct}% there. ${money(Math.max(0, TARGET - mrr))} to go.</div>
        </div>
        <div style=${card}><div class="bf-lb">Active clients</div><b style="font-size:28px">${rows.length}</b><div style="font-size:12.5px;color:var(--muted)">${rows.length - attn.length} on track</div></div>
        <div style=${card}><div class="bf-lb">Need attention</div><b style=${'font-size:28px;color:' + (attn.length ? 'var(--red)' : 'var(--green)')}>${attn.length}</b><div style="font-size:12.5px;color:var(--muted)">${attn.length ? 'See the list below' : 'All clear'}</div></div>
      </div>
      <h2 class="bf-h">Needs attention this week</h2>
      ${attn.length ? html`<div class="bf-list">${attn.map(function (r) { return rowBtn(r, r.why + ' · Do this next: ' + r.next); })}</div>` : html`<div class="bf-empty">Nothing is late or at risk. Good week.</div>`}
      <h2 class="bf-h">Renewals in the next 90 days</h2>
      ${renew.length ? html`<div class="bf-list">${renew.map(function (r) { return rowBtn(r, 'Ends ' + SR.fmtDay(r.H.end) + ' (' + r.H.dl + ' days) · ' + money(r.fee) + ' a month'); })}</div>` : html`<div class="bf-empty">No contracts end in the next 90 days.</div>`}
      <h2 class="bf-h">Agency goals</h2>
      <div class="bf-goals">${goals.map(function (g) { return html`<div key=${g.id} style=${card + ';position:relative'}>
        <button type="button" class="qas-x" aria-label="Delete goal" title="Delete goal" style="position:absolute;right:8px;top:8px" onClick=${function () { SR.agoals.list = goals.filter(function (x) { return x.id !== g.id; }); tick(); }}>×</button>
        <div contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" class="ed" style="font-weight:600;padding-right:22px" data-ph="Name this goal" onBlur=${function (e) { upG(g.id, { t: String(e.currentTarget.textContent || '').trim() }); }}>${g.t}</div>
        <div class="bf-bar" style="margin:10px 0 6px"><i style=${'width:' + Math.max(0, Math.min(100, +g.p || 0)) + '%'}></i></div>
        <div style="display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--muted)"><input type="range" min="0" max="100" aria-label="Progress" value=${+g.p || 0} onChange=${function (e) { upG(g.id, { p: +e.target.value }); }} style="flex:1;accent-color:var(--accent)" /><span>${+g.p || 0}%</span><span contentEditable="true" suppressContentEditableWarning=${true} spellcheck="false" class="ed" data-ph="Due" onBlur=${function (e) { upG(g.id, { due: String(e.currentTarget.textContent || '').trim() }); }}>${g.due}</span></div></div>`; })}
        <button type="button" class="bf-add" onClick=${function () { SR.agoals.list = goals.concat([{ id: 'g' + Date.now().toString(36), t: '', due: '', p: 0 }]); tick(); }}>+ New goal</button></div>
      <${SR.Blocks} id="war" /></div>`;
  };

})(window.SR);
