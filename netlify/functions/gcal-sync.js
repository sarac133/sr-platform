/* Step 3: run a sync for the signed in person. The dashboard calls this every minute and after local changes. */
const { supabase, userFromToken, googleFor, ensureWatch } = require('../lib/http');
const { runSync } = require('../lib/gcal');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  let body = {}; try { body = JSON.parse(event.body || '{}'); } catch (e) {}
  const sb = supabase(), rows = await sb.select('google_tokens', 'select=refresh_token&user_id=eq.' + u.id);
  if (!rows.length) return { statusCode: 409, body: JSON.stringify({ error: 'not_connected' }) };
  try {
    const g = await googleFor(rows[0].refresh_token);
    const stats = await runSync({ sb, g, userId: u.id, name: body.name || '', tz: body.tz || 'UTC' });
    await sb.patch('google_accounts', 'user_id=eq.' + u.id, { last_sync: new Date().toISOString(), name: body.name || '', tz: body.tz || 'UTC' });
    try { await ensureWatch(sb, u.id, g); } catch (e) { /* push is optional, polling still works */ }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
