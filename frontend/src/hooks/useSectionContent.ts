import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import {
  isSectionEnabledValue,
  sectionEnabledKey,
  sectionDarkBgKey,
  ALL_SECTION_DARK_BG_TOGGLES,
  getSectionDarkBgDefault,
  SECTION_DARK_BG_GROUPS,
} from '@/constants/sectionVisibility';
import type {
  AboutSectionToggleId,
  HomeSectionToggleId,
  ProductsSectionToggleId,
  ContactSectionToggleId,
  SectionDarkBgToggleId,
} from '@/constants/sectionVisibility';
import {
  ABOUT_SECTION_TOGGLES,
  HOME_SECTION_TOGGLES,
  PRODUCTS_SECTION_TOGGLES,
  CONTACT_SECTION_TOGGLES,
} from '@/constants/sectionVisibility';

export interface SectionContentDefaults {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function useSectionContent(prefix: string, defaults: SectionContentDefaults = {}) {
  const { get } = useSiteSettingsMap();

  const eyebrow = get(`${prefix}_eyebrow`, defaults.eyebrow ?? '');
  const title = get(`${prefix}_title`, defaults.title ?? '');
  const subtitle = get(`${prefix}_subtitle`, defaults.subtitle ?? '');

  return {
    eyebrow: eyebrow || defaults.eyebrow,
    title: title || defaults.title || '',
    subtitle: subtitle || defaults.subtitle,
  };
}

export function usePageHeroContent(
  prefix: string,
  defaults: { eyebrow?: string; title?: string; subtitle?: string } = {},
) {
  const { get } = useSiteSettingsMap();

  const eyebrow = get(`${prefix}_eyebrow`, defaults.eyebrow ?? '');
  const title = get(`${prefix}_title`, defaults.title ?? '');
  const subtitle = get(`${prefix}_subtitle`, defaults.subtitle ?? '');

  return {
    eyebrow: eyebrow || defaults.eyebrow || '',
    title: title || defaults.title || '',
    subtitle: subtitle || defaults.subtitle || '',
  };
}

export function useCtaContent(defaults: {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
} = {}) {
  const { get } = useSiteSettingsMap();

  return {
    title: get('home_cta_title', defaults.title ?? 'Have a project? Request a quote.'),
    subtitle: get('home_cta_subtitle', defaults.subtitle ?? ''),
    primaryLabel: get('home_cta_primary_label', defaults.primaryLabel ?? 'Get Started'),
    secondaryLabel: get('home_cta_secondary_label', defaults.secondaryLabel ?? 'Explore Services'),
  };
}

export function useProductsCtaContent(defaults: {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
} = {}) {
  const { get } = useSiteSettingsMap();

  return {
    title: get('products_cta_title', defaults.title ?? 'Need a custom demo or deployment?'),
    subtitle: get(
      'products_cta_subtitle',
      defaults.subtitle ??
        'Our team can tailor any product to your workflows, integrate with existing systems, and support you through production rollout and beyond.',
    ),
    primaryLabel: get('products_cta_primary_label', defaults.primaryLabel ?? 'Request a demo'),
    secondaryLabel: get('products_cta_secondary_label', defaults.secondaryLabel ?? 'Explore services'),
  };
}

export function useSectionEnabled(sectionId: string, defaultEnabled = true): boolean {
  const { get } = useSiteSettingsMap();
  return isSectionEnabledValue(get(sectionEnabledKey(sectionId)), defaultEnabled);
}

export function useHomeSectionsVisibility(): Record<HomeSectionToggleId, boolean> {
  const { get } = useSiteSettingsMap();
  const enabled = (id: HomeSectionToggleId) =>
    isSectionEnabledValue(get(sectionEnabledKey(id)));

  return {
    home_intro: enabled('home_intro'),
    home_services: enabled('home_services'),
    home_stats: enabled('home_stats'),
    home_clients: enabled('home_clients'),
    home_technologies: enabled('home_technologies'),
    home_featured_product: enabled('home_featured_product'),
    home_products: enabled('home_products'),
    home_industries: enabled('home_industries'),
    home_why: enabled('home_why'),
    home_process: enabled('home_process'),
    home_portfolio: enabled('home_portfolio'),
    home_testimonials: enabled('home_testimonials'),
    home_faq: enabled('home_faq'),
    home_blog: enabled('home_blog'),
    home_cta: enabled('home_cta'),
  };
}

export function useAboutSectionsVisibility(): Record<AboutSectionToggleId, boolean> {
  const { get } = useSiteSettingsMap();
  const enabled = (id: AboutSectionToggleId) =>
    isSectionEnabledValue(get(sectionEnabledKey(id)));

  return {
    about_mission: enabled('about_mission'),
    about_vision: enabled('about_vision'),
    about_story: enabled('about_story'),
    about_stats_bar: enabled('about_stats_bar'),
    about_stats: enabled('about_stats'),
    about_why: enabled('about_why'),
    about_process: enabled('about_process'),
    about_industries: enabled('about_industries'),
    about_products_promo: enabled('about_products_promo'),
    about_cta: enabled('about_cta'),
  };
}

export function useProductsSectionsVisibility(): Record<ProductsSectionToggleId, boolean> {
  const { get } = useSiteSettingsMap();
  const enabled = (id: ProductsSectionToggleId) =>
    isSectionEnabledValue(get(sectionEnabledKey(id)));

  return {
    products_featured: enabled('products_featured'),
    products_catalog: enabled('products_catalog'),
    products_cta: enabled('products_cta'),
  };
}

export function useContactSectionsVisibility(): Record<ContactSectionToggleId, boolean> {
  const { get } = useSiteSettingsMap();
  const enabled = (id: ContactSectionToggleId) =>
    isSectionEnabledValue(get(sectionEnabledKey(id)));

  return {
    contact_main: enabled('contact_main'),
    contact_map: enabled('contact_map'),
    contact_expect: enabled('contact_expect'),
    contact_careers: enabled('contact_careers'),
    contact_faq: enabled('contact_faq'),
  };
}

export function useSectionDarkBackground(sectionId: string, defaultDark?: boolean): boolean {
  const { get } = useSiteSettingsMap();
  const fallback = defaultDark ?? getSectionDarkBgDefault(sectionId);
  return isSectionEnabledValue(get(sectionDarkBgKey(sectionId)), fallback);
}

export function useSectionsDarkBackground(): Record<string, boolean> {
  const { get } = useSiteSettingsMap();
  return Object.fromEntries(
    ALL_SECTION_DARK_BG_TOGGLES.map((item) => [
      item.id,
      isSectionEnabledValue(get(sectionDarkBgKey(item.id)), item.defaultDark),
    ]),
  );
}

/** @deprecated Use useSectionDarkBackground */
export function useAboutSectionDarkBackground(
  sectionId: SectionDarkBgToggleId,
  defaultDark?: boolean,
): boolean {
  return useSectionDarkBackground(sectionId, defaultDark);
}

/** @deprecated Use useSectionsDarkBackground */
export function useAboutSectionsDarkBackground(): Record<SectionDarkBgToggleId, boolean> {
  return useSectionsDarkBackground() as Record<SectionDarkBgToggleId, boolean>;
}

export function usePageSectionTheme(sectionId: string, defaultDark?: boolean): 'light' | 'dark' {
  return useSectionDarkBackground(sectionId, defaultDark) ? 'dark' : 'light';
}

export { HOME_SECTION_TOGGLES, ABOUT_SECTION_TOGGLES, PRODUCTS_SECTION_TOGGLES, CONTACT_SECTION_TOGGLES, SECTION_DARK_BG_GROUPS, ALL_SECTION_DARK_BG_TOGGLES };
