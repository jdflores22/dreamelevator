export const HEADER_COMPANY_NAME_COLOR_KEY = 'header_company_name_color';
export const HEADER_COMPANY_NAME_ACCENT_COLOR_KEY = 'header_company_name_accent_color';
export const HEADER_COMPANY_TAGLINE_COLOR_KEY = 'header_company_tagline_color';

export const HEADER_TEXT_DEFAULTS = {
  light: {
    name: '#ffffff',
    accent: '#f8b44a',
    tagline: '#cbd5e1',
  },
  dark: {
    name: '#0a3144',
    accent: '#f7971f',
    tagline: '#047cae',
  },
} as const;

export const HEADER_TEXT_COLOR_FIELDS = [
  { key: HEADER_COMPANY_NAME_COLOR_KEY, label: 'Company name color', token: 'name' as const },
  {
    key: HEADER_COMPANY_NAME_ACCENT_COLOR_KEY,
    label: 'Name accent color',
    token: 'accent' as const,
  },
  { key: HEADER_COMPANY_TAGLINE_COLOR_KEY, label: 'Tagline color', token: 'tagline' as const },
] as const;
