import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductBySlug } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSEO } from '@/components/common/PageSEO';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { resolveMediaUrl } from '@/utils/media';
import { parseJsonArray } from '@/utils/jsonArray';
import { cn } from '@/utils/cn';
import { richTextContentClass } from '@/utils/richTextClasses';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProductBySlug(slug ?? '');

  if (isLoading) return <PageLoader />;
  if (isError || !product) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-primary-900">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-primary-800">
          Back to products
        </Link>
      </Container>
    );
  }

  const features = parseJsonArray(product.featuresJson).filter((item) => item.trim());
  const screenshots = parseJsonArray(product.screenshotsJson).map((url) => resolveMediaUrl(url)).filter(Boolean);
  const logoUrl = product.logoUrl ? resolveMediaUrl(product.logoUrl) : null;
  const heroPhoto = screenshots[0] || logoUrl;

  return (
    <>
      <PageSEO
        title={product.name}
        description={product.shortDescription || product.description?.slice(0, 160)}
      />
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="pro-eyebrow mb-4">Lift equipment</p>
              <h1 className="text-3xl font-semibold tracking-tight text-pretty text-primary-900 sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
              <span className="mt-4 block h-[3px] w-10 bg-brand-gold-500" aria-hidden />
              {product.shortDescription ? (
                <p className="mt-5 text-lg leading-relaxed text-slate-600">{product.shortDescription}</p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contact">
                  <Button>
                    Request a quote
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline">All products</Button>
                </Link>
              </div>
            </div>

            {heroPhoto ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shadow-[0_28px_64px_-32px_rgba(10,49,68,0.45)]">
                <img src={heroPhoto} alt={product.name} className="absolute inset-0 size-full object-cover" />
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {product.description ? (
              <section>
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                  Specifications
                </h2>
                <div
                  className={cn(richTextContentClass, 'mt-4 prose-p:text-slate-600')}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            ) : null}

            {screenshots.length > 1 ? (
              <section>
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                  Installation views
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {screenshots.slice(1).map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {features.length > 0 ? (
            <aside>
              <div className="sticky top-24 border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary-800">
                  At a glance
                </h2>
                <ul className="mt-4 space-y-3">
                  {features.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex gap-3 text-sm text-slate-700">
                      <span className="font-display w-6 shrink-0 text-[13px] font-semibold text-brand-gold-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="mt-6 block">
                  <Button className="w-full">Request a quote</Button>
                </Link>
              </div>
            </aside>
          ) : null}
        </div>
      </Container>
    </>
  );
}
