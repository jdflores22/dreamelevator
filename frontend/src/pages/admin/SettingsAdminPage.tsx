import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Mail,
  ScrollText,
  Settings2,
  Type,
} from 'lucide-react';
import { useSiteSettings } from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BrandingSettings } from '@/components/admin/BrandingSettings';
import { ContactSettings } from '@/components/admin/ContactSettings';
import { HeroBannerSettings } from '@/components/admin/HeroBannerSettings';
import { HeroContentSettings } from '@/components/admin/HeroContentSettings';
import { HomeSectionsSettings } from '@/components/admin/HomeSectionsSettings';
import { FooterSettings } from '@/components/admin/FooterSettings';
import { LayoutSettings } from '@/components/admin/LayoutSettings';
import { PageVisibilitySettings } from '@/components/admin/PageVisibilitySettings';
import { PagesContentSettings } from '@/components/admin/PagesContentSettings';
import { CustomSettingsTable } from '@/components/admin/CustomSettingsTable';
import { cn } from '@/utils/cn';

interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: string;
}

const SECTIONS: SettingsSection[] = [
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo, colors, and company identity used across the site.',
    icon: Building2,
    group: 'General',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Company contact details, address, and business hours.',
    icon: Mail,
    group: 'General',
  },
  {
    id: 'hero',
    label: 'Hero & banner',
    description: 'Homepage hero carousel, highlights, and appearance.',
    icon: ImageIcon,
    group: 'Homepage',
  },
  {
    id: 'hero-content',
    label: 'Hero content',
    description: 'Hero headline, description, and the intro banner text.',
    icon: Type,
    group: 'Homepage',
  },
  {
    id: 'home-sections',
    label: 'Section headings',
    description: 'Eyebrow, title, and subtitle for each homepage section.',
    icon: LayoutTemplate,
    group: 'Homepage',
  },
  {
    id: 'pages-visibility',
    label: 'Page visibility',
    description: 'Publish, hide, or set maintenance mode for individual pages.',
    icon: Eye,
    group: 'Pages',
  },
  {
    id: 'pages-content',
    label: 'Page content',
    description: 'About & portfolio copy, plus inner-page hero headings.',
    icon: FileText,
    group: 'Pages',
  },
  {
    id: 'layout',
    label: 'Layout & sections',
    description: 'Toggle section visibility and background themes site-wide.',
    icon: Layers,
    group: 'Structure',
  },
  {
    id: 'footer',
    label: 'Footer & legal',
    description: 'Footer tagline, social links, and privacy/terms content.',
    icon: ScrollText,
    group: 'Structure',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Raw key/value settings for power users.',
    icon: Settings2,
    group: 'System',
  },
];

const GROUP_ORDER = ['General', 'Homepage', 'Pages', 'Structure', 'System'];

function initialSection(): string {
  const hash = window.location.hash.replace('#', '');
  return SECTIONS.some((s) => s.id === hash) ? hash : SECTIONS[0].id;
}

export default function SettingsAdminPage() {
  const [activeId, setActiveId] = useState<string>(initialSection);
  const { data: items, isLoading } = useSiteSettings();

  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      sections: SECTIONS.filter((s) => s.group === group),
    })).filter((g) => g.sections.length > 0);
  }, []);

  const select = (id: string) => {
    setActiveId(id);
    try {
      window.history.replaceState(null, '', `#${id}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="Manage branding, page content, section layout, and legal copy. Public settings appear on the live website."
        eyebrow="Configuration"
      />

      {/* Mobile: horizontal scrolling section picker */}
      <div className="-mx-3 mb-6 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-2 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:px-6 lg:hidden">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => select(section.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
              activeId === section.id
                ? 'border-primary-800 bg-primary-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:text-primary-900',
            )}
          >
            <section.icon className="h-4 w-4 shrink-0" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        {/* Desktop: grouped vertical nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            {grouped.map(({ group, sections }) => (
              <div key={group}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {sections.map((section) => {
                    const isActive = section.id === activeId;
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => select(section.id)}
                          className={cn(
                            'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary-900 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-primary-900',
                          )}
                        >
                          <section.icon
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-brand-gold-400' : 'text-slate-400 group-hover:text-primary-700',
                            )}
                          />
                          <span className="truncate">{section.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content pane */}
        <div className="min-w-0">
          <div className="mb-6 flex items-start gap-3 border-b border-slate-200/80 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-900 text-brand-gold-400">
              <active.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-primary-900">
                {active.label}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{active.description}</p>
            </div>
          </div>

          <div className="space-y-8">
            {activeId === 'branding' && <BrandingSettings />}
            {activeId === 'contact' && <ContactSettings />}
            {activeId === 'hero' && <HeroBannerSettings />}
            {activeId === 'hero-content' && <HeroContentSettings />}
            {activeId === 'home-sections' && <HomeSectionsSettings />}
            {activeId === 'pages-visibility' && <PageVisibilitySettings />}
            {activeId === 'pages-content' && <PagesContentSettings />}
            {activeId === 'layout' && <LayoutSettings />}
            {activeId === 'footer' && <FooterSettings />}
            {activeId === 'advanced' && <CustomSettingsTable items={items} isLoading={isLoading} />}
          </div>
        </div>
      </div>
    </div>
  );
}
