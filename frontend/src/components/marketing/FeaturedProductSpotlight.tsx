import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SoftwareProduct } from '@/types';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { useSectionContent } from '@/hooks/useSectionContent';
import { resolveMediaUrl } from '@/utils/media';
import { parseJsonArray } from '@/utils/jsonArray';
import { cn } from '@/utils/cn';

const SLIDE_INTERVAL_MS = 4500;

function productPhotos(screenshotUrls: string[], logoUrl: string | null): string[] {
  if (screenshotUrls.length > 0) return screenshotUrls;
  if (logoUrl) return [logoUrl];
  return [];
}

function FeaturedProductMedia({
  productName,
  photos,
}: {
  productName: string;
  photos: string[];
}) {
  const isSlider = photos.length >= 2;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const screenshotsKey = photos.join('|');

  useEffect(() => {
    setActive(0);
  }, [screenshotsKey]);

  useEffect(() => {
    if (!isSlider || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % photos.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isSlider, paused, photos.length]);

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + photos.length) % photos.length);
  };

  const current = photos[isSlider ? active : 0];

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shadow-[0_28px_64px_-32px_rgba(10,49,68,0.45)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {current ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current}
            src={current}
            alt={productName}
            className="absolute inset-0 size-full object-cover object-center"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-slate-400">
            {productName}
          </p>
        </div>
      )}

      {isSlider ? (
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="inline-flex h-11 w-11 items-center justify-center bg-white/90 text-primary-900 shadow-sm hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Product photos">
            {photos.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Go to photo ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  'h-1.5 transition-all',
                  index === active ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="inline-flex h-11 w-11 items-center justify-center bg-white/90 text-primary-900 shadow-sm hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export interface FeaturedProductSpotlightProps {
  product: SoftwareProduct;
  contentPrefix?: string;
  showHeading?: boolean;
  sectionId?: string;
  anchorId?: string;
  className?: string;
}

export function FeaturedProductSpotlight({
  product,
  contentPrefix = 'home_featured_product',
  showHeading = true,
  anchorId = 'featured-product',
  className,
}: FeaturedProductSpotlightProps) {
  const section = useSectionContent(contentPrefix, {
    eyebrow: 'Latest product',
    title: 'A compact lift for homes and villas',
    subtitle:
      'Passenger, scenic, and residential systems engineered for tight shafts and everyday reliability.',
  });

  const logoUrl = product.logoUrl ? resolveMediaUrl(product.logoUrl) : null;
  const screenshotUrls = parseJsonArray(product.screenshotsJson)
    .map((url) => resolveMediaUrl(url))
    .filter(Boolean);
  const photos = productPhotos(screenshotUrls, logoUrl);
  const features = parseJsonArray(product.featuresJson).slice(0, 4);

  return (
    <section
      id={anchorId}
      className={cn('border-b border-slate-200 bg-white py-16 sm:py-20 lg:py-24', className)}
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="order-first lg:order-last"
          >
            <FeaturedProductMedia productName={product.name} photos={photos} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {showHeading && section.eyebrow ? (
              <p className="pro-eyebrow mb-4">{section.eyebrow}</p>
            ) : null}

            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-pretty text-primary-900 sm:text-4xl">
              {product.name}
            </h2>
            <span className="mt-4 block h-[3px] w-10 bg-brand-gold-500" aria-hidden />

            {product.shortDescription ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-slate-600 sm:text-lg">
                {product.shortDescription}
              </p>
            ) : section.subtitle ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-slate-600 sm:text-lg">
                {section.subtitle}
              </p>
            ) : null}

            {features.length > 0 ? (
              <ul className="mt-8 max-w-xl space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary-600" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to={`/products/${product.slug}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  View product
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Request a quote</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
