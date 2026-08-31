import {
  ArrowRight,
  Cloud,
  Cpu,
  Database,
  Layout,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTechnologies } from '@/api/hooks';
import { PageSEO } from '@/components/common/PageSEO';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { resolveMediaUrl } from '@/utils/media';
import type { Technology } from '@/types';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

/** Brand accents — orange and cyan. */
const brandAccents = [
  {
    border: 'border-brand-gold-500',
    accent: 'text-brand-gold-600',
    bg: 'bg-brand-gold-500/10',
  },
  {
    border: 'border-primary-700',
    accent: 'text-primary-800',
    bg: 'bg-primary-50',
  },
  {
    border: 'border-primary-500',
    accent: 'text-primary-600',
    bg: 'bg-primary-50',
  },
] as const;

const categoryIcons: Record<string, LucideIcon> = {
  Frontend: Layout,
  Backend: Server,
  Database: Database,
  Infrastructure: Cpu,
  Cloud: Cloud,
};

function getCategoryIcon(category: string) {
  return categoryIcons[category] ?? Cpu;
}

function groupByCategory(technologies: Technology[]) {
  return technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
    const cat = tech.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {});
}

export default function TechnologiesPage() {
  const { data: technologies, isLoading } = useTechnologies();
  const items = technologies ?? [];
  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped);

  const darkStats = useSectionDarkBackground('technologies_stats');
  const darkStack = useSectionDarkBackground('technologies_stack');
  const darkWhy = useSectionDarkBackground('technologies_why', true);
  const darkCta = useSectionDarkBackground('technologies_cta');

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO
        title="Technologies"
        description="Modern tools and frameworks powering our software development solutions."
      />

      <PageHero
        title="Technologies"
        subtitle="Modern tools and frameworks we use to build robust, scalable enterprise solutions."
      />

      <section className={cn('border-b', darkStats ? sectionSurfaceClass(true) : 'border-slate-200 bg-white py-8')}>
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            <Stat value={String(categories.length)} label="Technology categories" dark={darkStats} />
            <Stat value={String(items.length)} label="Tools & frameworks" dark={darkStats} />
            <Stat value="Full-stack" label="End-to-end coverage" dark={darkStats} />
          </div>
        </Container>
      </section>

      <section className={sectionSurfaceClass(darkStack, 'muted')}>
        <Container>
          <SectionHeading
            eyebrow="Our stack"
            title="Built With Modern Technology"
            subtitle="From frontend interfaces to backend systems — we choose the right tools for every layer of your software."
            theme={darkStack ? 'dark' : 'light'}
          />

          {categories.length === 0 ? (
            <p className="text-center text-slate-500">No technologies published yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(grouped).map(([category, techs], index) => {
                const style = brandAccents[index % brandAccents.length];
                const Icon = getCategoryIcon(category);

                return (
                  <article
                    key={category}
                    className={cn(
                      'group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
                      'border-t-4',
                      style.border,
                    )}
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-lg',
                          style.bg,
                        )}
                      >
                        <Icon className={cn('h-5 w-5', style.accent)} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wide text-primary-900">
                          {category}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {techs.length} {techs.length === 1 ? 'technology' : 'technologies'}
                        </p>
                      </div>
                    </div>

                    <ul className="flex flex-1 flex-wrap gap-2 p-6">
                      {techs.map((tech) => (
                        <li key={tech.id}>
                          <TechChip tech={tech} />
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <section className={sectionSurfaceClass(darkWhy)}>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className={darkWhy ? 'pro-eyebrow-dark' : 'pro-eyebrow'}>Why it matters</p>
            <h2 className={`mt-3 text-2xl font-medium uppercase tracking-tight sm:text-3xl ${darkWhy ? 'text-white' : 'text-primary-900'}`}>
              The Right Stack for Your Project
            </h2>
            {darkWhy && <div className="accent-line mx-auto mt-5" />}
            <p className={`mt-6 text-base leading-relaxed ${darkWhy ? 'text-slate-300' : 'text-slate-600'}`}>
              We select technologies based on performance, scalability, and long-term maintainability —
              not trends. Every stack is tailored to your business requirements, team, and growth plans.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Scalable',
                text: 'Architectures that grow with your user base and data volume.',
              },
              {
                title: 'Secure',
                text: 'Industry-standard practices for authentication, data, and compliance.',
              },
              {
                title: 'Maintainable',
                text: 'Clean codebases using well-supported, documented frameworks.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={cn(
                  'rounded-xl border p-6 backdrop-blur-sm',
                  darkWhy ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
                )}
              >
                <h3 className={`text-sm font-medium uppercase tracking-wide ${darkWhy ? 'text-brand-gold-400' : 'text-primary-900'}`}>
                  {item.title}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${darkWhy ? 'text-slate-300' : 'text-slate-600'}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className={sectionSurfaceClass(darkCta)}>
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <SectionHeading
              title="Need a Custom Solution?"
              subtitle="Tell us about your project and we'll recommend the ideal technology stack."
              showAccent
              theme={darkCta ? 'dark' : 'light'}
            />
            <Link to="/contact">
              <Button size="lg">
                Discuss your project
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="text-center sm:text-left">
      <p className={`text-3xl font-medium tabular-nums ${dark ? 'text-brand-gold-400' : 'text-primary-900'}`}>{value}</p>
      <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

function TechChip({ tech }: { tech: Technology }) {
  const iconSrc = tech.iconUrl ? resolveMediaUrl(tech.iconUrl) : null;

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-2 text-sm font-medium text-primary-800 transition-colors group-hover:border-brand-gold-500/30 group-hover:bg-white">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className="h-4 w-4 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-brand-gold-500" />
      )}
      {tech.name}
    </span>
  );
}
