import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AdminTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface AdminTabsProps<T extends string> {
  tabs: readonly AdminTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function AdminTabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: AdminTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm [-webkit-overflow-scrolling:touch] sm:inline-flex sm:flex-wrap',
        className,
      )}
    >
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:min-h-0 sm:gap-2 sm:px-4 sm:py-2.5',
              selected
                ? 'bg-primary-900 text-white shadow-sm ring-1 ring-primary-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-primary-900',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4" />}
            {label}
            {count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                  selected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
