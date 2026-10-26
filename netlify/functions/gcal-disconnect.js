/* Disconnect one Google account (body { account }) or all of them, or make one the primary (body { account, primary: true }).
   The primary account is where new tasks and events are written. Events stay where they are in Google. */
const { supabase, userFromToken, googleFor } = require('../lib/http');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const sb = supabase(), acct = typeof b.account === 'string' ? b.account : null, enc = encodeURIComponent;
  if (b.primary && acct !== null) {
    await sb.patch('google_accounts', 'user_id=eq.' + u.id, { is_primary: false });
    await sb.patch('google_accounts', 'user_id=eq.' + u.id + '&google_email=eq.' + enc(acct), { is_primary: true });
    return { statusCode: 200, body: 'ok' };
  }
  const f = 'user_id=eq.' + u.id + (acct !== null ? '&google_email=eq.' + enc(acct) : '');
  try {
    const t = await sb.select('google_tokens', 'select=refresh_token,google_email&' + f), ch = await sb.select('gcal_channels', 'select=*&user_id=eq.' + u.id + (acct !== null ? '&account=eq.' + enc(acct) : ''));
    if (t[0] && ch.length) { const g = await googleFor(t[0].refresh_token); for (const o of ch) { try { await fetch('https://www.googleapis.com/calendar/v3/channels/stop', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.channel_id, resourceId: o.resource_id }) }); } catch (e) {} } }
  } catch (e) {}
  let wasPrimary = false; try { const cur = await sb.select('google_accounts', 'select=google_email,is_primary&user_id=eq.' + u.id); wasPrimary = acct !== null && cur.some((a) => a.google_email === acct && a.is_primary); } catch (e) {}
  /* links made before accounts existed have no account name and belong to the primary one */
  const af = 'user_id=eq.' + u.id + (acct !== null ? (wasPrimary ? '&account=in.(' + enc('"' + acct + '"') + ',%22%22)' : '&account=eq.' + enc(acct)) : '');
  for (const [tbl, flt] of [['gcal_channels', af], ['gcal_links', af], ['google_tokens', f], ['google_accounts', f]]) { try { await sb.rm(tbl, flt); } catch (e) {} }
  if (acct !== null) { try { const left = await sb.select('google_accounts', 'select=google_email,is_primary&user_id=eq.' + u.id); if (left.length && !left.some((a) => a.is_primary)) await sb.patch('google_accounts', 'user_id=eq.' + u.id + '&google_email=eq.' + enc(left[0].google_email), { is_primary: true }); } catch (e) {} }
  return { statusCode: 200, body: 'ok' };
};
