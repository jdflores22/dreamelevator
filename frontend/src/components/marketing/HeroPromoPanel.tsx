import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useHeroAppearance } from '@/hooks/useHeroAppearance';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { cn } from '@/utils/cn';

export function HeroPromoPanel({
  className,
  isDark = false,
}: {
  className?: string;
  isDark?: boolean;
}) {
  const { get } = useSiteSettingsMap();
  const { colors } = useHeroAppearance();
  const companyName = get('company_name');

  const eyebrow = get('hero_panel_eyebrow', 'Request a quote');
  const title = get('hero_panel_title', 'Have a project? We want to work with you.');
  const body = get(
    'hero_panel_body',
    companyName
      ? `${companyName} supplies, installs, modernizes, and maintains elevators, escalators, and related lifting equipment. Free assessment is available in Metro Manila and nearby cities.`
      : 'We supply, install, modernize, and maintain elevators, escalators, and related lifting equipment. Free assessment is available in Metro Manila and nearby cities.',
  );
  const pointsRaw = get(
    'hero_panel_points',
    'Free Metro Manila assessment,All brands serviced,Supply & installation,Maintenance & modernization',
  );
  const points = pointsRaw.split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={cn(
        'rounded-sm border-l-[3px] border p-4 shadow-lg backdrop-blur-md sm:p-7',
        isDark ? 'shadow-black/20' : 'shadow-primary-900/5',
        className,
      )}
      style={{
        backgroundColor: isDark ? 'rgba(6, 31, 44, 0.9)' : colors.panelBg,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : colors.panelBorder,
        borderLeftColor: '#f7971f',
        borderLeftWidth: 3,
      }}
    >
      <p
        className="font-display mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:mb-4 sm:text-[13px] sm:tracking-[0.22em]"
        style={{ color: colors.eyebrow }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-base font-semibold leading-snug tracking-tight sm:text-2xl"
        style={{ color: isDark ? '#ffffff' : colors.title }}
      >
        {title}
      </h2>
      {body ? (
        <p
          className="mt-2 hidden text-sm leading-relaxed sm:mt-4 sm:block"
          style={{ color: colors.body }}
        >
          {body}
        </p>
      ) : null}

      {points.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:mt-5 sm:gap-2.5">
          {points.map((point) => (
            <li
              key={point}
              className={cn(
                'flex items-start gap-2 text-[13px] leading-snug sm:gap-2.5 sm:text-sm',
                isDark ? 'text-slate-200' : 'text-slate-600',
              )}
            >
              <CheckCircle2
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-400 sm:h-4 sm:w-4"
                strokeWidth={1.5}
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/contact" className="mt-4 block sm:mt-7">
        <Button className="w-full" size="md" variant={isDark ? 'secondary' : 'primary'}>
          Request a quote
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </motion.aside>
  );
}
