import { Globe, Mail, MapPin, Phone, ArrowUpRight, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { sectionSurfaceClass, sectionTheme } from '@/utils/sectionSurface';
import { formatWebsiteHref } from '@/utils/media';
import { mailtoHref, splitContactList, telHref } from '@/utils/contact';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';
import { ContactFormCard } from './ContactFormCard';
import { ContactOfficeHours } from './ContactOfficeHours';

const QUICK_LINKS = [
  { label: 'Our services', href: '/services' },
  { label: 'Lift products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Clients', href: '/clients' },
] as const;

interface ContactMethodProps {
  icon: typeof Mail;
  label: string;
  lines: { text: string; href?: string }[];
  isDark: boolean;
}

function ContactMethodCard({ icon: Icon, label, lines, isDark }: ContactMethodProps) {
  if (lines.length === 0) return null;

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border p-5 transition-colors',
        isDark
          ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          : 'border-slate-200 bg-white hover:border-brand-gold-400/40 hover:shadow-sm',
      )}
    >
      <div
        className={cn(
          'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
          isDark ? 'bg-brand-gold-500/15' : 'bg-brand-gold-500/10',
        )}
      >
        <Icon className="h-5 w-5 text-brand-gold-500" strokeWidth={1.5} />
      </div>
      <p className={cn('text-xs font-semibold uppercase tracking-wider', isDark ? 'text-slate-400' : 'text-slate-500')}>
        {label}
      </p>
      <div className="mt-1 space-y-1">
        {lines.map((line) => {
          const className = cn(
            'flex items-start gap-1 text-sm font-medium leading-snug',
            isDark ? 'text-white' : 'text-primary-900',
            line.href && 'hover:text-brand-gold-600',
          );
          const body = (
            <>
              <span className="flex-1">{line.text}</span>
              {line.href ? (
                <ArrowUpRight
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 opacity-40',
                    isDark ? 'text-brand-gold-400' : 'text-brand-gold-600',
                  )}
                />
              ) : null}
            </>
          );
          return line.href ? (
            <a
              key={line.text}
              href={line.href}
              className={className}
              target={line.href.startsWith('http') ? '_blank' : undefined}
              rel={line.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {body}
            </a>
          ) : (
            <p key={line.text} className={className}>
              {body}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function ContactMainSection() {
  const isDark = useSectionDarkBackground('contact_main');
  const theme = sectionTheme(isDark);
  const { get } = useSiteSettingsMap();
  const raw = useSectionContent('contact_main');
  const section = {
    eyebrow: deecCopy(raw.eyebrow, 'Las Piñas office'),
    title: deecCopy(raw.title, 'Let’s start with an assessment'),
    subtitle: deecCopy(
      raw.subtitle,
      'Tell us about the building, the equipment, or the service you need — we will connect you with the right team.',
    ),
  };

  const email = get('company_email');
  const emails = [email, get('company_email_alt')].map((item) => item.trim()).filter(Boolean);
  const uniqueEmails = [...new Set(emails)];
  const phone = get('company_phone');
  const mobiles = splitContactList(get('company_mobiles', ''));
  const address = get('company_address');
  const website = get('company_website');
  const websiteHref = formatWebsiteHref(website);

  const formTitle = deecCopy(get('contact_form_title'), 'Request a quote');
  const formSubtitle = deecCopy(
    get('contact_form_subtitle'),
    'Share the site, equipment type, and what you need — installation, modernization, or maintenance.',
  );

  return (
    <section className={sectionSurfaceClass(isDark, 'muted')}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          align="left"
          theme={theme}
          className="mb-10 max-w-2xl"
        />

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-8 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <ContactMethodCard
                icon={Mail}
                label="Email"
                lines={uniqueEmails.map((item) => ({ text: item, href: mailtoHref(item) }))}
                isDark={isDark}
              />
              <ContactMethodCard
                icon={Phone}
                label="Trunkline"
                lines={phone ? [{ text: phone, href: telHref(phone) }] : []}
                isDark={isDark}
              />
              <ContactMethodCard
                icon={Smartphone}
                label="Mobile"
                lines={mobiles.map((item) => ({ text: item, href: telHref(item) }))}
                isDark={isDark}
              />
              <ContactMethodCard
                icon={Globe}
                label="Website"
                lines={website ? [{ text: website, href: websiteHref }] : []}
                isDark={isDark}
              />
              <ContactMethodCard icon={MapPin} label="Address" lines={address ? [{ text: address }] : []} isDark={isDark} />
            </div>

            <ContactOfficeHours isDark={isDark} />

            <div>
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  isDark ? 'text-slate-400' : 'text-slate-500',
                )}
              >
                Quick links
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={cn(
                        'inline-flex rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors',
                        isDark
                          ? 'border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/10'
                          : 'border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-900',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactFormCard
              isDark={isDark}
              formTitle={formTitle}
              formSubtitle={formSubtitle}
              recipientEmail={email}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
