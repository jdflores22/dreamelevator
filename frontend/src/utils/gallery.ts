export interface GalleryImage {
  src: string;
  alt: string;
}

/** Parse gallery_images from JSON `[{src,alt}]` or one path per line (`src|alt`). */
export function parseGalleryImages(raw: string): GalleryImage[] {
  const value = raw.trim();
  if (!value) return [];

  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => {
          if (typeof item === 'string') return { src: item.trim(), alt: '' };
          if (item && typeof item === 'object') {
            const record = item as { src?: unknown; alt?: unknown; url?: unknown };
            const src = String(record.src ?? record.url ?? '').trim();
            const alt = String(record.alt ?? '').trim();
            return src ? { src, alt } : null;
          }
          return null;
        })
        .filter((item): item is GalleryImage => item !== null);
    } catch {
      return [];
    }
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src, ...rest] = line.split('|');
      return { src: src.trim(), alt: rest.join('|').trim() };
    })
    .filter((item) => item.src.length > 0);
}

export function serializeGalleryImages(images: GalleryImage[]): string {
  return JSON.stringify(images.map((item) => ({ src: item.src, alt: item.alt })));
}
