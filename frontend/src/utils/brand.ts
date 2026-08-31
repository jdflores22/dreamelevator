/** Legacy seed/copy still stored as TRANS-NET in the database. */
export const LEGACY_BRAND_NAME = 'TRANS-NET';

const LEGACY_COPY_RE =
  /software development company|software development services|custom software, web, mobile|custom software development for organizations/i;

const LEGACY_LOGO_PATHS = new Set(['/logo.png', 'logo.png', '/favicon.ico', '/favicon.svg']);

export function applyBrandName(text: string, companyName: string): string {
  if (!text || !companyName) return text;
  return text.replaceAll(LEGACY_BRAND_NAME, companyName);
}

/** Seeded TransNet slogans that should not override live branding. */
export function isLegacyBrandCopy(text: string): boolean {
  return Boolean(text) && LEGACY_COPY_RE.test(text);
}

export function isLegacyLogoPath(path: string): boolean {
  const clean = path.split('?')[0].split('#')[0].trim().toLowerCase();
  return LEGACY_LOGO_PATHS.has(clean);
}

export function formatPageTitle(pageLabel: string | undefined, companyName: string, tagline = ''): string {
  const branded = pageLabel ? applyBrandName(pageLabel, companyName).trim() : '';
  const usable = branded && !isLegacyBrandCopy(branded) ? branded : '';
  if (!usable) {
    return [companyName, tagline].filter(Boolean).join(' | ');
  }
  if (companyName && !usable.includes(companyName)) {
    return `${usable} | ${companyName}`;
  }
  return usable;
}
