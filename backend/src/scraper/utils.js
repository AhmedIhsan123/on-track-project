export function inferRemoteType(text) {
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  if (/\bremote\b/.test(t)) return 'remote';
  if (/\bonsite\b|\bon-site\b|\bin.office\b|\bin person\b/.test(t)) return 'onsite';
  return '';
}
