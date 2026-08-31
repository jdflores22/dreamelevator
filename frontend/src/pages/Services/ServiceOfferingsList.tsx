import { Link } from 'react-router-dom';
import { EquipmentGlyph, equipmentKindFromTitle } from '@/components/marketing/EquipmentGlyph';
import type { Service } from '@/types';
import { cn } from '@/utils/cn';

export function ServiceOfferingsList({
  services,
  isDark = false,
  columns = 1,
}: {
  services: Service[];
  isDark?: boolean;
  columns?: 1 | 2;
}) {
  if (services.length === 0) return null;

  return (
    <ul
      className={cn(
        columns === 2
          ? 'grid gap-x-10 md:grid-cols-2'
          : 'divide-y border-y',
        columns === 2
          ? isDark
            ? 'border-t border-white/10'
            : 'border-t border-slate-200'
          : isDark
            ? 'divide-white/10 border-white/10'
            : 'divide-slate-200 border-slate-200',
      )}
    >
      {services.map((item, index) => (
        <li key={item.id}>
          <Link
            to={`/services/${item.slug}`}
            className={cn(
              'group flex items-start gap-4 py-5 transition-colors sm:items-center',
              columns === 2 && (isDark ? 'border-b border-white/10' : 'border-b border-slate-200'),
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50',
            )}
          >
            <EquipmentGlyph
              kind={equipmentKindFromTitle(item.title)}
              className={cn('mt-0.5 shrink-0 sm:mt-0', isDark ? 'text-white' : 'text-primary-800')}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-display text-base font-semibold uppercase tracking-[0.12em]',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {item.title}
              </p>
              {item.shortDescription ? (
                <p className={cn('mt-1 text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  {item.shortDescription}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                'font-display hidden shrink-0 text-xl font-semibold tabular-nums sm:block',
                isDark ? 'text-white/20' : 'text-slate-300',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
