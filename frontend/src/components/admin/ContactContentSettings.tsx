import { useState } from 'react';
import { ChevronDown, LayoutGrid, MessageSquare } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { SaveFeedback } from '@/components/admin/SettingsPanel';
import { SectionToggleSwitch } from '@/components/admin/SectionToggleSwitch';
import {
  SectionThemeField,
  persistSectionTheme,
  type SectionTheme,
} from '@/components/admin/SectionThemeField';
import {
  CONTACT_SECTION_TOGGLES,
  isSectionEnabledValue,
  sectionEnabledKey,
} from '@/constants/sectionVisibility';
import { cn } from '@/utils/cn';
import type { SiteSetting } from '@/types';

const CONTACT_SECTIONS = [
  {
    id: 'contact_page',
    label: 'Page hero',
    group: 'pages' as const,
    defaults: {
      title: 'Contact Us',
      subtitle:
        'Visit is by appointment only. Call, message, or request a quote — we will connect you with the right team.',
    },
    extraFields: [{ key: 'contact_response_promise', label: 'Response promise badge', default: 'We typically respond within one business day.' }],
  },
  {
    id: 'contact_main',
    label: 'Contact form & details',
    group: 'contact' as const,
    defaults: {
      eyebrow: 'Las Piñas office',
      title: 'Let’s start with an assessment',
      subtitle:
        'Tell us about the building, the equipment, or the service you need — we will connect you with the right team.',
    },
    extraFields: [
      { key: 'contact_form_title', label: 'Form title', default: 'Send us a message' },
      {
        key: 'contact_form_subtitle',
        label: 'Form subtitle',
        default: 'Share the site, equipment type, and what you need — installation, modernization, or maintenance.',
      },
    ],
  },
  {
    id: 'contact_expect',
    label: 'What happens next',
    group: 'contact' as const,
    defaults: {
      eyebrow: 'What happens next',
      title: 'From first message to site assessment',
      subtitle: 'A straightforward path so you know what to expect after reaching out.',
    },
  },
  {
    id: 'contact_faq',
    label: 'FAQ',
    group: 'contact' as const,
    defaults: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      subtitle: 'Brands we service, free assessments, shafts, modernization, and how to request a quote.',
    },
  },
  {
    id: 'contact_map',
    label: 'Map & location',
    group: 'contact' as const,
    defaults: {
      eyebrow: 'Visit us',
      title: 'Las Piñas office',
      subtitle: 'Visit is by appointment only. Use the map for directions to Equitable Village, Talon Kuatro.',
    },
  },
  {
    id: 'contact_careers',
    label: 'Careers call-to-action',
    group: 'contact' as const,
    defaults: {
      eyebrow: 'Join our team',
      title: 'Join the DEEC team',
      subtitle:
        'We’re looking for people who care about safe installation, reliable service, and long-term client relationships.',
    },
    extraFields: [
      { key: 'contact_careers_primary_label', label: 'Primary button', default: 'View open roles' },
      { key: 'contact_careers_secondary_label', label: 'Secondary button', default: 'Send an inquiry' },
    ],
  },
] as const;

const EXPECT_STEPS = [
  {
    titleKey: 'contact_expect_step1_title',
    textKey: 'contact_expect_step1_text',
    titleDefault: 'Send your inquiry',
    textDefault: 'Tell us the building, equipment brand or type, and whether you need supply, modernization, or service.',
  },
  {
    titleKey: 'contact_expect_step2_title',
    textKey: 'contact_expect_step2_text',
    titleDefault: 'We review & respond',
    textDefault: 'Our team replies within one business day and, when applicable, schedules a free Metro Manila assessment.',
  },
  {
    titleKey: 'contact_expect_step3_title',
    textKey: 'contact_expect_step3_text',
    titleDefault: 'Survey & proposal',
    textDefault: 'We confirm shaft and site conditions, then recommend equipment or a maintenance plan.',
  },
] as const;

function getValue(settings: SiteSetting[] | undefined, key: string) {
  return settings?.find((s) => s.key === key)?.value ?? '';
}

export function ContactContentSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const saveField = async (key: string, value: string, group: string) => {
    const existing = settings?.find((s) => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, data: { value, isPublic: true } });
    } else {
      await createMutation.mutateAsync({ key, value, group, isPublic: true });
    }
  };

  const toggleSectionVisible = async (sectionId: string, enabled: boolean) => {
    setSavedId(null);
    setSavingId(`${sectionId}-visible`);
    try {
      await saveField(sectionEnabledKey(sectionId), enabled ? 'true' : 'false', 'contact');
      setSavedId(`${sectionId}-visible`);
    } finally {
      setSavingId(null);
    }
  };

  const isSectionVisible = (sectionId: string) =>
    isSectionEnabledValue(getValue(settings, sectionEnabledKey(sectionId)));

  const saveSection = async (
    sectionId: string,
    group: string,
    formData: FormData,
    themeSectionId?: string,
  ) => {
    setSavedId(null);
    setSavingId(sectionId);
    try {
      const saves: Promise<void>[] = [];
      const section = CONTACT_SECTIONS.find((s) => s.id === sectionId);

      if (sectionId === 'contact_page') {
        saves.push(
          saveField('contact_page_title', String(formData.get('title') ?? ''), group),
          saveField('contact_page_subtitle', String(formData.get('subtitle') ?? ''), group),
        );
        if (section && 'extraFields' in section) {
          section.extraFields.forEach((field) => {
            saves.push(saveField(field.key, String(formData.get(field.key) ?? ''), group));
          });
        }
        if (themeSectionId) {
          const theme = String(formData.get(`theme_${themeSectionId}`) ?? 'light') as SectionTheme;
          saves.push(persistSectionTheme(saveField, themeSectionId, theme));
        }
      } else {
        saves.push(
          saveField(`${sectionId}_eyebrow`, String(formData.get('eyebrow') ?? ''), group),
          saveField(`${sectionId}_title`, String(formData.get('title') ?? ''), group),
          saveField(`${sectionId}_subtitle`, String(formData.get('subtitle') ?? ''), group),
        );
        if (section && 'extraFields' in section) {
          section.extraFields.forEach((field) => {
            saves.push(saveField(field.key, String(formData.get(field.key) ?? ''), group));
          });
        }
        if (themeSectionId) {
          const theme = String(formData.get(`theme_${themeSectionId}`) ?? 'light') as SectionTheme;
          saves.push(persistSectionTheme(saveField, themeSectionId, theme));
        }
      }

      if (sectionId === 'contact_expect') {
        EXPECT_STEPS.forEach((step) => {
          saves.push(saveField(step.titleKey, String(formData.get(step.titleKey) ?? ''), group));
          saves.push(saveField(step.textKey, String(formData.get(step.textKey) ?? ''), group));
        });
      }

      await Promise.all(saves);
      setSavedId(sectionId);
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Edit the contact page at <strong className="font-medium text-primary-800">/contact</strong>.
        Company email, phone, and address are under{' '}
        <strong className="font-medium text-primary-800">Settings → Contact information</strong>.
        FAQ items are managed in <strong className="font-medium text-primary-800">Admin → FAQ</strong>.
      </p>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-primary-900">Show on contact page</h3>
          <p className="text-xs text-slate-500">Enable or hide each section on the live /contact page.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {CONTACT_SECTION_TOGGLES.map((item) => {
            const visible = isSectionVisible(item.id);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{visible ? 'Visible on /contact' : 'Hidden'}</p>
                </div>
                <SectionToggleSwitch
                  enabled={visible}
                  disabled={isSaving}
                  label={item.label}
                  size="sm"
                  onToggle={() => void toggleSectionVisible(item.id, !visible)}
                />
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-100 px-4 py-2">
          <SaveFeedback
            saved={savedId?.endsWith('-visible') ?? false}
            isSaving={isSaving && (savingId?.endsWith('-visible') ?? false)}
          />
        </div>
      </section>

      <p className="text-sm text-slate-500">
        Each block below includes a <strong className="font-medium text-primary-800">Light / Navy blue</strong>{' '}
        background theme where applicable.
      </p>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {CONTACT_SECTIONS.map((section) => {
          const isOpen = openId === section.id;
          const themeSectionId =
            section.id === 'contact_page' ? 'contact_hero' : section.id;
          const currentTitle =
            section.id === 'contact_page'
              ? getValue(settings, 'contact_page_title') || section.defaults.title
              : getValue(settings, `${section.id}_title`) || ('title' in section.defaults ? section.defaults.title : '');

          return (
            <div key={section.id} className="bg-white">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50/80"
              >
                <div className="min-w-0 flex items-start gap-2">
                  {section.id === 'contact_main' ? (
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  ) : (
                    <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary-900">{section.label}</p>
                    <p className="truncate text-xs text-slate-500">{currentTitle}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-slate-400 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                  <form
                    id={`contact-section-form-${section.id}`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveSection(section.id, section.group, new FormData(e.currentTarget), themeSectionId);
                    }}
                    className="space-y-3"
                  >
                    <SectionThemeField sectionId={themeSectionId} settings={settings} />

                    {section.id !== 'contact_page' && 'eyebrow' in section.defaults && (
                      <Input
                        name="eyebrow"
                        label="Eyebrow"
                        defaultValue={
                          getValue(settings, `${section.id}_eyebrow`) ||
                          ('eyebrow' in section.defaults ? section.defaults.eyebrow : '')
                        }
                      />
                    )}

                    <Input
                      name="title"
                      label="Title"
                      defaultValue={
                        section.id === 'contact_page'
                          ? getValue(settings, 'contact_page_title') || section.defaults.title
                          : getValue(settings, `${section.id}_title`) ||
                            ('title' in section.defaults ? section.defaults.title : '')
                      }
                    />
                    <Textarea
                      name="subtitle"
                      label="Subtitle"
                      rows={2}
                      defaultValue={
                        section.id === 'contact_page'
                          ? getValue(settings, 'contact_page_subtitle') || section.defaults.subtitle
                          : getValue(settings, `${section.id}_subtitle`) ||
                            ('subtitle' in section.defaults ? section.defaults.subtitle : '')
                      }
                    />

                    {'extraFields' in section &&
                      section.extraFields?.map((field) => (
                        <Input
                          key={field.key}
                          name={field.key}
                          label={field.label}
                          defaultValue={getValue(settings, field.key) || field.default}
                        />
                      ))}

                    {section.id === 'contact_expect' && (
                      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Process steps
                        </p>
                        {EXPECT_STEPS.map((step, index) => (
                          <div key={step.titleKey} className="space-y-2 border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                            <p className="text-xs font-medium text-primary-800">Step {index + 1}</p>
                            <Input
                              name={step.titleKey}
                              label="Title"
                              defaultValue={getValue(settings, step.titleKey) || step.titleDefault}
                            />
                            <Textarea
                              name={step.textKey}
                              label="Description"
                              rows={2}
                              defaultValue={getValue(settings, step.textKey) || step.textDefault}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button type="submit" size="sm" isLoading={savingId === section.id}>
                        Save
                      </Button>
                      <SaveFeedback saved={savedId === section.id} isSaving={isSaving} />
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
