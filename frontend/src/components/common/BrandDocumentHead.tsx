import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';

interface BrandDocumentHeadProps {
  pageLabel?: string;
  includeTitle?: boolean;
}

function faviconType(url: string): string | undefined {
  const path = url.split('?')[0].split('#')[0].toLowerCase();
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

function withCacheBust(url: string): string {
  if (!url || url.startsWith('data:')) return url;
  const stamp = url.split('/').pop() ?? '1';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(stamp)}`;
}

function setDocumentIcons(href: string, type?: string) {
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  for (const rel of rels) {
    let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    if (type && rel !== 'apple-touch-icon') link.type = type;
    link.href = href;
  }
}

export function BrandDocumentHead({ pageLabel, includeTitle = true }: BrandDocumentHeadProps) {
  const { name, logoSrc, pageTitle } = useCompanyBrand();
  const title = pageTitle(pageLabel);
  const iconHref = logoSrc ? withCacheBust(logoSrc) : 'data:,';
  const type = logoSrc ? faviconType(logoSrc) : undefined;

  useEffect(() => {
    setDocumentIcons(iconHref, type);
  }, [iconHref, type]);

  return (
    <Helmet>
      {includeTitle && title ? <title>{title}</title> : null}
      <link rel="icon" href={iconHref} {...(type ? { type } : {})} />
      {logoSrc ? <link rel="apple-touch-icon" href={iconHref} /> : null}
      {name ? <meta property="og:site_name" content={name} /> : null}
    </Helmet>
  );
}
