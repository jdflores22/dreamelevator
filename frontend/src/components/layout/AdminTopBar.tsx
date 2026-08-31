import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  CornerDownLeft,
  ExternalLink,
  LogOut,
  Mail,
  Menu,
  Search,
  Terminal,
  User as UserIcon,
} from 'lucide-react';
import { adminNavIndex, adminPageTitles } from '@/constants/navigation';
import { formatRoleLabel } from '@/constants/roles';
import { useAuth, useDashboardStats } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

/** Close a popover when clicking outside of the referenced element. */
function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { logoutMutation } = useAuth();
  const { data: stats } = useDashboardStats();
  const unread = stats?.unreadMessages ?? 0;

  const pageTitle = adminPageTitles[pathname] ?? 'Admin';
  const isDashboard = pathname === '/admin';

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Left: menu + breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="min-h-11 min-w-11 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 text-slate-500 transition-colors hover:text-primary-800 sm:inline-flex"
            >
              <Terminal className="h-3.5 w-3.5 text-brand-gold-500" />
              CMS
            </Link>
            {!isDashboard && (
              <>
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                <span className="truncate font-semibold text-primary-900">{pageTitle}</span>
              </>
            )}
            {isDashboard && (
              <span className="truncate font-semibold text-primary-900 sm:hidden">Dashboard</span>
            )}
          </nav>
        </div>

        {/* Center: global search */}
        <GlobalSearch className="hidden flex-1 justify-center md:flex" />

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <NotificationsMenu unread={unread} onNavigate={navigate} />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-gold-500/40 hover:bg-brand-gold-500/5 hover:text-primary-800 lg:inline-flex"
          >
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {user && (
            <UserMenu
              name={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
              email={user.email}
              role={formatRoleLabel(user.role)}
              initials={`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
              onSignOut={() => logoutMutation.mutate()}
            />
          )}
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-brand-red-500 via-brand-gold-500 to-primary-700" />
    </header>
  );
}

/* ─────────────────────────── Global search ─────────────────────────── */

function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return adminNavIndex.slice(0, 6);
    return adminNavIndex
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [q]);

  useEffect(() => setActiveIndex(0), [query, open]);

  // Keyboard shortcut: ⌘K / Ctrl+K focuses the search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function go(href: string) {
    navigate(href);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search admin…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-16 text-sm text-primary-900 placeholder:text-slate-400 transition-colors focus:border-brand-gold-500/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold-500/30"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:flex">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-40 mt-2 w-[min(28rem,90vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <p className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {q ? 'Results' : 'Jump to'}
          </p>
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">
              No pages match “{query}”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((item, i) => (
                <li key={item.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => go(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      i === activeIndex ? 'bg-brand-gold-500/10' : 'hover:bg-slate-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        i === activeIndex
                          ? 'bg-brand-gold-500/20 text-brand-gold-600'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary-900">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {item.group}
                        {item.description ? ` · ${item.description}` : ''}
                      </span>
                    </span>
                    {i === activeIndex && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Notifications ─────────────────────────── */

function NotificationsMenu({
  unread,
  onNavigate,
}: {
  unread: number;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-primary-900">Notifications</span>
            {unread > 0 && (
              <span className="rounded-full bg-brand-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-red-600">
                {unread} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate('/admin/messages');
              setOpen(false);
            }}
            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold-500/15 text-brand-gold-600">
              <Mail className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-primary-900">
                {unread > 0
                  ? `${unread} unread message${unread === 1 ? '' : 's'}`
                  : 'No unread messages'}
              </span>
              <span className="block text-xs text-slate-400">Open the inbox</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── User menu ─────────────────────────── */

function UserMenu({
  name,
  email,
  role,
  initials,
  onSignOut,
}: {
  name: string;
  email: string;
  role?: string;
  initials: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-1 transition-colors hover:border-brand-gold-500/40 hover:bg-slate-50 sm:pr-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-800 to-primary-900 text-xs font-semibold text-brand-gold-400">
          {initials || <UserIcon className="h-4 w-4" />}
        </span>
        <span className="hidden max-w-28 truncate text-xs font-medium text-primary-900 sm:block">
          {name || 'Account'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-primary-900">{name || 'Account'}</p>
            <p className="truncate text-xs text-slate-400">{email}</p>
            {role && (
              <span className="mt-2 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                {role}
              </span>
            )}
          </div>
          <div className="py-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary-900"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              View website
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-brand-red-600 transition-colors hover:bg-brand-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
