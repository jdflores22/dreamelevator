/** Site-setting keys: `{id}_enabled` = "true" | "false" */

export type SectionDarkBgToggle = {
  id: string;
  label: string;
  defaultDark: boolean;
};

export type SectionDarkBgGroup = {
  page: string;
  toggles: SectionDarkBgToggle[];
};

export const HOME_SECTION_TOGGLES = [
  { id: 'home_process', label: 'How we work', manageHint: 'Admin → Process steps' },
  { id: 'home_intro', label: 'Intro banner', manageHint: 'Settings → Site content' },
  { id: 'home_services', label: 'Services', manageHint: 'Admin → Services' },
  { id: 'home_stats', label: 'Stats counter', manageHint: 'Admin → Stats' },
  { id: 'home_clients', label: 'Trusted companies', manageHint: 'Admin → Clients' },
  { id: 'home_technologies', label: 'Technologies', manageHint: 'Admin → Technologies' },
  { id: 'home_featured_product', label: 'Featured product', manageHint: 'Admin → Products (mark one as featured)' },
  { id: 'home_products', label: 'Software products', manageHint: 'Admin → Products' },
  { id: 'home_industries', label: 'Sector expertise', manageHint: 'Admin → Industries' },
  { id: 'home_why', label: 'Why choose us', manageHint: 'Admin → Why choose us' },
  { id: 'home_portfolio', label: 'Featured portfolio', manageHint: 'Admin → Portfolio' },
  { id: 'home_testimonials', label: 'Testimonials', manageHint: 'Admin → Testimonials' },
  { id: 'home_faq', label: 'FAQ', manageHint: 'Admin → FAQ' },
  { id: 'home_blog', label: 'Latest articles', manageHint: 'Admin → Blog' },
  { id: 'home_cta', label: 'Call to action banner', manageHint: 'Settings → Site content' },
] as const;

export const ABOUT_SECTION_TOGGLES = [
  { id: 'about_mission', label: 'Mission statement', manageHint: 'Settings → Page content → About' },
  { id: 'about_vision', label: 'Vision statement', manageHint: 'Settings → Page content → About' },
  { id: 'about_story', label: 'Company story', manageHint: 'Settings → Page content → About' },
  { id: 'about_stats_bar', label: 'Quick stats bar (hero)', manageHint: 'Admin → Stats' },
  { id: 'about_stats', label: 'Stats showcase', manageHint: 'Admin → Stats' },
  { id: 'about_why', label: 'Why choose us', manageHint: 'Admin → Why choose us' },
  { id: 'about_process', label: 'Development process', manageHint: 'Admin → Process steps' },
  { id: 'about_industries', label: 'Sector expertise', manageHint: 'Admin → Industries' },
  {
    id: 'about_products_promo',
    label: 'Software products promo',
    manageHint: 'Settings → Page content → About',
  },
  { id: 'about_cta', label: 'Contact CTA', manageHint: 'Settings → Page content → About' },
] as const;

export const PRODUCTS_SECTION_TOGGLES = [
  {
    id: 'products_featured',
    label: 'Featured product spotlight',
    manageHint: 'Admin → Products (mark one as featured)',
  },
  { id: 'products_catalog', label: 'Product catalog', manageHint: 'Admin → Products' },
  {
    id: 'products_cta',
    label: 'Bottom call-to-action',
    manageHint: 'Settings → Page content → Products',
  },
] as const;

export type HomeSectionToggleId = (typeof HOME_SECTION_TOGGLES)[number]['id'];
export type AboutSectionToggleId = (typeof ABOUT_SECTION_TOGGLES)[number]['id'];
export type ProductsSectionToggleId = (typeof PRODUCTS_SECTION_TOGGLES)[number]['id'];
export const CONTACT_SECTION_TOGGLES = [
  { id: 'contact_main', label: 'Contact form & details', manageHint: 'Settings → Page content → Contact' },
  { id: 'contact_map', label: 'Map & location', manageHint: 'Settings → Page content → Contact' },
  {
    id: 'contact_expect',
    label: 'What happens next',
    manageHint: 'Settings → Page content → Contact',
  },
  {
    id: 'contact_careers',
    label: 'Careers call-to-action',
    manageHint: 'Settings → Page content → Contact',
  },
  { id: 'contact_faq', label: 'FAQ', manageHint: 'Admin → FAQ' },
] as const;

export type ContactSectionToggleId = (typeof CONTACT_SECTION_TOGGLES)[number]['id'];

export function isSectionEnabledValue(value: string | undefined, defaultEnabled = true): boolean {
  if (value === undefined || value === '') return defaultEnabled;
  return value === 'true' || value === '1';
}

export function sectionEnabledKey(sectionId: string): string {
  return `${sectionId}_enabled`;
}

export function sectionDarkBgKey(sectionId: string): string {
  return `${sectionId}_dark_bg`;
}

/** Navy background toggles grouped by page (Settings → Section visibility). */
export const SECTION_DARK_BG_GROUPS: SectionDarkBgGroup[] = [
  {
    page: 'Homepage',
    toggles: [
      { id: 'home_process', label: 'How we work', defaultDark: false },
      { id: 'home_intro', label: 'Intro banner', defaultDark: false },
      { id: 'home_stats', label: 'Stats counter', defaultDark: false },
      { id: 'home_services', label: 'Services', defaultDark: false },
      { id: 'home_portfolio', label: 'Featured portfolio', defaultDark: false },
      { id: 'home_clients', label: 'Trusted companies', defaultDark: false },
      { id: 'home_technologies', label: 'Technologies', defaultDark: false },
      { id: 'home_featured_product', label: 'Featured product', defaultDark: false },
      { id: 'home_products', label: 'Software products', defaultDark: false },
      { id: 'home_industries', label: 'Sector expertise', defaultDark: false },
      { id: 'home_why', label: 'Why choose us', defaultDark: false },
      { id: 'home_testimonials', label: 'Testimonials', defaultDark: false },
      { id: 'home_faq', label: 'FAQ', defaultDark: false },
      { id: 'home_blog', label: 'Latest articles', defaultDark: false },
      { id: 'home_cta', label: 'Call to action', defaultDark: false },
    ],
  },
  {
    page: 'About page',
    toggles: [
      { id: 'about_hero', label: 'Page hero', defaultDark: false },
      { id: 'about_mission', label: 'Mission', defaultDark: false },
      { id: 'about_vision', label: 'Vision', defaultDark: false },
      { id: 'about_story', label: 'Our story', defaultDark: false },
      { id: 'about_values', label: 'Core values', defaultDark: false },
      { id: 'about_assessment', label: 'Free assessment', defaultDark: false },
      { id: 'about_stats', label: 'Stats showcase', defaultDark: false },
      { id: 'about_why', label: 'What we do', defaultDark: false },
      { id: 'about_process', label: 'Development process', defaultDark: false },
      { id: 'about_industries', label: 'Sector expertise', defaultDark: false },
      { id: 'about_products_promo', label: 'Software products promo', defaultDark: true },
      { id: 'about_cta', label: 'Contact CTA', defaultDark: false },
    ],
  },
  {
    page: 'Services page',
    toggles: [
      { id: 'services_stats', label: 'Quick stats bar', defaultDark: false },
      { id: 'services_list', label: 'Other services', defaultDark: false },
      { id: 'services_how_we_work', label: 'How we work', defaultDark: true },
      { id: 'services_cta', label: 'Quote CTA', defaultDark: false },
    ],
  },
  {
    page: 'Technologies page',
    toggles: [
      { id: 'technologies_stats', label: 'Quick stats bar', defaultDark: false },
      { id: 'technologies_stack', label: 'Technology stack grid', defaultDark: false },
      { id: 'technologies_why', label: 'Why it matters', defaultDark: true },
      { id: 'technologies_cta', label: 'Contact CTA', defaultDark: false },
    ],
  },
  {
    page: 'Portfolio page',
    toggles: [{ id: 'portfolio_list', label: 'Project grid', defaultDark: false }],
  },
  {
    page: 'Industries page',
    toggles: [{ id: 'industries_list', label: 'Industries grid', defaultDark: false }],
  },
  {
    page: 'Products page',
    toggles: [
      { id: 'products_hero', label: 'Page hero', defaultDark: true },
      { id: 'products_featured', label: 'Featured product spotlight', defaultDark: false },
      { id: 'products_catalog', label: 'Product catalog', defaultDark: false },
      { id: 'products_cta', label: 'Bottom call-to-action', defaultDark: false },
    ],
  },
  {
    page: 'Contact page',
    toggles: [
      { id: 'contact_hero', label: 'Page hero', defaultDark: true },
      { id: 'contact_main', label: 'Contact form & details', defaultDark: false },
      { id: 'contact_map', label: 'Map & location', defaultDark: false },
      { id: 'contact_expect', label: 'What happens next', defaultDark: true },
      { id: 'contact_careers', label: 'Careers call-to-action', defaultDark: true },
      { id: 'contact_faq', label: 'FAQ', defaultDark: false },
    ],
  },
];

export const ALL_SECTION_DARK_BG_TOGGLES = SECTION_DARK_BG_GROUPS.flatMap((group) => group.toggles);

export type SectionDarkBgToggleId = (typeof ALL_SECTION_DARK_BG_TOGGLES)[number]['id'];

export function getSectionDarkBgDefault(sectionId: string): boolean {
  return ALL_SECTION_DARK_BG_TOGGLES.find((item) => item.id === sectionId)?.defaultDark ?? false;
}

/** @deprecated Use ALL_SECTION_DARK_BG_TOGGLES */
export const ABOUT_DARK_BG_TOGGLES = SECTION_DARK_BG_GROUPS.find((g) => g.page === 'About page')!.toggles;

export type AboutDarkBgToggleId = SectionDarkBgToggleId;
