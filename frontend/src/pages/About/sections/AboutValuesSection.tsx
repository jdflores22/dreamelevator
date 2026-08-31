import { motion } from 'framer-motion';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function parseCoreValues(raw: string) {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AboutValuesSection({
  eyebrow,
  title,
  values,
}: {
  eyebrow?: string;
  title?: string;
  values: string[];
}) {
  const isDark = useSectionDarkBackground('about_values');
  if (values.length === 0) return null;

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        {title ? (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            align="left"
            theme={isDark ? 'dark' : 'light'}
          />
        ) : null}
        <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <motion.li
              key={value}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className={cn(
                'border-t px-1 py-6',
                isDark ? 'border-white/10' : 'border-slate-200',
              )}
            >
              <span
                className={cn(
                  'font-display text-sm font-semibold tabular-nums',
                  isDark ? 'text-white/25' : 'text-slate-300',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <p
                className={cn(
                  'mt-3 font-display text-lg font-semibold uppercase tracking-[0.12em]',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {value}
              </p>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
