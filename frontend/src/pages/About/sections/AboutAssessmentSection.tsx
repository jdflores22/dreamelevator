import { ClipboardCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function AboutAssessmentSection({
  title,
  body,
  note,
}: {
  title?: string;
  body?: string;
  note?: string;
}) {
  const isDark = useSectionDarkBackground('about_assessment');
  if (!title && !body && !note) return null;

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <div
          className={cn(
            'grid items-start gap-8 border-l-[3px] border-brand-gold-500 pl-6 sm:pl-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16',
          )}
        >
          <div>
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center',
                isDark ? 'bg-brand-gold-500/15' : 'bg-brand-gold-500/10',
              )}
            >
              <ClipboardCheck className="h-5 w-5 text-brand-gold-600" strokeWidth={1.5} />
            </div>
            {title ? (
              <h2
                className={cn(
                  'mt-5 text-2xl font-semibold tracking-tight sm:text-3xl',
                  isDark ? 'text-white' : 'text-primary-900',
                )}
              >
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', isDark ? 'text-slate-300' : 'text-slate-600')}>
                {body}
              </p>
            ) : null}
          </div>
          {note ? (
            <p className={cn('text-sm leading-relaxed sm:text-base', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {note}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
