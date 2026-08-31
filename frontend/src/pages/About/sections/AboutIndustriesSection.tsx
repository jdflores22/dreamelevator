import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIndustries } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function AboutIndustriesSection() {
  const { data: industries } = useIndustries();
  const isDark = useSectionDarkBackground('about_industries');
  const section = useSectionContent('about_industries', {
    eyebrow: 'Industries',
    title: 'Sector Expertise',
    subtitle: 'Deep domain knowledge across diverse industries — from healthcare to logistics.',
  });
  const sorted = [...(industries ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          theme={isDark ? 'dark' : 'light'}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {sorted.map((industry, index) => (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                'flex w-full min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 transition-all sm:min-w-[220px] sm:max-w-[280px] sm:flex-1 sm:px-5 sm:py-4',
                isDark
                  ? 'border-white/10 bg-white/5 hover:border-brand-gold-500/40 hover:bg-white/[0.07]'
                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-gold-400/50 hover:shadow-md',
              )}
            >
              <CheckCircle2
                className={cn(
                  'h-4 w-4 shrink-0',
                  isDark
                    ? 'text-brand-gold-400'
                    : index % 3 === 0
                      ? 'text-brand-gold-600'
                      : index % 3 === 1
                        ? 'text-primary-700'
                        : 'text-sky-600',
                )}
              />
              <span
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {industry.name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/industries"
            className={
              isDark
                ? 'text-sm font-semibold text-brand-gold-400 hover:text-brand-gold-300'
                : 'sm-link'
            }
          >
            Explore all industries →
          </Link>
        </div>
      </Container>
    </section>
  );
}
