import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

type Accent = 'navy' | 'gold' | 'red' | 'neutral';

const accents: Record<Accent, { icon: string; value: string }> = {
  navy: { icon: 'bg-primary-100 text-primary-700', value: 'text-primary-900' },
  gold: { icon: 'bg-brand-gold-500/15 text-brand-gold-600', value: 'text-brand-gold-600' },
  red: { icon: 'bg-brand-red-500/10 text-brand-red-600', value: 'text-brand-red-600' },
  neutral: { icon: 'bg-slate-100 text-slate-600', value: 'text-primary-900' },
};

interface AdminStatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  href?: string;
  compact?: boolean;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'neutral',
  href,
  compact = false,
  className,
}: AdminStatCardProps) {
  const style = accents[accent];

  const inner = (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all',
        compact ? 'min-h-[5.75rem] p-3.5' : 'p-5',
        href && 'hover:border-brand-gold-500/30 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p
            className={cn(
              'font-medium tabular-nums',
              compact ? 'mt-1 text-xl' : 'mt-2 text-2xl sm:text-3xl',
              style.value,
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className={cn('leading-snug text-slate-500', compact ? 'mt-1 text-[11px]' : 'mt-1.5 text-xs')}>
              {hint}
            </p>
          ) : null}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-xl',
              compact ? 'h-8 w-8' : 'h-10 w-10',
              style.icon,
            )}
          >
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}
