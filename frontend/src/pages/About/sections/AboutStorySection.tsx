import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

interface AboutStorySectionProps {
  eyebrow: string;
  title: string;
  intro: string;
  secondary: string;
  photos: string[];
  values: string[];
}

export function AboutStorySection({
  eyebrow,
  title,
  intro,
  secondary,
  photos,
  values,
}: AboutStorySectionProps) {
  const isDark = useSectionDarkBackground('about_story');

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              align="left"
              className="mb-0"
              theme={isDark ? 'dark' : 'light'}
            />
            <div
              className={cn(
                'mt-8 space-y-6 text-base leading-relaxed sm:text-lg',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {intro ? <p>{intro}</p> : null}
              {secondary ? <p>{secondary}</p> : null}
            </div>

            {values.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {values.map((label) => (
                  <span
                    key={label}
                    className={cn(
                      'inline-flex items-center border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
                      isDark
                        ? 'border-white/15 bg-white/5 text-slate-200'
                        : 'border-slate-200 bg-slate-50 text-primary-800',
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8">
              <Link to="/services">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    isDark &&
                      'border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white',
                  )}
                >
                  Our services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {photos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className={cn('grid gap-3', photos.length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1')}
            >
              {photos.map((src, index) => (
                <figure
                  key={src}
                  className={cn(
                    'overflow-hidden bg-slate-100 shadow-[0_24px_50px_-28px_rgba(10,49,68,0.45)]',
                    index === 1 && photos.length === 3 && 'sm:mt-6',
                  )}
                >
                  <img src={src} alt="" className="aspect-[3/4] h-full w-full object-cover" />
                </figure>
              ))}
            </motion.div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
