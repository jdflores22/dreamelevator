import { useProducts } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSEO } from '@/components/common/PageSEO';
import { FeaturedProductSpotlight } from '@/components/marketing/FeaturedProductSpotlight';
import { PageLoader } from '@/components/ui/Spinner';
import { useProductsSectionsVisibility } from '@/hooks/useSectionContent';
import { ProductsHero } from '@/pages/Products/sections/ProductsHero';
import { ProductsCatalogSection } from '@/pages/Products/sections/ProductsCatalogSection';
import { ProductsCTA } from '@/pages/Products/sections/ProductsCTA';

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const sections = useProductsSectionsVisibility();
  const sorted = [...(products ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted.find((p) => p.isFeatured) ?? null;
  const catalog = featured ? sorted.filter((p) => p.id !== featured.id) : sorted;

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO
        pageKey="products"
        title="Products"
        description="Passenger, freight, scenic, hospital, home, and accessibility lifts — plus escalators and moving walkways."
      />

      <ProductsHero productCount={sorted.length} hasFeatured={Boolean(featured)} />

      {sections.products_featured && featured && (
        <FeaturedProductSpotlight
          product={featured}
          contentPrefix="products_featured"
          sectionId="products_featured"
        />
      )}

      {sections.products_catalog && catalog.length > 0 && (
        <ProductsCatalogSection products={catalog} />
      )}

      {sorted.length === 0 && (
        <Container className="py-20">
          <p className="text-center text-slate-500">No products published yet.</p>
        </Container>
      )}

      {sections.products_cta && <ProductsCTA />}
    </>
  );
}
