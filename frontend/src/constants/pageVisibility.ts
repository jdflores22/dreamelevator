/** Maps public URL paths to SEO/page-visibility keys. */
export function pathnameToPageKey(pathname: string): string | null {
  if (pathname === '/') return 'home';
  const segment = pathname.split('/').filter(Boolean)[0];
  const keys = [
    'about',
    'services',
    'products',
    'portfolio',
    'gallery',
    'clients',
    'technologies',
    'industries',
    'blog',
    'careers',
    'contact',
    'privacy',
    'terms',
  ] as const;
  return keys.includes(segment as (typeof keys)[number]) ? segment! : null;
}

/** Nav href → page key (home uses "/"). */
export function hrefToPageKey(href: string): string {
  if (href === '/') return 'home';
  return href.replace(/^\//, '');
}

export const PAGE_VISIBILITY_LABELS: Record<string, { label: string; path: string }> = {
  home: { label: 'Homepage', path: '/' },
  about: { label: 'About Us', path: '/about' },
  services: { label: 'Services', path: '/services' },
  products: { label: 'Products', path: '/products' },
  portfolio: { label: 'Portfolio', path: '/portfolio' },
  gallery: { label: 'Gallery', path: '/gallery' },
  clients: { label: 'Clients', path: '/clients' },
  technologies: { label: 'Technologies', path: '/technologies' },
  industries: { label: 'Industries', path: '/industries' },
  blog: { label: 'Blog', path: '/blog' },
  careers: { label: 'Careers', path: '/careers' },
  contact: { label: 'Contact', path: '/contact' },
  privacy: { label: 'Privacy Policy', path: '/privacy' },
  terms: { label: 'Terms & Conditions', path: '/terms' },
};

export const PAGE_VISIBILITY_ORDER = [
  'home',
  'about',
  'services',
  'products',
  'gallery',
  'clients',
  'portfolio',
  'technologies',
  'industries',
  'blog',
  'careers',
  'contact',
  'privacy',
  'terms',
] as const;

export interface PageVisibilityGroup {
  id: string;
  label: string;
  description: string;
  keys: readonly (typeof PAGE_VISIBILITY_ORDER)[number][];
}

/** Logical groupings for the admin page-visibility UI. */
export const PAGE_VISIBILITY_GROUPS: PageVisibilityGroup[] = [
  {
    id: 'core',
    label: 'Core pages',
    description: 'Primary entry points and contact.',
    keys: ['home', 'about', 'contact'],
  },
  {
    id: 'offerings',
    label: 'Services & showcase',
    description: 'Offerings, products, and proof of work.',
    keys: ['services', 'products', 'gallery', 'clients', 'portfolio', 'technologies', 'industries'],
  },
  {
    id: 'content',
    label: 'Content & hiring',
    description: 'Blog articles and open roles.',
    keys: ['blog', 'careers'],
  },
  {
    id: 'legal',
    label: 'Legal',
    description: 'Footer policy pages.',
    keys: ['privacy', 'terms'],
  },
];

/** Pages that expose child/detail routes when the parent is live. */
export const PAGE_VISIBILITY_HAS_DETAILS = new Set([
  'services',
  'products',
  'portfolio',
  'blog',
]);
