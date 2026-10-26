/* "Continue with Google" sign in: the dashboard hands us the Google refresh token Supabase received, so calendar sync switches on with no second step. */
const { supabase, userFromToken, googleFor, ensureWatch } = require('../lib/http');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!b.refresh_token) return { statusCode: 400, body: 'No token.' };
  const sb = supabase(), email = String(u.email || '').toLowerCase();
  const have = await sb.select('google_accounts', 'select=google_email,is_primary&user_id=eq.' + u.id);
  const same = have.find((a) => String(a.google_email || '').toLowerCase() === email);
  await sb.upsert('google_tokens', [{ user_id: u.id, refresh_token: b.refresh_token, google_email: email }], 'user_id,google_email');
  await sb.upsert('google_accounts', [{ user_id: u.id, google_email: email, connected_at: new Date().toISOString(), is_primary: same ? !!same.is_primary : have.length === 0 }], 'user_id,google_email');
  try { await ensureWatch(sb, u.id, await googleFor(b.refresh_token), email); } catch (e) {}
  return { statusCode: 200, body: 'ok' };
};
