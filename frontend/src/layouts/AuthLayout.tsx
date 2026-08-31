import { Outlet } from 'react-router-dom';
import { Code2, Globe, Shield, Zap } from 'lucide-react';
import { CompanyLogoImage } from '@/components/common/CompanyLogoImage';
import { BrandDocumentHead } from '@/components/common/BrandDocumentHead';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { cn } from '@/utils/cn';

const highlights = [
  { icon: Code2, text: 'Manage services, products & portfolio' },
  { icon: Globe, text: 'Publish content to your live website' },
  { icon: Shield, text: 'Secure admin access for your team' },
  { icon: Zap, text: 'Fast updates without touching code' },
];

function AuthBrandLogo({
  className,
  size = 'lg',
}: {
  className?: string;
  size?: 'md' | 'lg';
}) {
  const { name: companyName, logoSrc, logoMedia } = useCompanyBrand();
  if (!logoSrc) return null;

  return (
    <CompanyLogoImage
      src={logoSrc}
      alt={companyName ? `${companyName} logo` : 'Logo'}
      size={size}
      mediaHint={logoMedia}
      bare
      className={cn('max-w-[11rem] object-contain', className)}
    />
  );
}

export function AuthLayout() {
  const { name: companyName, tagline } = useCompanyBrand();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <BrandDocumentHead pageLabel="Sign in" />
      <aside className="admin-sidebar-bg relative hidden flex-col justify-between px-10 py-10 text-white lg:flex lg:min-h-screen lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-gold-500/8 via-transparent to-primary-500/8" />

        <div className="relative">
          <AuthBrandLogo size="lg" className="object-left" />
          <h1 className="mt-6 text-2xl font-medium tracking-tight">
            {companyName ? `${companyName} CMS` : 'CMS'}
          </h1>
          {tagline ? <p className="mt-1.5 text-sm text-brand-gold-400">{tagline}</p> : null}
          <div className="mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r from-brand-red-500 via-brand-gold-500 to-primary-400" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
            Content management for your website — branding, services, products, portfolio, and
            client messages.
          </p>
        </div>

        <ul className="relative space-y-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold-500/10 text-brand-gold-400">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <p className="relative text-xs text-slate-600">
          {companyName ? `© ${companyName} · Admin Console` : 'Admin Console'}
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="admin-sidebar-bg relative px-6 py-8 pt-[max(2rem,env(safe-area-inset-top))] text-center text-white lg:hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-gold-500/8 via-transparent to-primary-500/8" />
          <div className="relative flex flex-col items-center">
            <AuthBrandLogo size="md" className="mx-auto object-center" />
            {companyName ? <h1 className="mt-4 text-lg font-medium">{companyName}</h1> : null}
            {tagline ? (
              <p className="mt-1 text-xs uppercase tracking-wider text-brand-gold-400">{tagline}</p>
            ) : null}
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center admin-shell-bg px-4 py-8 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-primary-900/5 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-medium text-primary-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your credentials to continue.
                </p>
              </div>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
