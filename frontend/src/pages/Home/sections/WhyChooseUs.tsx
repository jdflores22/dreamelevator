import { useCompanyHighlights } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CompanyHighlightGrid } from '@/components/marketing/CompanyHighlightGrid';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

export function WhyChooseUs() {
  const { data: highlights, isLoading } = useCompanyHighlights();
  const section = useSectionContent('home_why', {
    eyebrow: 'Why us',
    title: 'Integrity, discipline, efficiency, accountability',
    subtitle: 'The standards that guide how we specify, install, and maintain every system.',
  });
  const theme = usePageSectionTheme('home_why');
  const isDark = theme === 'dark';

  return (
    <PageSection sectionId="home_why" variant="muted">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          size="large"
          theme={theme}
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
          <CompanyHighlightGrid highlights={highlights} isDark={isDark} useHomepageRows />
        )}
      </Container>
    </PageSection>
  );
}
