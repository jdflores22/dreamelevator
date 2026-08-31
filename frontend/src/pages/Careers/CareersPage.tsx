import { useState } from 'react';
import { Briefcase, MapPin } from 'lucide-react';
import { useCareers } from '@/api/hooks';
import { CareerApplyModal } from '@/components/careers/CareerApplyModal';
import type { Career } from '@/types';
import { PageSEO } from '@/components/common/PageSEO';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { Card, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { usePageHeroContent } from '@/hooks/useSectionContent';

export default function CareersPage() {
  const { data: careers, isLoading } = useCareers();
  const [applyCareer, setApplyCareer] = useState<Career | null>(null);
  const hero = usePageHeroContent('careers_page', {
    title: 'Careers',
    subtitle: 'Join a team that keeps buildings moving safely.',
  });

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageSEO pageKey="careers" title="Careers" description="Join the team." />
      <PageHero title={hero.title} subtitle={hero.subtitle} />
      <Container className="py-16">
        <div className="space-y-4">
          {(careers || []).map((career) => (
            <Card key={career.id}>
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{career.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {career.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {career.location}
                    </span>
                  </div>
                  {career.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{career.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <Badge>{career.type}</Badge>
                  <Button size="sm" onClick={() => setApplyCareer(career)}>
                    Apply now
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
          {!careers?.length && (
            <p className="text-center text-slate-500">No open positions at the moment. Check back soon!</p>
          )}
        </div>
      </Container>
      <CareerApplyModal career={applyCareer} onClose={() => setApplyCareer(null)} />
    </>
  );
}
