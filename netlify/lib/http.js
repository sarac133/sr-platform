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
    /* every row, even past the 1000 row API limit */
    selectAll: async (table, q) => { let out = [], from = 0; for (;;) { const page = await call(table + '?' + q + '&limit=1000&offset=' + from); out = out.concat(page); if (page.length < 1000) return out; from += 1000; } },
    upsert: (table, rows, onConflict) => call(table + '?on_conflict=' + onConflict, { method: 'POST', headers: Object.assign({}, H, { Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(rows) }),
    /* many rows in as few requests as possible (300 per request) */
    upsertMany: async (table, rows, onConflict) => { let out = []; for (let i = 0; i < rows.length; i += 300) out = out.concat(await call(table + '?on_conflict=' + onConflict, { method: 'POST', headers: Object.assign({}, H, { Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(rows.slice(i, i + 300)) })); return out; },
    /* PATCH that tells us how many rows it changed, used as a lock */
    claim: (table, filter, body) => call(table + '?' + filter, { method: 'PATCH', headers: Object.assign({}, H, { Prefer: 'return=representation' }), body: JSON.stringify(body) }),
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

/* Google Calendar adapter for one refresh token. Retries rate limits and server hiccups. */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function gfetch(url, opt, tries) {
  for (let n = 0; ; n++) {
    let res; try { res = await fetch(url, opt); } catch (e) { if (n >= (tries || 3)) throw e; await wait(300 * (n + 1)); continue; }
    const limited = res.status === 429 || res.status >= 500 || (res.status === 403 && n < 2);
    if (res.ok || !limited || n >= (tries || 3)) return res;
    await wait(400 * Math.pow(2, n));
  }
}
async function googleFor(refreshToken) {
  const { gid, gsecret } = env();
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: gid, client_secret: gsecret, refresh_token: refreshToken, grant_type: 'refresh_token' }) });
  if (!r.ok) { const t = await r.text(); const e = new Error('google token ' + r.status + ' ' + t); e.revoked = /invalid_grant/.test(t); throw e; }
  const at = (await r.json()).access_token; const B = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const H = { Authorization: 'Bearer ' + at, 'Content-Type': 'application/json' };
  const j = async (res) => { if (!res.ok) { const e = new Error('google ' + res.status); e.status = res.status; throw e; } const t = await res.text(); return t ? JSON.parse(t) : {}; };
  return {
    at,
    list: async (timeMin, timeMax) => { let out = [], page = ''; do { const q = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', showDeleted: 'true', maxResults: '2500', ...(page ? { pageToken: page } : {}) }); const d = await j(await gfetch(B + '?' + q, { headers: H })); out = out.concat(d.items || []); page = d.nextPageToken || ''; } while (page); return out; },
    insert: async (body) => j(await gfetch(B, { method: 'POST', headers: H, body: JSON.stringify(body) })),
    patch: async (id, body) => j(await gfetch(B + '/' + encodeURIComponent(id), { method: 'PATCH', headers: H, body: JSON.stringify(body) })),
    delete: async (id) => j(await gfetch(B + '/' + encodeURIComponent(id) + '?sendUpdates=none', { method: 'DELETE', headers: H })),
    calTz: async () => { try { const d = await j(await gfetch('https://www.googleapis.com/calendar/v3/calendars/primary', { headers: H })); return d.timeZone || ''; } catch (e) { return ''; } },
  };
}

/* Ask Google to ping us when this calendar changes, so edits made in Google show up here at once. Channels last about a week. One per connected account. */
async function ensureWatch(sb, userId, g, account) {
  const { site } = env(); if (!site) return; account = account || '';
  const rows = await sb.select('gcal_channels', 'select=*&user_id=eq.' + userId + '&account=eq.' + encodeURIComponent(account));
  if (rows.some((r) => new Date(r.expiration).getTime() > Date.now() + 86400000)) return;
  const id = crypto.randomUUID(), exp = Date.now() + 6 * 86400000;
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type: 'web_hook', address: site + '/.netlify/functions/gcal-webhook', token: sign('ch.' + id), expiration: exp }) });
  if (!r.ok) return; const j = await r.json();
  await sb.upsert('gcal_channels', [{ channel_id: id, user_id: userId, account, resource_id: j.resourceId, expiration: new Date(+j.expiration || exp).toISOString() }], 'channel_id');
  for (const o of rows) { try { await fetch('https://www.googleapis.com/calendar/v3/channels/stop', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.channel_id, resourceId: o.resource_id }) }); } catch (e) {} await sb.patch('gcal_channels', 'channel_id=eq.' + o.channel_id, { expiration: new Date(0).toISOString() }); }
}
const verifyChannel = (id, token) => sign('ch.' + id) === token;
module.exports = { env, supabase, userFromToken, makeState, readState, googleFor, ensureWatch, verifyChannel };
