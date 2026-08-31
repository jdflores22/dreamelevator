import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

interface ClientLogoMarqueeProps {
  clients: { id: string; name: string; logoUrl?: string; location?: string }[];
  className?: string;
  variant?: 'light' | 'dark';
}

export function ClientLogoMarquee({ clients, className, variant = 'light' }: ClientLogoMarqueeProps) {
  if (clients.length === 0) return null;

  // Repeat the logos until one "lane" is wide enough to fill the viewport, then
  // render the lane twice. The track animates by -50% so the second lane lands
  // exactly where the first started — a seamless, gapless infinite loop.
  const MIN_PER_LANE = 8;
  const repeats = Math.max(1, Math.ceil(MIN_PER_LANE / clients.length));
  const lane = Array.from({ length: repeats }, () => clients).flat();
  const track = [...lane, ...lane];

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent',
          variant === 'dark' ? 'from-primary-900' : 'from-slate-50',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent',
          variant === 'dark' ? 'from-primary-900' : 'from-slate-50',
        )}
      />

      <div className="tech-marquee-track-slow flex w-max items-center gap-5 py-3">
        {track.map((client, i) => (
          <div
            key={`${client.id}-${i}`}
            className={cn(
              'flex h-[9.5rem] w-[14.5rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-5 shadow-md transition-all duration-300',
              variant === 'dark'
                ? 'border-white/15 bg-white/10 hover:bg-white/15'
                : 'border-slate-200 bg-white hover:border-brand-gold-400/50 hover:shadow-lg',
            )}
          >
            <div className="flex h-16 w-full items-center justify-center">
              {client.logoUrl ? (
                <img
                  src={resolveMediaUrl(client.logoUrl)}
                  alt=""
                  className="max-h-16 max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span
                  className={cn(
                    'text-lg font-semibold tracking-tight',
                    variant === 'dark' ? 'text-white' : 'text-primary-800',
                  )}
                >
                  {client.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="w-full text-center">
              <p
                className={cn(
                  'truncate text-sm font-semibold tracking-tight',
                  variant === 'dark' ? 'text-slate-200' : 'text-primary-900',
                )}
                title={client.name}
              >
                {client.name}
              </p>
              <p
                className={cn(
                  'mt-0.5 h-4 truncate text-xs',
                  variant === 'dark' ? 'text-slate-400' : 'text-slate-500',
                )}
                title={client.location}
              >
                {client.location || '\u00a0'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
