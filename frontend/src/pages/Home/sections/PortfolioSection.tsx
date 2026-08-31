import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PortfolioCoverImage } from '@/components/portfolio/PortfolioCoverImage';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

export function PortfolioSection() {
  const { data: items, isLoading } = usePortfolio();
  const featured = (items ?? []).filter((item) => item.isFeatured).slice(0, 6);
  const fallback = (items ?? []).slice(0, 6);
  const projects = featured.length > 0 ? featured : fallback;
  const [active, setActive] = useState(0);

  const section = useSectionContent('home_portfolio', {
    eyebrow: 'Case Studies',
    title: 'Proven results across industries',
    subtitle: 'Installations and modernization work across residential and commercial buildings.',
  });

  const current = projects[active];
  const total = String(projects.length).padStart(2, '0');
  const index = String(active + 1).padStart(2, '0');

  const theme = usePageSectionTheme('home_portfolio');

  if (!isLoading && projects.length === 0) return null;

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + projects.length) % projects.length);
  };

  return (
    <PageSection sectionId="home_portfolio" variant="white" id="portfolio">
      <Container>
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            align="left"
            className="mb-0 max-w-2xl"
            showAccent={false}
            theme={theme}
          />
          {projects.length > 0 && (
            <p className="font-mono text-sm tabular-nums text-slate-400">
              <span className="text-2xl font-semibold text-primary-900">{index}</span>
              <span className="mx-1">/</span>
              {total}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg"
                >
                  <PortfolioCoverImage
                    imagesJson={current.imagesJson}
                    alt={current.title}
                    className="aspect-[16/10] !rounded-none"
                  />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${current.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="pro-eyebrow mb-3">Featured project</p>
                  <h3 className="text-2xl font-semibold text-primary-900 sm:text-3xl">{current.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 line-clamp-5">
                    {current.description}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link to={`/portfolio/${current.slug}`}>
                      <Button size="md">
                        View case study
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Previous project"
                        className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 text-primary-800 transition-colors hover:border-primary-300 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Next project"
                        className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 text-primary-800 transition-colors hover:border-primary-300 hover:bg-slate-50"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {projects.length > 1 && (
              <div className="mt-10 flex gap-2 overflow-x-auto border-t border-slate-100 pt-8">
                {projects.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'shrink-0 rounded-lg px-4 py-2.5 text-left text-sm transition-all',
                      i === active
                        ? 'bg-primary-900 font-medium text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    <span className="mr-2 font-mono text-xs opacity-70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-10">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-brand-gold-600"
          >
            View gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </PageSection>
  );
}
