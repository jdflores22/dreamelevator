import { cn } from '@/utils/cn';
import { isTransparentLogoUrl } from '@/utils/logo';

interface CompanyLogoImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** From CMS `company_logo_media` — png/svg/webp keeps transparency */
  mediaHint?: string;
  /** Skip wrapper styling — use on auth/marketing surfaces */
  bare?: boolean;
}

const sizeClasses = {
  sm: 'h-9 max-w-[7rem]',
  md: 'h-9 max-w-[7rem] sm:h-11 sm:max-w-[10rem]',
  lg: 'h-14 max-w-[12rem]',
};

export function CompanyLogoImage({
  src,
  alt,
  size = 'md',
  className,
  mediaHint,
  bare = false,
}: CompanyLogoImageProps) {
  const transparent = isTransparentLogoUrl(src, mediaHint);

  const img = (
    <img
      src={src}
      alt={alt}
      className={cn(
        sizeClasses[size],
        'w-auto object-contain object-left',
        transparent && 'bg-transparent',
        bare && className,
      )}
    />
  );

  if (bare) {
    return img;
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center',
        !transparent && 'rounded-md bg-primary-900/90 p-1',
        className,
      )}
    >
      {img}
    </span>
  );
}

interface LogoPreviewFrameProps {
  src: string;
  alt: string;
  /** Match public header (navy) or admin checkerboard for transparency check */
  variant?: 'header' | 'checkerboard';
  className?: string;
  mediaHint?: string;
}

export function LogoPreviewFrame({
  src,
  alt,
  variant = 'header',
  className,
  mediaHint,
}: LogoPreviewFrameProps) {
  const transparent = isTransparentLogoUrl(src, mediaHint);

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl p-3',
        variant === 'header' && 'bg-primary-900',
        // Transparent logos preview on a clean neutral surface (no distracting
        // checkerboard, which users mistake for an added background). Only opaque
        // formats (JPG) get a subtle fill so their edges are visible.
        variant === 'checkerboard' && 'border border-slate-200 bg-white',
        !transparent && variant === 'checkerboard' && 'bg-slate-100',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-24 w-auto max-w-full bg-transparent object-contain"
      />
    </div>
  );
}
