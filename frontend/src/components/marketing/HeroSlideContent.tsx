import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { HeroSlide } from '@/constants/heroCarousel';
import type { HeroColorTokens } from '@/constants/heroAppearance';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type HeroSlideContentProps = {
  slide: HeroSlide;
  colors: HeroColorTokens;
  isDark: boolean;
  animate?: boolean;
  /** Pin CTAs to the bottom inside a fixed-height carousel slide */
  fillHeight?: boolean;
};

export function HeroSlideContent({
  slide,
  colors,
  isDark,
  animate = true,
  fillHeight = false,
}: HeroSlideContentProps) {
  const wrapperClass = fillHeight ? 'flex h-full min-h-full flex-1 flex-col' : undefined;
  const ctaClass = fillHeight
    ? 'mt-auto flex gap-2 pt-5 sm:gap-3 sm:pt-6'
    : 'mt-5 flex gap-2 sm:mt-10 sm:gap-3';

  const body = (
    <div className={wrapperClass}>
      {slide.eyebrow && (
        <p
          className="font-display mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] sm:mb-5 sm:text-[13px] sm:tracking-[0.22em]"
          style={{ color: colors.eyebrow }}
        >
          {slide.eyebrow}
        </p>
      )}
      <h1 className="max-w-5xl text-[1.45rem] font-semibold leading-[1.2] tracking-tight text-pretty sm:text-4xl lg:text-5xl">
        <span style={{ color: colors.title }}>{slide.titleLine1}</span>
        {slide.titleHighlight ? (
          <>
            {' '}
            <span style={{ color: colors.titleHighlight }}>{slide.titleHighlight}</span>
          </>
        ) : null}
      </h1>

      {slide.description && (
        <p
          className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed sm:mt-8 sm:line-clamp-none sm:text-lg sm:leading-relaxed lg:text-xl"
          style={{ color: colors.body }}
        >
          {slide.description}
        </p>
      )}

      <div className={ctaClass}>
        {slide.ctaLabel && slide.ctaHref && (
          <Link to={slide.ctaHref} className="min-w-0 sm:flex-none">
            <Button
              size="md"
              variant={isDark ? 'secondary' : 'primary'}
              className="sm:h-auto sm:px-7 sm:py-3.5 sm:text-sm"
            >
              {slide.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
          <Link to={slide.secondaryCtaHref} className="hidden min-w-0 flex-1 sm:flex sm:flex-none">
            <Button
              size="md"
              variant="outline"
              className={cn(
                'w-full sm:h-auto sm:px-7 sm:py-3.5 sm:text-sm',
                isDark &&
                  'border-white/30 bg-white/5 text-white hover:border-white/40 hover:bg-white/10',
              )}
            >
              {slide.secondaryCtaLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  if (!animate) {
    return body;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      {body}
    </motion.div>
  );
}
