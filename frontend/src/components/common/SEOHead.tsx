import { Helmet } from 'react-helmet-async';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { applyBrandName, formatPageTitle, isLegacyBrandCopy } from '@/utils/brand';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export function SEOHead({ title, description, keywords, ogImage }: SEOHeadProps) {
  const { name, tagline } = useCompanyBrand();
  const resolvedTitle = formatPageTitle(title, name, tagline);
  const brandedDescription = description ? applyBrandName(description, name) : '';
  const resolvedDescription =
    brandedDescription && !isLegacyBrandCopy(brandedDescription)
      ? brandedDescription
      : [name, tagline].filter(Boolean).join(' — ');
  const resolvedKeywords = keywords ? applyBrandName(keywords, name) : '';

  return (
    <Helmet>
      {resolvedTitle ? <title>{resolvedTitle}</title> : null}
      {resolvedDescription ? <meta name="description" content={resolvedDescription} /> : null}
      {resolvedKeywords ? <meta name="keywords" content={resolvedKeywords} /> : null}
      {resolvedTitle ? <meta property="og:title" content={resolvedTitle} /> : null}
      {resolvedDescription ? <meta property="og:description" content={resolvedDescription} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
    </Helmet>
  );
}
