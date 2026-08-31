import { ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCareers } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function ContactCareersSection() {
  const isDark = useSectionDarkBackground('contact_careers', true);
  const { get } = useSiteSettingsMap();
  const section = useSectionContent('contact_careers', {
    eyebrow: 'Join our team',
    title: 'Build enterprise software with us',
    subtitle:
      'We’re always looking for engineers, designers, and consultants who care about quality delivery and long-term partnerships.',
  });

  const primaryLabel = get('contact_careers_primary_label', 'View open roles');
  const secondaryLabel = get('contact_careers_secondary_label', 'Send an inquiry');
  const { data: careers } = useCareers();
  const openCount = (careers ?? []).filter((c) => c.isPublished).length;

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <div
          className={cn(
            'relative overflow-hidden rounded-sm border-l-[3px] border-brand-gold-500 border px-8 py-10 sm:px-12 sm:py-12',
            isDark
              ? 'border-white/15 bg-gradient-to-br from-primary-950/80 via-primary-900/60 to-primary-950/80'
              : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          {isDark && (
            <>
              <div
                className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-gold-500/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-primary-600/20 blur-3xl"
                aria-hidden
              />
            </>
          )}

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.2em]',
                  isDark ? 'text-brand-gold-400' : 'pro-eyebrow mb-0',
                )}
              >
                {section.eyebrow}
              </p>
              <h2
                className={cn(
                  'mt-3 text-2xl font-semibold tracking-tight sm:text-3xl',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p
                  className={cn(
                    'mt-4 text-base leading-relaxed sm:text-lg',
                    isDark ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {section.subtitle}
                </p>
              )}

              {openCount > 0 && (
                <div
                  className={cn(
                    'mt-5 inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm',
                    isDark
                      ? 'border-white/15 bg-white/5 text-slate-200'
                      : 'border-slate-200 bg-slate-50 text-slate-700',
                  )}
                >
                  <Briefcase
                    className={cn('h-4 w-4', isDark ? 'text-brand-gold-400' : 'text-brand-gold-600')}
                    strokeWidth={1.5}
                  />
                  {openCount} open role{openCount === 1 ? '' : 's'}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link to="/careers">
                {isDark ? (
                  <Button className="bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400">
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg">
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </Link>
              <a href="#contact-form">
                <Button
                  variant="outline"
                  size={isDark ? 'md' : 'lg'}
                  className={cn(
                    isDark &&
                      'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {secondaryLabel}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
