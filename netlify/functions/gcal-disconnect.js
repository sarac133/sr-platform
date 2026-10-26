/* Disconnect Google Calendar for the signed in user: stop the push channel, forget the token and the links. Events stay where they are. */
const { supabase, userFromToken, googleFor } = require('../lib/http');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  const sb = supabase();
  try {
    const t = await sb.select('google_tokens', 'select=refresh_token&user_id=eq.' + u.id), ch = await sb.select('gcal_channels', 'select=*&user_id=eq.' + u.id);
    if (t[0] && ch.length) { const g = await googleFor(t[0].refresh_token); for (const o of ch) { try { await fetch('https://www.googleapis.com/calendar/v3/channels/stop', { method: 'POST', headers: { Authorization: 'Bearer ' + g.at, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.channel_id, resourceId: o.resource_id }) }); } catch (e) {} } }
  } catch (e) {}
  for (const tbl of ['gcal_channels', 'gcal_links', 'google_tokens', 'google_accounts']) { try { await sb.rm(tbl, 'user_id=eq.' + u.id); } catch (e) {} }
  return { statusCode: 200, body: 'ok' };
};
