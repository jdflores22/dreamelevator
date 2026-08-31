import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PreFooterCTA } from '@/components/marketing/PreFooterCTA';
import { MaintenancePage } from '@/components/common/MaintenancePage';
import { StickyCta } from '@/components/common/StickyCta';
import { AnalyticsScript } from '@/components/common/AnalyticsScript';
import { OrganizationJsonLd } from '@/components/common/OrganizationJsonLd';
import { BrandDocumentHead } from '@/components/common/BrandDocumentHead';
import { PageLoader } from '@/components/ui/Spinner';
import { pathnameToPageKey } from '@/constants/pageVisibility';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { usePublicSiteSettings } from '@/hooks/useSiteSettingsMap';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  const pageKey = pathnameToPageKey(pathname);
  const { isLoading: visibilityLoading, isPublished, maintenanceMessage } = usePageVisibility(pageKey);
  // Wait for site settings too, so section headings/visibility never flash their
  // hardcoded defaults before the real CMS content arrives (noticeable in production).
  const { isLoading: settingsLoading } = usePublicSiteSettings();
  const isLoading = visibilityLoading || settingsLoading;

  if (pageKey && !isLoading && !isPublished) {
    return (
      <div className="flex min-h-screen flex-col">
        <BrandDocumentHead includeTitle={false} />
        <Header />
        <main className="flex-1">
          <MaintenancePage pageKey={pageKey} message={maintenanceMessage} />
        </main>
        <div className="pb-20 sm:pb-0">
          <Footer />
        </div>
        <StickyCta />
      </div>
    );
  }

  if (pageKey && isLoading) {
    return (
      <>
        <BrandDocumentHead includeTitle={false} />
        <PageLoader />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BrandDocumentHead includeTitle={false} />
      <OrganizationJsonLd />
      <AnalyticsScript />
      <Header />
      <motion.main
        className="flex-1"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
      {pathname !== '/' && <PreFooterCTA />}
      <div className="pb-20 sm:pb-0">
        <Footer />
      </div>
      <StickyCta />
    </div>
  );
}
