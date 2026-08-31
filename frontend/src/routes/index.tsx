import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { CmsRoute } from '@/routes/CmsRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const AboutPage = lazy(() => import('@/pages/About/AboutPage'));
const ServicesPage = lazy(() => import('@/pages/Services/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/Services/ServiceDetailPage'));
const PortfolioPage = lazy(() => import('@/pages/Portfolio/PortfolioPage'));
const PortfolioDetailPage = lazy(() => import('@/pages/Portfolio/PortfolioDetailPage'));
const GalleryPage = lazy(() => import('@/pages/Gallery/GalleryPage'));
const ClientsPage = lazy(() => import('@/pages/Clients/ClientsPage'));
const TechnologiesPage = lazy(() => import('@/pages/Technologies/TechnologiesPage'));
const IndustriesPage = lazy(() => import('@/pages/Industries/IndustriesPage'));
const BlogPage = lazy(() => import('@/pages/Blog/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/Blog/BlogDetailPage'));
const CareersPage = lazy(() => import('@/pages/Careers/CareersPage'));
const ContactPage = lazy(() => import('@/pages/Contact/ContactPage'));
const ProductsPage = lazy(() => import('@/pages/Products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/Products/ProductDetailPage'));
const PrivacyPage = lazy(() => import('@/pages/Privacy/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/Terms/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

const AdminLoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const ServicesAdminPage = lazy(() => import('@/pages/admin/ServicesAdminPage'));
const TechnologiesAdminPage = lazy(() => import('@/pages/admin/TechnologiesAdminPage'));
const ProductsAdminPage = lazy(() => import('@/pages/admin/ProductsAdminPage'));
const IndustriesAdminPage = lazy(() => import('@/pages/admin/IndustriesAdminPage'));
const FaqAdminPage = lazy(() => import('@/pages/admin/FaqAdminPage'));
const SiteStatsAdminPage = lazy(() => import('@/pages/admin/SiteStatsAdminPage'));
const CompanyHighlightsAdminPage = lazy(() => import('@/pages/admin/CompanyHighlightsAdminPage'));
const ProcessStepsAdminPage = lazy(() => import('@/pages/admin/ProcessStepsAdminPage'));
const PortfolioAdminPage = lazy(() => import('@/pages/admin/PortfolioAdminPage'));
const ClientsAdminPage = lazy(() => import('@/pages/admin/ClientsAdminPage'));
const BlogAdminPage = lazy(() => import('@/pages/admin/BlogAdminPage'));
const MessagesAdminPage = lazy(() => import('@/pages/admin/MessagesAdminPage'));
const CareersAdminPage = lazy(() => import('@/pages/admin/CareersAdminPage'));
const UsersAdminPage = lazy(() => import('@/pages/admin/UsersAdminPage'));
const SettingsAdminPage = lazy(() => import('@/pages/admin/SettingsAdminPage'));
const SeoAdminPage = lazy(() => import('@/pages/admin/SeoAdminPage'));
const ProjectsAdminPage = lazy(() => import('@/pages/admin/ProjectsAdminPage'));
const TestimonialsAdminPage = lazy(() => import('@/pages/admin/TestimonialsAdminPage'));
const MediaLibraryAdminPage = lazy(() => import('@/pages/admin/MediaLibraryAdminPage'));
const ActivityLogAdminPage = lazy(() => import('@/pages/admin/ActivityLogAdminPage'));
const SubscribersAdminPage = lazy(() => import('@/pages/admin/SubscribersAdminPage'));
const JobApplicationsAdminPage = lazy(() => import('@/pages/admin/JobApplicationsAdminPage'));
const WorkspaceHomePage = lazy(() => import('@/pages/admin/WorkspaceHomePage'));
const InventoryAdminPage = lazy(() => import('@/pages/admin/workspace/InventoryAdminPage'));
const InventoryStockOutPage = lazy(() => import('@/pages/admin/workspace/InventoryStockOutPage'));
const SuppliersAdminPage = lazy(() => import('@/pages/admin/workspace/SuppliersAdminPage'));
const EmployeesAdminPage = lazy(() => import('@/pages/admin/workspace/EmployeesAdminPage'));
const StockMovementsPage = lazy(() => import('@/pages/admin/workspace/StockMovementsPage'));
const EmployeeProfilePage = lazy(() => import('@/pages/admin/workspace/EmployeeProfilePage'));

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LazyPage><HomePage /></LazyPage> },
      { path: 'about', element: <LazyPage><AboutPage /></LazyPage> },
      { path: 'services', element: <LazyPage><ServicesPage /></LazyPage> },
      { path: 'services/:slug', element: <LazyPage><ServiceDetailPage /></LazyPage> },
      { path: 'products', element: <LazyPage><ProductsPage /></LazyPage> },
      { path: 'products/:slug', element: <LazyPage><ProductDetailPage /></LazyPage> },
      { path: 'portfolio', element: <LazyPage><PortfolioPage /></LazyPage> },
      { path: 'portfolio/:slug', element: <LazyPage><PortfolioDetailPage /></LazyPage> },
      { path: 'gallery', element: <LazyPage><GalleryPage /></LazyPage> },
      { path: 'clients', element: <LazyPage><ClientsPage /></LazyPage> },
      { path: 'technologies', element: <LazyPage><TechnologiesPage /></LazyPage> },
      { path: 'industries', element: <LazyPage><IndustriesPage /></LazyPage> },
      { path: 'blog', element: <LazyPage><BlogPage /></LazyPage> },
      { path: 'blog/:slug', element: <LazyPage><BlogDetailPage /></LazyPage> },
      { path: 'careers', element: <LazyPage><CareersPage /></LazyPage> },
      { path: 'contact', element: <LazyPage><ContactPage /></LazyPage> },
      { path: 'privacy', element: <LazyPage><PrivacyPage /></LazyPage> },
      { path: 'terms', element: <LazyPage><TermsPage /></LazyPage> },
      { path: '*', element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
  {
    path: 'admin/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LazyPage><AdminLoginPage /></LazyPage> }],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'workspace', element: <LazyPage><WorkspaceHomePage /></LazyPage> },
      { path: 'workspace/inventory/out', element: <LazyPage><InventoryStockOutPage /></LazyPage> },
      { path: 'workspace/suppliers', element: <LazyPage><SuppliersAdminPage /></LazyPage> },
      { path: 'workspace/inventory/movements', element: <LazyPage><StockMovementsPage /></LazyPage> },
      { path: 'workspace/employees', element: <LazyPage><EmployeesAdminPage /></LazyPage> },
      { path: 'workspace/employees/:id', element: <LazyPage><EmployeeProfilePage /></LazyPage> },
      { path: 'workspace/inventory', element: <LazyPage><InventoryAdminPage /></LazyPage> },
      { path: 'workspace/inventory/:supplier', element: <LazyPage><InventoryAdminPage /></LazyPage> },
      {
        element: <CmsRoute />,
        children: [
          { index: true, element: <LazyPage><AdminDashboardPage /></LazyPage> },
          { path: 'services', element: <LazyPage><ServicesAdminPage /></LazyPage> },
          { path: 'products', element: <LazyPage><ProductsAdminPage /></LazyPage> },
          { path: 'industries', element: <LazyPage><IndustriesAdminPage /></LazyPage> },
          { path: 'faq', element: <LazyPage><FaqAdminPage /></LazyPage> },
          { path: 'stats', element: <LazyPage><SiteStatsAdminPage /></LazyPage> },
          { path: 'highlights', element: <LazyPage><CompanyHighlightsAdminPage /></LazyPage> },
          { path: 'process-steps', element: <LazyPage><ProcessStepsAdminPage /></LazyPage> },
          { path: 'technologies', element: <LazyPage><TechnologiesAdminPage /></LazyPage> },
          { path: 'portfolio', element: <LazyPage><PortfolioAdminPage /></LazyPage> },
          { path: 'clients', element: <LazyPage><ClientsAdminPage /></LazyPage> },
          { path: 'testimonials', element: <LazyPage><TestimonialsAdminPage /></LazyPage> },
          { path: 'blog', element: <LazyPage><BlogAdminPage /></LazyPage> },
          { path: 'messages', element: <LazyPage><MessagesAdminPage /></LazyPage> },
          { path: 'subscribers', element: <LazyPage><SubscribersAdminPage /></LazyPage> },
          { path: 'applications', element: <LazyPage><JobApplicationsAdminPage /></LazyPage> },
          { path: 'careers', element: <LazyPage><CareersAdminPage /></LazyPage> },
          { path: 'users', element: <LazyPage><UsersAdminPage /></LazyPage> },
          { path: 'media', element: <LazyPage><MediaLibraryAdminPage /></LazyPage> },
          { path: 'activity', element: <LazyPage><ActivityLogAdminPage /></LazyPage> },
          { path: 'settings', element: <LazyPage><SettingsAdminPage /></LazyPage> },
          { path: 'seo', element: <LazyPage><SeoAdminPage /></LazyPage> },
          { path: 'projects', element: <LazyPage><ProjectsAdminPage /></LazyPage> },
        ],
      },
    ],
  },
  { path: 'admin/*', element: <Navigate to="/admin" replace /> },
]);
