import { useState } from 'react';
import { Briefcase, FileText, Home, Image as ImageIcon, Info, Share2 } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { SettingsImageField } from '@/components/admin/SettingsImageField';
import {
  persistAboutThemesFromForm,
  SectionThemeField,
} from '@/components/admin/SectionThemeField';
import type { SiteSetting } from '@/types';

type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'richtext';
  rows?: number;
  options?: { value: string; label: string }[];
};

type ImageFieldDef = {
  key: string;
  label: string;
  hint?: string;
};

const CONTENT_GROUPS: {
  id: string;
  title: string;
  description: string;
  icon: typeof Home;
  fields: FieldDef[];
  imageKey?: string;
  imageFields?: ImageFieldDef[];
}[] = [
  {
    id: 'home',
    title: 'Hero banner',
    description: 'Static hero copy, side panel, and default background image. Used when layout is Static.',
    icon: Home,
    fields: [
      { key: 'hero_tagline', label: 'Tagline (fallback if agency label is empty)' },
      { key: 'hero_agency_label', label: 'Agency label (shown above headline)' },
      { key: 'hero_title_line1', label: 'Title line 1' },
      { key: 'hero_title_highlight', label: 'Title highlight' },
      { key: 'hero_description', label: 'Description', type: 'textarea', rows: 3 },
      { key: 'hero_panel_eyebrow', label: 'Side panel — eyebrow' },
      { key: 'hero_panel_title', label: 'Side panel — headline' },
      { key: 'hero_panel_body', label: 'Side panel — message', type: 'textarea', rows: 4 },
      {
        key: 'hero_panel_points',
        label: 'Side panel — bullet points (comma-separated)',
        type: 'textarea',
        rows: 3,
      },
    ],
    imageKey: 'hero_background_image',
  },
  {
    id: 'home-intro',
    title: 'Intro banner',
    description: '“What we do” statement block below the hero.',
    icon: Home,
    fields: [
      { key: 'home_intro_eyebrow', label: 'Eyebrow' },
      { key: 'home_intro_line1', label: 'Headline — line 1' },
      { key: 'home_intro_line2', label: 'Headline — line 2 (accent)' },
      { key: 'home_intro_line3', label: 'Headline — line 3 (optional)' },
      { key: 'home_intro_body', label: 'Body text', type: 'textarea', rows: 3 },
      { key: 'home_intro_story_label', label: 'About link label' },
      { key: 'home_intro_services_label', label: 'Services link label' },
    ],
  },
  {
    id: 'portfolio',
    title: 'Portfolio page',
    description: 'Hero image and intro text on the portfolio page.',
    icon: Briefcase,
    fields: [
      { key: 'portfolio_page_subtitle', label: 'Page subtitle', type: 'textarea', rows: 2 },
    ],
    imageKey: 'portfolio_hero_image',
  },
  {
    id: 'gallery',
    title: 'Gallery page',
    description: 'Photo grid on /gallery. One image URL per line, or JSON [{ "src", "alt" }].',
    icon: ImageIcon,
    fields: [
      { key: 'gallery_page_title', label: 'Page title' },
      { key: 'gallery_page_subtitle', label: 'Page subtitle', type: 'textarea', rows: 2 },
      {
        key: 'gallery_images',
        label: 'Photos (JSON or one URL per line, optional |alt)',
        type: 'textarea',
        rows: 10,
      },
    ],
    imageKey: 'gallery_hero_image',
  },
  {
    id: 'services',
    title: 'Services page',
    description: 'Service & Maintenance page on /services. Lead copy comes from Admin → Services.',
    icon: Briefcase,
    fields: [
      { key: 'services_page_highlight', label: 'Highlight callout' },
      { key: 'services_related_eyebrow', label: 'Other services — eyebrow' },
      { key: 'services_related_title', label: 'Other services — title' },
      { key: 'services_cta_title', label: 'Quote CTA — title' },
      { key: 'services_cta_subtitle', label: 'Quote CTA — subtitle', type: 'textarea', rows: 2 },
      { key: 'services_cta_label', label: 'Quote button label' },
    ],
    imageFields: [
      {
        key: 'services_page_image',
        label: 'Photo 1',
        hint: 'Portrait from the Service & Maintenance page.',
      },
      {
        key: 'services_page_image_2',
        label: 'Photo 2',
        hint: 'Second portrait beside the first.',
      },
    ],
  },
  {
    id: 'about',
    title: 'About page',
    description: 'Hero, vision, mission, and company story on the about page.',
    icon: Info,
    imageFields: [
      {
        key: 'about_hero_image',
        label: 'Hero background image',
        hint: 'Shown behind the page headline. Recommended 1600×900 or wider.',
      },
      {
        key: 'about_story_image',
        label: 'Company story image',
        hint: 'Optional photo beside the story section. Falls back to the hero image if empty.',
      },
      {
        key: 'about_mission_image',
        label: 'Mission section image',
        hint: 'Optional image beside the mission statement.',
      },
      {
        key: 'about_vision_image',
        label: 'Vision section image',
        hint: 'Optional image beside the vision statement.',
      },
      {
        key: 'about_story_image_2',
        label: 'Who we are — photo 2',
        hint: 'Second portrait in the story photo row.',
      },
      {
        key: 'about_story_image_3',
        label: 'Who we are — photo 3',
        hint: 'Third portrait in the story photo row.',
      },
    ],
    fields: [
      { key: 'about_page_eyebrow', label: 'Page hero — eyebrow' },
      { key: 'about_page_title', label: 'Page headline' },
      { key: 'about_page_subtitle', label: 'Page intro', type: 'textarea', rows: 3 },
      { key: 'about_values_eyebrow', label: 'Core values — eyebrow' },
      { key: 'about_values_title', label: 'Core values — title' },
      { key: 'about_values', label: 'Core values (one per line)', type: 'textarea', rows: 4 },
      { key: 'about_assessment_title', label: 'Free assessment — title' },
      { key: 'about_assessment_body', label: 'Free assessment — body', type: 'textarea', rows: 3 },
      { key: 'about_controls_note', label: 'Controls / technical note', type: 'textarea', rows: 4 },
      { key: 'about_mission', label: 'Mission statement', type: 'textarea', rows: 3 },
      {
        key: 'about_mission_image_position',
        label: 'Mission image position',
        type: 'select',
        options: [
          { value: 'left', label: 'Image on left' },
          { value: 'right', label: 'Image on right' },
        ],
      },
      { key: 'about_vision', label: 'Vision statement', type: 'textarea', rows: 3 },
      {
        key: 'about_vision_image_position',
        label: 'Vision image position',
        type: 'select',
        options: [
          { value: 'left', label: 'Image on left' },
          { value: 'right', label: 'Image on right' },
        ],
      },
      { key: 'about_story_eyebrow', label: 'Story section — eyebrow' },
      { key: 'about_story_title', label: 'Story section — title' },
      { key: 'about_intro', label: 'Story — first paragraph', type: 'textarea', rows: 4 },
      { key: 'about_secondary', label: 'Story — second paragraph', type: 'textarea', rows: 4 },
      { key: 'about_cta_title', label: 'Contact CTA — title' },
      {
        key: 'about_cta_subtitle',
        label: 'Contact CTA — subtitle',
        type: 'textarea',
        rows: 2,
      },
    ],
  },
  {
    id: 'general',
    title: 'Footer',
    description: 'Short description shown in the site footer.',
    icon: FileText,
    fields: [{ key: 'footer_text', label: 'Footer tagline', type: 'textarea', rows: 3 }],
  },
  {
    id: 'social-tracking',
    title: 'Booking & analytics',
    description: 'Calendly / booking URL and Google Analytics.',
    icon: Share2,
    fields: [
      { key: 'calendly_url', label: 'Calendly / booking URL' },
      { key: 'ga_measurement_id', label: 'Google Analytics 4 Measurement ID (G-XXXX)' },
    ],
  },
  {
    id: 'social',
    title: 'Social links',
    description: 'Social profile URLs for the website.',
    icon: Share2,
    fields: [
      { key: 'social_facebook', label: 'Facebook URL' },
      { key: 'social_linkedin', label: 'LinkedIn URL' },
      { key: 'social_whatsapp', label: 'WhatsApp number (digits, e.g. 639171234567)' },
      { key: 'calendly_url', label: 'Calendly / booking URL' },
      { key: 'ga_measurement_id', label: 'Google Analytics 4 Measurement ID (G-XXXX)' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal pages',
    description: 'HTML content for privacy and terms pages.',
    icon: FileText,
    fields: [
      { key: 'privacy_content', label: 'Privacy policy', type: 'richtext' },
      { key: 'terms_content', label: 'Terms & conditions', type: 'richtext' },
    ],
  },
];

function getValue(settings: SiteSetting[] | undefined, key: string) {
  return settings?.find((s) => s.key === key)?.value ?? '';
}

export function ContentSettings({
  includeGroups,
  variant = 'panels',
}: {
  includeGroups?: string[];
  variant?: 'panels' | 'compact';
}) {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();
  const [savedGroup, setSavedGroup] = useState<string | null>(null);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [richDrafts, setRichDrafts] = useState<Record<string, string>>({});

  const visibleGroups = includeGroups
    ? CONTENT_GROUPS.filter((group) => includeGroups.includes(group.id))
    : CONTENT_GROUPS;

  const saveFieldByKey = async (key: string, value: string, group: string) => {
    const existing = settings?.find((s) => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({
        id: existing.id,
        data: { value, isPublic: true },
      });
    } else {
      await createMutation.mutateAsync({
        key,
        value,
        group,
        isPublic: true,
      });
    }
  };

  const saveField = async (field: FieldDef, value: string, group: string) => {
    await saveFieldByKey(field.key, value, group);
  };

  const saveGroup = async (
    groupId: string,
    formData: FormData,
    fields: FieldDef[],
    group: string,
    imageKey?: string,
    imageFields?: ImageFieldDef[],
  ) => {
    setSavedGroup(null);
    setSavingGroup(groupId);
    try {
      const saves = fields.map((field) =>
        saveField(field, String(formData.get(field.key) ?? ''), group),
      );
      const imageKeys = [
        ...(imageKey ? [imageKey] : []),
        ...(imageFields?.map((img) => img.key) ?? []),
      ];
      for (const key of imageKeys) {
        if (key in imageDrafts) {
          saves.push(saveFieldByKey(key, imageDrafts[key], group));
        }
      }
      for (const field of fields) {
        if (field.type === 'richtext' && field.key in richDrafts) {
          saves.push(saveFieldByKey(field.key, richDrafts[field.key], group));
        }
      }
      if (groupId === 'about') {
        saves.push(persistAboutThemesFromForm(saveFieldByKey, formData));
        const promoKeys = [
          'about_products_promo_eyebrow',
          'about_products_promo_title',
          'about_products_promo_subtitle',
        ] as const;
        for (const key of promoKeys) {
          if (formData.has(key)) {
            saves.push(saveFieldByKey(key, String(formData.get(key) ?? ''), group));
          }
        }
      }
      await Promise.all(saves);
      setSavedGroup(groupId);
    } finally {
      setSavingGroup(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const renderField = (field: FieldDef, groupId: string) =>
    field.type === 'richtext' ? (
      <div key={field.key} className="sm:col-span-2">
        <RichTextEditor
          label={field.label}
          value={richDrafts[field.key] ?? getValue(settings, field.key)}
          onChange={(html) => setRichDrafts((prev) => ({ ...prev, [field.key]: html }))}
        />
      </div>
    ) : field.type === 'textarea' ? (
      <div key={field.key} className="sm:col-span-2">
        <Textarea
          name={field.key}
          label={field.label}
          rows={field.rows ?? 3}
          defaultValue={getValue(settings, field.key)}
        />
      </div>
    ) : field.type === 'select' ? (
      <div key={field.key} className="space-y-1.5">
        <label htmlFor={`${groupId}-${field.key}`} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <select
          id={`${groupId}-${field.key}`}
          name={field.key}
          defaultValue={getValue(settings, field.key) || field.options?.[0]?.value || ''}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <Input
        key={field.key}
        name={field.key}
        label={field.label}
        defaultValue={getValue(settings, field.key)}
      />
    );

  const renderGroupForm = (
    group: (typeof CONTENT_GROUPS)[number],
    compact?: boolean,
  ) => (
    <form
      id={`content-form-${group.id}`}
      onSubmit={(e) => {
        e.preventDefault();
        void saveGroup(
          group.id,
          new FormData(e.currentTarget),
          group.fields,
          group.id,
          group.imageKey,
          group.imageFields,
        );
      }}
      className={compact ? 'space-y-6' : 'space-y-4'}
    >
      {group.id === 'about' && compact ? (
        <>
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Page hero
            </legend>
            <SectionThemeField sectionId="about_hero" settings={settings} />
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields
                .filter((f) =>
                  ['about_page_eyebrow', 'about_page_title', 'about_page_subtitle'].includes(f.key),
                )
                .map((f) => renderField(f, group.id))}
            </div>
          </fieldset>

          {group.imageFields && (
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Images
              </legend>
              <div className="grid gap-4 lg:grid-cols-3">
                {group.imageFields.map((imageField) => (
                  <SettingsImageField
                    key={imageField.key}
                    label={imageField.label}
                    value={
                      imageDrafts[imageField.key] !== undefined
                        ? imageDrafts[imageField.key]
                        : getValue(settings, imageField.key)
                    }
                    onChange={(url) =>
                      setImageDrafts((prev) => ({ ...prev, [imageField.key]: url }))
                    }
                    folder="pages"
                    hint={imageField.hint}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Mission
              </legend>
              <SectionThemeField sectionId="about_mission" settings={settings} />
              {group.fields
                .filter((f) => f.key.startsWith('about_mission'))
                .map((f) => renderField(f, group.id))}
            </fieldset>
            <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Vision
              </legend>
              <SectionThemeField sectionId="about_vision" settings={settings} />
              {group.fields
                .filter((f) => f.key.startsWith('about_vision'))
                .map((f) => renderField(f, group.id))}
            </fieldset>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Company story
            </legend>
            <SectionThemeField sectionId="about_story" settings={settings} />
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields
                .filter((f) =>
                  ['about_story_eyebrow', 'about_story_title'].includes(f.key),
                )
                .map((f) => renderField(f, group.id))}
            </div>
            {group.fields
              .filter((f) => ['about_intro', 'about_secondary'].includes(f.key))
              .map((f) => renderField(f, group.id))}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Contact CTA
            </legend>
            <SectionThemeField sectionId="about_cta" settings={settings} />
            {group.fields
              .filter((f) => f.key.startsWith('about_cta'))
              .map((f) => renderField(f, group.id))}
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-brand-gold-500/30 bg-brand-gold-500/5 p-4">
            <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-primary-800">
              Software products promo
            </legend>
            <p className="text-xs text-slate-600">
              Products-style banner on the about page — links to /products. Toggle visibility under
              Layout → About.
            </p>
            <SectionThemeField sectionId="about_products_promo" settings={settings} />
            <Input
              name="about_products_promo_eyebrow"
              label="Eyebrow"
              defaultValue={getValue(settings, 'about_products_promo_eyebrow') || 'Software products'}
            />
            <Input
              name="about_products_promo_title"
              label="Title"
              defaultValue={
                getValue(settings, 'about_products_promo_title') || 'Enterprise Software Products'
              }
            />
            <Textarea
              name="about_products_promo_subtitle"
              label="Subtitle"
              rows={3}
              defaultValue={
                getValue(settings, 'about_products_promo_subtitle') ||
                'Ready-to-deploy and customizable solutions built for real-world operations — from document management to industry-specific platforms.'
              }
            />
          </fieldset>
        </>
      ) : group.id === 'home' && compact ? (
        <>
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Headline
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields
                .filter((f) =>
                  [
                    'hero_tagline',
                    'hero_agency_label',
                    'hero_title_line1',
                    'hero_title_highlight',
                  ].includes(f.key),
                )
                .map((f) => renderField(f, group.id))}
            </div>
            {group.fields
              .filter((f) => f.key === 'hero_description')
              .map((f) => renderField(f, group.id))}
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Side panel
            </legend>
            {group.fields
              .filter((f) => f.key.startsWith('hero_panel_'))
              .map((f) => renderField(f, group.id))}
          </fieldset>
          {group.imageKey && (
            <SettingsImageField
              label="Hero background image"
              value={
                imageDrafts[group.imageKey] !== undefined
                  ? imageDrafts[group.imageKey]
                  : getValue(settings, group.imageKey)
              }
              onChange={(url) =>
                setImageDrafts((prev) => ({ ...prev, [group.imageKey!]: url }))
              }
              folder="pages"
              hint="Optional image behind the homepage hero."
            />
          )}
        </>
      ) : group.id === 'home-intro' && compact ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {group.fields
              .filter((f) => f.key.startsWith('home_intro_line'))
              .map((f) => renderField(f, group.id))}
          </div>
          {group.fields
            .filter((f) => f.key === 'home_intro_body')
            .map((f) => renderField(f, group.id))}
        </>
      ) : (
        <>
          {group.imageFields?.map((imageField) => (
            <SettingsImageField
              key={imageField.key}
              label={imageField.label}
              value={
                imageDrafts[imageField.key] !== undefined
                  ? imageDrafts[imageField.key]
                  : getValue(settings, imageField.key)
              }
              onChange={(url) =>
                setImageDrafts((prev) => ({ ...prev, [imageField.key]: url }))
              }
              folder="pages"
              hint={imageField.hint}
            />
          ))}
          {!group.imageFields && group.imageKey && (
            <SettingsImageField
              label={group.id === 'portfolio' ? 'Hero image' : 'Hero background image'}
              value={
                imageDrafts[group.imageKey] !== undefined
                  ? imageDrafts[group.imageKey]
                  : getValue(settings, group.imageKey)
              }
              onChange={(url) =>
                setImageDrafts((prev) => ({ ...prev, [group.imageKey!]: url }))
              }
              folder="pages"
              hint={
                group.id === 'portfolio'
                  ? 'Behind the portfolio page title. Recommended 1920×600.'
                  : 'Optional image behind the homepage hero.'
              }
            />
          )}
          <div className={compact ? 'grid gap-4 sm:grid-cols-2' : undefined}>
            {group.fields.map((field) => renderField(field, group.id))}
          </div>
        </>
      )}
    </form>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            className="rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-primary-900">{group.title}</h3>
                <p className="text-xs text-slate-500">{group.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  form={`content-form-${group.id}`}
                  isLoading={savingGroup === group.id}
                  size="sm"
                >
                  Save
                </Button>
                <SaveFeedback saved={savedGroup === group.id} isSaving={isSaving} />
              </div>
            </div>
            <div className="p-4">{renderGroupForm(group, true)}</div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleGroups.map((group) => (
        <SettingsPanel
          key={group.id}
          icon={group.icon}
          title={group.title}
          description={group.description}
          footer={
            <>
              <Button
                type="submit"
                form={`content-form-${group.id}`}
                isLoading={savingGroup === group.id}
                size="sm"
              >
                Save {group.title.toLowerCase()}
              </Button>
              <SaveFeedback
                saved={savedGroup === group.id}
                isSaving={isSaving}
              />
            </>
          }
        >
          {renderGroupForm(group)}
        </SettingsPanel>
      ))}
    </div>
  );
}
