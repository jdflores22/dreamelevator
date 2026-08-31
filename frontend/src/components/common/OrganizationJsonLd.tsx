import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { splitContactList } from '@/utils/contact';

export function OrganizationJsonLd() {
  const { get } = useSiteSettingsMap();
  const { logoSrc } = useCompanyBrand();
  const name = get('company_name');
  const tagline = get('company_tagline');
  const url = get('company_website');
  const emails = [...new Set([get('company_email'), get('company_email_alt')].map((item) => item.trim()).filter(Boolean))];
  const phones = [get('company_phone', ''), ...splitContactList(get('company_mobiles', ''))].filter(Boolean);
  const address = get('company_address', '');
  const logo = logoSrc || undefined;
  const siteUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: name || undefined,
    alternateName: tagline || 'Elevator & Escalator Corp.',
    description:
      'Supply, installation, modernization, and maintenance of elevators, escalators, and lifting equipment since 1996.',
    url: siteUrl,
    logo,
    email: emails.length > 1 ? emails : emails[0] || undefined,
    telephone: phones.length > 1 ? phones : phones[0] || undefined,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Las Piñas',
          addressCountry: 'PH',
        }
      : undefined,
    areaServed: 'PH',
    knowsAbout: ['Elevators', 'Escalators', 'Moving walkways', 'Lift modernization', 'Elevator maintenance'],
  };

  const safeJson = JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
