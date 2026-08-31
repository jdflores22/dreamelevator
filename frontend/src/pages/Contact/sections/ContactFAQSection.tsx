import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFaqItems } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass, sectionTheme } from '@/utils/sectionSurface';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';

export function ContactFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { data: faqItems, isLoading } = useFaqItems();
  const sorted = [...(faqItems ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const isDark = useSectionDarkBackground('contact_faq');
  const theme = sectionTheme(isDark);
  const raw = useSectionContent('contact_faq');
  const section = {
    eyebrow: deecCopy(raw.eyebrow, 'FAQ'),
    title: deecCopy(raw.title, 'Common questions'),
    subtitle: deecCopy(
      raw.subtitle,
      'Brands we service, free assessments, shafts, modernization, and how to request a quote.',
    ),
  };

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          theme={theme}
        />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <p className={cn('text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No FAQ items published yet.
          </p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {sorted.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'overflow-hidden rounded-xl border',
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm',
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className={cn('font-semibold', isDark ? 'text-white' : 'text-primary-900')}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform',
                      isDark ? 'text-slate-400' : 'text-slate-400',
                      openIndex === index && 'rotate-180',
                    )}
                  />
                </button>
                {openIndex === index && (
                  <p
                    className={cn(
                      'border-t px-6 pb-5 pt-0 text-sm leading-relaxed',
                      isDark ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600',
                    )}
                  >
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
