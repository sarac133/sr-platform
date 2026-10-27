/* Google Calendar sync is paused. This endpoint does nothing and never contacts Google. */
exports.handler = async () => ({ statusCode: 410, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Google Calendar sync is paused.' }) });
