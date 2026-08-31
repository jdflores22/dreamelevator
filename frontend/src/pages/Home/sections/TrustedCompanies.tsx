import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useClients } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { PageSection } from '@/components/common/SectionHeading';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ClientLogoMarquee } from '@/components/effects/ClientLogoMarquee';
import { Spinner } from '@/components/ui/Spinner';
import { useSectionContent, usePageSectionTheme } from '@/hooks/useSectionContent';
import { usePageVisibilityMap } from '@/hooks/usePageVisibility';

export function TrustedCompanies() {
  const { data: clients, isLoading } = useClients({ pageSize: 50 });
  const { isPagePublished } = usePageVisibilityMap();
  const showClientsPage = isPagePublished('clients');

  const section = useSectionContent('home_clients', {
    eyebrow: 'Trusted By',
    title: 'Organizations that rely on us',
    subtitle: 'Selected buildings and facilities we are proud to serve.',
  });

  const theme = usePageSectionTheme('home_clients');

  if (!isLoading && !clients?.length) return null;

  return (
    <PageSection sectionId="home_clients" variant="muted" className="!py-14 lg:!py-16">
      <Container className="mb-10">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          theme={theme}
        />
        {showClientsPage ? (
          <div className="mt-4">
            <Link
              to="/clients"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-brand-gold-600"
            >
              View all clients
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </Container>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <ClientLogoMarquee clients={clients!} variant="light" />
      )}
    </PageSection>
  );
}
