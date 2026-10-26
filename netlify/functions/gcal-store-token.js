/* "Continue with Google" sign in: the dashboard hands us the Google refresh token Supabase received, so calendar sync switches on with no second step. */
const { supabase, userFromToken, googleFor, ensureWatch } = require('../lib/http');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!b.refresh_token) return { statusCode: 400, body: 'No token.' };
  const sb = supabase();
  await sb.upsert('google_tokens', [{ user_id: u.id, refresh_token: b.refresh_token, google_email: u.email }], 'user_id');
  await sb.upsert('google_accounts', [{ user_id: u.id, google_email: u.email, connected_at: new Date().toISOString() }], 'user_id');
  try { await ensureWatch(sb, u.id, await googleFor(b.refresh_token)); } catch (e) {}
  return { statusCode: 200, body: 'ok' };
};
