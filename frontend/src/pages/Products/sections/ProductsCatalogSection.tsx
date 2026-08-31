import type { SoftwareProduct } from '@/types';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { ProductCatalogCard } from '@/pages/Products/sections/ProductCatalogCard';
import { cn } from '@/utils/cn';

interface ProductsCatalogSectionProps {
  products: SoftwareProduct[];
}

export function ProductsCatalogSection({ products }: ProductsCatalogSectionProps) {
  const isDark = useSectionDarkBackground('products_catalog');
  const section = useSectionContent('products_catalog', {
    eyebrow: 'Product catalog',
    title: 'Lifts and moving systems',
    subtitle:
      'Passenger, freight, scenic, hospital, home, accessibility, escalators, and moving walkways.',
  });

  if (products.length === 0) return null;

  return (
    <section className={cn(sectionSurfaceClass(isDark), 'relative overflow-hidden')}>
      <ShaftAtmosphere isDark={isDark} showRail={false} />
      <Container className="relative z-10">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          size="large"
          theme={isDark ? 'dark' : 'light'}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCatalogCard key={product.id} product={product} index={index} isDark={isDark} />
          ))}
        </div>
      </Container>
    </section>
  );
}
