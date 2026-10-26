/* Step 2: Google sends the person back here with a code. We keep the refresh token server side only. A person can connect several Google accounts. */
const { env, supabase, readState, googleFor, ensureWatch } = require('../lib/http');
exports.handler = async (event) => {
  const p = event.queryStringParameters || {}, e = env(), back = (m) => ({ statusCode: 302, headers: { Location: e.site + '/?gcal=' + m } });
  const userId = readState(p.state); if (!userId || !p.code) return back('failed');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: p.code, client_id: e.gid, client_secret: e.gsecret, redirect_uri: e.site + '/.netlify/functions/gcal-callback', grant_type: 'authorization_code' }) });
  if (!r.ok) return back('failed'); const t = await r.json();
  if (!t.refresh_token) return back('norefresh');
  let email = ''; try { email = (await (await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: 'Bearer ' + t.access_token } })).json()).email || ''; } catch (x) {}
  email = String(email || '').toLowerCase();
  const sb = supabase();
  const have = await sb.select('google_accounts', 'select=google_email,is_primary&user_id=eq.' + userId);
  const same = have.find((a) => String(a.google_email || '').toLowerCase() === email);
  const isPrimary = same ? !!same.is_primary : have.length === 0;
  await sb.upsert('google_tokens', [{ user_id: userId, refresh_token: t.refresh_token, google_email: email }], 'user_id,google_email');
  await sb.upsert('google_accounts', [{ user_id: userId, google_email: email, connected_at: new Date().toISOString(), is_primary: isPrimary, last_error: null }], 'user_id,google_email');
  try { await ensureWatch(sb, userId, await googleFor(t.refresh_token), email); } catch (x) {}
  return back(have.length && !same ? 'added' : 'connected');
};
