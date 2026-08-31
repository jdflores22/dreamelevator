import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { usePageSectionTheme } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

export function PreFooterCTA() {
  const { pathname } = useLocation();
  const { get } = useSiteSettingsMap();
  const theme = usePageSectionTheme('home_cta');
  const isDark = theme === 'dark';
  const onServices = pathname === '/services' || pathname.startsWith('/services/');

  const title = get('home_cta_title', 'Have a project? Request a quote.');
  const subtitle = get(
    'home_cta_subtitle',
    'Tell us about the building, the equipment, or the problem — we will help you plan the right path forward.',
  );
  const primaryLabel = get('home_cta_primary_label', 'Get a quote');
  const secondaryLabel = get('home_cta_secondary_label', 'Explore Services');

  return (
    <PageSection sectionId="home_cta" variant="muted" className="!py-10 sm:!py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
        >
          <span
            className={cn(
              'absolute inset-x-0 -top-10 h-px bg-gradient-to-r from-transparent to-transparent sm:-top-12',
              isDark ? 'via-brand-gold-400/80' : 'via-brand-gold-500/70',
            )}
            aria-hidden
          />

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.2em]',
                isDark ? 'text-brand-gold-400' : 'text-brand-gold-600',
              )}
            >
              Next step
            </p>
            <h2
              className={cn(
                'mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl',
                isDark ? 'text-white' : 'text-primary-900',
              )}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={cn(
                  'mt-1.5 max-w-xl text-sm leading-relaxed line-clamp-2',
                  isDark ? 'text-slate-300' : 'text-slate-600',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link to="/contact" className="w-full sm:w-auto">
              {isDark ? (
                <Button
                  size="md"
                  className="w-full bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400 sm:w-auto"
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="md" className="w-full sm:w-auto">
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </Link>
            {!onServices && secondaryLabel ? (
              <Link
                to="/services"
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-2 text-sm font-medium transition-colors',
                  isDark
                    ? 'text-slate-300 hover:text-brand-gold-400'
                    : 'text-primary-800 hover:text-brand-gold-600',
                )}
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </motion.div>
      </Container>
    </PageSection>
  );
}
