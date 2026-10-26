/* Two way sync between the dashboard (Supabase tables) and one Google Calendar.
   Pure logic: the caller passes in `sb` (Supabase) and `g` (Google) adapters, so it can be tested without a network. */
'use strict';

const DAY = 86400000;
const addDays = (d, n) => new Date(new Date(d + 'T00:00:00Z').getTime() + n * DAY).toISOString().slice(0, 10);
const mins = (t) => { const a = String(t || '0:0').split(':'); return (+a[0]) * 60 + (+a[1] || 0); };
const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

function localParts(iso, tz) {
  const P = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date(iso)).forEach((x) => { P[x.type] = x.value; });
  return { date: P.year + '-' + P.month + '-' + P.day, time: P.hour + ':' + P.minute };
}

/* Google event -> { title, date, start, end, allDay } in the given timezone */
function fromGoogle(g, tz) {
  const title = g.summary || '(no title)';
  if (g.start && g.start.date) return { title, date: g.start.date, start: '', end: '', allDay: true };
  const s = localParts(g.start.dateTime, tz), e = g.end && g.end.dateTime ? localParts(g.end.dateTime, tz) : s;
  return { title, date: s.date, start: s.time, end: e.date === s.date ? e.time : '23:59', allDay: false };
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
  const hasTime = kind === 'task' ? !!d.time : !!d.start && !d.allDay;
  if (!hasTime) return Object.assign(base, { start: { date: d.date }, end: { date: addDays(d.date, 1) } });
  const s = mins(kind === 'task' ? d.time : d.start);
  let e = kind === 'task' ? s + (d.min || d.est || 30) : (d.end ? mins(d.end) : s + 60);
  if (e <= s) e = s + 30; if (e > 1439) e = 1439;
  return Object.assign(base, { start: { dateTime: d.date + 'T' + hm(s) + ':00', timeZone: tz }, end: { dateTime: d.date + 'T' + hm(e) + ':00', timeZone: tz } });
}

async function runSync(ctx) {
  const { sb, g, userId, name, tz } = ctx, stamp = ctx.stamp || (() => new Date().toISOString());
  const now = Date.now(), stats = { pulledNew: 0, pulledChanged: 0, pushedNew: 0, pushedChanged: 0, removed: 0 };
  const [taskRows, eventRows, links, gitems] = await Promise.all([
    sb.select('tasks', 'select=*&deleted=eq.false'),
    sb.select('events', 'select=*&deleted=eq.false'),
    sb.select('gcal_links', 'select=*&user_id=eq.' + userId),
    g.list(new Date(now - 30 * DAY).toISOString(), new Date(now + 180 * DAY).toISOString()),
  ]);
  const taskById = {}, eventById = {};
  taskRows.forEach((r) => { taskById[r.id] = r; }); eventRows.forEach((r) => { eventById[r.id] = r; });
  const taskScope = (r) => r && !r.deleted && r.data.owner === name && !r.data.done;
  const taskItems = {};
  taskRows.forEach((r) => { if (!taskScope(r)) return; blocksOf(r.data).forEach((b) => { if (!b.done) taskItems[r.id + (b.i < 0 ? '' : '#' + b.i)] = { row: r, block: b }; }); });
  const eventScope = (r) => r && !r.deleted && (!r.data.who || r.data.who === name);
  const byGcal = {}, byLocal = {};
  links.forEach((l) => { byGcal[l.gcal_id] = l; byLocal[l.kind + ':' + l.local_id] = l; });
  const handled = new Set(), dropLinks = [], saveLinks = [];
  const link = (kind, localId, gcalId, gUpdated, syncedAt) => ({ user_id: userId, kind, local_id: String(localId), gcal_id: gcalId, g_updated: gUpdated, synced_at: syncedAt });

  /* 1. pull: what changed in Google */
  for (const ev of gitems) {
    const l = byGcal[ev.id], priv = (ev.extendedProperties && ev.extendedProperties.private) || {};
    if (!l) {
      if (ev.status === 'cancelled' || priv.srTask || priv.srEvent) continue;
      const f = fromGoogle(ev, tz), id = 'g' + ev.id;
      const rows = await sb.upsert('events', [{ id, data: { id, title: f.title, date: f.date, start: f.start, end: f.end, allDay: f.allDay, who: name }, deleted: false }], 'id');
      saveLinks.push(link('event', id, ev.id, ev.updated, rows[0].updated_at)); handled.add('event:' + id); stats.pulledNew++; continue;
    }
    if (ev.updated === l.g_updated) continue;
    const key = l.kind + ':' + l.local_id; handled.add(key);
    const [tid, slotIx] = l.kind === 'task' ? String(l.local_id).split('#') : [l.local_id, undefined];
    const idx = slotIx === undefined ? -1 : +slotIx;
    if (ev.status === 'cancelled') {
      if (l.kind === 'task' && taskById[tid]) {
        const r = taskById[tid], d = Object.assign({}, r.data);
        if (idx < 0) d.time = ''; else { d.slots = (d.slots || []).filter((_, k) => k !== idx); if (d.slots.length) { d.date = d.slots[0].date; d.time = d.slots[0].time; } else d.time = ''; }
        d.auto = false; await sb.upsert('tasks', [{ id: r.id, data: d, deleted: false }], 'id');
      }
      if (l.kind === 'event' && eventById[l.local_id]) { const r = eventById[l.local_id]; await sb.upsert('events', [{ id: r.id, data: r.data, deleted: true }], 'id'); }
      dropLinks.push(l); stats.removed++; continue;
    }
    const f = fromGoogle(ev, tz);
    if (l.kind === 'task') {
      const r = taskById[tid]; if (!r) { dropLinks.push(l); continue; }
      const dur = f.start && f.end ? Math.max(15, mins(f.end) - mins(f.start)) : null, d = Object.assign({}, r.data);
      if (idx < 0) { d.name = stripPart(f.title); d.date = f.date; d.time = f.start; if (dur) d.est = dur + (d.spent || 0); }
      else if (d.slots && d.slots[idx]) { d.slots = d.slots.map((x, k) => k === idx ? Object.assign({}, x, { date: f.date, time: f.start, min: dur || x.min }) : x); }
      d.auto = false;
      const rows = await sb.upsert('tasks', [{ id: r.id, data: d, deleted: false }], 'id');
      saveLinks.push(Object.assign({}, l, { g_updated: ev.updated, synced_at: rows[0].updated_at }));
    } else {
      const r = eventById[l.local_id]; if (!r) { dropLinks.push(l); continue; }
      const rows = await sb.upsert('events', [{ id: r.id, data: Object.assign({}, r.data, { title: f.title, date: f.date, start: f.start, end: f.end, allDay: f.allDay }), deleted: false }], 'id');
      saveLinks.push(Object.assign({}, l, { g_updated: ev.updated, synced_at: rows[0].updated_at }));
    }
    stats.pulledChanged++;
  }
  const dropped = new Set(dropLinks.map((l) => l.kind + ':' + l.local_id));

  /* 2. push: what changed here */
  const upsertLink = (kind, localId, made, existing) => saveLinks.push(existing ? Object.assign({}, existing, { g_updated: made.updated, synced_at: stamp() }) : link(kind, localId, made.id, made.updated, stamp()));
  const pushOne = async (kind, key, updatedAt, body) => {
    const k = kind + ':' + key; if (handled.has(k)) return;
    const l = byLocal[k];
    if (!l || dropped.has(k)) { const made = await g.insert(body); upsertLink(kind, key, made, null); stats.pushedNew++; }
    else if (new Date(updatedAt) > new Date(l.synced_at || 0)) { const made = await g.patch(l.gcal_id, body); upsertLink(kind, key, made, l); stats.pushedChanged++; }
  };
  for (const key of Object.keys(taskItems)) {
    const { row, block } = taskItems[key], n = (row.data.slots || []).length;
    await pushOne('task', key, row.updated_at, toGoogle('task', key, Object.assign({}, row.data, { date: block.date, time: block.time, min: block.min }), tz, { description: 'Sarac Ramsay dashboard task', part: n > 1 ? (block.i + 1) + '/' + n : '' }));
  }
  for (const r of eventRows) if (eventScope(r)) await pushOne('event', r.id, r.updated_at, toGoogle('event', r.id, r.data, tz, null));

  /* 3. clean up: links whose dashboard item is gone, finished, unscheduled or not this person's */
  for (const l of links) {
    const key = l.kind + ':' + l.local_id; if (dropped.has(key)) continue;
    const alive = l.kind === 'task' ? !!taskItems[l.local_id] : eventScope(eventById[l.local_id]);
    if (!alive) { try { await g.delete(l.gcal_id); } catch (e) { /* already gone */ } dropLinks.push(l); stats.removed++; }
  }
  if (dropLinks.length) await sb.del('gcal_links', dropLinks.map((l) => ({ kind: l.kind, local_id: l.local_id })), userId);
  const seen = new Set(), out = [];
  saveLinks.slice().reverse().forEach((l) => { const k = l.kind + ':' + l.local_id; if (!seen.has(k)) { seen.add(k); out.push(l); } });
  if (out.length) await sb.upsert('gcal_links', out, 'user_id,kind,local_id');
  return stats;
}

module.exports = { runSync, fromGoogle, toGoogle, localParts, blocksOf };
