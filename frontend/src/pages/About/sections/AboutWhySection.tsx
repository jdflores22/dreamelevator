import { useCompanyHighlights } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CompanyHighlightGrid } from '@/components/marketing/CompanyHighlightGrid';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { cn } from '@/utils/cn';

export function AboutWhySection() {
  const { data: highlights, isLoading } = useCompanyHighlights();
  const isDark = useSectionDarkBackground('about_why');
  const section = useSectionContent('about_why', {
    eyebrow: 'What we do',
    title: 'Vertical transportation for every building',
    subtitle: 'Elevators, escalators, modernization, and maintenance specified for how each facility actually operates.',
  });

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          size="large"
          theme={isDark ? 'dark' : 'light'}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !highlights?.length ? (
          <p className={cn('text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No highlights published yet.
          </p>
        ) : (
          <CompanyHighlightGrid highlights={highlights} isDark={isDark} useHomepageRows={false} />
        )}
      </Container>
    </section>
  );
}
