import type { CSSProperties } from 'react';
import {
  FEATURED_PRODUCT_COLOR_FIELDS,
  FEATURED_PRODUCT_THEME_PRESETS,
  type FeaturedProductColorTokens,
  type FeaturedProductPreset,
} from '@/constants/featuredProductAppearance';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { hexToRgba, isDarkColor, isValidHexColor, normalizeHexColor } from '@/utils/color';

function buildCustomColors(
  get: (key: string, fallback?: string) => string,
): FeaturedProductColorTokens {
  const base = FEATURED_PRODUCT_THEME_PRESETS.custom;
  const read = (key: string, token: keyof FeaturedProductColorTokens) => {
    const stored = get(key);
    if (stored && isValidHexColor(stored)) {
      return normalizeHexColor(stored, base[token]);
    }
    return base[token];
  };

  return {
    bg: read('home_featured_product_bg_color', 'bg'),
    accent: read('home_featured_product_accent_color', 'accent'),
    title: read('home_featured_product_title_color', 'title'),
    body: read('home_featured_product_body_color', 'body'),
    eyebrow: read('home_featured_product_eyebrow_color', 'eyebrow'),
    cardBg: read('home_featured_product_card_bg_color', 'cardBg'),
    cardBorder: read('home_featured_product_card_border_color', 'cardBorder'),
  };
}

export function useFeaturedProductAppearance(sectionId = 'home_featured_product') {
  const { get } = useSiteSettingsMap();
  const defaultDark = false;
  const darkFromLayout = useSectionDarkBackground(sectionId, defaultDark);
  const presetKey =
    sectionId === 'products_featured'
      ? 'products_featured_theme_preset'
      : 'home_featured_product_theme_preset';
  const storedPreset = get(presetKey) || get('home_featured_product_theme_preset');
  const isCustom = storedPreset === 'custom';

  // Layout → Backgrounds toggle is the source of truth for light vs navy.
  const effectivePreset: FeaturedProductPreset = !darkFromLayout
    ? 'light'
    : isCustom
      ? 'custom'
      : 'navy';

  const colors: FeaturedProductColorTokens =
    isCustom && darkFromLayout
      ? buildCustomColors(get)
      : { ...FEATURED_PRODUCT_THEME_PRESETS[effectivePreset] };

  const isDark =
    darkFromLayout &&
    (isCustom ? isDarkColor(colors.bg.startsWith('#') ? colors.bg : '#ffffff') : true);

  const sectionStyle: CSSProperties = {
    backgroundColor: colors.bg,
    backgroundImage: isDark
      ? `radial-gradient(ellipse 80% 60% at 100% 0%, ${hexToRgba(colors.accent, 0.12)}, transparent 55%)`
      : `radial-gradient(ellipse 70% 50% at 100% 0%, ${hexToRgba(colors.accent, 0.08)}, transparent 50%)`,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : undefined,
  };

  return {
    preset: effectivePreset,
    colors,
    isDark,
    sectionStyle,
    colorFieldKeys: FEATURED_PRODUCT_COLOR_FIELDS,
  };
}
