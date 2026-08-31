import { Navigate, Outlet } from 'react-router-dom';
import { isCmsRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';

/** Blocks Staff / Accounting / Admin from the website CMS. */
export function CmsRoute() {
  const role = useAuthStore((s) => s.user?.role);

  if (!isCmsRole(role)) {
    return <Navigate to="/admin/workspace" replace />;
  }

  return <Outlet />;
}
