export type HeroSlide = {
  eyebrow: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImage: string;
};

export type HeroLayoutMode = 'static' | 'carousel';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: 'Vertical transportation since 1996',
    titleLine1: 'An uplifting experience',
    titleHighlight: 'for every building',
    description:
      'We offer elevators, escalators, and other lifting equipment — from supply and installation to modernization and long-term service.',
    ctaLabel: 'Learn more',
    ctaHref: '/about',
    secondaryCtaLabel: 'Get a quote',
    secondaryCtaHref: '/contact',
    backgroundImage: '',
  },
  {
    eyebrow: 'Elevators',
    titleLine1: 'Passenger, freight,',
    titleHighlight: 'home and hospital lifts',
    description:
      'Machine-room-less and small-machine-room systems specified for tight shafts, scenic enclosures, and everyday passenger traffic.',
    ctaLabel: 'View products',
    ctaHref: '/products',
    secondaryCtaLabel: 'Request a quote',
    secondaryCtaHref: '/contact',
    backgroundImage: '',
  },
  {
    eyebrow: 'Escalators & service',
    titleLine1: 'Moving people',
    titleHighlight: 'safely, every day',
    description:
      'Escalators, moving walkways, control modernization, and maintenance for all brands — with free assessment in Metro Manila.',
    ctaLabel: 'Our services',
    ctaHref: '/services',
    secondaryCtaLabel: 'Contact us',
    secondaryCtaHref: '/contact',
    backgroundImage: '',
  },
];

export function emptyHeroSlide(): HeroSlide {
  return {
    eyebrow: '',
    titleLine1: '',
    titleHighlight: '',
    description: '',
    ctaLabel: 'Learn more',
    ctaHref: '/services',
    secondaryCtaLabel: 'Contact us',
    secondaryCtaHref: '/contact',
    backgroundImage: '',
  };
}

export function parseHeroSlides(raw: string | undefined): HeroSlide[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSlide)
      .filter((slide) => slide.titleLine1.trim() || slide.titleHighlight.trim());
  } catch {
    return parseHeroSlidesPipeFormat(raw);
  }
}

function normalizeSlide(value: unknown): HeroSlide {
  const slide = (value && typeof value === 'object' ? value : {}) as Partial<HeroSlide>;
  return {
    eyebrow: String(slide.eyebrow ?? '').trim(),
    titleLine1: String(slide.titleLine1 ?? '').trim(),
    titleHighlight: String(slide.titleHighlight ?? '').trim(),
    description: String(slide.description ?? '').trim(),
    ctaLabel: String(slide.ctaLabel ?? 'Learn more').trim() || 'Learn more',
    ctaHref: String(slide.ctaHref ?? '/services').trim() || '/services',
    secondaryCtaLabel: String(slide.secondaryCtaLabel ?? 'Contact us').trim() || 'Contact us',
    secondaryCtaHref: String(slide.secondaryCtaHref ?? '/contact').trim() || '/contact',
    backgroundImage: String(slide.backgroundImage ?? '').trim(),
  };
}

/** Legacy: Eyebrow|Title1|Highlight|Description|CTA|/href|/image;; */
function parseHeroSlidesPipeFormat(raw: string): HeroSlide[] {
  return raw
    .split(';;')
    .map((entry) => {
      const [
        eyebrow = '',
        titleLine1 = '',
        titleHighlight = '',
        description = '',
        ctaLabel = 'Learn more',
        ctaHref = '/services',
        backgroundImage = '',
      ] = entry.split('|');
      return normalizeSlide({
        eyebrow,
        titleLine1,
        titleHighlight,
        description,
        ctaLabel,
        ctaHref,
        secondaryCtaLabel: 'Contact us',
        secondaryCtaHref: '/contact',
        backgroundImage,
      });
    })
    .filter((slide) => slide.titleLine1 || slide.titleHighlight);
}

export function serializeHeroSlides(slides: HeroSlide[]): string {
  return JSON.stringify(slides, null, 2);
}
