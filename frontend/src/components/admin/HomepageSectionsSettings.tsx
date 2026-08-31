import { useState } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSetting, useCreateSiteSetting } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { cn } from '@/utils/cn';
import type { SiteSetting } from '@/types';

/** Matches homepage section order on the live site. */
const HOME_SECTIONS = [
  {
    id: 'home_process',
    label: 'How we work',
    defaults: {
      eyebrow: 'How we work',
      title: 'Supply and jobsite process',
      subtitle: 'From free assessment through production, careful unloading, installation, and maintenance.',
    },
  },
  {
    id: 'home_clients',
    label: 'Trusted companies',
    defaults: {
      eyebrow: 'Trusted By',
      title: 'Companies That Trust Us',
      subtitle: 'Partnering with leading organizations across industries.',
    },
  },
  {
    id: 'home_services',
    label: 'Services',
    defaults: { eyebrow: 'Our Services', title: 'End-to-end solutions for modern businesses', subtitle: 'From discovery to delivery and support — we help you build software that performs in production.' },
  },
  {
    id: 'home_technologies',
    label: 'Technologies',
    defaults: {
      eyebrow: 'Technologies',
      title: 'Modern Tech Stack',
      subtitle: 'From frontend to backend — we choose reliable, maintainable tools for every layer of your software.',
    },
  },
  {
    id: 'home_featured_product',
    label: 'Featured product',
    defaults: {
      eyebrow: 'Featured product',
      title: 'Software built for real operations',
      subtitle: 'Explore our flagship solution — designed for teams that need reliability, visibility, and scale.',
    },
  },
  {
    id: 'home_products',
    label: 'Software products',
    defaults: {
      eyebrow: 'Products',
      title: 'Software Solutions',
      subtitle: 'Ready-to-deploy and customizable enterprise software products.',
    },
  },
  {
    id: 'home_industries',
    label: 'Industries',
    defaults: { eyebrow: 'Industries', title: 'Sector Expertise', subtitle: 'Deep domain knowledge across diverse industries.' },
  },
  {
    id: 'home_why',
    label: 'Why choose us',
    defaults: {
      eyebrow: 'Why us',
      title: 'Built around what matters to you',
      subtitle: 'Engagements tied to delivery milestones, transparent scope, and outcomes you can measure.',
    },
  },
  {
    id: 'home_portfolio',
    label: 'Portfolio',
    defaults: {
      eyebrow: 'Case Studies',
      title: 'Proven results across industries',
      subtitle: 'Explore how we help organizations solve complex challenges with custom software, web platforms, and mobile applications.',
    },
  },
  {
    id: 'home_testimonials',
    label: 'Testimonials',
    defaults: {
      eyebrow: 'Testimonials',
      title: 'What Our Clients Say',
      subtitle: 'Trusted by businesses worldwide for delivering exceptional results.',
    },
  },
  {
    id: 'home_stats',
    label: 'Statistics',
    defaults: {
      eyebrow: 'Results',
      title: 'Outcomes we deliver',
      subtitle: 'Measurable impact from software built with clarity, quality, and long-term partnership.',
    },
  },
  {
    id: 'home_faq',
    label: 'FAQ',
    defaults: {
      eyebrow: 'FAQ',
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our services and process.',
    },
  },
  {
    id: 'home_blog',
    label: 'Latest articles',
    defaults: {
      eyebrow: 'Blog',
      title: 'Latest Articles',
      subtitle: 'Insights, trends, and best practices from our team.',
    },
  },
] as const;

const PAGE_HEROES = [
  { id: 'services_page', label: 'Services — page hero', defaults: { title: 'Service & Maintenance', subtitle: 'Affordable, quality maintenance for all types and brands of elevators, escalators, and related equipment.' } },
  { id: 'services_section', label: 'Services — main section', defaults: { eyebrow: 'What we do', title: 'Elevators, escalators, and complete support', subtitle: 'Supply, installation, modernization, maintenance, parts, and structural shafts — tailored to each building.' } },
  { id: 'gallery_page', label: 'Gallery page', defaults: { title: 'Gallery', subtitle: 'Jobsite photos from installation, modernization, and service work.' } },
  { id: 'clients_page', label: 'Clients page', defaults: { title: 'Our valued clients', subtitle: 'Buildings and facilities we are proud to serve.' } },
  { id: 'careers_page', label: 'Careers page', defaults: { title: 'Careers', subtitle: 'Build the future of enterprise software with us.' } },
  { id: 'blog_page', label: 'Blog page', defaults: { title: 'Blog', subtitle: 'Insights, trends, and best practices.' } },
  { id: 'industries_page', label: 'Industries page', defaults: { title: 'Industries We Serve', subtitle: 'Domain expertise across diverse sectors.' } },
  { id: 'about_industries', label: 'About — industries section', defaults: { eyebrow: 'Industries', title: 'Sector Expertise', subtitle: 'Deep domain knowledge across diverse industries — from healthcare to logistics.' } },
  { id: 'about_why', label: 'About — what we do', defaults: { eyebrow: 'What we do', title: 'We help companies build better software', subtitle: 'Custom development, dedicated teams, and long-term support tailored to your goals.' } },
  { id: 'about_process', label: 'About — development process', defaults: { eyebrow: 'Process', title: 'Our Development Process', subtitle: 'A proven methodology for delivering successful projects on time and on budget.' } },
  { id: 'about_stats', label: 'About — statistics', defaults: { title: 'The support you need, for results you want' } },
  { id: 'products_page', label: 'Products — page hero', defaults: { eyebrow: 'Software products', title: 'Enterprise Software Products', subtitle: 'Ready-to-deploy and customizable solutions built for real-world operations — from document management to industry-specific platforms.' } },
  { id: 'products_featured', label: 'Products — featured spotlight', defaults: { eyebrow: 'Featured product', title: 'Our flagship solution', subtitle: 'Purpose-built software for teams that need reliability, visibility, and scale in daily operations.' } },
  { id: 'products_catalog', label: 'Products — catalog section', defaults: { eyebrow: 'Product catalog', title: 'All software solutions', subtitle: 'Browse our full suite of enterprise products — each customizable to your workflows and integration needs.' } },
] as const;

/** Inner-page headings excluding products (edited under Settings → Pages → Products). */
const PAGE_HEADINGS = PAGE_HEROES.filter((page) => !page.id.startsWith('products_'));

const CTA_FIELDS = [
  { key: 'home_cta_title', label: 'Title', default: 'Ready to build your next software solution?' },
  { key: 'home_cta_subtitle', label: 'Subtitle', default: "Let's discuss how we can help you plan, build, and maintain software that fits your business.", type: 'textarea' as const },
  { key: 'home_cta_primary_label', label: 'Primary button', default: 'Get Started' },
  { key: 'home_cta_secondary_label', label: 'Secondary button', default: 'Explore Services' },
];

function getValue(settings: SiteSetting[] | undefined, key: string) {
  return settings?.find((s) => s.key === key)?.value ?? '';
}

type HomepageSectionsSettingsProps = {
  mode?: 'home' | 'pages';
  variant?: 'panels' | 'compact';
  compactTab?: 'sections' | 'cta';
};

export function HomepageSectionsSettings({
  mode = 'home',
  variant = 'panels',
  compactTab = 'sections',
}: HomepageSectionsSettingsProps) {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(HOME_SECTIONS[0]?.id ?? PAGE_HEROES[0]?.id ?? null);

  const saveField = async (key: string, value: string, group: string) => {
    const existing = settings?.find((s) => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, data: { value, isPublic: true } });
    } else {
      await createMutation.mutateAsync({ key, value, group, isPublic: true });
    }
  };

  const saveSection = async (sectionId: string, formData: FormData, group: string) => {
    setSavedId(null);
    setSavingId(sectionId);
    try {
      await Promise.all([
        saveField(`${sectionId}_eyebrow`, String(formData.get('eyebrow') ?? ''), group),
        saveField(`${sectionId}_title`, String(formData.get('title') ?? ''), group),
        saveField(`${sectionId}_subtitle`, String(formData.get('subtitle') ?? ''), group),
      ]);
      setSavedId(sectionId);
    } finally {
      setSavingId(null);
    }
  };

  const saveCta = async (formData: FormData) => {
    setSavedId(null);
    setSavingId('cta');
    try {
      await Promise.all(
        CTA_FIELDS.map((field) => saveField(field.key, String(formData.get(field.key) ?? ''), 'home')),
      );
      setSavedId('cta');
    } finally {
      setSavingId(null);
    }
  };

  const renderCtaFields = (
    fields: readonly { key: string; label: string; default: string; type?: 'textarea' }[],
  ) =>
    fields.map((field) =>
      field.type === 'textarea' ? (
        <div key={field.key} className="sm:col-span-2">
          <Textarea
            name={field.key}
            label={field.label}
            rows={2}
            defaultValue={getValue(settings, field.key) || field.default}
          />
        </div>
      ) : (
        <Input
          key={field.key}
          name={field.key}
          label={field.label}
          defaultValue={getValue(settings, field.key) || field.default}
        />
      ),
    );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const showHome = mode === 'home';

  const renderSectionForm = (
    section: (typeof HOME_SECTIONS)[number] | (typeof PAGE_HEROES)[number],
    group: string,
  ) => (
    <SettingsPanel
      key={section.id}
      icon={LayoutGrid}
      title={section.label}
      description={
        showHome
          ? 'Section heading text on the homepage.'
          : 'Page hero title and subtitle.'
      }
      footer={
        <>
          <Button
            type="submit"
            form={`section-form-${section.id}`}
            isLoading={savingId === section.id}
            size="sm"
          >
            Save
          </Button>
          <SaveFeedback saved={savedId === section.id} isSaving={isSaving} />
        </>
      }
    >
      <form
        id={`section-form-${section.id}`}
        onSubmit={(e) => {
          e.preventDefault();
          void saveSection(section.id, new FormData(e.currentTarget), group);
        }}
        className="space-y-4"
      >
        <Input
          name="eyebrow"
          label="Eyebrow"
          defaultValue={
            getValue(settings, `${section.id}_eyebrow`) ||
            ('eyebrow' in section.defaults ? section.defaults.eyebrow : '')
          }
        />
        <Input
          name="title"
          label="Title"
          defaultValue={getValue(settings, `${section.id}_title`) || section.defaults.title}
        />
        <Textarea
          name="subtitle"
          label="Subtitle"
          rows={2}
          defaultValue={
            getValue(settings, `${section.id}_subtitle`) ||
            ('subtitle' in section.defaults ? section.defaults.subtitle : '')
          }
        />
      </form>
    </SettingsPanel>
  );

  if (showHome) {
    if (variant === 'compact') {
      if (compactTab === 'cta') {
        return (
          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-primary-900">Homepage call-to-action</h3>
                <p className="text-xs text-slate-500">Bottom banner on the homepage.</p>
              </div>
              <Button type="submit" form="homepage-cta-form" isLoading={savingId === 'cta'} size="sm">
                Save
              </Button>
            </div>
            <div className="p-4">
              <form
                id="homepage-cta-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveCta(new FormData(e.currentTarget));
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {renderCtaFields(CTA_FIELDS)}
              </form>
              <SaveFeedback saved={savedId === 'cta'} isSaving={isSaving} />
            </div>
          </section>
        );
      }

      return (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {HOME_SECTIONS.map((section) => {
            const isOpen = openId === section.id;
            const currentTitle =
              getValue(settings, `${section.id}_title`) || section.defaults.title;

            return (
              <div key={section.id} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50/80"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900">{section.label}</p>
                    <p className="truncate text-xs text-slate-500">{currentTitle}</p>
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
                      id={`section-form-${section.id}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        void saveSection(section.id, new FormData(e.currentTarget), 'home');
                      }}
                      className="space-y-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          name="eyebrow"
                          label="Eyebrow"
                          defaultValue={
                            getValue(settings, `${section.id}_eyebrow`) || section.defaults.eyebrow
                          }
                        />
                        <Input
                          name="title"
                          label="Title"
                          defaultValue={
                            getValue(settings, `${section.id}_title`) || section.defaults.title
                          }
                        />
                      </div>
                      <Textarea
                        name="subtitle"
                        label="Subtitle"
                        rows={2}
                        defaultValue={
                          getValue(settings, `${section.id}_subtitle`) || section.defaults.subtitle
                        }
                      />
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
      );
    }

    return (
      <div className="space-y-6">
        <p className="text-sm text-slate-500">
          Section headings appear in the same order as on the homepage. Toggle visibility and navy
          backgrounds in the <strong className="font-medium text-primary-800">Layout</strong> tab.
        </p>

        {HOME_SECTIONS.map((section) => renderSectionForm(section, 'home'))}

        <SettingsPanel
          icon={LayoutGrid}
          title="Homepage call-to-action"
          description="Bottom CTA banner on the homepage."
          footer={
            <>
              <Button type="submit" form="homepage-cta-form" isLoading={savingId === 'cta'} size="sm">
                Save CTA
              </Button>
              <SaveFeedback saved={savedId === 'cta'} isSaving={isSaving} />
            </>
          }
        >
          <form
            id="homepage-cta-form"
            onSubmit={(e) => {
              e.preventDefault();
              void saveCta(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            {CTA_FIELDS.map((field) =>
              field.type === 'textarea' ? (
                <Textarea
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  rows={2}
                  defaultValue={getValue(settings, field.key) || field.default}
                />
              ) : (
                <Input
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  defaultValue={getValue(settings, field.key) || field.default}
                />
              ),
            )}
          </form>
        </SettingsPanel>
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' ? (
        <div className="space-y-4">
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {PAGE_HEADINGS.map((page) => {
            const isOpen = openId === page.id;
            const currentTitle =
              getValue(settings, `${page.id}_title`) || page.defaults.title;

            return (
              <div key={page.id} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : page.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50/80"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900">{page.label}</p>
                    <p className="truncate text-xs text-slate-500">{currentTitle}</p>
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
                      id={`section-form-${page.id}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        void saveSection(page.id, new FormData(e.currentTarget), 'pages');
                      }}
                      className="space-y-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          name="eyebrow"
                          label="Eyebrow"
                          defaultValue={
                            getValue(settings, `${page.id}_eyebrow`) ||
                            ('eyebrow' in page.defaults ? page.defaults.eyebrow : '')
                          }
                        />
                        <Input
                          name="title"
                          label="Title"
                          defaultValue={
                            getValue(settings, `${page.id}_title`) || page.defaults.title
                          }
                        />
                      </div>
                      <Textarea
                        name="subtitle"
                        label="Subtitle"
                        rows={2}
                        defaultValue={
                          getValue(settings, `${page.id}_subtitle`) ||
                          ('subtitle' in page.defaults ? page.defaults.subtitle : '')
                        }
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="submit"
                          size="sm"
                          isLoading={savingId === page.id}
                        >
                          Save
                        </Button>
                        <SaveFeedback saved={savedId === page.id} isSaving={isSaving} />
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            Hero titles and section headings for inner pages. Products page content is under the{' '}
            <strong className="font-medium text-primary-800">Products</strong> tab. Publish or hide
            whole pages in the <strong className="font-medium text-primary-800">Pages</strong> tab.
          </p>
          {PAGE_HEADINGS.map((page) => renderSectionForm(page, 'pages'))}
        </div>
      )}
    </>
  );
}
