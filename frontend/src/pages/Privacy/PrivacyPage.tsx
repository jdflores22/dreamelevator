import { SEOHead } from '@/components/common/SEOHead';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';

export default function PrivacyPage() {
  const { get } = useSiteSettingsMap();
  const content = get(
    'privacy_content',
    '<p>Last updated: August 2026</p><h2>Information We Collect</h2><p>We collect information you provide directly, such as when you request a quote or fill out our contact form.</p><h2>How We Use Your Information</h2><p>We use collected information to respond to inquiries, prepare assessments, and provide service.</p><h2>Contact</h2><p>For privacy-related inquiries, contact us at elevatordream@yahoo.com.</p>',
  );

  return (
    <>
      <SEOHead title="Privacy Policy" />
      <PageHero title="Privacy Policy" />
      <Container className="py-16">
        <div
          className="prose prose-slate mx-auto max-w-3xl space-y-6 text-slate-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </>
  );
}
