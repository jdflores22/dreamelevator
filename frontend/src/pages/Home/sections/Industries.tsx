import { Link } from 'react-router-dom';
import { useIndustries } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection, SectionHeading } from '@/components/common/SectionHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { resolveMediaUrl } from '@/utils/media';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { cn } from '@/utils/cn';

const brandBorders = [
  'border-b-brand-gold-500',
  'border-b-primary-700',
  'border-b-brand-gold-600',
] as const;

export function Industries() {
  const { data: industries, isLoading } = useIndustries();
  const sorted = [...(industries ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 6);

  const section = useSectionContent('home_industries', {
    eyebrow: 'Industries',
    title: 'Buildings we serve',
    subtitle: 'Residential, commercial, healthcare, hospitality, mixed-use, and industrial facilities.',
  });

  const theme = usePageSectionTheme('home_industries');

  return (
    <PageSection sectionId="home_industries" variant="muted" className="!py-10 sm:!py-20">
      <Container>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} theme={theme} />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center text-slate-500">No industries published yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((industry, index) => {
              const iconUrl = industry.iconUrl ? resolveMediaUrl(industry.iconUrl) : null;
              return (
                <Card
                  key={industry.id}
                  className={cn(
                    'overflow-hidden border-b-4 transition-shadow hover:shadow-md',
                    brandBorders[index % brandBorders.length],
                  )}
                >
                  <CardBody>
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt=""
                        className="mb-3 h-8 w-8 object-contain"
                      />
                    )}
                    <h3 className="font-medium text-primary-900">{industry.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {industry.shortDescription ||
                        `Vertical transportation specified for ${industry.name.toLowerCase()} buildings.`}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/industries" className="text-sm font-medium text-accent-600 hover:text-accent-700">
            Explore all industries →
          </Link>
        </div>
      </Container>
    </PageSection>
  );
}
