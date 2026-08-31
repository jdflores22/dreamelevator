import { useProcessSteps } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { ProcessRoadmap } from '@/components/marketing/ProcessRoadmap';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';

export function DevProcess() {
  const { data: steps, isLoading } = useProcessSteps();
  const sorted = [...(steps ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const section = useSectionContent('home_process', {
    eyebrow: 'How we work',
    title: 'From inquiry to handover',
    subtitle: 'Assessment, production, installation, and service — the same path every lift takes.',
  });

  const theme = usePageSectionTheme('home_process');

  return (
    <PageSection sectionId="home_process" variant="muted">
      <Container>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            No process steps published yet.
          </p>
        ) : (
          <ProcessRoadmap
            steps={sorted}
            variant={theme}
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        )}
      </Container>
    </PageSection>
  );
}
