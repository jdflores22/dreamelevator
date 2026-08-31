import type { CSSProperties } from 'react';
import {
  HERO_COLOR_FIELDS,
  HERO_THEME_PRESETS,
  type HeroColorTokens,
  type HeroThemePreset,
} from '@/constants/heroAppearance';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { hexToRgba, isDarkColor, isValidHexColor, normalizeHexColor } from '@/utils/color';

function resolvePreset(value: string | undefined): HeroThemePreset {
  if (value === 'navy' || value === 'gold' || value === 'custom' || value === 'light') {
    return value;
  }
  return 'light';
}

function resolveColor(
  stored: string | undefined,
  preset: HeroThemePreset,
  token: keyof HeroColorTokens,
): string {
  const base = HERO_THEME_PRESETS[preset] ?? HERO_THEME_PRESETS.light;
  if (stored && isValidHexColor(stored)) {
    return normalizeHexColor(stored, base[token]);
  }
  if (preset === 'custom') {
    return HERO_THEME_PRESETS.light[token];
  }
  return base[token];
}

function buildHeroBackground(colors: HeroColorTokens, isDark: boolean): string {
  const layers = [
    `radial-gradient(ellipse 90% 70% at 100% 0%, ${hexToRgba(colors.accentGold, isDark ? 0.22 : 0.14)}, transparent 52%)`,
    `radial-gradient(ellipse 75% 55% at 0% 100%, ${hexToRgba(colors.accentNavy, isDark ? 0.35 : 0.1)}, transparent 50%)`,
    `linear-gradient(135deg, ${hexToRgba(colors.bg, isDark ? 1 : 0.92)} 0%, ${colors.bg} 55%, ${isDark ? colors.bg : '#ffffff'} 100%)`,
  ];

  if (!isDark) {
    layers.push(
      'linear-gradient(rgba(26, 58, 102, 0.04) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(26, 58, 102, 0.04) 1px, transparent 1px)',
    );
  }

  return layers.join(', ');
}

function buildImageOverlay(color: string, veil: number, isDark: boolean): string {
  const left = veil === 0 ? 0 : Math.min(0.98, 0.58 + veil * 0.45);
  const mid = veil === 0 ? 0 : Math.min(0.94, 0.42 + veil * 0.5);
  const right = veil === 0 ? 0 : Math.max(0.28, veil * 0.48);
  return [
    `linear-gradient(90deg, ${hexToRgba(color, left)} 0%, ${hexToRgba(color, mid)} 46%, ${hexToRgba(color, right)} 100%)`,
    `linear-gradient(180deg, ${hexToRgba(color, isDark ? 0.45 : 0.28)} 0%, transparent 22%, transparent 82%, ${hexToRgba(color, isDark ? 0.3 : 0.16)} 100%)`,
  ].join(', ');
}

export function useHeroAppearance() {
  const { get } = useSiteSettingsMap();
  const preset = resolvePreset(get('hero_theme_preset', 'light'));

  const colors: HeroColorTokens = {
    bg: resolveColor(get('hero_bg_color'), preset, 'bg'),
    accentNavy: resolveColor(get('hero_accent_navy_color'), preset, 'accentNavy'),
    accentGold: resolveColor(get('hero_accent_gold_color'), preset, 'accentGold'),
    title: resolveColor(get('hero_title_color'), preset, 'title'),
    titleHighlight: resolveColor(get('hero_title_highlight_color'), preset, 'titleHighlight'),
    body: resolveColor(get('hero_body_color'), preset, 'body'),
    eyebrow: resolveColor(get('hero_eyebrow_color'), preset, 'eyebrow'),
    panelBg: resolveColor(get('hero_panel_bg_color'), preset, 'panelBg'),
    panelBorder: HERO_THEME_PRESETS[preset]?.panelBorder ?? HERO_THEME_PRESETS.light.panelBorder,
    highlightsBg: resolveColor(get('hero_highlights_bg_color'), preset, 'highlightsBg'),
    highlightsBorder: HERO_THEME_PRESETS[preset]?.highlightsBorder ?? HERO_THEME_PRESETS.light.highlightsBorder,
    highlightsTitle: resolveColor(get('hero_title_color'), preset, 'title'),
    highlightsBody: resolveColor(get('hero_body_color'), preset, 'body'),
    link: HERO_THEME_PRESETS[preset]?.link ?? HERO_THEME_PRESETS.light.link,
  };

  const overlayRaw = Number.parseInt(get('hero_image_overlay', '85'), 10);
  const imageOverlayOpacity = Number.isFinite(overlayRaw)
    ? Math.min(100, Math.max(0, overlayRaw)) / 100
    : 0.85;

  const overlayStored = get('hero_overlay_color', '').trim();
  const imageOverlayColor = overlayStored && isValidHexColor(overlayStored)
    ? normalizeHexColor(overlayStored, colors.bg)
    : colors.bg;

  const isDark = preset === 'navy' || (preset === 'custom' && isDarkColor(colors.bg));

  const imageOverlayStyle = buildImageOverlay(imageOverlayColor, imageOverlayOpacity, isDark);

  const mainStyle: CSSProperties = {
    backgroundColor: colors.bg,
    backgroundImage: buildHeroBackground(colors, isDark),
    backgroundSize: isDark ? 'auto, auto, auto' : 'auto, auto, auto, 48px 48px, 48px 48px',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : undefined,
  };

  const cssVars: CSSProperties = {
    ['--hero-title' as string]: colors.title,
    ['--hero-title-highlight' as string]: colors.titleHighlight,
    ['--hero-body' as string]: colors.body,
    ['--hero-eyebrow' as string]: colors.eyebrow,
    ['--hero-link' as string]: colors.link,
    ['--hero-panel-bg' as string]: colors.panelBg,
    ['--hero-panel-border' as string]: colors.panelBorder,
    ['--hero-highlights-bg' as string]: colors.highlightsBg,
    ['--hero-highlights-border' as string]: colors.highlightsBorder,
    ['--hero-highlights-title' as string]: colors.highlightsTitle,
    ['--hero-highlights-body' as string]: colors.highlightsBody,
  };

  return {
    preset,
    colors,
    isDark,
    imageOverlayOpacity,
    imageOverlayColor,
    imageOverlayStyle,
    mainStyle,
    cssVars,
    colorFieldKeys: HERO_COLOR_FIELDS,
  };
}
