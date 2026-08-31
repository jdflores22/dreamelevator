/** Website CMS — current developer console. */
export const CMS_ROLES = ['SuperAdmin', 'Editor'] as const;

/** Operational roles. No CMS access until their modules are built. */
export const WORKSPACE_ROLES = ['Staff', 'Accounting', 'Admin'] as const;

export type CmsRole = (typeof CMS_ROLES)[number];
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: 'Developer',
  Editor: 'Editor',
  Staff: 'Staff',
  Accounting: 'Accounting',
  Admin: 'Admin',
};

const ROLE_ORDER = ['SuperAdmin', 'Editor', 'Admin', 'Staff', 'Accounting'] as const;

export function formatRoleLabel(role?: string | null): string {
  if (!role) return '';
  return ROLE_LABELS[role] ?? role;
}

export function isCmsRole(role?: string | null): boolean {
  return Boolean(role && (CMS_ROLES as readonly string[]).includes(role));
}

export function isWorkspaceRole(role?: string | null): boolean {
  return Boolean(role && !isCmsRole(role));
}

export function homePathForRole(role?: string | null): string {
  return isCmsRole(role) ? '/admin' : '/admin/workspace';
}

export function isCmsAdminPath(pathname: string): boolean {
  if (!pathname.startsWith('/admin')) return false;
  if (pathname === '/admin/login' || pathname.startsWith('/admin/workspace')) return false;
  return true;
}

export function sortRoles<T extends { name: string }>(roles: T[]): T[] {
  return [...roles].sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a.name as (typeof ROLE_ORDER)[number]);
    const bi = ROLE_ORDER.indexOf(b.name as (typeof ROLE_ORDER)[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
