import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Clock, Menu, Phone } from 'lucide-react';
import { usePublishedNavLinks } from '@/hooks/usePublishedNavLinks';
import { usePageVisibilityMap } from '@/hooks/usePageVisibility';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { MobileNav } from '@/components/layout/MobileNav';
import { useHeaderAppearance } from '@/hooks/useHeaderAppearance';
import { useHeaderBrandingText } from '@/hooks/useHeaderBrandingText';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { cn } from '@/utils/cn';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = usePublishedNavLinks();
  const { isPagePublished } = usePageVisibilityMap();
  const showContact = isPagePublished('contact');
  const header = useHeaderAppearance();
  const headerTextColors = useHeaderBrandingText(header.logoVariant === 'light' ? 'light' : 'dark');
  const { get } = useSiteSettingsMap();
  const phone = get('company_phone');
  const hours = get('contact_office_hours', 'Mon–Fri|8:00 AM – 5:00 PM')
    .split('\n')[0]
    ?.replace('|', ' ');

  return (
    <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <span className="block h-[3px] bg-brand-gold-500" aria-hidden />
      <div
        className={cn(
          'border-b text-[11px] sm:text-[12px]',
          header.isDark
            ? 'border-white/10 bg-primary-950 text-slate-300'
            : 'border-slate-200 bg-slate-50 text-slate-600',
        )}
      >
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-3 sm:h-9 sm:px-6 lg:px-8">
          <p className="font-display truncate tracking-[0.12em] uppercase sm:tracking-[0.14em]">
            <span className="sm:hidden">Est. 1996</span>
            <span className="hidden sm:inline">Est. 1996 · Las Piñas, Philippines</span>
          </p>
          <div className="flex items-center gap-5">
            {hours ? (
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                <Clock className="h-3.5 w-3.5 text-brand-gold-500" />
                {hours}
              </span>
            ) : null}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-1.5 font-medium hover:text-brand-gold-500"
              >
                <Phone className="h-3.5 w-3.5 text-brand-gold-500" />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn('border-b', header.borderClassName, header.headerClassName)}
        style={header.headerStyle}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-stretch justify-between gap-3 px-3 sm:h-[4.5rem] sm:gap-6 sm:px-6 lg:px-8">
          <Logo
            variant={header.logoVariant}
            textColors={headerTextColors}
            className="min-w-0 max-w-[calc(100%-3.25rem)] self-center"
          />

          <nav className="hidden h-full items-stretch xl:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) => header.navLinkClass(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {showContact && (
            <div className="hidden self-center xl:block">
              <Link to="/contact">
                <Button size="md" variant={header.contactButtonVariant}>
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className={cn(
              'min-h-11 min-w-11 self-center rounded-sm p-2 xl:hidden',
              header.menuButtonClassName,
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        dark={header.mobileDark}
        panelClassName={header.headerClassName}
        panelStyle={header.headerStyle}
        logoVariant={header.logoVariant}
        logoTextColors={headerTextColors}
      />
    </header>
  );
}
