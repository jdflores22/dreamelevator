import { cn } from '@/utils/cn';

const DEFAULT_ITEMS = [
  'Passenger elevators',
  'Freight elevators',
  'Home & villa lifts',
  'Hospital elevators',
  'Scenic lifts',
  'Escalators',
  'Moving walkways',
  'Control modernization',
  'Preventive maintenance',
  'Parts & structural works',
];

interface TechMarqueeProps {
  items?: string[];
  className?: string;
  variant?: 'dark' | 'light';
  speed?: 'slow' | 'normal' | 'fast';
}

export function TechMarquee({
  items = DEFAULT_ITEMS,
  className,
  variant = 'dark',
  speed = 'normal',
}: TechMarqueeProps) {
  const doubled = [...items, ...items];
  const speedClass =
    speed === 'slow' ? 'tech-marquee-track-slow' : speed === 'fast' ? 'tech-marquee-track-fast' : 'tech-marquee-track';

  return (
    <div
      className={cn(
        'relative overflow-hidden border-y',
        variant === 'dark'
          ? 'border-white/10 bg-primary-950/60'
          : 'border-slate-200 bg-slate-50',
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent',
          variant === 'dark' ? 'from-primary-950' : 'from-slate-50',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent',
          variant === 'dark' ? 'from-primary-950' : 'from-slate-50',
        )}
      />

      <div className={cn('flex w-max gap-3 py-3', speedClass)}>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={cn(
              'font-display flex shrink-0 items-center gap-2 rounded-sm border px-4 py-1 text-[12px] uppercase tracking-[0.14em]',
              variant === 'dark'
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-slate-200 bg-white text-slate-600',
            )}
          >
            <span className="h-3 w-[2px] bg-brand-gold-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
