import { cn } from '@/utils/cn';

const SPEC_ROWS = [
  { label: 'Passenger', value: '800–1600 kg' },
  { label: 'Home / villa', value: 'Shaft from 900×1100' },
  { label: 'Escalators', value: 'Indoor & outdoor' },
  { label: 'Service', value: 'All brands' },
];

/** Architectural spec plate — replaces the old software-terminal motif. */
export function CodeTerminal({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative hidden overflow-hidden rounded-sm border border-white/10 bg-primary-950/85 shadow-2xl backdrop-blur-md lg:block',
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-gold-500" aria-hidden />
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-gold-400">
          Equipment range
        </p>
        <span className="font-display text-[11px] uppercase tracking-[0.16em] text-slate-500">
          Since 1996
        </span>
      </div>
      <ul className="divide-y divide-white/8 p-2">
        {SPEC_ROWS.map((row) => (
          <li key={row.label} className="flex items-center justify-between px-3 py-3">
            <span className="text-sm text-slate-400">{row.label}</span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
