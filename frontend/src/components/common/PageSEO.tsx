import { useSeoByPageKey } from '@/api/hooks';
import { SEOHead, type SEOHeadProps } from '@/components/common/SEOHead';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { applyBrandName, isLegacyBrandCopy } from '@/utils/brand';

export interface PageSEOProps extends SEOHeadProps {
  pageKey?: string;
}

export function PageSEO({ pageKey, title, description, keywords, ogImage }: PageSEOProps) {
  const { data: seo } = useSeoByPageKey(pageKey ?? '');
  const { name } = useCompanyBrand();

  const cmsTitle = seo?.title ? applyBrandName(seo.title, name) : '';
  const hasUsableCmsTitle = Boolean(cmsTitle) && !isLegacyBrandCopy(cmsTitle);
  const resolvedTitle = hasUsableCmsTitle ? cmsTitle : pageKey === 'home' ? undefined : title;

  const cmsDescription = seo?.description ? applyBrandName(seo.description, name) : '';
  const hasUsableCmsDescription = Boolean(cmsDescription) && !isLegacyBrandCopy(cmsDescription);
  const resolvedDescription = hasUsableCmsDescription ? cmsDescription : description;

  return (
    <SEOHead
      title={resolvedTitle}
      description={resolvedDescription}
      keywords={seo?.keywords || keywords}
      ogImage={seo?.ogImage || ogImage}
    />
  );
}
