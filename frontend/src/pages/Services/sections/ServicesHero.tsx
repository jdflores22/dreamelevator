import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/common/Container';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';
import { Button } from '@/components/ui/Button';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { looksLikeHtml } from '@/pages/Services/serviceCatalog';
import { richTextContentClass } from '@/utils/richTextClasses';
import { cn } from '@/utils/cn';

interface ServicesHeroProps {
  title: string;
  subtitle?: string;
  body?: string;
  highlight?: string;
  ctaLabel?: string;
  photos: string[];
}

export function ServicesHero({
  title,
  subtitle,
  body,
  highlight,
  ctaLabel,
  photos,
}: ServicesHeroProps) {
  const { name: companyName } = useCompanyBrand();

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <ShaftAtmosphere />
      <div
        className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-brand-gold-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary-700/5 blur-3xl"
        aria-hidden
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {companyName ? <p className="pro-eyebrow mb-5">{companyName}</p> : null}
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-pretty text-primary-900 sm:text-5xl lg:text-[3rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">{subtitle}</p>
            ) : null}

            {body ? (
              looksLikeHtml(body) ? (
                <div
                  className={cn(richTextContentClass, 'mt-6 max-w-xl text-base leading-relaxed')}
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              ) : (
                <p className="mt-6 max-w-xl whitespace-pre-wrap text-base leading-relaxed text-slate-600">
                  {body}
                </p>
              )
            ) : null}

            {highlight ? (
              <p className="mt-8 flex items-start gap-3 border-l-[3px] border-brand-gold-500 pl-4 text-base font-semibold tracking-tight text-primary-900">
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold-600" strokeWidth={1.5} />
                <span>{highlight}</span>
              </p>
            ) : null}

            {ctaLabel ? (
              <div className="mt-8">
                <Link to="/contact">
                  <Button size="lg">
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </motion.div>

          {photos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <ServicesPhotoPair photos={photos} title={title} highlight={highlight} />
            </motion.div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function ServicesPhotoPair({
  photos,
  title,
  highlight,
}: {
  photos: string[];
  title: string;
  highlight?: string;
}) {
  if (photos.length === 1) {
    return (
      <figure className="overflow-hidden bg-slate-100 shadow-[0_28px_64px_-32px_rgba(10,49,68,0.45)]">
        <img src={photos[0]} alt={title} className="aspect-[3/4] w-full object-cover" />
      </figure>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 lg:relative lg:aspect-[4/5] lg:max-w-none lg:grid-cols-none lg:gap-0">
      <figure className="overflow-hidden bg-slate-100 shadow-[0_28px_64px_-32px_rgba(10,49,68,0.45)] lg:absolute lg:left-0 lg:top-0 lg:z-10 lg:w-[62%]">
        <img src={photos[0]} alt={title} className="aspect-[3/4] w-full object-cover" />
      </figure>
      <figure className="overflow-hidden border-l-[3px] border-brand-gold-500 bg-slate-100 shadow-[0_24px_50px_-28px_rgba(10,49,68,0.5)] lg:absolute lg:bottom-0 lg:right-0 lg:z-20 lg:w-[54%]">
        <img
          src={photos[1]}
          alt={highlight || title}
          className="aspect-[3/4] w-full object-cover"
        />
      </figure>
    </div>
  );
}
