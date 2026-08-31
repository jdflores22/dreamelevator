import { useProducts } from '@/api/hooks';
import { FeaturedProductSpotlight } from '@/components/marketing/FeaturedProductSpotlight';
import { Spinner } from '@/components/ui/Spinner';

export function FeaturedProduct() {
  const { data: products, isLoading } = useProducts();
  const featured = (products ?? []).find((p) => p.isFeatured) ?? null;

  if (isLoading) {
    return (
      <section className="flex justify-center border-b border-slate-200 bg-white py-20">
        <Spinner size="lg" />
      </section>
    );
  }

  if (!featured) return null;

  return <FeaturedProductSpotlight product={featured} />;
}
