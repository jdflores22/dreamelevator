import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar, MobileAdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { BrandDocumentHead } from '@/components/common/BrandDocumentHead';
import { adminPageTitles } from '@/constants/navigation';
import { isCmsRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';

export function AdminLayout() {
  const { pathname } = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  if (pathname.startsWith('/admin/workspace') || !isCmsRole(role)) {
    return <WorkspaceLayout />;
  }

  return <CmsShell />;
}

function CmsShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const pageLabel = adminPageTitles[pathname] ?? 'CMS';

  return (
    <div className="flex min-h-screen admin-shell-bg">
      <BrandDocumentHead pageLabel={pageLabel} />
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <AdminSidebar />
      </div>

      <MobileAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[17.5rem]">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[110rem]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
