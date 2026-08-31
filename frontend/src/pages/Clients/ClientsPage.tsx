import { Building2, MapPin } from 'lucide-react';
import { useClients } from '@/api/hooks';
import { PageSEO } from '@/components/common/PageSEO';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { Card, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { usePageHeroContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { resolveMediaUrl, formatWebsiteHref } from '@/utils/media';
import { sectionSurfaceClass } from '@/utils/sectionSurface';

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients({ pageSize: 50 });
  const hero = usePageHeroContent('clients_page', {
    title: 'Our valued clients',
    subtitle: 'Buildings and facilities we are proud to serve.',
  });
  const darkList = useSectionDarkBackground('clients_list');
  const sorted = [...(clients ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO
        pageKey="clients"
        title="Our valued clients"
        description="Buildings and facilities served by DREAM Elevator & Escalator Corp."
      />
      <PageHero title={hero.title} subtitle={hero.subtitle} />
      <section className={sectionSurfaceClass(darkList)}>
        <Container className="py-16">
          {sorted.length === 0 ? (
            <p className="text-center text-slate-500">No clients published yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((client) => {
                const href = client.website ? formatWebsiteHref(client.website) : '';
                const inner = (
                  <CardBody className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      {client.logoUrl ? (
                        <img
                          src={resolveMediaUrl(client.logoUrl)}
                          alt=""
                          className="max-h-8 max-w-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-brand-gold-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-primary-900">{client.name}</h2>
                      {client.location ? (
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-500" />
                          {client.location}
                        </p>
                      ) : null}
                    </div>
                  </CardBody>
                );

                return href && href !== '#' ? (
                  <a key={client.id} href={href} target="_blank" rel="noopener noreferrer">
                    <Card className="h-full transition-shadow hover:shadow-md">{inner}</Card>
                  </a>
                ) : (
                  <Card key={client.id}>{inner}</Card>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
