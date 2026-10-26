/* Step 1: the dashboard sends the signed in person here. We check them, then send them to Google's consent screen. */
const { env, userFromToken, makeState } = require('../lib/http');
exports.handler = async (event) => {
  const token = (event.queryStringParameters || {}).token, e = env();
  const u = token && await userFromToken(token);
  if (!u) return { statusCode: 401, body: 'Not signed in to the dashboard.' };
  const q = new URLSearchParams({ client_id: e.gid, redirect_uri: e.site + '/.netlify/functions/gcal-callback', response_type: 'code', access_type: 'offline', prompt: 'consent select_account', include_granted_scopes: 'true',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email', state: makeState(u.id) });
  return { statusCode: 302, headers: { Location: 'https://accounts.google.com/o/oauth2/v2/auth?' + q } };
};
