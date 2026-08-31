import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { usePortfolio, usePortfolioItem } from '@/api/hooks';
import { SEOHead } from '@/components/common/SEOHead';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { parsePortfolioImages, parseTechStack } from '@/utils/portfolio';
import { resolveMediaUrl } from '@/utils/media';

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: item, isLoading, isError } = usePortfolioItem(slug || '');
  const { data: allItems } = usePortfolio();

  if (isLoading) return <PageLoader />;
  if (isError || !item) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link to="/portfolio" className="mt-4 inline-block text-brand-gold-600">
          Back to portfolio
        </Link>
      </Container>
    );
  }

  const techStack = parseTechStack(item.techStackJson);
  const images = parsePortfolioImages(item.imagesJson);
  const coverImage = images[0];
  const galleryImages = images.slice(1);
  const related = (allItems ?? [])
    .filter((p) => p.id !== item.id && p.isPublished)
    .slice(0, 3);

  const hasHtmlContent = item.content?.trim().startsWith('<');

  return (
    <>
      <SEOHead title={item.title} description={item.description} />

      {coverImage ? (
        <div className="relative h-64 overflow-hidden bg-primary-900 sm:h-80 lg:h-96">
          <img src={coverImage} alt={item.title} className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-transparent" />
          <Container className="absolute inset-x-0 bottom-0 pb-10">
            <Link
              to="/portfolio"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
            <div className="flex items-end gap-4">
              {item.logoUrl && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
                  <img
                    src={resolveMediaUrl(item.logoUrl)}
                    alt={`${item.title} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-medium uppercase tracking-tight text-white sm:text-4xl">
                  {item.title}
                </h1>
                {item.description && (
                  <p className="mt-3 max-w-2xl text-lg text-slate-300">{item.description}</p>
                )}
              </div>
            </div>
          </Container>
        </div>
      ) : (
        <section className="bg-primary-900 py-16 text-white circuit-bg">
          <Container>
            <Link
              to="/portfolio"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
            <div className="flex items-start gap-4">
              {item.logoUrl && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-md">
                  <img
                    src={resolveMediaUrl(item.logoUrl)}
                    alt={`${item.title} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-medium uppercase tracking-tight sm:text-4xl">{item.title}</h1>
                {item.description && (
                  <p className="mt-3 max-w-2xl text-lg text-slate-300">{item.description}</p>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      <Container className="py-16">
        {techStack.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold-600">Challenge</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {item.description || 'Client needed a reliable partner to deliver measurable outcomes on a complex initiative.'}
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Solution</p>
            {hasHtmlContent ? (
              <div
                className="prose prose-slate mt-3 max-w-none prose-p:text-slate-700"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {item.content || item.description}
              </p>
            )}
          </section>
        </div>

        {techStack.length > 0 && (
          <section className="mt-8 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Results & delivery</p>
            <p className="mt-3 text-sm text-slate-600">
              Delivered with a production-ready stack and practices aligned to the client&apos;s operational goals.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="accent">{tech}</Badge>
              ))}
            </div>
          </section>
        )}

        {galleryImages.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {galleryImages.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="rounded-xl border border-slate-200 object-cover shadow-sm"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-xl font-semibold text-primary-900">Related projects</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((project) => (
                <Link key={project.id} to={`/portfolio/${project.slug}`} className="group">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardBody>
                      <h3 className="font-semibold text-primary-900 group-hover:text-primary-700">
                        {project.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-800">
                        View case study
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
