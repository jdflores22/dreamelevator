export type HeroThemePreset = 'light' | 'navy' | 'gold' | 'custom';

export type HeroColorTokens = {
  bg: string;
  accentNavy: string;
  accentGold: string;
  title: string;
  titleHighlight: string;
  body: string;
  eyebrow: string;
  panelBg: string;
  panelBorder: string;
  highlightsBg: string;
  highlightsBorder: string;
  highlightsTitle: string;
  highlightsBody: string;
  link: string;
};

export const HERO_THEME_PRESETS: Record<HeroThemePreset, HeroColorTokens> = {
  light: {
    bg: '#f8fafc',
    accentNavy: '#047cae',
    accentGold: '#f7971f',
    title: '#0a3144',
    titleHighlight: '#0a3144',
    body: '#475569',
    eyebrow: '#047cae',
    panelBg: 'rgba(255, 255, 255, 0.9)',
    panelBorder: 'rgba(226, 232, 240, 0.9)',
    highlightsBg: '#ffffff',
    highlightsBorder: '#e2e8f0',
    highlightsTitle: '#0a3144',
    highlightsBody: '#475569',
    link: '#047cae',
  },
  navy: {
    bg: '#0a3144',
    accentNavy: '#03658f',
    accentGold: '#f7971f',
    title: '#ffffff',
    titleHighlight: '#f8b44a',
    body: '#cbd5e1',
    eyebrow: '#f8b44a',
    panelBg: 'rgba(255, 255, 255, 0.06)',
    panelBorder: 'rgba(255, 255, 255, 0.12)',
    highlightsBg: '#0a4a66',
    highlightsBorder: 'rgba(255, 255, 255, 0.1)',
    highlightsTitle: '#ffffff',
    highlightsBody: '#cbd5e1',
    link: '#f8b44a',
  },
  gold: {
    bg: '#fff7ed',
    accentNavy: '#047cae',
    accentGold: '#f7971f',
    title: '#0a3144',
    titleHighlight: '#b85f0c',
    body: '#57534e',
    eyebrow: '#de7a12',
    panelBg: 'rgba(255, 255, 255, 0.85)',
    panelBorder: 'rgba(247, 151, 31, 0.35)',
    highlightsBg: '#ffffff',
    highlightsBorder: '#fed7aa',
    highlightsTitle: '#0a3144',
    highlightsBody: '#57534e',
    link: '#b85f0c',
  },
  custom: {
    bg: '#f8fafc',
    accentNavy: '#047cae',
    accentGold: '#f7971f',
    title: '#0a3144',
    titleHighlight: '#0a3144',
    body: '#475569',
    eyebrow: '#047cae',
    panelBg: 'rgba(255, 255, 255, 0.9)',
    panelBorder: 'rgba(226, 232, 240, 0.9)',
    highlightsBg: '#ffffff',
    highlightsBorder: '#e2e8f0',
    highlightsTitle: '#0a3144',
    highlightsBody: '#475569',
    link: '#047cae',
  },
};

export const HERO_COLOR_FIELDS = [
  { key: 'hero_bg_color', label: 'Background', token: 'bg' as const },
  { key: 'hero_accent_navy_color', label: 'Blue glow accent', token: 'accentNavy' as const },
  { key: 'hero_accent_gold_color', label: 'Orange glow accent', token: 'accentGold' as const },
  { key: 'hero_title_color', label: 'Title line 1', token: 'title' as const },
  { key: 'hero_title_highlight_color', label: 'Title highlight', token: 'titleHighlight' as const },
  { key: 'hero_body_color', label: 'Description text', token: 'body' as const },
  { key: 'hero_eyebrow_color', label: 'Eyebrow / label', token: 'eyebrow' as const },
  { key: 'hero_panel_bg_color', label: 'Side panel background', token: 'panelBg' as const },
  { key: 'hero_highlights_bg_color', label: 'Highlight cards background', token: 'highlightsBg' as const },
] as const;

export const HERO_PRESET_OPTIONS: { value: HeroThemePreset; label: string }[] = [
  { value: 'light', label: 'Light (default)' },
  { value: 'navy', label: 'Dark' },
  { value: 'gold', label: 'Orange wash' },
  { value: 'custom', label: 'Custom colors' },
];
