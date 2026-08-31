import { useServices } from '@/api/hooks';
import { PageSEO } from '@/components/common/PageSEO';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { PageLoader } from '@/components/ui/Spinner';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { sectionSurfaceClass } from '@/utils/sectionSurface';
import { resolveMediaUrl } from '@/utils/media';
import { ServiceOfferingsList } from '@/pages/Services/ServiceOfferingsList';
import { ServicesHero } from '@/pages/Services/sections/ServicesHero';
import { findMaintenanceService, sortServices } from '@/pages/Services/serviceCatalog';

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const { get } = useSiteSettingsMap();
  const hero = usePageHeroContent('services_page');
  const featured = findMaintenanceService(services ?? []);
  const related = sortServices(services ?? []).filter((item) => item.id !== featured?.id);

  const title = featured?.title || hero.title;
  const subtitle = featured?.shortDescription || hero.subtitle || get('services_page_subtitle');
  const body = featured?.description || '';
  const highlight = get('services_page_highlight');
  const ctaLabel = get('services_cta_label') || get('home_cta_primary_label');
  const relatedEyebrow = get('services_related_eyebrow');
  const relatedTitle = get('services_related_title');
  const photos = [
    get('services_page_image') || '/uploads/pages/service-01.jpg',
    get('services_page_image_2') || '/uploads/pages/service-02.png',
  ]
    .map((src) => resolveMediaUrl(src))
    .filter(Boolean);

  const darkList = useSectionDarkBackground('services_list');

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO pageKey="services" title={title || 'Services'} description={subtitle} />

      <ServicesHero
        title={title}
        subtitle={subtitle}
        body={body}
        highlight={highlight}
        ctaLabel={ctaLabel}
        photos={photos}
      />

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
            <ServiceOfferingsList services={related} isDark={darkList} columns={2} />
          </Container>
        </section>
      ) : !featured && (services ?? []).length === 0 ? (
        <section className={sectionSurfaceClass(false)}>
          <Container>
            <p className="text-center text-slate-500">No services published yet.</p>
          </Container>
        </section>
      ) : null}
    </>
  );
}
