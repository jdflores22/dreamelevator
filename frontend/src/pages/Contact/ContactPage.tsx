import { PageSEO } from '@/components/common/PageSEO';
import { useContactSectionsVisibility } from '@/hooks/useSectionContent';
import { ContactHero } from '@/pages/Contact/sections/ContactHero';
import { ContactMainSection } from '@/pages/Contact/sections/ContactMainSection';
import { ContactExpectSection } from '@/pages/Contact/sections/ContactExpectSection';
import { ContactFAQSection } from '@/pages/Contact/sections/ContactFAQSection';
import { ContactMapSection } from '@/pages/Contact/sections/ContactMapSection';

export default function ContactPage() {
  const sections = useContactSectionsVisibility();

  return (
    <>
      <PageSEO
        pageKey="contact"
        title="Contact"
        description="Get in touch for a quote, free assessment, installation, modernization, or maintenance."
      />

      <ContactHero />

      {sections.contact_main && <ContactMainSection />}

      {sections.contact_map && <ContactMapSection />}

      {sections.contact_expect && <ContactExpectSection />}

      {sections.contact_faq && <ContactFAQSection />}
    </>
  );
}
