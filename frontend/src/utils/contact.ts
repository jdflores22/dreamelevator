/** Split comma, semicolon, or newline separated contact values. */
export function splitContactList(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function telHref(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '#';
}

export function mailtoHref(value: string): string {
  return value.trim() ? `mailto:${value.trim()}` : '#';
}
