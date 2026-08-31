import { useState } from 'react';
import { ContentSettings } from '@/components/admin/ContentSettings';
import { HomepageSectionsSettings } from '@/components/admin/HomepageSectionsSettings';
import { ProductsContentSettings } from '@/components/admin/ProductsContentSettings';
import { AboutContentSettings } from '@/components/admin/AboutContentSettings';
import { ContactContentSettings } from '@/components/admin/ContactContentSettings';
import { cn } from '@/utils/cn';
type PageTab = 'about' | 'contact' | 'portfolio' | 'gallery' | 'products' | 'services' | 'headings';

const TABS: { id: PageTab; label: string; hint: string }[] = [
  { id: 'about', label: 'About', hint: 'Content, CTA & section themes' },
  { id: 'products', label: 'Products', hint: 'Bottom CTA & page sections' },
  { id: 'services', label: 'Services', hint: 'Maintenance page & quote CTA' },
  { id: 'contact', label: 'Contact', hint: 'Form, steps & FAQ sections' },
  { id: 'gallery', label: 'Gallery', hint: 'Photo grid & hero' },
  { id: 'portfolio', label: 'Portfolio', hint: 'Page intro & hero image' },
  { id: 'headings', label: 'Other pages', hint: 'Blog, careers…' },
];

export function PagesContentSettings() {
  const [tab, setTab] = useState<PageTab>('about');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 bg-white p-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'shrink-0 rounded-md px-3 py-2.5 text-left transition-colors sm:min-w-[7rem]',
              tab === item.id
                ? 'bg-primary-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-primary-900',
            )}
          >
            <span className="block text-sm font-medium">{item.label}</span>
            <span
              className={cn(
                'mt-0.5 hidden text-[11px] sm:block',
                tab === item.id ? 'text-white/70' : 'text-slate-400',
              )}
            >
              {item.hint}
            </span>
          </button>
        ))}
      </div>

      {tab === 'about' && <AboutContentSettings />}
      {tab === 'products' && <ProductsContentSettings />}
      {tab === 'contact' && <ContactContentSettings />}
      {tab === 'services' && <ContentSettings includeGroups={['services']} variant="compact" />}
      {tab === 'gallery' && <ContentSettings includeGroups={['gallery']} variant="compact" />}
      {tab === 'portfolio' && (
        <ContentSettings includeGroups={['portfolio']} variant="compact" />
      )}
      {tab === 'headings' && (
        <HomepageSectionsSettings mode="pages" variant="compact" />
      )}
    </div>
  );
}
