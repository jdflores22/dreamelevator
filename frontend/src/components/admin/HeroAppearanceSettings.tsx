import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useSiteSettings, useUpsertSiteSettings } from '@/api/hooks';
import {
  HERO_COLOR_FIELDS,
  HERO_PRESET_OPTIONS,
  HERO_THEME_PRESETS,
  type HeroThemePreset,
} from '@/constants/heroAppearance';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { CompactSettingsSection } from '@/components/admin/SettingsTabBar';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { isValidHexColor, normalizeHexColor } from '@/utils/color';
import type { SiteSetting } from '@/types';

function getValue(settings: SiteSetting[] | undefined, key: string) {
  return settings?.find((s) => s.key === key)?.value ?? '';
}

function resolvePreset(value: string): HeroThemePreset {
  if (value === 'navy' || value === 'gold' || value === 'custom' || value === 'light') {
    return value;
  }
  return 'light';
}

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = isValidHexColor(value) ? normalizeHexColor(value, '#000000') : '#0a3144';

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
      <Input
        name={name}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#0a3144"
      />
      <label className="flex h-[42px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-14">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${label} color picker`}
        />
      </label>
    </div>
  );
}

export function HeroAppearanceSettings({ variant = 'panel' }: { variant?: 'panel' | 'compact' }) {
  const { data: settings, isLoading } = useSiteSettings();
  const upsertMutation = useUpsertSiteSettings();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const storedPreset = resolvePreset(getValue(settings, 'hero_theme_preset') || 'light');
  const [preset, setPreset] = useState<HeroThemePreset>(storedPreset);
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of HERO_COLOR_FIELDS) {
      initial[field.key] = getValue(settings, field.key);
    }
    return initial;
  });
  const [overlay, setOverlay] = useState(getValue(settings, 'hero_image_overlay') || '85');
  const [overlayColor, setOverlayColor] = useState(getValue(settings, 'hero_overlay_color'));

  const applyPresetColors = (next: HeroThemePreset) => {
    const tokens = HERO_THEME_PRESETS[next];
    const nextColors: Record<string, string> = {};
    for (const field of HERO_COLOR_FIELDS) {
      const tokenValue = tokens[field.token];
      nextColors[field.key] = tokenValue.startsWith('#') ? tokenValue : '';
    }
    setColors(nextColors);
    setPreset(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    setSaving(true);
    try {
      await upsertMutation.mutateAsync([
        { key: 'hero_theme_preset', value: preset, group: 'home', isPublic: true },
        { key: 'hero_image_overlay', value: overlay, group: 'home', isPublic: true },
        { key: 'hero_overlay_color', value: overlayColor.trim(), group: 'home', isPublic: true },
        ...HERO_COLOR_FIELDS.map((field) => ({
          key: field.key,
          value: colors[field.key]?.trim() ?? '',
          group: 'home',
          isPublic: true,
        })),
      ]);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const isSaving = saving || upsertMutation.isPending;
  const showColorFields = preset === 'custom' || preset === 'light' || preset === 'navy' || preset === 'gold';

  const form = (
    <form id="hero-appearance-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="hero_theme_preset" className="text-sm font-medium text-slate-700">
            Color preset
          </label>
          <select
            id="hero_theme_preset"
            name="hero_theme_preset"
            value={preset}
            onChange={(e) => applyPresetColors(e.target.value as HeroThemePreset)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {HERO_PRESET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Presets fill suggested colors below. Use <strong>Custom</strong> to tune each value, or
            adjust colors after picking a preset.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Overlay color"
            name="hero_overlay_color"
            value={overlayColor}
            onChange={setOverlayColor}
          />
          <Input
            name="hero_image_overlay"
            label="Overlay strength (0–100)"
            type="number"
            min={0}
            max={100}
            value={overlay}
            onChange={(e) => setOverlay(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Overlay color sits on top of the hero photo. Leave it blank to match the hero background.
          Higher strength hides more of the photo on the left so the headline stays readable.
        </p>

        {showColorFields && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-medium text-primary-900">Color calibration</p>
            <div className="grid gap-4 md:grid-cols-2">
              {HERO_COLOR_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  name={field.key}
                  value={colors[field.key] ?? ''}
                  onChange={(value) => {
                    setColors((prev) => ({ ...prev, [field.key]: value }));
                    if (preset !== 'custom') setPreset('custom');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div
          className="overflow-hidden rounded-xl border border-slate-200"
          style={{
            backgroundColor: colors.hero_bg_color || HERO_THEME_PRESETS[preset].bg,
            backgroundImage: `radial-gradient(ellipse 80% 60% at 100% 0%, ${colors.hero_accent_gold_color || HERO_THEME_PRESETS[preset].accentGold}33, transparent 55%)`,
          }}
        >
          <div className="px-5 py-6">
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: colors.hero_eyebrow_color || HERO_THEME_PRESETS[preset].eyebrow }}
            >
              Preview label
            </p>
            <p
              className="mt-2 text-2xl font-semibold"
              style={{ color: colors.hero_title_color || HERO_THEME_PRESETS[preset].title }}
            >
              Driven by engineering,
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color:
                  colors.hero_title_highlight_color || HERO_THEME_PRESETS[preset].titleHighlight,
              }}
            >
              empowered by people
            </p>
            <p
              className="mt-3 max-w-md text-sm"
              style={{ color: colors.hero_body_color || HERO_THEME_PRESETS[preset].body }}
            >
              Short description preview for your hero color calibration.
            </p>
          </div>
        </div>
      </form>
  );

  if (variant === 'compact') {
    return (
      <CompactSettingsSection
        title="Hero appearance"
        description="Colors, overlay color & strength, and live preview."
        formId="hero-appearance-form"
        isSaving={isSaving}
        saved={saved}
      >
        {form}
      </CompactSettingsSection>
    );
  }

  return (
    <SettingsPanel
      icon={Palette}
      title="Hero appearance"
      description="Calibrate homepage hero colors — background, text, accents, overlay color, and strength."
      footer={
        <>
          <Button type="submit" form="hero-appearance-form" isLoading={isSaving} size="sm">
            Save appearance
          </Button>
          <SaveFeedback saved={saved} isSaving={isSaving} />
        </>
      }
    >
      {form}
    </SettingsPanel>
  );
}
