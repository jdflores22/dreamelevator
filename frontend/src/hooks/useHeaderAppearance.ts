import type { CSSProperties } from 'react';
import {
  DEFAULT_HEADER_BG_COLOR,
  DEFAULT_HEADER_STYLE,
  HEADER_BG_COLOR_KEY,
  HEADER_PRESET_COLORS,
  HEADER_STYLE_KEY,
  type HeaderStylePreset,
} from '@/constants/headerAppearance';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { cn } from '@/utils/cn';
import { isDarkColor, isValidHexColor, normalizeHexColor } from '@/utils/color';

export type HeaderAppearance = {
  preset: HeaderStylePreset;
  backgroundColor: string;
  isDark: boolean;
  headerClassName: string;
  headerStyle?: CSSProperties;
  borderClassName: string;
  logoVariant: 'light' | 'dark';
  navLinkClass: (isActive: boolean) => string;
  contactButtonVariant: 'primary' | 'secondary';
  menuButtonClassName: string;
  mobileDark: boolean;
  previewContactClass: string;
  previewNavActiveClass: string;
  previewNavInactiveClass: string;
};

function resolvePreset(value: string | undefined): HeaderStylePreset {
  if (value === 'white' || value === 'custom' || value === 'navy') {
    return value;
  }
  return DEFAULT_HEADER_STYLE;
}

function resolveBackgroundColor(preset: HeaderStylePreset, storedColor: string | undefined): string {
  if (preset === 'custom') {
    return isValidHexColor(storedColor ?? '')
      ? normalizeHexColor(storedColor!, DEFAULT_HEADER_BG_COLOR)
      : DEFAULT_HEADER_BG_COLOR;
  }
  return HEADER_PRESET_COLORS[preset];
}

export function resolveHeaderAppearance(
  get: (key: string, fallback?: string) => string,
): HeaderAppearance {
  const preset = resolvePreset(get(HEADER_STYLE_KEY, DEFAULT_HEADER_STYLE));
  const backgroundColor = resolveBackgroundColor(preset, get(HEADER_BG_COLOR_KEY, DEFAULT_HEADER_BG_COLOR));
  const isDark = preset === 'navy' || (preset === 'custom' && isDarkColor(backgroundColor));

  const headerClassName =
    preset === 'navy' ? 'bg-primary-900' : preset === 'white' ? 'bg-white' : '';

  const headerStyle: CSSProperties | undefined =
    preset === 'custom' ? { backgroundColor } : undefined;

  const borderClassName = isDark ? 'border-white/10' : 'border-slate-200';

  const navLinkClass = (isActive: boolean) =>
    cn(
      'relative flex h-full items-center px-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] font-display transition-colors',
      isDark
        ? isActive
          ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-brand-gold-500'
          : 'text-slate-300 hover:text-white'
        : isActive
          ? 'text-primary-900 after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-brand-gold-500'
          : 'text-slate-600 hover:text-primary-900',
    );

  return {
    preset,
    backgroundColor,
    isDark,
    headerClassName,
    headerStyle,
    borderClassName,
    logoVariant: isDark ? 'light' : 'dark',
    navLinkClass,
    contactButtonVariant: isDark ? 'secondary' : 'primary',
    menuButtonClassName: isDark ? 'text-white' : 'text-primary-900',
    mobileDark: isDark,
    previewContactClass: isDark
      ? 'rounded-sm bg-white/10 px-3 py-1.5 text-xs font-medium text-white'
      : 'rounded-sm bg-primary-900 px-3 py-1.5 text-xs font-medium text-white',
    previewNavActiveClass: isDark ? 'text-white' : 'text-primary-900',
    previewNavInactiveClass: isDark ? 'text-slate-400' : 'text-slate-500',
  };
}

export function useHeaderAppearance(): HeaderAppearance {
  const { get } = useSiteSettingsMap();
  return resolveHeaderAppearance(get);
}
