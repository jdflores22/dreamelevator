export type HeroHighlightCard = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

export const DEFAULT_HERO_HIGHLIGHTS: HeroHighlightCard[] = [
  {
    title: 'Elevators',
    body: 'Passenger, freight, scenic, hospital, home, and accessibility lifts — MRL or SMR.',
    href: '/services',
    linkLabel: 'Learn more',
  },
  {
    title: 'Escalators',
    body: 'Standard escalators, walkalators, moving walkways, and stair lifts.',
    href: '/services',
    linkLabel: 'Learn more',
  },
  {
    title: 'Modernization',
    body: 'Reliable control upgrades that cut energy use and maintenance cost.',
    href: '/services',
    linkLabel: 'Learn more',
  },
];

export function emptyHeroHighlight(): HeroHighlightCard {
  return {
    title: '',
    body: '',
    href: '/services',
    linkLabel: 'Learn more',
  };
}

export function parseHeroHighlights(raw: string | undefined): HeroHighlightCard[] {
  if (raw === '[]') return [];
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return parseHeroHighlightsPipe(raw);
    return parsed
      .map(normalizeHighlight)
      .filter((item) => item.title && item.body)
      .slice(0, 3);
  } catch {
    return parseHeroHighlightsPipe(raw);
  }
}

function normalizeHighlight(value: unknown): HeroHighlightCard {
  const item = (value && typeof value === 'object' ? value : {}) as Partial<HeroHighlightCard>;
  return {
    title: String(item.title ?? '').trim(),
    body: String(item.body ?? '').trim(),
    href: String(item.href ?? '/services').trim() || '/services',
    linkLabel: String(item.linkLabel ?? 'Learn more').trim() || 'Learn more',
  };
}

/** Legacy: Title|Body|/link */
function parseHeroHighlightsPipe(raw: string): HeroHighlightCard[] {
  return raw
    .split(';;')
    .map((entry) => {
      const [title = '', body = '', href = '/services'] = entry.split('|');
      return normalizeHighlight({ title, body, href, linkLabel: 'Learn more' });
    })
    .filter((item) => item.title && item.body)
    .slice(0, 3);
}

export function serializeHeroHighlights(cards: HeroHighlightCard[]): string {
  return JSON.stringify(cards, null, 2);
}

/** Legacy pipe format for seeder compatibility */
export function serializeHeroHighlightsPipe(cards: HeroHighlightCard[]): string {
  return cards.map((c) => `${c.title}|${c.body}|${c.href}`).join(';;');
}
