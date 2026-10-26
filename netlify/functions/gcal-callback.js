/* Step 2: Google sends the person back here with a code. We keep the refresh token server side only. */
const { env, supabase, readState, googleFor, ensureWatch } = require('../lib/http');
exports.handler = async (event) => {
  const p = event.queryStringParameters || {}, e = env(), back = (m) => ({ statusCode: 302, headers: { Location: e.site + '/?gcal=' + m } });
  const userId = readState(p.state); if (!userId || !p.code) return back('failed');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: p.code, client_id: e.gid, client_secret: e.gsecret, redirect_uri: e.site + '/.netlify/functions/gcal-callback', grant_type: 'authorization_code' }) });
  if (!r.ok) return back('failed'); const t = await r.json();
  if (!t.refresh_token) return back('norefresh');
  let email = ''; try { email = (await (await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: 'Bearer ' + t.access_token } })).json()).email || ''; } catch (x) {}
  const sb = supabase();
  await sb.upsert('google_tokens', [{ user_id: userId, refresh_token: t.refresh_token, google_email: email }], 'user_id');
  await sb.upsert('google_accounts', [{ user_id: userId, google_email: email, connected_at: new Date().toISOString() }], 'user_id');
  try { await ensureWatch(sb, userId, await googleFor(t.refresh_token)); } catch (x) {}
  return back('connected');
};
