import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_HERO_HIGHLIGHTS, parseHeroHighlights } from '@/constants/heroHighlights';
import { EquipmentGlyph, equipmentKindFromTitle } from '@/components/marketing/EquipmentGlyph';
import { useHeroAppearance } from '@/hooks/useHeroAppearance';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { cn } from '@/utils/cn';

function heroHighlightsEnabled(get: (key: string, fallback?: string) => string): boolean {
  return get('hero_highlights_enabled', 'true') !== 'false';
}

export function HeroHighlights() {
  const { get } = useSiteSettingsMap();
  const { isDark } = useHeroAppearance();

  if (!heroHighlightsEnabled(get)) return null;

  const raw = get('hero_highlights', '');
  const parsed = parseHeroHighlights(raw);
  const hasStoredValue = raw.trim().length > 0;
  const items =
    parsed.length > 0 ? parsed : hasStoredValue ? [] : DEFAULT_HERO_HIGHLIGHTS;

  if (items.length === 0) return null;

  return (
    <div className={cn('border-t', isDark ? 'border-white/10 bg-primary-950' : 'border-slate-200 bg-slate-50')}>
      <div className="mx-auto max-w-7xl px-3 py-0 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={cn(
                'relative flex flex-col border-b px-0 py-6 sm:py-10 lg:border-b-0 lg:px-8 lg:py-12',
                index < items.length - 1 && (isDark ? 'lg:border-r lg:border-white/10' : 'lg:border-r lg:border-slate-200'),
                isDark ? 'border-white/10' : 'border-slate-200',
              )}
            >
              <div className="mb-5 flex items-center justify-between">
                <EquipmentGlyph
                  kind={equipmentKindFromTitle(item.title)}
                  className={isDark ? 'text-white' : 'text-primary-800'}
                />
                <span
                  className={cn(
                    'font-display text-3xl font-semibold tabular-nums',
                    isDark ? 'text-white/15' : 'text-slate-200',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h2
                className={cn(
                  'font-display text-lg font-semibold uppercase tracking-[0.12em] sm:text-2xl',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {item.title}
              </h2>
              <p className={cn('mt-3 flex-1 text-sm leading-relaxed sm:text-base', isDark ? 'text-slate-400' : 'text-slate-600')}>
                {item.body}
              </p>
              <Link
                to={item.href}
                className={cn(
                  'mt-6 inline-flex items-center gap-1.5 text-sm font-semibold',
                  isDark ? 'text-brand-gold-400 hover:text-brand-gold-300' : 'text-primary-800 hover:text-brand-gold-600',
                )}
              >
                {item.linkLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
