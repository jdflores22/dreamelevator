import type { GalleryImage } from '@/utils/gallery';

export const DEEC_GALLERY_PHOTOS: GalleryImage[] = [
  { src: '/uploads/gallery/installation-01.jpg', alt: 'Elevator installation' },
  { src: '/uploads/gallery/installation-02.jpg', alt: 'Elevator installation' },
  { src: '/uploads/gallery/installation-03.jpg', alt: 'Elevator installation' },
  { src: '/uploads/gallery/installation-04.jpg', alt: 'Elevator shaft work' },
  { src: '/uploads/gallery/installation-05.jpg', alt: 'Elevator installation' },
  { src: '/uploads/gallery/process-intallation-01.png', alt: 'Installation in progress' },
  { src: '/uploads/gallery/process-intallation-02.png', alt: 'Installation in progress' },
  { src: '/uploads/gallery/process-intallation-hydrau.png', alt: 'Hydraulic lift installation' },
  { src: '/uploads/gallery/process-intallation-hydrau-2.png', alt: 'Hydraulic lift installation' },
  { src: '/uploads/gallery/process-unloading-01.png', alt: 'Jobsite unloading' },
  { src: '/uploads/gallery/process-unloading-02.png', alt: 'Jobsite unloading' },
  { src: '/uploads/gallery/process-jsc-01.png', alt: 'Jobsite coordination' },
  { src: '/uploads/gallery/process-jsc-02.png', alt: 'Jobsite coordination' },
  { src: '/uploads/gallery/prod-coor-01.png', alt: 'Production coordination' },
  { src: '/uploads/gallery/prod-coor-02.png', alt: 'Production coordination' },
  { src: '/uploads/gallery/service-02.png', alt: 'Service and maintenance' },
  { src: '/uploads/gallery/csm1.png', alt: 'Control system work' },
  { src: '/uploads/gallery/csm2.png', alt: 'Control system work' },
  { src: '/uploads/gallery/latest-project_.jpg', alt: 'Recent project' },
  { src: '/uploads/gallery/about-us-01.png', alt: 'DREAM operations' },
  { src: '/uploads/gallery/about-us-02.png', alt: 'DREAM operations' },
  { src: '/uploads/gallery/about-us-03.png', alt: 'DREAM operations' },
  { src: '/uploads/gallery/about-us-page-edited.png', alt: 'DREAM team and jobsite' },
  { src: '/uploads/gallery/20220216_150627.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20220209_094039.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20220209_094032.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20211207_135517.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20211201_070055.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210922_111930.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210922_111917.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210908_153850.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210820_111051-1.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210820_151842.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210812_143722.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210812_143715.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210812_143659.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210812_125948.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210803_150428.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20210802_102036.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20181010_094023.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20181010_094000.jpg', alt: 'Jobsite photo' },
  { src: '/uploads/gallery/20181010_093957.jpg', alt: 'Jobsite photo' },
];

const LOCAL_GALLERY_FILES = new Set(
  DEEC_GALLERY_PHOTOS.map((item) => item.src.split('/').pop() ?? ''),
);

/** Prefer the local copy when the CMS still points at the live WordPress URL. */
export function localizeGallerySrc(src: string): string {
  const file = src.split('?')[0]?.split('/').pop() ?? '';
  if (file && LOCAL_GALLERY_FILES.has(file)) return `/uploads/gallery/${file}`;
  return src;
}
