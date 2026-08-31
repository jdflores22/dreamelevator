export type HeaderStylePreset = 'navy' | 'white' | 'custom';

export const HEADER_STYLE_KEY = 'header_style';
export const HEADER_BG_COLOR_KEY = 'header_bg_color';

export const HEADER_STYLE_OPTIONS: { value: HeaderStylePreset; label: string }[] = [
  { value: 'navy', label: 'Dark (default)' },
  { value: 'white', label: 'White' },
  { value: 'custom', label: 'Custom color' },
];

export const HEADER_PRESET_COLORS: Record<Exclude<HeaderStylePreset, 'custom'>, string> = {
  navy: '#0a3144',
  white: '#ffffff',
};

export const DEFAULT_HEADER_STYLE: HeaderStylePreset = 'navy';
export const DEFAULT_HEADER_BG_COLOR = HEADER_PRESET_COLORS.navy;
