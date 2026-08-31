import { useProcessSteps } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { ProcessRoadmap } from '@/components/marketing/ProcessRoadmap';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function AboutProcessSection() {
  const { data: processSteps, isLoading } = useProcessSteps();
  const isDark = useSectionDarkBackground('about_process', false);
  const section = useSectionContent('about_process', {
    eyebrow: 'How we work',
    title: 'From inquiry to handover',
    subtitle: 'Assessment, production, installation, and service — the same path every lift takes.',
  });
  const sorted = [...(processSteps ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <p className={cn('text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No process steps published yet.
          </p>
        ) : (
          <ProcessRoadmap
            steps={sorted}
            variant={isDark ? 'dark' : 'light'}
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        )}
      </Container>
    </section>
  );
}
