import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteStats } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

export function Stats() {
  const { data: stats, isLoading } = useSiteStats();
  const sorted = [...(stats ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const section = useSectionContent('home_stats', {
    eyebrow: 'Results',
    title: 'Outcomes we deliver',
    subtitle: 'Maintenance roots, expanded supply and installation, and a long-term service commitment.',
  });
  const theme = usePageSectionTheme('home_stats');

  if (!isLoading && sorted.length === 0) return null;

  return (
    <PageSection sectionId="home_stats" variant="white" className="!py-14 lg:!py-16">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          size="large"
          theme={theme}
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-px overflow-hidden rounded-sm sm:grid-cols-2 lg:grid-cols-4',
              theme === 'dark'
                ? 'border border-white/15 bg-white/10'
                : 'border border-slate-200 bg-slate-200',
            )}
          >
            {sorted.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  'flex flex-col p-8',
                  theme === 'dark' ? 'bg-white/5' : 'bg-white',
                )}
              >
                <p
                  className={cn(
                    'text-4xl font-semibold tracking-tight sm:text-5xl',
                    theme === 'dark' ? 'text-white' : 'text-primary-900',
                  )}
                >
                  {stat.value}
                </p>
                <p
                  className={cn(
                    'mt-3 text-sm leading-relaxed',
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {stat.label}
                </p>
                <Link
                  to="/gallery"
                  className={cn(
                    'mt-6 inline-flex items-center gap-1 text-sm font-semibold',
                    theme === 'dark'
                      ? 'text-brand-gold-400 hover:text-brand-gold-300'
                      : 'sm-link',
                  )}
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </PageSection>
  );
}
