/* One sync for one person: every connected Google account, primary first, inside a time budget. Only one runs at a time per person. */
'use strict';
const { googleFor, ensureWatch } = require('./http');
const { runSync } = require('./gcal');

async function syncUser({ sb, userId, name, tz, budgetMs }) {
  const t0 = Date.now(), deadline = t0 + (budgetMs || 8000);
  const toks = await sb.select('google_tokens', 'select=refresh_token,google_email&user_id=eq.' + userId);
  if (!toks.length) return { notConnected: true };
  const accs = await sb.select('google_accounts', 'select=google_email,is_primary&user_id=eq.' + userId);
  const prim = (accs.find((a) => a.is_primary) || accs[0] || toks[0]).google_email || '';
  toks.sort((a, b) => (b.google_email === prim) - (a.google_email === prim));
  /* lock: a second sync for the same person waits, so nothing is written twice */
  const cutoff = new Date(Date.now() - 45000).toISOString();
  let got = [];
  try { got = await sb.claim('google_accounts', 'user_id=eq.' + userId + '&or=(sync_lock.is.null,sync_lock.lt.' + cutoff + ')', { sync_lock: new Date().toISOString() }); } catch (e) { got = [1]; }
  if (!got.length) return { busy: true };
  const total = { pulledNew: 0, pulledChanged: 0, pushedNew: 0, pushedChanged: 0, removed: 0, partial: false, accounts: toks.length, errors: [] };
  try {
    for (const t of toks) {
      const email = t.google_email || '';
      try {
        const g = await googleFor(t.refresh_token);
        const s = await runSync({ sb, g, userId, name, tz, account: email, primaryEmail: prim, isPrimary: email === prim, deadline });
        ['pulledNew', 'pulledChanged', 'pushedNew', 'pushedChanged', 'removed'].forEach((k) => { total[k] += s[k] || 0; });
        if (s.partial) total.partial = true;
        if (s.failed) total.errors.push((email || 'account') + ': ' + s.firstError);
        try { if (Date.now() < deadline - 500) await ensureWatch(sb, userId, g, email); } catch (e) { /* push is optional, polling still works */ }
        await sb.patch('google_accounts', 'user_id=eq.' + userId + '&google_email=eq.' + encodeURIComponent(email), { last_sync: new Date().toISOString(), last_error: s.failed ? s.firstError : null });
      } catch (e) {
        const msg = e.revoked ? 'Google access was removed. Connect this account again.' : String(e.message || e);
        total.errors.push((email || 'account') + ': ' + msg);
        try { await sb.patch('google_accounts', 'user_id=eq.' + userId + '&google_email=eq.' + encodeURIComponent(email), { last_error: msg }); } catch (x) {}
      }
      if (total.partial) break;
    }
    await sb.patch('google_accounts', 'user_id=eq.' + userId, { name: name || '', tz: tz || 'UTC' });
  } finally {
    try { await sb.patch('google_accounts', 'user_id=eq.' + userId, { sync_lock: null }); } catch (e) {}
  }
  return total;
}
module.exports = { syncUser };
