import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SiteStat } from '@/types';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

interface AboutStatsSectionProps {
  stats: SiteStat[];
}

export function AboutStatsSection({ stats }: AboutStatsSectionProps) {
  const isDark = useSectionDarkBackground('about_stats');
  const section = useSectionContent('about_stats', {
    title: 'The support you need, for results you want',
  });
  const sorted = [...stats].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        <SectionHeading
          title={section.title}
          size="large"
          className="mb-12 text-center"
          theme={isDark ? 'dark' : 'light'}
        />

        <div
          className={cn(
            'grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2',
            sorted.length >= 4 && 'lg:grid-cols-4',
            sorted.length === 3 && 'lg:grid-cols-3',
            isDark ? 'border border-white/15 bg-white/10' : 'border border-slate-200 bg-slate-200',
          )}
        >
          {sorted.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={cn('flex flex-col p-8', isDark ? 'bg-white/5' : 'bg-white')}
            >
              <p
                className={cn(
                  'text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl',
                  isDark ? 'text-brand-gold-400' : 'text-primary-900',
                )}
              >
                {stat.value}
              </p>
              <p
                className={cn(
                  'mt-3 text-sm leading-relaxed',
                  isDark ? 'text-slate-300' : 'text-slate-600',
                )}
              >
                {stat.label}
              </p>
              <Link
                to="/gallery"
                className={cn(
                  'mt-6 inline-flex items-center gap-1 text-sm font-semibold',
                  isDark ? 'text-brand-gold-400 hover:text-brand-gold-300' : 'sm-link',
                )}
              >
                See our work
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
