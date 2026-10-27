/* Google Calendar sync is paused. Acknowledge pings so Google stops retrying, and do nothing else. */
exports.handler = async () => ({ statusCode: 200, body: '' });
