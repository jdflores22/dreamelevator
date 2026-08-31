import { cn } from '@/utils/cn';

interface ShaftAtmosphereProps {
  isDark?: boolean;
  className?: string;
  showRail?: boolean;
}

/** Vertical shaft lines + optional orange left rail — public-site motif. */
export function ShaftAtmosphere({
  isDark = false,
  className,
  showRail = true,
}: ShaftAtmosphereProps) {
  const line = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(10,49,68,0.055)';
  const gold = isDark ? 'rgba(247,151,31,0.22)' : 'rgba(247,151,31,0.14)';

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: '56px 100%',
          backgroundPosition: '8% 0',
        }}
      />
      <span className="absolute left-[8%] top-0 h-full w-px" style={{ backgroundColor: gold }} />
      <span className="absolute right-[12%] top-0 hidden h-full w-px lg:block" style={{ backgroundColor: gold }} />
      {showRail ? <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-gold-500" /> : null}
    </div>
  );
}
