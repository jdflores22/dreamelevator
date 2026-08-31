import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { SiteStat } from '@/types';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

interface AboutHeroProps {
  heroImage?: string;
  showStatsBar?: boolean;
  stats?: SiteStat[];
}

export function AboutHero({ heroImage, showStatsBar = false, stats = [] }: AboutHeroProps) {
  const isDark = useSectionDarkBackground('about_hero');
  const hero = usePageHeroContent('about_page', {
    eyebrow: 'Who we are',
    title: 'An elevator company built on experience',
    subtitle:
      'Since 1996 we have supplied, installed, modernized, and maintained elevators, escalators, and lifting equipment across the Philippines.',
  });
  const sortedStats = [...stats].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4);

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b py-16 sm:py-20 lg:py-24',
        isDark
          ? 'border-primary-800/30 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white'
          : 'border-slate-200/60 bg-white hero-heading-bg text-primary-900',
      )}
    >
      {heroImage && (
        <>
          <img
            src={heroImage}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(105deg, rgba(10,49,68,0.94) 0%, rgba(10,49,68,0.88) 45%, rgba(10,49,68,0.75) 100%)'
                : 'linear-gradient(105deg, rgba(248,250,252,0.97) 0%, rgba(255,255,255,0.92) 42%, rgba(255,255,255,0.78) 68%, rgba(255,255,255,0.55) 100%)',
            }}
          />
        </>
      )}

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
          {hero.eyebrow && (
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.2em]',
                isDark ? 'text-brand-gold-400' : 'pro-eyebrow mb-0',
              )}
            >
              {hero.eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3rem]',
              isDark ? 'text-white' : 'text-primary-900',
            )}
          >
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p
              className={cn(
                'mt-6 max-w-2xl text-lg leading-relaxed',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {hero.subtitle}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact">
              {isDark ? (
                <Button className="bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400">
                  Contact us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg">
                  Contact us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </Link>
            <Link to="/services">
              <Button
                variant="outline"
                size={isDark ? 'md' : 'lg'}
                className={cn(
                  isDark &&
                    'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                )}
              >
                Our services
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>

      {showStatsBar && sortedStats.length > 0 && (
        <div
          className={cn(
            'relative mt-16 border-t sm:mt-20',
            isDark ? 'border-white/10 bg-primary-950/60' : 'border-primary-800/20 bg-primary-900',
          )}
        >
          <Container className="py-8 sm:py-10">
            <div
              className={cn(
                'grid gap-8',
                sortedStats.length === 1 && 'mx-auto max-w-xs grid-cols-1 text-center',
                sortedStats.length === 2 && 'mx-auto max-w-2xl grid-cols-2',
                sortedStats.length === 3 && 'grid-cols-2 sm:grid-cols-3',
                sortedStats.length >= 4 && 'grid-cols-2 lg:grid-cols-4',
              )}
            >
              {sortedStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  className={cn(
                    'text-center lg:text-left',
                    index > 0 && sortedStats.length >= 2 && 'lg:border-l lg:border-white/10 lg:pl-8',
                  )}
                >
                  <p className="text-3xl font-semibold tabular-nums text-brand-gold-400 sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-300">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </div>
      )}
    </section>
  );
}
