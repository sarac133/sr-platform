'use strict';
const crypto = require('crypto');
const env = () => ({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, gid: process.env.GOOGLE_CLIENT_ID, gsecret: process.env.GOOGLE_CLIENT_SECRET, site: (process.env.SITE_URL || '').replace(/\/$/, '') });

/* Supabase REST with the service role key (server only) */
function supabase() {
  const { url, key } = env();
  const H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const call = async (path, opt) => { const r = await fetch(url + '/rest/v1/' + path, Object.assign({ headers: H }, opt)); if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text())); const t = await r.text(); return t ? JSON.parse(t) : []; };
  return {
    select: (table, q) => call(table + '?' + q),
    upsert: (table, rows, onConflict) => call(table + '?on_conflict=' + onConflict, { method: 'POST', headers: Object.assign({}, H, { Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(rows) }),
    rm: (table, filter) => call(table + '?' + filter, { method: 'DELETE' }),
    patch: (table, filter, body) => call(table + '?' + filter, { method: 'PATCH', body: JSON.stringify(body) }),
    del: async (table, pairs, userId) => { for (const p of pairs) await call(table + '?user_id=eq.' + userId + '&kind=eq.' + p.kind + '&local_id=eq.' + encodeURIComponent(p.local_id), { method: 'DELETE' }); },
  };
}

/* the signed in dashboard user, from their Supabase access token */
async function userFromToken(token) {
  const { url, key } = env();
  const r = await fetch(url + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
  if (!r.ok) return null; const u = await r.json();
  const ok = await fetch(url + '/rest/v1/allowed_users?select=email&email=ilike.' + encodeURIComponent(u.email), { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  const rows = ok.ok ? await ok.json() : [];
  if (rows.length) return u;
  const dom = String(u.email || '').split('@')[1] || '';
  const d = await fetch(url + '/rest/v1/allowed_domains?select=domain&domain=ilike.' + encodeURIComponent(dom), { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  const drows = d.ok ? await d.json() : [];
  return dom && drows.length ? u : null;
}
const sign = (v) => crypto.createHmac('sha256', env().key).update(v).digest('hex');
const makeState = (userId) => { const v = userId + '.' + Date.now(); return v + '.' + sign(v); };
const readState = (s) => { const p = String(s || '').split('.'); if (p.length !== 3 || sign(p[0] + '.' + p[1]) !== p[2] || Date.now() - +p[1] > 600000) return null; return p[0]; };

/* Google Calendar adapter for one refresh token */
async function googleFor(refreshToken) {
  const { gid, gsecret } = env();
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: gid, client_secret: gsecret, refresh_token: refreshToken, grant_type: 'refresh_token' }) });
  if (!r.ok) throw new Error('google token ' + r.status + ' ' + (await r.text()));
  const at = (await r.json()).access_token; const B = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const H = { Authorization: 'Bearer ' + at, 'Content-Type': 'application/json' };
  const j = async (res) => { if (!res.ok) { const e = new Error('google ' + res.status); e.status = res.status; throw e; } const t = await res.text(); return t ? JSON.parse(t) : {}; };
  return {
    at,
    list: async (timeMin, timeMax) => { let out = [], page = ''; do { const q = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', showDeleted: 'true', maxResults: '2500', ...(page ? { pageToken: page } : {}) }); const d = await j(await fetch(B + '?' + q, { headers: H })); out = out.concat(d.items || []); page = d.nextPageToken || ''; } while (page); return out; },
    insert: async (body) => j(await fetch(B, { method: 'POST', headers: H, body: JSON.stringify(body) })),
    patch: async (id, body) => j(await fetch(B + '/' + encodeURIComponent(id), { method: 'PATCH', headers: H, body: JSON.stringify(body) })),
    delete: async (id) => j(await fetch(B + '/' + encodeURIComponent(id), { method: 'DELETE', headers: H })),
  };
}

/* Ask Google to ping us when this calendar changes, so edits made in Google show up here at once. Channels last about a week. */
async function ensureWatch(sb, userId, g) {
  const { site } = env(); if (!site) return;
  const rows = await sb.select('gcal_channels', 'select=*&user_id=eq.' + userId);
  if (rows.some((r) => new Date(r.expiration).getTime() > Date.now() + 86400000)) return;
  const id = crypto.randomUUID(), exp = Date.now() + 6 * 86400000;
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type: 'web_hook', address: site + '/.netlify/functions/gcal-webhook', token: sign('ch.' + id), expiration: exp }) });
  if (!r.ok) return; const j = await r.json();
  await sb.upsert('gcal_channels', [{ channel_id: id, user_id: userId, resource_id: j.resourceId, expiration: new Date(+j.expiration || exp).toISOString() }], 'channel_id');
  for (const o of rows) { try { await fetch('https://www.googleapis.com/calendar/v3/channels/stop', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.channel_id, resourceId: o.resource_id }) }); } catch (e) {} await sb.patch('gcal_channels', 'channel_id=eq.' + o.channel_id, { expiration: new Date(0).toISOString() }); }
}
const verifyChannel = (id, token) => sign('ch.' + id) === token;
module.exports = { env, supabase, userFromToken, makeState, readState, googleFor, ensureWatch, verifyChannel };
