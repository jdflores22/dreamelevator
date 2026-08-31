import { Gauge, Package, PackageMinus, Repeat2, Truck, Users, type LucideIcon } from 'lucide-react';

export interface WorkspaceNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const workspaceNavLinks: WorkspaceNavLink[] = [
  { label: 'Dashboard', href: '/admin/workspace', icon: Gauge },
  { label: 'Inventory', href: '/admin/workspace/inventory', icon: Package },
  { label: 'Stock Out', href: '/admin/workspace/inventory/out', icon: PackageMinus },
  { label: 'Movements', href: '/admin/workspace/inventory/movements', icon: Repeat2 },
  { label: 'Suppliers', href: '/admin/workspace/suppliers', icon: Truck },
  { label: 'Employees', href: '/admin/workspace/employees', icon: Users },
];

/** Supplier register pages live under /inventory/:supplier, so exact-match the sibling tabs. */
export function isWorkspaceNavActive(href: string, pathname: string) {
  if (href === '/admin/workspace') return pathname === '/admin/workspace';
  if (href === '/admin/workspace/inventory/out') return pathname === '/admin/workspace/inventory/out';
  if (href === '/admin/workspace/inventory/movements')
    return pathname === '/admin/workspace/inventory/movements';
  if (href === '/admin/workspace/inventory') {
    return (
      pathname.startsWith('/admin/workspace/inventory') &&
      pathname !== '/admin/workspace/inventory/out' &&
      pathname !== '/admin/workspace/inventory/movements'
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
