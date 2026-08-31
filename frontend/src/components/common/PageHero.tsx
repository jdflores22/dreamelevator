import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Container } from '@/components/common/Container';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function PageHero({ title, subtitle, children, className, backgroundImage }: PageHeroProps) {
  const { name: companyName } = useCompanyBrand();

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-20',
        className,
      )}
    >
      <ShaftAtmosphere />
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            aria-hidden
          />
          <div className="absolute inset-0 bg-white/90" />
        </>
      )}
      <Container className="relative">
        <div className="max-w-3xl border-l-[3px] border-brand-gold-500 pl-4 sm:pl-8">
          {companyName ? <p className="pro-eyebrow mb-4">{companyName}</p> : null}
          <h1 className="text-[1.85rem] font-semibold tracking-tight text-pretty text-primary-900 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:mt-5 sm:text-lg">{subtitle}</p>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
