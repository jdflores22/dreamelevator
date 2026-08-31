import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '@/api/hooks';
import type { SoftwareProduct } from '@/types';
import { Container } from '@/components/common/Container';
import { PageSection, SectionHeading } from '@/components/common/SectionHeading';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { parseJsonArray } from '@/utils/jsonArray';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

function ProductCard({
  product,
  index,
  isDark,
}: {
  product: SoftwareProduct;
  index: number;
  isDark: boolean;
}) {
  const logoUrl = product.logoUrl ? resolveMediaUrl(product.logoUrl) : null;
  const photos = parseJsonArray(product.screenshotsJson).map((url) => resolveMediaUrl(url)).filter(Boolean);
  const cover = photos[0] || logoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden border transition-colors',
          isDark
            ? 'border-white/10 bg-white/[0.03] hover:border-brand-gold-400/40'
            : 'border-slate-200 bg-white hover:border-primary-300',
        )}
      >
        <div className={cn('relative aspect-[4/3] overflow-hidden', isDark ? 'bg-white/5' : 'bg-slate-100')}>
          {cover ? (
            <img
              src={cover}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center font-display text-3xl font-semibold',
                isDark ? 'text-white/20' : 'text-slate-300',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className={cn('text-lg font-semibold tracking-tight', isDark ? 'text-white' : 'text-primary-900')}>
            {product.name}
          </h3>
          {product.shortDescription ? (
            <p
              className={cn(
                'mt-2 flex-1 text-sm leading-relaxed line-clamp-3',
                isDark ? 'text-slate-400' : 'text-slate-600',
              )}
            >
              {product.shortDescription}
            </p>
          ) : null}
          <span
            className={cn(
              'mt-4 inline-flex items-center gap-1.5 text-sm font-semibold',
              isDark ? 'text-brand-gold-400' : 'text-primary-800 group-hover:text-brand-gold-600',
            )}
          >
            View product
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function SoftwareSolutions() {
  const { data: products, isLoading } = useProducts();
  const sorted = [...(products ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const row1 = sorted.filter((p) => (p.homepageRow ?? 1) === 1);
  const row2 = sorted.filter((p) => (p.homepageRow ?? 1) === 2);
  const preferred = [...row1, ...row2];
  const display = (preferred.length > 0 ? preferred : sorted).slice(0, 8);

  const section = useSectionContent('home_products', {
    eyebrow: 'Products',
    title: 'Lifts and moving systems',
    subtitle: 'Passenger, freight, scenic, hospital, home, accessibility, escalators, and moving walkways.',
  });

  const theme = usePageSectionTheme('home_products');
  const isDark = theme === 'dark';

  return (
    <PageSection
      sectionId="home_products"
      variant="white"
      id="products"
    >
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          size="large"
          theme={theme}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : display.length === 0 ? (
          <p className={cn('text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No products published yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {display.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} isDark={isDark} />
            ))}
          </div>
        )}

        {display.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className={cn(
                'inline-flex items-center gap-2 rounded-sm border px-6 py-3 text-sm font-semibold transition-all duration-300',
                isDark
                  ? 'border-white/15 text-white hover:border-brand-gold-400/60 hover:bg-white/5'
                  : 'border-slate-300 text-primary-900 hover:border-brand-gold-400/60 hover:bg-white hover:shadow-sm',
              )}
            >
              Explore all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </Container>
    </PageSection>
  );
}
