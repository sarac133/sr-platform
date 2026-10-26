/* Two way sync between the dashboard (Supabase tables) and one Google Calendar.
   Pure logic: the caller passes in `sb` (Supabase) and `g` (Google) adapters, so it can be tested without a network.
   Built to finish inside a function time limit: batched writes, parallel Google calls, a deadline, and links saved as it goes. */
'use strict';

const DAY = 86400000;
const addDays = (d, n) => new Date(new Date(d + 'T00:00:00Z').getTime() + n * DAY).toISOString().slice(0, 10);
const mins = (t) => { const a = String(t || '0:0').split(':'); return (+a[0]) * 60 + (+a[1] || 0); };
const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const GCOLORS = { 1: '#7986cb', 2: '#33b679', 3: '#8e24aa', 4: '#e67c73', 5: '#f6bf26', 6: '#f4511e', 7: '#039be5', 8: '#616161', 9: '#3f51b5', 10: '#0b8043', 11: '#d50000' };

function localParts(iso, tz) {
  const P = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(iso)).forEach((x) => { P[x.type] = x.value; });
  return { date: P.year + '-' + P.month + '-' + P.day, time: P.hour + ':' + P.minute };
}

/* reminder: '' = Google's default, 'none', or minutes before */
function remFrom(g) {
  const r = g.reminders; if (!r || r.useDefault) return '';
  const o = r.overrides || []; return o.length ? o[0].minutes : 'none';
}

/* Google event -> { title, date, start, end, allDay, plus the details the popover shows } in the given timezone */
function fromGoogle(g, tz) {
  const details = { desc: g.description || '', loc: g.location || '', rec: !!g.recurringEventId, link: g.htmlLink || '', meet: g.hangoutLink || '', by: (g.creator && g.creator.email) || '', rem: remFrom(g), gcolor: g.colorId || '', color: g.colorId && GCOLORS[g.colorId] ? GCOLORS[g.colorId] : '' };
  const title = g.summary || '(no title)';
  if (g.start && g.start.date) return Object.assign({ title, date: g.start.date, start: '', end: '', allDay: true }, details);
  const s = localParts(g.start.dateTime, tz), e = g.end && g.end.dateTime ? localParts(g.end.dateTime, tz) : s;
  return Object.assign({ title, date: s.date, start: s.time, end: e.date === s.date ? e.time : '23:59', allDay: false }, details);
}

/* every scheduled piece of a task (chunk slots, or the one date+time block) */
function blocksOf(d) {
  if (d.slots && d.slots.length) return d.slots.map((s, i) => ({ i, date: s.date, time: s.time, min: s.min, done: !!s.done }));
  if (d.date && d.time) return [{ i: -1, date: d.date, time: d.time, min: d.est || 30, done: false }];
  return [];
}
const stripPart = (t) => String(t || '').replace(/ \(part \d+\/\d+\)$/, '');

/* dashboard item -> Google event body */
function toGoogle(kind, id, d, tz, extra) {
  const private_ = kind === 'task' ? { srTask: String(id) } : { srEvent: String(id) };
  const base = { summary: kind === 'task' ? d.name + (extra && extra.part ? ' (part ' + extra.part + ')' : '') : d.title, extendedProperties: { private: private_ } };
  if (extra && extra.description) base.description = extra.description;
  if (kind === 'event') {
    if (d.desc !== undefined) base.description = d.desc;
    if (d.loc !== undefined) base.location = d.loc;
    if (d.gcolor) base.colorId = String(d.gcolor);
    if (d.rem === 'none') base.reminders = { useDefault: false, overrides: [] };
    else if (d.rem !== undefined && d.rem !== '' && !isNaN(+d.rem)) base.reminders = { useDefault: false, overrides: [{ method: 'popup', minutes: +d.rem }] };
  }
  const hasTime = kind === 'task' ? !!d.time : !!d.start && !d.allDay;
  if (!hasTime) return Object.assign(base, { start: { date: d.date }, end: { date: addDays(d.date, 1) } });
  const s = mins(kind === 'task' ? d.time : d.start);
  let e = kind === 'task' ? s + (d.min || d.est || 30) : (d.end ? mins(d.end) : s + 60);
  if (e <= s) e = s + 30; if (e > 1439) e = 1439;
  return Object.assign(base, { start: { dateTime: d.date + 'T' + hm(s) + ':00', timeZone: tz }, end: { dateTime: d.date + 'T' + hm(e) + ':00', timeZone: tz } });
}

async function runSync(ctx) {
  const { sb, g, userId, name, tz } = ctx, account = ctx.account || '', primaryEmail = ctx.primaryEmail || '', isPrimary = ctx.isPrimary !== false;
  const stamp = ctx.stamp || (() => new Date().toISOString()), deadline = ctx.deadline || Infinity, timeLeft = () => deadline - Date.now();
  const now = Date.now(), stats = { pulledNew: 0, pulledChanged: 0, pushedNew: 0, pushedChanged: 0, removed: 0, partial: false, failed: 0, firstError: '' };
  const [taskRows, eventRows, allLinks, gitems] = await Promise.all([
    sb.selectAll ? sb.selectAll('tasks', 'select=*&deleted=eq.false&order=id') : sb.select('tasks', 'select=*&deleted=eq.false'),
    sb.selectAll ? sb.selectAll('events', 'select=*&deleted=eq.false&order=id') : sb.select('events', 'select=*&deleted=eq.false'),
    sb.select('gcal_links', 'select=*&user_id=eq.' + userId + '&limit=20000'),
    g.list(new Date(now - 30 * DAY).toISOString(), new Date(now + 120 * DAY).toISOString()),
  ]);
  /* links written before accounts existed belong to the primary account */
  const mineOf = (l) => (l.account || primaryEmail) === account;
  const links = allLinks.filter(mineOf), elsewhere = new Set(allLinks.filter((l) => !mineOf(l)).map((l) => l.kind + ':' + l.local_id));
  const taskById = {}, eventById = {};
  taskRows.forEach((r) => { taskById[r.id] = r; }); eventRows.forEach((r) => { eventById[r.id] = r; });
  const taskScope = (r) => r && !r.deleted && r.data.owner === name && !r.data.done;
  const taskItems = {};
  taskRows.forEach((r) => { if (!taskScope(r)) return; blocksOf(r.data).forEach((b) => { if (!b.done) taskItems[r.id + (b.i < 0 ? '' : '#' + b.i)] = { row: r, block: b }; }); });
  const eventScope = (r) => r && !r.deleted && (!r.data.who || r.data.who === name);
  const byGcal = {}, byLocal = {};
  links.forEach((l) => { byGcal[l.gcal_id] = l; byLocal[l.kind + ':' + l.local_id] = l; });
  const handled = new Set(), dropLinks = [], saveLinks = [];
  const link = (kind, localId, gcalId, gUpdated, syncedAt) => ({ user_id: userId, kind, local_id: String(localId), gcal_id: gcalId, g_updated: gUpdated, synced_at: syncedAt, account });
  const flushLinks = async () => {
    if (!saveLinks.length) return; const batch = saveLinks.splice(0), seen = new Set(), out = [];
    batch.slice().reverse().forEach((l) => { const k = l.kind + ':' + l.local_id; if (!seen.has(k)) { seen.add(k); out.push(l); } });
    await sb.upsertMany('gcal_links', out, 'user_id,kind,local_id');
  };

  /* 1. pull: what changed in Google. Everything is collected first and written in a few batches. */
  const taskOut = {}, evOut = {}, newOut = [], adopted = new Set(), orphanDel = [];
  const workTask = (id) => (taskOut[id] ? taskOut[id].data : Object.assign({}, taskById[id].data));
  for (const ev of gitems) {
    const l = byGcal[ev.id], priv = (ev.extendedProperties && ev.extendedProperties.private) || {};
    if (!l) {
      if (ev.status === 'cancelled') continue;
      if (priv.srTask || priv.srEvent) {
        /* made by us earlier but the link was lost (for example a sync that timed out): adopt the first copy, delete extra copies */
        const kind = priv.srTask ? 'task' : 'event', key = String(priv.srTask || priv.srEvent), k = kind + ':' + key;
        const alive = kind === 'task' ? !!taskItems[key] : eventScope(eventById[key]);
        if (alive && !byLocal[k] && !elsewhere.has(k) && !adopted.has(k)) { adopted.add(k); const lk = link(kind, key, ev.id, ev.updated, stamp()); byLocal[k] = lk; byGcal[ev.id] = lk; saveLinks.push(lk); handled.add(k); }
        else if (isPrimary) orphanDel.push(ev.id);
        continue;
      }
      const f = fromGoogle(ev, tz), id = 'g' + ev.id;
      newOut.push({ row: { id, data: Object.assign({ id, who: name, cal: account || primaryEmail }, f), deleted: false }, gid: ev.id, gUpdated: ev.updated });
      handled.add('event:' + id); continue;
    }
    if (ev.updated === l.g_updated) continue;
    const key = l.kind + ':' + l.local_id; handled.add(key);
    const [tid, slotIx] = l.kind === 'task' ? String(l.local_id).split('#') : [l.local_id, undefined];
    const idx = slotIx === undefined ? -1 : +slotIx;
    if (ev.status === 'cancelled') {
      if (l.kind === 'task' && taskById[tid]) {
        const d = workTask(tid);
        if (idx < 0) d.time = ''; else { d.slots = (d.slots || []).filter((_, k) => k !== idx); if (d.slots.length) { d.date = d.slots[0].date; d.time = d.slots[0].time; } else d.time = ''; }
        d.auto = false; taskOut[tid] = { row: { id: tid, data: d, deleted: false }, metas: (taskOut[tid] ? taskOut[tid].metas : []) };
      }
      if (l.kind === 'event' && eventById[l.local_id]) { const r = eventById[l.local_id]; evOut[r.id] = { row: { id: r.id, data: r.data, deleted: true }, metas: [] }; }
      dropLinks.push(l); stats.removed++; continue;
    }
    const f = fromGoogle(ev, tz);
    if (l.kind === 'task') {
      const r = taskById[tid]; if (!r) { dropLinks.push(l); continue; }
      const dur = f.start && f.end ? Math.max(15, mins(f.end) - mins(f.start)) : null, d = workTask(tid);
      if (idx < 0) { d.name = stripPart(f.title); d.date = f.date; d.time = f.start; if (dur) d.est = dur + (d.spent || 0); }
      else if (d.slots && d.slots[idx]) { d.slots = d.slots.map((x, k) => k === idx ? Object.assign({}, x, { date: f.date, time: f.start, min: dur || x.min }) : x); }
      d.auto = false;
      const prev = taskOut[tid] ? taskOut[tid].metas : []; taskOut[tid] = { row: { id: r.id, data: d, deleted: false }, metas: prev.concat([{ l, gUpdated: ev.updated }]) };
    } else {
      const r = eventById[l.local_id]; if (!r) { dropLinks.push(l); continue; }
      evOut[r.id] = { row: { id: r.id, data: Object.assign({}, r.data, f), deleted: false }, metas: [{ l, gUpdated: ev.updated }] };
    }
    stats.pulledChanged++;
  }
  const byId = (rows) => { const m = {}; rows.forEach((x) => { m[x.id] = x; }); return m; };
  if (Object.keys(taskOut).length) {
    const back = byId(await sb.upsertMany('tasks', Object.keys(taskOut).map((k) => taskOut[k].row), 'id'));
    Object.keys(taskOut).forEach((k) => taskOut[k].metas.forEach((m) => saveLinks.push(Object.assign({}, m.l, { g_updated: m.gUpdated, synced_at: back[k] ? back[k].updated_at : stamp() }))));
  }
  if (Object.keys(evOut).length) {
    const back = byId(await sb.upsertMany('events', Object.keys(evOut).map((k) => evOut[k].row), 'id'));
    Object.keys(evOut).forEach((k) => evOut[k].metas.forEach((m) => saveLinks.push(Object.assign({}, m.l, { g_updated: m.gUpdated, synced_at: back[k] ? back[k].updated_at : stamp() }))));
  }
  if (newOut.length) {
    const back = byId(await sb.upsertMany('events', newOut.map((n) => n.row), 'id'));
    newOut.forEach((n) => saveLinks.push(link('event', n.row.id, n.gid, n.gUpdated, back[n.row.id] ? back[n.row.id].updated_at : stamp())));
    stats.pulledNew = newOut.length;
  }
  await flushLinks();
  const dropped = new Set(dropLinks.map((l) => l.kind + ':' + l.local_id));

  /* 2. push: what changed here, several Google calls at a time */
  const jobs = [], errors = [];
  const upsertLink = (kind, localId, made, existing) => saveLinks.push(existing ? Object.assign({}, existing, { g_updated: made.updated, synced_at: stamp(), account }) : link(kind, localId, made.id, made.updated, stamp()));
  const plan = (kind, key, updatedAt, body, data) => {
    const k = kind + ':' + key; if (handled.has(k) || elsewhere.has(k)) return;
    const l = byLocal[k];
    if (!l || dropped.has(k)) {
      if (!isPrimary) return; if (kind === 'event' && data && data.cal && data.cal !== account && data.cal !== primaryEmail) return;
      jobs.push(async () => { const made = await g.insert(body); upsertLink(kind, key, made, null); stats.pushedNew++; });
    } else if (new Date(updatedAt) > new Date(l.synced_at || 0)) {
      jobs.push(async () => {
        let made; try { made = await g.patch(l.gcal_id, body); } catch (e) { if (e.status === 404 || e.status === 410) { made = await g.insert(body); upsertLink(kind, key, made, null); stats.pushedChanged++; return; } throw e; }
        upsertLink(kind, key, made, l); stats.pushedChanged++;
      });
    }
  };
  for (const key of Object.keys(taskItems)) {
    const { row, block } = taskItems[key], n = (row.data.slots || []).length;
    plan('task', key, row.updated_at, toGoogle('task', key, Object.assign({}, row.data, { date: block.date, time: block.time, min: block.min }), tz, { description: 'Sarac Ramsay dashboard task', part: n > 1 ? (block.i + 1) + '/' + n : '' }));
  }
  for (const r of eventRows) if (eventScope(r)) plan('event', r.id, r.updated_at, toGoogle('event', r.id, r.data, tz, null), r.data);
  orphanDel.forEach((gid) => jobs.unshift(async () => { try { await g.delete(gid); } catch (e) { if (e.status !== 404 && e.status !== 410) throw e; } stats.removed++; }));

  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      if (timeLeft() < 800) return;
      const job = jobs[next++];
      try { await job(); } catch (e) { stats.failed++; if (!stats.firstError) stats.firstError = String(e.message || e); }
      if (saveLinks.length >= 15) { try { await flushLinks(); } catch (e) {} }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  if (next < jobs.length) stats.partial = true;
  await flushLinks();

  /* 3. clean up: links whose dashboard item is gone, finished, unscheduled or not this person's. Only after a full pass. */
  if (!stats.partial && timeLeft() > 2000) {
    const stale = links.filter((l) => { const key = l.kind + ':' + l.local_id; if (dropped.has(key)) return false; return !(l.kind === 'task' ? !!taskItems[l.local_id] : eventScope(eventById[l.local_id])); });
    let si = 0;
    const cw = async () => { while (si < stale.length) { if (timeLeft() < 800) { stats.partial = true; return; } const l = stale[si++]; try { await g.delete(l.gcal_id); } catch (e) { /* already gone */ } dropLinks.push(l); stats.removed++; } };
    await Promise.all([cw(), cw(), cw(), cw()]);
  }
  if (dropLinks.length) await sb.del('gcal_links', dropLinks.map((l) => ({ kind: l.kind, local_id: l.local_id })), userId);
  if (stats.failed && stats.failed >= jobs.length && jobs.length) throw new Error(stats.firstError);
  return stats;
}

module.exports = { runSync, fromGoogle, toGoogle, localParts, blocksOf, GCOLORS };
