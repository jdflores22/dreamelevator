import { PageSEO } from '@/components/common/PageSEO';
import { useHomeSectionsVisibility } from '@/hooks/useSectionContent';
import { Hero } from '@/pages/Home/sections/Hero';
import { HomeIntroBanner } from '@/pages/Home/sections/HomeIntroBanner';
import { ServicesSection } from '@/pages/Home/sections/ServicesSection';
import { Stats } from '@/pages/Home/sections/Stats';
import { TrustedCompanies } from '@/pages/Home/sections/TrustedCompanies';
import { TechnologiesSection } from '@/pages/Home/sections/TechnologiesSection';
import { SoftwareSolutions } from '@/pages/Home/sections/SoftwareSolutions';
import { FeaturedProduct } from '@/pages/Home/sections/FeaturedProduct';
import { Industries } from '@/pages/Home/sections/Industries';
import { WhyChooseUs } from '@/pages/Home/sections/WhyChooseUs';
import { DevProcess } from '@/pages/Home/sections/DevProcess';
import { PortfolioSection } from '@/pages/Home/sections/PortfolioSection';
import { Testimonials } from '@/pages/Home/sections/Testimonials';
import { FAQ } from '@/pages/Home/sections/FAQ';
import { LatestArticles } from '@/pages/Home/sections/LatestArticles';
import { CTA } from '@/pages/Home/sections/CTA';

export default function HomePage() {
  const sections = useHomeSectionsVisibility();

  return (
    <>
      <PageSEO
        pageKey="home"
        description="Elevator and escalator solutions from installation to long-term service."
      />
      <Hero />
      <div id="home-content" className="sm-page">
        {sections.home_clients && <TrustedCompanies />}
        {sections.home_process && <DevProcess />}
        {sections.home_intro && <HomeIntroBanner />}
        {sections.home_services && !sections.home_intro && <ServicesSection />}
        {sections.home_technologies && <TechnologiesSection />}
        {sections.home_featured_product && <FeaturedProduct />}
        {sections.home_products && <SoftwareSolutions />}
        {sections.home_industries && <Industries />}
        {sections.home_why && <WhyChooseUs />}
        {sections.home_portfolio && <PortfolioSection />}
        {sections.home_testimonials && <Testimonials />}
        {sections.home_stats && <Stats />}
        {sections.home_faq && <FAQ />}
        {sections.home_blog && <LatestArticles />}
        {sections.home_cta && <CTA />}
      </div>
    </>
  );
}
