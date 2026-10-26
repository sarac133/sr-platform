exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { action, data, apiKey } = JSON.parse(event.body);
    if (!apiKey) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing API key. Set it in Settings.' }) };

    const endpoints = {
      sequences: 'https://api.apollo.io/api/v1/emailer_campaigns/search',
      steps: 'https://api.apollo.io/api/v1/emailer_steps/search',
      contacts: 'https://api.apollo.io/api/v1/contacts/search',
      sequenceContacts: 'https://api.apollo.io/api/v1/emailer_campaigns/CAMPAIGN_ID/contacts',
      messages: 'https://api.apollo.io/api/v1/emailer_messages/search',
      contactStages: 'https://api.apollo.io/api/v1/contact_stages',
    };

    let endpoint = endpoints[action];
    if (!endpoint) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) };

    // For sequenceContacts, replace CAMPAIGN_ID with the actual ID
    if (action === 'sequenceContacts' && data.campaign_id) {
      endpoint = endpoint.replace('CAMPAIGN_ID', data.campaign_id);
      delete data.campaign_id;
    }

    const method = (action === 'sequenceContacts' || action === 'messages' || action === 'contactStages') ? 'GET' : 'POST';
    if (method === 'GET' && data) {
      const qs = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(x => qs.append(k + '[]', x));
        else if (v !== undefined && v !== null) qs.append(k, v);
      });
      const q = qs.toString();
      if (q) endpoint += (endpoint.includes('?') ? '&' : '?') + q;
    }
    const fetchOpts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    };
    if (method === 'POST') fetchOpts.body = JSON.stringify(data || {});

    const resp = await fetch(endpoint, fetchOpts);
    const body = await resp.text();
    return { statusCode: resp.status, headers, body };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
