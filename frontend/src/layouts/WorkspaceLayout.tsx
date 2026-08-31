import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { BrandDocumentHead } from '@/components/common/BrandDocumentHead';
import { CompanyLogoImage } from '@/components/common/CompanyLogoImage';
import { useAuth } from '@/api/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { formatRoleLabel, isCmsRole } from '@/constants/roles';
import { isWorkspaceNavActive, workspaceNavLinks } from '@/constants/workspaceNavigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export function WorkspaceLayout() {
  const user = useAuthStore((s) => s.user);
  const { logoutMutation } = useAuth();
  const { name: companyName, logoSrc, logoMedia } = useCompanyBrand();
  const roleLabel = formatRoleLabel(user?.role);
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showCmsLink = isCmsRole(user?.role);

  return (
    <div className="flex min-h-screen admin-shell-bg">
      <BrandDocumentHead pageLabel={roleLabel || 'Workspace'} />

      <aside className="admin-sidebar-bg fixed inset-y-0 left-0 z-40 hidden h-screen w-[min(17.5rem,85vw)] flex-col text-white lg:flex">
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <Link to="/admin/workspace" className="flex items-center gap-3">
            {logoSrc ? (
              <CompanyLogoImage src={logoSrc} alt={companyName} size="sm" mediaHint={logoMedia} />
            ) : null}
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">{companyName || 'Workspace'}</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-brand-gold-400/90">
                {roleLabel} workspace
              </span>
            </div>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {workspaceNavLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href !== '/admin/workspace/inventory'}
              className={() =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isWorkspaceNavActive(link.href, pathname)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto shrink-0 space-y-2 border-t border-white/10 p-3">
          {showCmsLink ? (
            <Link
              to="/admin"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Back to CMS
            </Link>
          ) : null}
          {user && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 text-xs font-bold text-primary-950">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[10px] text-slate-500">{user.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-brand-red-500/30 hover:bg-brand-red-500/10 hover:text-brand-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary-900">{companyName || 'Workspace'}</p>
              <p className="truncate text-[11px] text-slate-500">{roleLabel}</p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-primary-900"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-primary-950/60"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="admin-sidebar-bg absolute inset-y-0 right-0 flex h-full w-[min(20rem,92vw)] flex-col pt-[env(safe-area-inset-top)] text-white pb-[env(safe-area-inset-bottom)]">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold">Workspace</p>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
                {workspaceNavLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    end={link.href !== '/admin/workspace/inventory'}
                    onClick={() => setMobileOpen(false)}
                    className={() =>
                      cn(
                        'flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                        isWorkspaceNavActive(link.href, pathname)
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300',
                      )
                    }
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto shrink-0 space-y-2 border-t border-white/10 p-3">
                {showCmsLink ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"
                  >
                    Back to CMS
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[110rem] min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
