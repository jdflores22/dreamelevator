import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';

export function ContactHero() {
  const isDark = useSectionDarkBackground('contact_hero', true);
  const { get } = useSiteSettingsMap();
  const { name: companyName } = useCompanyBrand();
  const hero = usePageHeroContent('contact_page');
  const title = deecCopy(hero.title, 'Contact us');
  const subtitle = deecCopy(
    hero.subtitle,
    'Visit is by appointment only. Call, message, or request a quote — we will connect you with the right team.',
  );
  const responsePromise = deecCopy(
    get('contact_response_promise'),
    'We typically respond within one business day.',
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b py-16 sm:py-20 lg:py-24',
        isDark
          ? 'border-primary-800/30 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white'
          : 'border-slate-200/60 bg-white hero-heading-bg text-primary-900',
      )}
    >
      {isDark ? (
        <>
          <div
            className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-brand-gold-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-brand-gold-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary-700/5 blur-3xl"
            aria-hidden
          />
        </>
      )}

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.2em]',
              isDark ? 'text-brand-gold-400' : 'pro-eyebrow mb-0',
            )}
          >
            {companyName || 'Get in touch'}
          </p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3rem]">
            {title}
          </h1>
          <p
            className={cn(
              'mt-6 max-w-2xl text-lg leading-relaxed',
              isDark ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {subtitle}
          </p>

          {responsePromise && (
            <div
              className={cn(
                'mt-6 inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm',
                isDark
                  ? 'border-white/15 bg-white/5 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700',
              )}
            >
              <Clock
                className={cn('h-4 w-4', isDark ? 'text-brand-gold-400' : 'text-brand-gold-600')}
                strokeWidth={1.5}
              />
              {responsePromise}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#contact-form">
              {isDark ? (
                <Button className="bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400">
                  Send a message
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg">
                  Send a message
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </a>
            <Link to="/services">
              <Button
                variant="outline"
                size={isDark ? 'md' : 'lg'}
                className={cn(
                  isDark &&
                    'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                )}
              >
                Explore services
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
