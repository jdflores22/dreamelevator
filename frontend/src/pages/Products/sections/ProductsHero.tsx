import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

interface ProductsHeroProps {
  productCount: number;
  hasFeatured: boolean;
}

export function ProductsHero({ productCount, hasFeatured }: ProductsHeroProps) {
  const isDark = useSectionDarkBackground('products_hero', true);
  const hero = usePageHeroContent('products_page', {
    eyebrow: 'Lift products',
    title: 'Elevators, escalators, and moving systems',
    subtitle:
      'Passenger, freight, scenic, hospital, home, and accessibility lifts — plus escalators, moving walkways, modernization, and service.',
  });

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
            {hero.eyebrow}
          </p>
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

          {productCount > 0 && (
            <div
              className={cn(
                'mt-6 inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm',
                isDark
                  ? 'border-white/15 bg-white/5 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700',
              )}
            >
              <Package
                className={cn('h-4 w-4', isDark ? 'text-brand-gold-400' : 'text-brand-gold-600')}
                strokeWidth={1.5}
              />
              {productCount} product{productCount === 1 ? '' : 's'} available
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact">
              {isDark ? (
                <Button className="bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400">
                  Request a quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg">
                  Request a quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </Link>
            {hasFeatured && (
              <a href="#featured-product">
                <Button
                  variant="outline"
                  size={isDark ? 'md' : 'lg'}
                  className={cn(
                    isDark &&
                      'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                  )}
                >
                  View featured product
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
