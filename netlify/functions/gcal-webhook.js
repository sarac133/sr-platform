/* Google calls this the moment a calendar changes. We run a sync for that person, and the dashboard updates live through Supabase. */
const { supabase, verifyChannel } = require('../lib/http');
const { syncUser } = require('../lib/sync');
exports.handler = async (event) => {
  const h = {}; Object.keys(event.headers || {}).forEach((k) => { h[k.toLowerCase()] = event.headers[k]; });
  const id = h['x-goog-channel-id'], token = h['x-goog-channel-token'];
  if (!id || !verifyChannel(id, token)) return { statusCode: 403, body: 'no' };
  if (h['x-goog-resource-state'] === 'sync') return { statusCode: 200, body: 'ok' };
  try {
    const sb = supabase(), ch = await sb.select('gcal_channels', 'select=user_id&channel_id=eq.' + encodeURIComponent(id));
    if (!ch.length) return { statusCode: 200, body: 'gone' };
    const uid = ch[0].user_id, acc = await sb.select('google_accounts', 'select=name,tz&user_id=eq.' + uid);
    if (!acc.length || !acc[0].name) return { statusCode: 200, body: 'not ready' };
    await syncUser({ sb, userId: uid, name: acc[0].name, tz: acc[0].tz || 'UTC', budgetMs: 8000 });
  } catch (e) { return { statusCode: 200, body: 'error ' + String(e.message || e) }; }
  return { statusCode: 200, body: 'ok' };
};
