import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useServices } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { EquipmentGlyph, equipmentKindFromTitle } from '@/components/marketing/EquipmentGlyph';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { usePageSectionTheme } from '@/hooks/useSectionContent';
import { usePageVisibilityMap } from '@/hooks/usePageVisibility';
import { cn } from '@/utils/cn';

export function HomeIntroBanner() {
  const { get } = useSiteSettingsMap();
  const { data: services } = useServices();
  const { isPagePublished } = usePageVisibilityMap();
  const showAbout = isPagePublished('about');
  const showServices = isPagePublished('services');

  const eyebrow = get('home_intro_eyebrow');
  const line1 = get('home_intro_line1');
  const line2 = get('home_intro_line2');
  const line3 = get('home_intro_line3');
  const introBody = get('home_intro_body');
  const storyLabel = get('home_intro_story_label');
  const servicesLabel = get('home_intro_services_label');

  const theme = usePageSectionTheme('home_intro');
  const isDark = theme === 'dark';
  const items = [...(services ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasHeading = Boolean(line1 || line2 || line3);

  return (
    <PageSection sectionId="home_intro" variant="white">
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {eyebrow ? (
              <p className={isDark ? 'pro-eyebrow-dark mb-5' : 'pro-eyebrow mb-5'}>{eyebrow}</p>
            ) : null}
            {hasHeading ? (
              <h2
                className={cn(
                  'text-2xl font-semibold leading-tight tracking-tight text-pretty sm:text-4xl lg:text-[2.75rem]',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {line1}
                {line2 ? (
                  <>
                    {line1 ? ' ' : ''}
                    <span className={isDark ? 'text-brand-gold-400' : 'text-primary-700'}>{line2}</span>
                  </>
                ) : null}
                {line3 ? (
                  <span className={cn('block', isDark ? 'text-slate-300' : 'text-slate-500')}>{line3}</span>
                ) : null}
              </h2>
            ) : null}
            {introBody ? (
              <p
                className={cn(
                  'mt-6 max-w-xl text-base leading-relaxed sm:text-lg',
                  isDark ? 'text-slate-300' : 'text-slate-600',
                )}
              >
                {introBody}
              </p>
            ) : null}
            {(showAbout && storyLabel) || (showServices && servicesLabel) ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                {showAbout && storyLabel ? (
                  <Link
                    to="/about"
                    className={cn(
                      'inline-flex items-center gap-2 text-sm font-semibold',
                      isDark ? 'text-brand-gold-400 hover:text-brand-gold-300' : 'sm-link',
                    )}
                  >
                    {storyLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {showServices && servicesLabel ? (
                  <Link
                    to="/services"
                    className={cn(
                      'inline-flex items-center gap-2 text-sm font-semibold',
                      isDark ? 'text-white/80 hover:text-white' : 'text-primary-800 hover:text-brand-gold-600',
                    )}
                  >
                    {servicesLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          {items.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className={cn(
                'divide-y border-y',
                isDark ? 'divide-white/10 border-white/10' : 'divide-slate-200 border-slate-200',
              )}
            >
              {items.map((item, index) => (
                <li key={item.id}>
                  <Link
                    to={`/services/${item.slug}`}
                    className={cn(
                      'group flex items-start gap-4 py-4 transition-colors sm:items-center',
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50',
                    )}
                  >
                    <EquipmentGlyph
                      kind={equipmentKindFromTitle(item.title)}
                      className={cn('mt-0.5 shrink-0 sm:mt-0', isDark ? 'text-white' : 'text-primary-800')}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'font-display text-base font-semibold uppercase tracking-[0.12em]',
                          isDark ? 'text-white' : 'text-primary-900',
                        )}
                      >
                        {item.title}
                      </p>
                      {item.shortDescription ? (
                        <p className={cn('mt-1 text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>
                          {item.shortDescription}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'font-display hidden shrink-0 text-xl font-semibold tabular-nums sm:block',
                        isDark ? 'text-white/20' : 'text-slate-300',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </div>
      </Container>
    </PageSection>
  );
}
