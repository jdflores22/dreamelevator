import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SoftwareProduct } from '@/types';
import { HexagonBadge } from '@/components/marketing/HexagonBadge';
import { parseJsonArray } from '@/utils/jsonArray';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

const GOLD_STROKE = '#f7971f';

interface ProductCatalogCardProps {
  product: SoftwareProduct;
  index: number;
  isDark?: boolean;
}

export function ProductCatalogCard({ product, index, isDark = false }: ProductCatalogCardProps) {
  const logoUrl = product.logoUrl ? resolveMediaUrl(product.logoUrl) : null;
  const screenshots = parseJsonArray(product.screenshotsJson);
  const screenshotUrl = screenshots[0] ? resolveMediaUrl(screenshots[0]) : null;
  const features = parseJsonArray(product.featuresJson).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
    >
      <Link to={`/products/${product.slug}`} className="group block h-full">
        <article
          className={cn(
            'relative flex h-full flex-col overflow-hidden rounded-sm border transition-all duration-300',
            isDark
              ? 'border-white/10 bg-white/[0.03] hover:border-brand-gold-400/40 hover:bg-white/[0.06]'
              : 'border-slate-200 bg-white/90 backdrop-blur-[2px] hover:-translate-y-1 hover:border-brand-gold-400/55 hover:shadow-[0_24px_50px_-28px_rgba(10,49,68,0.45)]',
          )}
        >
          <span className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-transparent via-brand-gold-500 to-transparent transition-transform duration-300 group-hover:scale-x-100" />

          <div
            className={cn(
              'relative aspect-[16/10] overflow-hidden',
              isDark ? 'bg-white/[0.04]' : 'bg-slate-100',
            )}
          >
            {screenshotUrl ? (
              <>
                <img
                  src={screenshotUrl}
                  alt=""
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t',
                    isDark
                      ? 'from-primary-950/80 via-primary-950/20 to-transparent'
                      : 'from-primary-900/50 via-transparent to-transparent',
                  )}
                />
              </>
            ) : (
              <div
                className={cn(
                  'flex h-full items-center justify-center',
                  isDark
                    ? 'bg-gradient-to-br from-white/[0.04] to-transparent'
                    : 'bg-gradient-to-br from-brand-gold-500/5 via-white to-primary-50/40',
                )}
              >
                <HexagonBadge
                  size="lg"
                  stroke={GOLD_STROKE}
                  isDark={isDark}
                  fillClassName={isDark ? 'bg-white/[0.08] text-brand-gold-400' : 'bg-white text-brand-gold-600'}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="max-h-9 max-w-9 object-contain" />
                  ) : (
                    <span className="text-lg font-bold">{product.name.charAt(0)}</span>
                  )}
                </HexagonBadge>
              </div>
            )}

            {logoUrl && screenshotUrl && (
              <div className="absolute bottom-3 left-3">
                <HexagonBadge
                  size="sm"
                  stroke={GOLD_STROKE}
                  isDark={isDark}
                  fillClassName="bg-white"
                >
                  <img src={logoUrl} alt="" className="max-h-5 max-w-5 object-contain" />
                </HexagonBadge>
              </div>
            )}

            <span
              className={cn(
                'absolute right-3 top-3 font-mono text-xs font-semibold tabular-nums',
                isDark ? 'text-white/35' : 'text-white/80',
                !screenshotUrl && (isDark ? 'text-white/25' : 'text-slate-300'),
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <div className="mb-3 flex items-start gap-3">
              {screenshotUrl && !logoUrl && (
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-l-[3px] border-brand-gold-500 text-xs font-bold',
                    isDark ? 'bg-white/8 text-brand-gold-400' : 'bg-brand-gold-500/10 text-brand-gold-600',
                  )}
                >
                  {product.name.charAt(0)}
                </span>
              )}
              <h2
                className={cn(
                  'text-lg font-semibold tracking-tight',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {product.name}
              </h2>
            </div>

            <p
              className={cn(
                'line-clamp-2 flex-1 text-sm leading-relaxed',
                isDark ? 'text-slate-400' : 'text-slate-600',
              )}
            >
              {product.shortDescription}
            </p>

            {features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className={cn(
                      'inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium',
                      isDark
                        ? 'border-white/10 bg-white/[0.04] text-slate-300'
                        : 'border-brand-gold-500/20 bg-brand-gold-500/5 text-primary-800',
                    )}
                  >
                    {feature.length > 28 ? `${feature.slice(0, 26)}…` : feature}
                  </span>
                ))}
              </div>
            )}

            <span
              className={cn(
                'mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
                isDark
                  ? 'text-brand-gold-400 group-hover:text-brand-gold-300'
                  : 'text-primary-800 group-hover:text-brand-gold-600',
              )}
            >
              View product
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
