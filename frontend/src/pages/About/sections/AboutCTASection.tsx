import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function AboutCTASection() {
  const { get } = useSiteSettingsMap();
  const isDark = useSectionDarkBackground('about_cta');
  const title = get('about_cta_title', "We'd love to hear from you");
  const subtitle = get(
    'about_cta_subtitle',
    "Tell us about the building or the equipment — we will get back to you as soon as possible.",
  );

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <div
          className={cn(
            'mx-auto max-w-3xl rounded-sm border-l-[3px] border-brand-gold-500 border px-8 py-12 text-center sm:px-12 sm:py-14',
            isDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          <h2
            className={cn(
              'text-3xl font-semibold tracking-tight sm:text-4xl',
              isDark ? 'text-white' : 'text-primary-900',
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                'mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button size="lg">
                Get in touch
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  isDark &&
                    'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                )}
              >
                View case studies
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
