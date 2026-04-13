export function getCtaVariant() {
  const key = 'ctaVariant';
  const stored = window.localStorage.getItem(key);
  if (stored) return stored;

  // Simple A/B variant selection (50/50)
  const variant = Math.random() < 0.5 ? 'Start Free Interview' : 'Start Your First Interview';
  window.localStorage.setItem(key, variant);
  return variant;
}
