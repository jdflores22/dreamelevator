import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Code2, ExternalLink, LogOut, Search, X } from 'lucide-react';
import { adminNavGroups, type AdminNavGroup } from '@/constants/navigation';
import { useAuth, useDashboardStats } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';
import { CompanyLogoImage } from '@/components/common/CompanyLogoImage';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { cn } from '@/utils/cn';

export interface AdminSidebarProps {
  onNavigate?: () => void;
}

const COLLAPSE_KEY = 'admin.sidebar.collapsedGroups';

function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / privacy-mode errors */
      }
      return next;
    });

  return { collapsed, toggle };
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { logoutMutation } = useAuth();
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const { data: stats } = useDashboardStats();
  const { collapsed, toggle } = useCollapsedGroups();
  const [query, setQuery] = useState('');
  const { name: companyName, logoSrc, logoMedia } = useCompanyBrand();

  const badges: Record<string, number> = {
    unreadMessages: stats?.unreadMessages ?? 0,
  };

  const q = query.trim().toLowerCase();
  const groups = useMemo<AdminNavGroup[]>(() => {
    if (!q) return adminNavGroups;
    return adminNavGroups
      .map((group) => ({
        ...group,
        links: group.links.filter(
          (link) =>
            link.label.toLowerCase().includes(q) ||
            link.description?.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.links.length > 0);
  }, [q]);

  return (
    <aside className="admin-sidebar-bg flex h-full w-[min(17.5rem,85vw)] flex-col text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-4">
        <Link to="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          {logoSrc ? (
            <CompanyLogoImage
              src={logoSrc}
              alt={companyName}
              size="sm"
              mediaHint={logoMedia}
            />
          ) : null}
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{companyName || 'CMS'}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-brand-gold-400/90">
              <Code2 className="h-3 w-3" />
              CMS Console
            </span>
          </div>
        </Link>
      </div>

      {/* Quick filter */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter menu…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-xs text-white placeholder:text-slate-500 focus:border-brand-gold-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-brand-gold-500/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {groups.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-500">No matches for “{query}”.</p>
        )}
        {groups.map((group) => {
          const groupActive = group.links.some((l) =>
            l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href),
          );
          // When searching, always show results expanded; otherwise honour the toggle
          // (auto-open the group that contains the current route).
          const isCollapsed = q ? false : (collapsed[group.id] ?? false) && !groupActive;
          const groupBadge = group.links.reduce(
            (sum, l) => sum + (l.badgeKey ? badges[l.badgeKey] ?? 0 : 0),
            0,
          );

          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggle(group.id)}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <group.icon className="h-3.5 w-3.5 opacity-70" />
                  {group.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {isCollapsed && groupBadge > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white">
                      {groupBadge}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      isCollapsed && '-rotate-90',
                    )}
                  />
                </span>
              </button>

              {!isCollapsed && (
                <ul className="mt-0.5 space-y-0.5 pb-1">
                  {group.links.map((link) => {
                    const badge = link.badgeKey ? badges[link.badgeKey] ?? 0 : 0;
                    return (
                      <li key={link.href}>
                        <NavLink
                          to={link.href}
                          end={link.href === '/admin'}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                              isActive
                                ? 'bg-brand-gold-500/10 text-brand-gold-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand-gold-500" />
                              )}
                              <link.icon
                                className={cn(
                                  'h-4 w-4 shrink-0',
                                  isActive
                                    ? 'text-brand-gold-400'
                                    : 'opacity-70 group-hover:opacity-100',
                                )}
                              />
                              <span className="flex-1 truncate">{link.label}</span>
                              {badge > 0 && (
                                <span
                                  className={cn(
                                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                                    isActive
                                      ? 'bg-brand-gold-500 text-primary-950'
                                      : 'bg-brand-red-500 text-white',
                                  )}
                                >
                                  {badge}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/10 p-3">
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
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View site
          </a>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-brand-red-500/30 hover:bg-brand-red-500/10 hover:text-brand-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

export interface MobileAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAdminSidebar({ isOpen, onClose }: MobileAdminSidebarProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-[min(17.5rem,85vw)] pt-[env(safe-area-inset-top)] shadow-2xl">
        <button
          type="button"
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white/80 hover:bg-white/10"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
        <AdminSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
