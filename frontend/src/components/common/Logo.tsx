import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import type { CompanyTextColors } from '@/hooks/useHeaderBrandingText';
import { CompanyBrandText } from '@/components/common/CompanyBrandText';
import { CompanyLogoImage } from '@/components/common/CompanyLogoImage';
import { isTransparentLogoUrl } from '@/utils/logo';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
  /** Header-only CMS text colors. Omit for footer and other surfaces. */
  textColors?: CompanyTextColors;
}

export function Logo({ variant = 'light', className, showText = true, textColors }: LogoProps) {
  const isLight = variant === 'light';
  const { name: companyName, tagline, logoSrc, logoMedia } = useCompanyBrand();
  const transparent = isTransparentLogoUrl(logoSrc, logoMedia);
  const nameParts = companyName.includes('-') ? companyName.split('-') : null;

  return (
    <Link to="/" className={cn('flex min-w-0 items-center gap-2 sm:gap-3', className)}>
      {logoSrc ? (
        <CompanyLogoImage
          src={logoSrc}
          alt={companyName ? `${companyName} logo` : 'Logo'}
          size="md"
          mediaHint={logoMedia}
          bare={isLight || transparent}
        />
      ) : null}
      {showText &&
        (textColors ? (
          <CompanyBrandText
            companyName={companyName}
            tagline={tagline}
            nameColor={textColors.nameColor}
            accentColor={textColors.accentColor}
            taglineColor={textColors.taglineColor}
          />
        ) : (
          <div className="min-w-0 leading-tight">
            <span
              className={cn(
                'block truncate text-sm font-medium tracking-wide sm:text-base',
                isLight ? 'text-white' : 'text-primary-900',
              )}
            >
              {companyName.trim().split(/\s+/).filter(Boolean).length > 2 ? (
                <>
                  <span className="sm:hidden">{companyName.trim().split(/\s+/)[0]}</span>
                  <span className="hidden sm:inline">
                    {nameParts ? (
                      <>
                        {nameParts[0]}-
                        <span className={isLight ? 'text-brand-gold-400' : 'text-brand-gold-500'}>
                          {nameParts.slice(1).join('-')}
                        </span>
                      </>
                    ) : (
                      companyName
                    )}
                  </span>
                </>
              ) : nameParts ? (
                <>
                  {nameParts[0]}-
                  <span className={isLight ? 'text-brand-gold-400' : 'text-brand-gold-500'}>
                    {nameParts.slice(1).join('-')}
                  </span>
                </>
              ) : (
                companyName
              )}
            </span>
            {tagline ? (
              <span
                className={cn(
                  'hidden truncate text-[10px] font-medium uppercase tracking-wider sm:block',
                  isLight ? 'text-slate-300' : 'text-primary-600',
                )}
              >
                {tagline}
              </span>
            ) : null}
          </div>
        ))}
    </Link>
  );
}
