import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageSEO } from '@/components/common/PageSEO';
import { Container } from '@/components/common/Container';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { DEEC_GALLERY_PHOTOS, localizeGallerySrc } from '@/constants/deecGalleryPhotos';
import { parseGalleryImages, type GalleryImage } from '@/utils/gallery';
import { resolveMediaUrl } from '@/utils/media';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export default function GalleryPage() {
  const { get } = useSiteSettingsMap();
  const { name: companyName } = useCompanyBrand();
  const hero = usePageHeroContent('gallery_page');
  const fromCms = parseGalleryImages(get('gallery_images', ''));
  const images = (fromCms.length > 0 ? fromCms : DEEC_GALLERY_PHOTOS).map((image) => ({
    ...image,
    src: resolveMediaUrl(localizeGallerySrc(image.src)),
  }));
  const darkList = useSectionDarkBackground('gallery_list');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const labels = images.map((image) => image.alt.trim()).filter(Boolean);
    return [...new Set(labels)];
  }, [images]);

  const visible = useMemo(() => {
    if (filter === 'all') return images;
    return images.filter((image) => image.alt === filter);
  }, [filter, images]);

  const active = activeIndex !== null ? visible[activeIndex] : null;

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= visible.length) setActiveIndex(null);
  }, [activeIndex, visible.length]);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((i) => (i === null ? i : (i + 1) % visible.length));
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((i) => (i === null ? i : (i - 1 + visible.length) % visible.length));
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeIndex, visible.length]);

  const featured = images.slice(0, 2);
  const title = hero.title;
  const subtitle = hero.subtitle;

  return (
    <>
      <PageSEO pageKey="gallery" title={title || 'Gallery'} description={subtitle} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <ShaftAtmosphere />
        <div
          className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-brand-gold-500/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {companyName ? <p className="pro-eyebrow mb-5">{companyName}</p> : null}
              <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-pretty text-primary-900 sm:text-5xl lg:text-[3rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">{subtitle}</p>
              ) : null}
              {images.length > 0 ? (
                <p className="mt-8 border-l-[3px] border-brand-gold-500 pl-4 text-sm font-semibold tabular-nums tracking-wide text-primary-900">
                  {String(images.length).padStart(2, '0')} photos
                </p>
              ) : null}
            </motion.div>

            {featured.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="grid grid-cols-2 gap-3"
              >
                {featured.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => {
                      setFilter('all');
                      setActiveIndex(index);
                    }}
                    className={cn(
                      'group overflow-hidden bg-slate-100 text-left shadow-[0_28px_64px_-32px_rgba(10,49,68,0.45)]',
                      index === 1 && 'sm:mt-8',
                    )}
                  >
                    <img
                      src={image.src}
                      alt={image.alt || title}
                      className="aspect-[3/4] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </motion.div>
            ) : null}
          </div>
        </Container>
      </section>

      <section className={sectionSurfaceClass(darkList, 'muted')}>
        <Container>
          {images.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white py-16 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-slate-500">No gallery photos published yet.</p>
            </div>
          ) : (
            <>
              {categories.length > 1 ? (
                <div className="-mx-3 mb-10 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                  <FilterChip
                    label="All"
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    isDark={darkList}
                  />
                  {categories.map((label) => (
                    <FilterChip
                      key={label}
                      label={label}
                      active={filter === label}
                      onClick={() => setFilter(label)}
                      isDark={darkList}
                    />
                  ))}
                </div>
              ) : null}

              <div className="columns-1 gap-3 sm:columns-2 md:columns-3 md:gap-4 lg:columns-4">
                {visible.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group mb-3 block w-full break-inside-avoid overflow-hidden bg-slate-100 text-left md:mb-4"
                  >
                    <span className="relative block">
                      <img
                        src={image.src}
                        alt={image.alt || 'Gallery photo'}
                        className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>

      {active ? (
        <GalleryLightbox
          image={active}
          index={activeIndex ?? 0}
          total={visible.length}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) => (i === null ? i : (i - 1 + visible.length) % visible.length))
          }
          onNext={() => setActiveIndex((i) => (i === null ? i : (i + 1) % visible.length))}
        />
      ) : null}
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  isDark,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
        active
          ? 'border-primary-900 bg-primary-900 text-white'
          : isDark
            ? 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white'
            : 'border-slate-200 bg-white text-primary-800 hover:border-brand-gold-400/70',
      )}
    >
      {label}
    </button>
  );
}

function GalleryLightbox({
  image,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  image: GalleryImage;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-primary-950/92 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Gallery photo'}
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-slate-300">{image.alt}</p>
        <button
          type="button"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center border border-white/15 text-white hover:border-brand-gold-400/60 hover:text-brand-gold-400"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <figure
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={resolveMediaUrl(image.src)}
          alt={image.alt || 'Gallery photo'}
          className="max-h-[min(70vh,calc(100dvh-8rem))] w-full object-contain shadow-[0_28px_64px_-24px_rgba(0,0,0,0.55)]"
        />
        <figcaption className="mt-4 flex w-full items-center justify-between gap-3 text-sm text-slate-300">
          {total > 1 ? (
            <div className="flex gap-2">
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center border border-white/15 text-white"
                aria-label="Previous photo"
                onClick={onPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center border border-white/15 text-white"
                aria-label="Next photo"
                onClick={onNext}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <span />
          )}
          <span className="font-display tabular-nums text-white/50">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
