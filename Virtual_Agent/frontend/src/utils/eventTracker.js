export function trackEvent(name, payload = {}) {
  try {
    const key = 'lanai_events';
    const stored = JSON.parse(window.localStorage.getItem(key) || '[]');
    const event = {
      name,
      timestamp: new Date().toISOString(),
      ...payload
    };
    stored.push(event);
    window.localStorage.setItem(key, JSON.stringify(stored));
    console.log('[EventTracker]', event);
  } catch (err) {
    console.warn('[EventTracker] failed to log event', err);
  }
}
