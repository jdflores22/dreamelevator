import { useIndustries } from '@/api/hooks';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { PageSEO } from '@/components/common/PageSEO';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

const brandBorders = [
  'border-b-brand-gold-500',
  'border-b-primary-700',
  'border-b-primary-500',
] as const;

export default function IndustriesPage() {
  const { data: industries, isLoading } = useIndustries();
  const sorted = [...(industries ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const hero = usePageHeroContent('industries_page', {
    title: 'Industries We Serve',
    subtitle: 'Domain expertise across diverse sectors.',
  });
  const darkList = useSectionDarkBackground('industries_list');

  return (
    <>
      <PageSEO
        pageKey="industries"
        title="Industries"
        description="Residential, commercial, healthcare, hospitality, mixed-use, and industrial buildings."
      />
      <PageHero title={hero.title} subtitle={hero.subtitle} />
      <section className={sectionSurfaceClass(darkList)}>
        <Container className="py-16">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center text-slate-500">No industries published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                        className="mb-3 h-10 w-10 object-contain"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-primary-900">{industry.name}</h3>
                    <p className="mt-3 text-sm text-slate-600">
                      {industry.shortDescription ||
                        `Vertical transportation specified for the unique demands of the ${industry.name.toLowerCase()} sector.`}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
        </Container>
      </section>
    </>
  );
}
