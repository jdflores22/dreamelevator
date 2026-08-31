import { ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useService, useServices } from '@/api/hooks';
import { SEOHead } from '@/components/common/SEOHead';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { richTextContentClass } from '@/utils/richTextClasses';
import { cn } from '@/utils/cn';
import { ServiceOfferingsList } from '@/pages/Services/ServiceOfferingsList';
import { looksLikeHtml, sortServices } from '@/pages/Services/serviceCatalog';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, isError } = useService(slug || '');
  const { data: services } = useServices();
  const { get } = useSiteSettingsMap();
  const ctaLabel = get('services_cta_label') || get('home_cta_primary_label');
  const relatedEyebrow = get('services_related_eyebrow');
  const relatedTitle = get('services_related_title');
  const darkList = useSectionDarkBackground('services_list');

  const related = sortServices(services ?? []).filter((item) => item.id !== service?.id);

  if (isLoading) return <PageLoader />;
  if (isError || !service) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-primary-900">Service not found</h1>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold text-primary-800">
          Back to services
        </Link>
      </Container>
    );
  }

  return (
    <>
      <SEOHead title={service.title} description={service.shortDescription} />
      <PageHero title={service.title} subtitle={service.shortDescription}>
        {ctaLabel ? (
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg">
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : null}
      </PageHero>

      {service.description ? (
        <section className={sectionSurfaceClass(false)}>
          <Container>
            <div className="max-w-3xl">
              {looksLikeHtml(service.description) ? (
                <div
                  className={cn(richTextContentClass, 'text-base leading-relaxed sm:text-lg')}
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-600 sm:text-lg">
                  {service.description}
                </p>
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className={sectionSurfaceClass(darkList, 'muted')}>
          <Container>
            {relatedTitle ? (
              <SectionHeading
                eyebrow={relatedEyebrow}
                title={relatedTitle}
                align="left"
                theme={darkList ? 'dark' : 'light'}
              />
            ) : null}
            <ServiceOfferingsList services={related} isDark={darkList} />
          </Container>
        </section>
      ) : null}
    </>
  );
}
