import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/api/hooks';
import {
  FEATURED_PRODUCT_COLOR_FIELDS,
  FEATURED_PRODUCT_PRESET_KEY,
  FEATURED_PRODUCT_PRESET_OPTIONS,
  FEATURED_PRODUCT_THEME_PRESETS,
  type FeaturedProductPreset,
} from '@/constants/featuredProductAppearance';
import { sectionDarkBgKey } from '@/constants/sectionVisibility';
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

function resolvePreset(value: string): FeaturedProductPreset {
  if (value === 'navy' || value === 'custom' || value === 'light') return value;
  return 'navy';
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
  const pickerValue = isValidHexColor(value) ? normalizeHexColor(value, '#0a3144') : '#0a3144';

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

export function FeaturedProductAppearanceSettings({ variant = 'panel' }: { variant?: 'panel' | 'compact' }) {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const storedPreset = resolvePreset(getValue(settings, FEATURED_PRODUCT_PRESET_KEY) || 'navy');
  const [preset, setPreset] = useState<FeaturedProductPreset>(storedPreset);
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of FEATURED_PRODUCT_COLOR_FIELDS) {
      initial[field.key] = getValue(settings, field.key);
    }
    return initial;
  });

  const applyPresetColors = (next: FeaturedProductPreset) => {
    const tokens = FEATURED_PRODUCT_THEME_PRESETS[next];
    const nextColors: Record<string, string> = {};
    for (const field of FEATURED_PRODUCT_COLOR_FIELDS) {
      const tokenValue = tokens[field.token];
      nextColors[field.key] = tokenValue.startsWith('#') ? tokenValue : '';
    }
    setColors(nextColors);
    setPreset(next);
  };

  const saveField = async (key: string, value: string, group: string) => {
    const existing = settings?.find((s) => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, data: { value, isPublic: true } });
    } else {
      await createMutation.mutateAsync({ key, value, group, isPublic: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    setSaving(true);
    try {
      await saveField(FEATURED_PRODUCT_PRESET_KEY, preset, 'home');
      await saveField(sectionDarkBgKey('home_featured_product'), preset === 'navy' ? 'true' : 'false', 'sections');
      await Promise.all(
        FEATURED_PRODUCT_COLOR_FIELDS.map((field) =>
          saveField(field.key, colors[field.key]?.trim() ?? '', 'home'),
        ),
      );
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

  const isSaving = saving || createMutation.isPending || updateMutation.isPending;
  const previewTokens = FEATURED_PRODUCT_THEME_PRESETS[preset];

  const formBody = (
    <>
      <div className="space-y-1.5">
        <label htmlFor="featured_product_theme_preset" className="text-sm font-medium text-slate-700">
          Color preset
        </label>
        <select
          id="featured_product_theme_preset"
          name="featured_product_theme_preset"
          value={preset}
          onChange={(e) => applyPresetColors(e.target.value as FeaturedProductPreset)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {FEATURED_PRODUCT_PRESET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">
          Controls the featured product spotlight on the homepage. Pick a preset, then fine-tune colors below.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-medium text-primary-900">Color calibration</p>
        <div className="grid gap-4 md:grid-cols-2">
          {FEATURED_PRODUCT_COLOR_FIELDS.map((field) => (
            <ColorField
              key={field.key}
              label={field.label}
              name={field.key}
              value={colors[field.key] ?? ''}
              onChange={(value) => setColors((prev) => ({ ...prev, [field.key]: value }))}
            />
          ))}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border p-5"
        style={{
          backgroundColor: colors.home_featured_product_bg_color || previewTokens.bg,
          borderColor: colors.home_featured_product_card_border_color || previewTokens.cardBorder,
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: colors.home_featured_product_eyebrow_color || previewTokens.eyebrow }}
        >
          Featured product
        </p>
        <p
          className="mt-2 text-lg font-semibold"
          style={{ color: colors.home_featured_product_title_color || previewTokens.title }}
        >
          Product name preview
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: colors.home_featured_product_body_color || previewTokens.body }}
        >
          Short description and feature list use the body color.
        </p>
        <span
          className="mt-4 inline-block rounded-md px-3 py-1.5 text-sm font-semibold text-primary-950"
          style={{
            backgroundColor: colors.home_featured_product_accent_color || previewTokens.accent,
          }}
        >
          View product
        </span>
      </div>
    </>
  );

  const form = (
    <form id="featured-product-appearance-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {formBody}
      {variant === 'panel' && (
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save colors
          </Button>
          <SaveFeedback saved={saved} isSaving={isSaving} />
        </div>
      )}
    </form>
  );

  if (variant === 'compact') {
    return (
      <CompactSettingsSection
        title="Featured product colors"
        description="Preset and color calibration for the homepage product spotlight."
        formId="featured-product-appearance-form"
        isSaving={isSaving}
        saved={saved}
        saveLabel="Save colors"
      >
        {form}
      </CompactSettingsSection>
    );
  }

  return (
    <SettingsPanel
      icon={Palette}
      title="Featured product appearance"
      description="Choose light or navy presets and customize colors for the homepage product spotlight."
    >
      {form}
    </SettingsPanel>
  );
}
