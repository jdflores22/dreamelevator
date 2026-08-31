import { ExternalLink, MapPin } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { sectionSurfaceClass, sectionTheme } from '@/utils/sectionSurface';
import { formatMapSearchHref, resolveGoogleMapEmbedUrl } from '@/utils/media';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';

export function ContactMapSection() {
  const isDark = useSectionDarkBackground('contact_map');
  const theme = sectionTheme(isDark);
  const { get } = useSiteSettingsMap();
  const raw = useSectionContent('contact_map');
  const section = {
    eyebrow: deecCopy(raw.eyebrow, 'Visit us'),
    title: deecCopy(raw.title, 'Las Piñas office'),
    subtitle: deecCopy(
      raw.subtitle,
      'Visit is by appointment only. Use the map for directions to Equitable Village, Talon Kuatro.',
    ),
  };

  const address = deecCopy(get('company_address'), '');
  const companyName = get('company_name');
  const tagline = get('company_tagline');
  const embedUrl = resolveGoogleMapEmbedUrl(
    address,
    get('contact_map_embed_url', ''),
    [companyName, tagline, 'Philippines'].filter(Boolean).join(' '),
  );
  const mapsHref = formatMapSearchHref(address);

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          theme={theme}
          align="left"
          className="mb-8 max-w-2xl"
        />

        <div
          className={cn(
            'overflow-hidden rounded-2xl border',
            isDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          {embedUrl ? (
            <div className="relative aspect-[16/7] min-h-[280px] w-full sm:min-h-[360px]">
              <iframe
                title={`Map showing ${address}`}
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className={cn(
                'flex aspect-[16/7] min-h-[280px] flex-col items-center justify-center gap-4 px-6 text-center sm:min-h-[320px]',
                isDark ? 'bg-primary-950/40' : 'bg-slate-50',
              )}
            >
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl',
                  isDark ? 'bg-white/10' : 'bg-white shadow-sm',
                )}
              >
                <MapPin className="h-7 w-7 text-brand-gold-500" strokeWidth={1.5} />
              </div>
              <div className="max-w-md">
                <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-primary-900')}>
                  {address}
                </p>
                <p className={cn('mt-2 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Set your office address under Settings → Contact information to show the map here.
                </p>
              </div>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                <Button variant={isDark ? 'secondary' : 'outline'}>
                  Open in Google Maps
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          )}

          <div
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6',
              isDark ? 'border-white/10' : 'border-slate-100',
            )}
          >
            <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
              <span className="font-medium text-brand-gold-500">Address:</span> {address}
            </p>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className={isDark ? 'text-slate-200 hover:bg-white/10 hover:text-white' : undefined}
              >
                Get directions
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
