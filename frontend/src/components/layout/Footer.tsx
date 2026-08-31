import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone, Smartphone } from 'lucide-react';
import { useServices } from '@/api/hooks';
import { Container } from '@/components/common/Container';
import { Logo } from '@/components/common/Logo';
import { NewsletterSignup } from '@/components/common/NewsletterSignup';
import { FacebookIcon, LinkedInIcon } from '@/components/common/SocialBrandIcons';
import { usePagePublishFlags } from '@/hooks/usePublishedNavLinks';
import { usePageVisibilityMap } from '@/hooks/usePageVisibility';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { isSocialLinkVisible } from '@/utils/socialLinks';
import { mailtoHref, splitContactList, telHref } from '@/utils/contact';
import { deecCopy } from '@/utils/deecCopy';
import { formatWebsiteHref } from '@/utils/media';

const EXPLORE_LINKS = [
  { label: 'About', href: '/about', pageKey: 'about' },
  { label: 'Services', href: '/services', pageKey: 'services' },
  { label: 'Products', href: '/products', pageKey: 'products' },
  { label: 'Gallery', href: '/gallery', pageKey: 'gallery' },
  { label: 'Clients', href: '/clients', pageKey: 'clients' },
  { label: 'Contact', href: '/contact', pageKey: 'contact' },
] as const;

function footerLegalName(name: string, tagline: string) {
  const brand = name.trim();
  const extra = tagline.trim();
  if (!extra) return brand;
  if (brand.toLowerCase().includes(extra.toLowerCase())) return brand;
  return `${brand} ${extra}`.replace(/\s+/g, ' ').trim();
}

export function Footer() {
  const { get } = useSiteSettingsMap();
  const { name, tagline } = useCompanyBrand();
  const { data: services } = useServices();
  const pages = usePagePublishFlags();
  const { map, isLoading } = usePageVisibilityMap();

  const exploreLinks = EXPLORE_LINKS.filter((link) => {
    if (isLoading) return true;
    return map[link.pageKey]?.isPublished !== false;
  });

  const topServices = pages.services
    ? [...(services ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5)
    : [];

  const footerText = deecCopy(
    get('footer_text'),
    'Our Experience, Your Advantage — elevators, escalators, and lifting equipment since 1996.',
  );
  const legalName = footerLegalName(name, tagline);
  const emails = [...new Set([get('company_email'), get('company_email_alt')].map((item) => item.trim()).filter(Boolean))];
  const phone = deecCopy(get('company_phone'), '');
  const mobiles = splitContactList(get('company_mobiles', ''));
  const address = deecCopy(get('company_address'), '');
  const website = deecCopy(get('company_website'), '');
  const websiteHref = website ? formatWebsiteHref(website) : '';
  const newsletterTitle = deecCopy(get('footer_newsletter_title'), 'Project updates');
  const newsletterBody = deecCopy(
    get('footer_newsletter_body'),
    'Occasional news on installations, service, and company announcements.',
  );

  const facebookUrl = get('social_facebook', '');
  const linkedinUrl = get('social_linkedin', '');
  const showLinkedin = isSocialLinkVisible(linkedinUrl, get('social_linkedin_enabled', 'true'));
  const showFacebook = isSocialLinkVisible(facebookUrl, get('social_facebook_enabled', 'true'));

  return (
    <footer className="relative border-t border-slate-800 bg-primary-950 text-slate-300">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-brand-gold-500" aria-hidden />
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo variant="light" />
            {footerText ? (
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{footerText}</p>
            ) : null}
            {(showLinkedin || showFacebook) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {showFacebook && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs font-medium text-slate-400 transition-colors hover:border-brand-gold-500/40 hover:text-brand-gold-400"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="h-3.5 w-3.5" />
                    Facebook
                  </a>
                )}
                {showLinkedin && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs font-medium text-slate-400 transition-colors hover:border-brand-gold-500/40 hover:text-brand-gold-400"
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {exploreLinks.length > 0 && (
            <div className="lg:col-span-2">
              <h4 className="font-display mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-slate-400 transition-colors hover:text-brand-gold-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pages.services && (
            <div className="lg:col-span-3">
              <h4 className="font-display mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white">
                Services
              </h4>
              <ul className="space-y-2.5 text-sm">
                {topServices.length > 0 ? (
                  topServices.map((service) => (
                    <li key={service.id}>
                      <Link
                        to={`/services/${service.slug}`}
                        className="text-slate-400 transition-colors hover:text-brand-gold-400"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link to="/services" className="text-slate-400 transition-colors hover:text-brand-gold-400">
                      All services
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="lg:col-span-3">
            <h4 className="font-display mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-white">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              {emails.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-slate-400">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-400" />
                  <a href={mailtoHref(item)} className="break-all hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
              {phone ? (
                <li className="flex items-center gap-2.5 text-slate-400">
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold-400" />
                  <a href={telHref(phone)} className="hover:text-white">
                    {phone}
                  </a>
                </li>
              ) : null}
              {mobiles.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-slate-400">
                  <Smartphone className="h-4 w-4 shrink-0 text-brand-gold-400" />
                  <a href={telHref(item)} className="hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
              {website && websiteHref ? (
                <li className="flex items-start gap-2.5 text-slate-400">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-400" />
                  <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="break-all hover:text-white">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-400" />
                  <span>{address}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <NewsletterSignup
            variant="dark"
            layout="row"
            title={newsletterTitle}
            description={newsletterBody}
          />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {legalName}. All rights reserved.
          </p>
          {(pages.privacy || pages.terms) && (
            <div className="flex gap-5">
              {pages.privacy && (
                <Link to="/privacy" className="hover:text-brand-gold-400">
                  Privacy
                </Link>
              )}
              {pages.terms && (
                <Link to="/terms" className="hover:text-brand-gold-400">
                  Terms
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
