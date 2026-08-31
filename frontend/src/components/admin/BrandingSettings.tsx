import { useEffect, useRef, useState } from 'react';
import { ImageIcon, LayoutTemplate, Upload } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { LogoPreviewFrame, CompanyLogoImage } from '@/components/common/CompanyLogoImage';
import { CompanyBrandText } from '@/components/common/CompanyBrandText';
import {
  HEADER_COMPANY_NAME_ACCENT_COLOR_KEY,
  HEADER_COMPANY_NAME_COLOR_KEY,
  HEADER_COMPANY_TAGLINE_COLOR_KEY,
  HEADER_TEXT_COLOR_FIELDS,
  HEADER_TEXT_DEFAULTS,
} from '@/constants/headerBranding';
import {
  DEFAULT_HEADER_BG_COLOR,
  HEADER_BG_COLOR_KEY,
  HEADER_STYLE_KEY,
  HEADER_STYLE_OPTIONS,
  HEADER_PRESET_COLORS,
  type HeaderStylePreset,
} from '@/constants/headerAppearance';
import { resolveHeaderAppearance } from '@/hooks/useHeaderAppearance';
import { resolveHeaderBrandingText } from '@/hooks/useHeaderBrandingText';
import { resolveMediaUrl } from '@/utils/media';
import { isLegacyLogoPath } from '@/utils/brand';
import { isTransparentLogoUrl } from '@/utils/logo';
import { isValidHexColor, normalizeHexColor } from '@/utils/color';
import { cn } from '@/utils/cn';
import apiClient from '@/api/client';

const LOGO_KEY = 'company_logo';
const NAME_KEY = 'company_name';
const SUB_NAME_KEY = 'company_tagline';

function getSettingValue(settings: { key: string; value: string }[] | undefined, key: string) {
  return settings?.find((s) => s.key === key)?.value ?? '';
}

function resolveHeaderPreset(value: string): HeaderStylePreset {
  if (value === 'white' || value === 'custom' || value === 'navy') {
    return value;
  }
  return 'navy';
}

function ColorField({
  label,
  name,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = isValidHexColor(value)
    ? normalizeHexColor(value, placeholder)
    : placeholder;

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
      <Input
        name={name}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Auto (${placeholder})`}
      />
      <label className="flex h-[42px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-14">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${label} picker`}
        />
      </label>
    </div>
  );
}

export function BrandingSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [headerSaved, setHeaderSaved] = useState(false);
  const [previewName, setPreviewName] = useState('');
  const [previewTagline, setPreviewTagline] = useState('');

  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();

  const logoSetting = settings?.find((s) => s.key === LOGO_KEY);
  const nameSetting = settings?.find((s) => s.key === NAME_KEY);
  const subNameSetting = settings?.find((s) => s.key === SUB_NAME_KEY);
  const logoUrl =
    logoSetting?.value && !isLegacyLogoPath(logoSetting.value)
      ? resolveMediaUrl(logoSetting.value)
      : '';
  const logoMedia = settings?.find((s) => s.key === 'company_logo_media')?.value ?? 'png';
  const logoIsTransparent = isTransparentLogoUrl(logoUrl, logoMedia);

  const storedHeaderPreset = resolveHeaderPreset(getSettingValue(settings, HEADER_STYLE_KEY) || 'navy');
  const storedHeaderColor =
    getSettingValue(settings, HEADER_BG_COLOR_KEY) || DEFAULT_HEADER_BG_COLOR;

  const [headerPreset, setHeaderPreset] = useState<HeaderStylePreset>(storedHeaderPreset);
  const [headerColor, setHeaderColor] = useState(storedHeaderColor);
  const [nameColor, setNameColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [taglineColor, setTaglineColor] = useState('');
  const headerStateSynced = useRef(false);
  const textColorStateSynced = useRef(false);

  useEffect(() => {
    if (!settings || headerStateSynced.current) return;
    setHeaderPreset(resolveHeaderPreset(getSettingValue(settings, HEADER_STYLE_KEY) || 'navy'));
    setHeaderColor(getSettingValue(settings, HEADER_BG_COLOR_KEY) || DEFAULT_HEADER_BG_COLOR);
    headerStateSynced.current = true;
  }, [settings]);

  useEffect(() => {
    if (!settings || textColorStateSynced.current) return;
    setNameColor(getSettingValue(settings, HEADER_COMPANY_NAME_COLOR_KEY));
    setAccentColor(getSettingValue(settings, HEADER_COMPANY_NAME_ACCENT_COLOR_KEY));
    setTaglineColor(getSettingValue(settings, HEADER_COMPANY_TAGLINE_COLOR_KEY));
    textColorStateSynced.current = true;
  }, [settings]);

  const displayName = previewName || nameSetting?.value || '';
  const displayTagline = previewTagline || subNameSetting?.value || '';

  const headerPreview = resolveHeaderAppearance((key, fallback = '') => {
    if (key === HEADER_STYLE_KEY) return headerPreset;
    if (key === HEADER_BG_COLOR_KEY) return headerColor;
    return fallback;
  });

  const textVariant = headerPreview.isDark ? 'light' : 'dark';
  const textDefaults = HEADER_TEXT_DEFAULTS[textVariant];
  const previewTextColors = resolveHeaderBrandingText((key, fallback = '') => {
    if (key === HEADER_COMPANY_NAME_COLOR_KEY) return nameColor;
    if (key === HEADER_COMPANY_NAME_ACCENT_COLOR_KEY) return accentColor;
    if (key === HEADER_COMPANY_TAGLINE_COLOR_KEY) return taglineColor;
    return fallback;
  }, textVariant);

  const saveSetting = async (key: string, value: string, group: string) => {
    const existing = settings?.find((s) => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({
        id: existing.id,
        data: { value, group, isPublic: true },
      });
    } else {
      await createMutation.mutateAsync({ key, value, group, isPublic: true });
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ data: { url: string } }>(
        '/upload?folder=branding',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      await saveSetting(LOGO_KEY, data.data.url, 'branding');
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (['png', 'svg', 'webp', 'jpg', 'jpeg'].includes(ext)) {
        await saveSetting('company_logo_media', ext, 'branding');
      }
    } catch {
      setError('Upload failed. Please try a PNG, JPG, or SVG under 10 MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get(NAME_KEY) ?? '');
    const tagline = String(formData.get(SUB_NAME_KEY) ?? '');
    await Promise.all([
      saveSetting(NAME_KEY, name, 'general'),
      saveSetting(SUB_NAME_KEY, tagline, 'branding'),
    ]);
    setPreviewName('');
    setPreviewTagline('');
    setSaved(true);
  };

  const handleHeaderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHeaderSaved(false);
    const normalizedColor = isValidHexColor(headerColor)
      ? normalizeHexColor(headerColor, DEFAULT_HEADER_BG_COLOR)
      : DEFAULT_HEADER_BG_COLOR;
    await Promise.all([
      saveSetting(HEADER_STYLE_KEY, headerPreset, 'branding'),
      saveSetting(HEADER_BG_COLOR_KEY, normalizedColor, 'branding'),
      saveSetting(HEADER_COMPANY_NAME_COLOR_KEY, nameColor.trim(), 'branding'),
      saveSetting(HEADER_COMPANY_NAME_ACCENT_COLOR_KEY, accentColor.trim(), 'branding'),
      saveSetting(HEADER_COMPANY_TAGLINE_COLOR_KEY, taglineColor.trim(), 'branding'),
    ]);
    setHeaderColor(normalizedColor);
    setHeaderSaved(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const headerPickerValue = isValidHexColor(headerColor)
    ? normalizeHexColor(headerColor, DEFAULT_HEADER_BG_COLOR)
    : DEFAULT_HEADER_BG_COLOR;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="sticky top-6 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Live preview</p>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-500">
              Live preview — matches the public site header
            </div>
            <div
              className={cn('border-b', headerPreview.borderClassName, headerPreview.headerClassName)}
              style={headerPreview.headerStyle}
            >
              <div className="flex h-16 items-center justify-between gap-4 px-6">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <CompanyLogoImage
                      src={logoUrl}
                      alt="Logo preview"
                      size="md"
                      mediaHint={logoMedia}
                      bare={logoIsTransparent || headerPreview.isDark}
                    />
                  ) : null}
                  <CompanyBrandText
                    companyName={displayName}
                    tagline={displayTagline}
                    nameColor={previewTextColors.nameColor}
                    accentColor={previewTextColors.accentColor}
                    taglineColor={previewTextColors.taglineColor}
                  />
                </div>
                <span className={cn('hidden sm:inline', headerPreview.previewContactClass)}>
                  Contact us
                </span>
              </div>
            </div>
            <div
              className={cn(
                'hidden gap-4 border-b px-6 py-2 sm:flex',
                headerPreview.borderClassName,
                headerPreview.headerClassName,
              )}
              style={headerPreview.headerStyle}
            >
              {['Home', 'About', 'Services', 'Portfolio'].map((item) => (
                <span
                  key={item}
                  className={cn(
                    'text-xs font-medium',
                    item === 'Home'
                      ? headerPreview.previewNavActiveClass
                      : headerPreview.previewNavInactiveClass,
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-3">
        <SettingsPanel
          icon={LayoutTemplate}
          title="Header navigation"
          description="Top navigation bar background and company name colors. Does not affect the footer."
          footer={
            <>
              <Button
                type="submit"
                form="header-style-form"
                isLoading={isSaving && !uploading}
                size="sm"
              >
                Save header style
              </Button>
              <SaveFeedback saved={headerSaved} isSaving={isSaving} />
            </>
          }
        >
          <form id="header-style-form" onSubmit={(e) => void handleHeaderSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="header_style" className="text-sm font-medium text-slate-700">
                Navigation style
              </label>
              <select
                id="header_style"
                name={HEADER_STYLE_KEY}
                value={headerPreset}
                onChange={(e) => {
                  const next = e.target.value as HeaderStylePreset;
                  setHeaderPreset(next);
                  if (next !== 'custom') {
                    setHeaderColor(HEADER_PRESET_COLORS[next]);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {HEADER_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Navy is the default brand look. White works on lighter marketing pages. Custom lets
                you pick any hex color.
              </p>
            </div>

            {headerPreset === 'custom' && (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                <Input
                  name={HEADER_BG_COLOR_KEY}
                  label="Custom navigation color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  placeholder="#0a3144"
                />
                <label className="flex h-[42px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-14">
                  <input
                    type="color"
                    value={headerPickerValue}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
                    aria-label="Navigation color picker"
                  />
                </label>
              </div>
            )}

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-sm font-medium text-primary-900">Header text colors</p>
                <p className="mt-1 text-xs text-slate-500">
                  Colors for the company name and tagline in the top navigation only. Leave blank
                  for automatic colors that match your header style. Use a hyphen in the company
                  name (e.g. DREAM-ELEVATOR) to split primary and accent colors.
                </p>
              </div>
              {HEADER_TEXT_COLOR_FIELDS.map((field) => {
                const value =
                  field.token === 'name'
                    ? nameColor
                    : field.token === 'accent'
                      ? accentColor
                      : taglineColor;
                const setValue =
                  field.token === 'name'
                    ? setNameColor
                    : field.token === 'accent'
                      ? setAccentColor
                      : setTaglineColor;

                return (
                  <ColorField
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    value={value}
                    placeholder={textDefaults[field.token]}
                    onChange={setValue}
                  />
                );
              })}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNameColor('');
                  setAccentColor('');
                  setTaglineColor('');
                }}
              >
                Reset text colors to auto
              </Button>
            </div>
          </form>
        </SettingsPanel>

        <SettingsPanel
          icon={ImageIcon}
          title="Company identity"
          description="Name and tagline displayed next to your logo across the site."
          footer={
            <>
              <Button type="submit" form="branding-names-form" isLoading={isSaving && !uploading}>
                Save branding
              </Button>
              <SaveFeedback saved={saved} isSaving={isSaving} />
            </>
          }
        >
          <form id="branding-names-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <Input
              name={NAME_KEY}
              label="Company name"
              defaultValue={nameSetting?.value ?? ''}
              placeholder="Company name"
              onChange={(e) => setPreviewName(e.target.value)}
            />
            <Input
              name={SUB_NAME_KEY}
              label="Sub company name"
              defaultValue={subNameSetting?.value ?? ''}
              placeholder="Elevator & Escalator Corp."
              onChange={(e) => setPreviewTagline(e.target.value)}
            />
          </form>
        </SettingsPanel>

        <SettingsPanel
          title="Logo"
          description={
            logoIsTransparent
              ? `PNG/SVG detected — transparency is preserved on the ${headerPreview.isDark ? 'dark' : 'light'} header.`
              : `Upload a PNG or SVG with a transparent background for best results on the ${headerPreview.isDark ? 'dark' : 'light'} header.`
          }
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <LogoPreviewFrame
              src={logoUrl}
              alt="Logo preview"
              variant={headerPreview.isDark ? 'header' : 'checkerboard'}
              className="h-32 w-32 shrink-0"
              mediaHint={logoMedia}
            />
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload new logo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => {
                    void saveSetting(LOGO_KEY, '', 'branding');
                    void saveSetting('company_logo_media', 'png', 'branding');
                  }}
                >
                  Reset to default
                </Button>
              </div>
              <p className="text-xs text-slate-400">Max 10 MB · Saves automatically on upload</p>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </SettingsPanel>
      </div>
    </div>
  );
}
