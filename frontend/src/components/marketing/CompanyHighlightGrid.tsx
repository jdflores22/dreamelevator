import { motion } from 'framer-motion';
import type { CompanyHighlight } from '@/types';
import { HexagonBadge } from '@/components/marketing/HexagonBadge';
import { cn } from '@/utils/cn';

const GOLD_STROKE = '#f7971f';

function HighlightCard({
  item,
  displayIndex,
  isDark,
}: {
  item: CompanyHighlight;
  displayIndex: number;
  isDark: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: displayIndex * 0.05, duration: 0.4 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-sm border p-6 transition-all duration-300',
        isDark
          ? 'border-white/10 bg-white/[0.03] hover:border-brand-gold-400/40 hover:bg-white/[0.06]'
          : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-brand-gold-400/60 hover:shadow-[0_24px_50px_-30px_rgba(10,49,68,0.5)]',
      )}
    >
      <div className="mb-5">
        <HexagonBadge
          size="md"
          stroke={GOLD_STROKE}
          isDark={isDark}
          fillClassName={cn(
            isDark
              ? 'bg-white/[0.08] text-brand-gold-400 group-hover:bg-brand-gold-400/15'
              : 'bg-brand-gold-500/10 text-brand-gold-600 group-hover:bg-brand-gold-500 group-hover:text-white',
          )}
        >
          <span className="text-sm font-bold tabular-nums transition-colors duration-300">
            {String(displayIndex).padStart(2, '0')}
          </span>
        </HexagonBadge>
      </div>

      <h3
        className={cn(
          'text-lg font-semibold tracking-tight',
          isDark ? 'text-white' : 'text-primary-900',
        )}
      >
        {item.title}
      </h3>
      <p
        className={cn(
          'mt-2 flex-1 text-sm leading-relaxed',
          isDark ? 'text-slate-400' : 'text-slate-600',
        )}
      >
        {item.description}
      </p>

      <span className="mt-5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-brand-gold-500/70 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </motion.div>
  );
}

export interface CompanyHighlightGridProps {
  highlights: CompanyHighlight[];
  isDark: boolean;
  useHomepageRows?: boolean;
}

export function CompanyHighlightGrid({
  highlights,
  isDark,
  useHomepageRows = true,
}: CompanyHighlightGridProps) {
  const sorted = [...highlights].sort((a, b) => a.sortOrder - b.sortOrder);

  const items = useHomepageRows
    ? (() => {
        const row1 = sorted.filter((h) => (h.homepageRow ?? 1) === 1);
        const row2 = sorted.filter((h) => (h.homepageRow ?? 1) === 2);
        const preferred = [...row1, ...row2];
        return (preferred.length > 0 ? preferred : sorted).slice(0, 4);
      })()
    : sorted;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <HighlightCard key={item.id} item={item} displayIndex={index + 1} isDark={isDark} />
      ))}
    </div>
  );
}
