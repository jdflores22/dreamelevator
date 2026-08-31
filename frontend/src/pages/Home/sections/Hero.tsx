import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePageVisibilityMap } from '@/hooks/usePageVisibility';
import { useHeroAppearance } from '@/hooks/useHeroAppearance';
import {
  useHeroCarouselOptions,
  useHeroLayoutMode,
  useHeroSlides,
} from '@/hooks/useHeroSlides';
import { HeroCarousel } from '@/components/marketing/HeroCarousel';
import { HeroHighlights } from '@/components/marketing/HeroHighlights';
import { HeroPromoPanel } from '@/components/marketing/HeroPromoPanel';
import { HeroSlideContent } from '@/components/marketing/HeroSlideContent';
import type { HeroSlide } from '@/constants/heroCarousel';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { resolveMediaUrl } from '@/utils/media';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';
import { cn } from '@/utils/cn';

export function Hero() {
  const { isPagePublished } = usePageVisibilityMap();
  const showAbout = isPagePublished('about');
  const { get } = useSiteSettingsMap();
  const { colors, isDark, mainStyle, cssVars, imageOverlayStyle } = useHeroAppearance();
  const layoutMode = useHeroLayoutMode();
  const carouselSlides = useHeroSlides();
  const { intervalMs, showPanel, autoplay } = useHeroCarouselOptions();
  const [carouselIndex, setCarouselIndex] = useState(0);

  const staticSlide = useMemo<HeroSlide>(
    () => ({
      eyebrow: get('hero_agency_label', '') || get('hero_tagline', 'Vertical transportation since 1996'),
      titleLine1: get('hero_title_line1', 'An uplifting experience'),
      titleHighlight: get('hero_title_highlight', 'for every building'),
      description: get(
        'hero_description',
        'We offer elevators, escalators, and other lifting equipment — from supply and installation to modernization and long-term service.',
      ),
      ctaLabel: 'Learn more',
      ctaHref: showAbout ? '/about' : '/services',
      secondaryCtaLabel: 'Get a quote',
      secondaryCtaHref: '/contact',
      backgroundImage: get('hero_background_image', ''),
    }),
    [get, showAbout],
  );

  const isCarousel = layoutMode === 'carousel' && carouselSlides.length > 0;
  const activeSlide = isCarousel ? carouselSlides[carouselIndex] ?? carouselSlides[0] : staticSlide;
  const backgroundImage = resolveMediaUrl(
    activeSlide?.backgroundImage || get('hero_background_image') || '',
  );

  const onSlideChange = useCallback((index: number) => {
    setCarouselIndex(index);
  }, []);

  const showPromoPanel = !isCarousel || showPanel;
  const gridCols = showPromoPanel ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'lg:grid-cols-1';

  return (
    <section style={{ ...cssVars, backgroundColor: colors.highlightsBg }}>
      <div
        className={cn('relative overflow-hidden border-b', isDark ? 'border-white/10' : 'border-slate-200/60')}
        style={backgroundImage ? { backgroundColor: colors.bg } : mainStyle}
      >
        {!backgroundImage ? <ShaftAtmosphere isDark={isDark} showRail={false} /> : null}
        <AnimatePresence mode="wait">
          {backgroundImage && (
            <motion.div
              key={backgroundImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={backgroundImage}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover object-[72%_center] blur-[8px] saturate-[0.6] sm:blur-[14px] sm:saturate-[0.55]"
              />
              <div className="absolute inset-0" style={{ background: imageOverlayStyle }} />
              <div className="absolute inset-0 bg-primary-950/40 sm:hidden" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            'relative z-10 mx-auto grid max-w-7xl items-start gap-5 px-3 pb-8 pt-7 sm:items-center sm:gap-10 sm:px-6 sm:pb-20 sm:pt-20 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-24',
            gridCols,
          )}
        >
          <div>
            {isCarousel ? (
              <HeroCarousel
                slides={carouselSlides}
                colors={colors}
                isDark={isDark}
                intervalMs={intervalMs}
                autoplay={autoplay}
                onSlideChange={onSlideChange}
              />
            ) : (
              <HeroSlideContent slide={staticSlide} colors={colors} isDark={isDark} animate={false} />
            )}
          </div>

          {showPromoPanel && <HeroPromoPanel isDark={isDark} />}
        </div>
      </div>

      <HeroHighlights />
    </section>
  );
}
