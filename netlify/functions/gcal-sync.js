/* Step 3: run a sync for the signed in person. The dashboard calls this every minute and after local changes.
   If there is more to do than fits in the time limit it answers { partial: true } and the dashboard calls again straight away. */
const { supabase, userFromToken } = require('../lib/http');
const { syncUser } = require('../lib/sync');
exports.handler = async (event) => {
  const h = event.headers || {}, token = String(h.authorization || h.Authorization || '').replace(/^Bearer /i, '');
  const u = token && await userFromToken(token); if (!u) return { statusCode: 401, body: 'Not signed in.' };
  let body = {}; try { body = JSON.parse(event.body || '{}'); } catch (e) {}
  try {
    const r = await syncUser({ sb: supabase(), userId: u.id, name: body.name || '', tz: body.tz || 'UTC', budgetMs: 8000 });
    if (r.notConnected) return { statusCode: 409, body: JSON.stringify({ error: 'not_connected' }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
