import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';
import { usePortfolio } from '@/api/hooks';
import { PageSEO } from '@/components/common/PageSEO';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { Card, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { PortfolioMedia } from '@/components/portfolio/PortfolioMedia';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { parseTechStack } from '@/utils/portfolio';
import { resolveMediaUrl } from '@/utils/media';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import type { Portfolio } from '@/types';

function PortfolioCard({ item }: { item: Portfolio }) {
  const techStack = parseTechStack(item.techStackJson).slice(0, 3);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <PortfolioMedia item={item} />
      <CardBody>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {item.isFeatured && <Badge variant="accent">Featured</Badge>}
          {item.client?.name && (
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {item.client.name}
            </span>
          )}
        </div>
        <CardTitle className="group-hover:text-primary-800">{item.title}</CardTitle>
        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.description}</p>
        {techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <Badge key={tech} className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
        <Link
          to={`/portfolio/${item.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gold-600 hover:text-brand-gold-700"
        >
          View project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardBody>
    </Card>
  );
}

export default function PortfolioPage() {
  const { data: items, isLoading } = usePortfolio();
  const { get } = useSiteSettingsMap();

  const subtitle =
    get('portfolio_page_subtitle') || 'Success stories from our client engagements.';
  const heroImage = resolveMediaUrl(get('portfolio_hero_image') || '');

  const sorted = [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const featuredCount = sorted.filter((i) => i.isFeatured).length;
  const darkList = useSectionDarkBackground('portfolio_list');

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO
        pageKey="portfolio"
        title="Portfolio"
        description="Explore our project portfolio and case studies."
      />
      <PageHero
        title="Our Portfolio"
        subtitle={subtitle}
        backgroundImage={heroImage || undefined}
      />
      <section className={sectionSurfaceClass(darkList)}>
        <Container className="py-16">
        {sorted.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-6 rounded-xl border border-slate-200/80 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary-900">{sorted.length}</p>
                <p className="text-xs text-slate-500">Projects</p>
              </div>
            </div>
            {featuredCount > 0 && (
              <div className="border-l border-slate-200 pl-6">
                <p className="text-2xl font-semibold text-brand-gold-600">{featuredCount}</p>
                <p className="text-xs text-slate-500">Featured</p>
              </div>
            )}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-slate-500">No portfolio items published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </Container>
      </section>
    </>
  );
}
