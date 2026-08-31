import { useCallback } from 'react';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { resolveMediaUrl } from '@/utils/media';
import { formatPageTitle, isLegacyLogoPath } from '@/utils/brand';

export function useCompanyBrand() {
  const settings = useSiteSettingsMap();
  const name = settings.get('company_name').trim();
  const tagline = settings.get('company_tagline').trim();
  const rawLogo = settings.get('company_logo').trim();
  const logoPath = rawLogo && !isLegacyLogoPath(rawLogo) ? rawLogo : '';
  const logoMedia = settings.get('company_logo_media').trim();
  const logoSrc = logoPath ? resolveMediaUrl(logoPath) : '';
  const pageTitle = useCallback(
    (pageLabel?: string) => formatPageTitle(pageLabel, name, tagline),
    [name, tagline],
  );

  return {
    ...settings,
    name,
    tagline,
    logoPath,
    logoSrc,
    logoMedia,
    pageTitle,
  };
}
