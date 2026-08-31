import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Briefcase,
  Building2,
  Factory,
  FileText,
  FolderKanban,
  Gauge,
  HelpCircle,
  History,
  Image,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  ListOrdered,
  Mail,
  Mails,
  MessageSquareQuote,
  Newspaper,
  Package,
  PackageMinus,
  Repeat2,
  PenSquare,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Clients', href: '/clients' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

/** Keys of numeric counters exposed by the dashboard stats endpoint. */
export type AdminBadgeKey = 'unreadMessages';

export interface AdminNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Short helper shown under the label in search / command results. */
  description?: string;
  /** When set, renders a live count pill sourced from dashboard stats. */
  badgeKey?: AdminBadgeKey;
}

export interface AdminNavGroup {
  /** Stable id used to persist the collapsed/expanded state. */
  id: string;
  label: string;
  icon: LucideIcon;
  links: AdminNavLink[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    links: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: Gauge,
        description: 'Metrics & quick actions',
      },
    ],
  },
  {
    id: 'homepage',
    label: 'Homepage',
    icon: LayoutTemplate,
    links: [
      { label: 'Stats', href: '/admin/stats', icon: BarChart3, description: 'Headline numbers' },
      {
        label: 'Why choose us',
        href: '/admin/highlights',
        icon: Sparkles,
        description: 'Value highlights',
      },
      {
        label: 'Process steps',
        href: '/admin/process-steps',
        icon: ListOrdered,
        description: 'How you work',
      },
      {
        label: 'Testimonials',
        href: '/admin/testimonials',
        icon: MessageSquareQuote,
        description: 'Client quotes',
      },
      { label: 'Clients', href: '/admin/clients', icon: Building2, description: 'Logos & partners' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: ShoppingBag,
    links: [
      { label: 'Services', href: '/admin/services', icon: Wrench, description: 'What you offer' },
      {
        label: 'Products',
        href: '/admin/products',
        icon: Package,
        description: 'ECMS, CRM, ERP & more',
      },
      {
        label: 'Industries',
        href: '/admin/industries',
        icon: Factory,
        description: 'Sector expertise',
      },
      {
        label: 'Technologies',
        href: '/admin/technologies',
        icon: Layers,
        description: 'Your tech stack',
      },
    ],
  },
  {
    id: 'showcase',
    label: 'Showcase',
    icon: Briefcase,
    links: [
      {
        label: 'Portfolio',
        href: '/admin/portfolio',
        icon: Briefcase,
        description: 'Client case studies',
      },
      {
        label: 'Projects',
        href: '/admin/projects',
        icon: FolderKanban,
        description: 'Delivered work',
      },
    ],
  },
  {
    id: 'publishing',
    label: 'Publishing',
    icon: PenSquare,
    links: [
      { label: 'Blog', href: '/admin/blog', icon: Newspaper, description: 'Articles & news' },
      { label: 'FAQ', href: '/admin/faq', icon: HelpCircle, description: 'Common questions' },
      { label: 'Careers', href: '/admin/careers', icon: Users, description: 'Open positions' },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    icon: Inbox,
    links: [
      {
        label: 'Messages',
        href: '/admin/messages',
        icon: Mail,
        description: 'Contact submissions',
        badgeKey: 'unreadMessages',
      },
      {
        label: 'Subscribers',
        href: '/admin/subscribers',
        icon: Mails,
        description: 'Newsletter list & export',
      },
      {
        label: 'Applications',
        href: '/admin/applications',
        icon: Briefcase,
        description: 'Career applications inbox',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Warehouse,
    links: [
      {
        label: 'Inventory dashboard',
        href: '/admin/workspace',
        icon: Gauge,
        description: 'Parts spend & suppliers',
      },
      {
        label: 'Parts register',
        href: '/admin/workspace/inventory',
        icon: Package,
        description: 'CRUD matching the Excel file',
      },
      {
        label: 'Stock out',
        href: '/admin/workspace/inventory/out',
        icon: PackageMinus,
        description: 'Issue parts to people and sites',
      },
      {
        label: 'Movements',
        href: '/admin/workspace/inventory/movements',
        icon: Repeat2,
        description: 'Returns, damage, loss, count fixes',
      },
      {
        label: 'Suppliers',
        href: '/admin/workspace/suppliers',
        icon: Truck,
        description: 'Master list of parts suppliers',
      },
      {
        label: 'Employees',
        href: '/admin/workspace/employees',
        icon: Users,
        description: 'Staff profiles that receive stock',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    links: [
      { label: 'Media library', href: '/admin/media', icon: Image, description: 'Images & uploads' },
      { label: 'Activity log', href: '/admin/activity', icon: History, description: 'Audit trail' },
      { label: 'Users', href: '/admin/users', icon: Shield, description: 'Team & access' },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Branding & site content',
      },
      { label: 'SEO', href: '/admin/seo', icon: FileText, description: 'Search & metadata' },
    ],
  },
];

/** @deprecated use adminNavGroups */
export const adminNavLinks: AdminNavLink[] = adminNavGroups.flatMap((g) => g.links);

/** Flat list of every admin link paired with its group label (for search/command palette). */
export const adminNavIndex: (AdminNavLink & { group: string })[] = adminNavGroups.flatMap((g) =>
  g.links.map((link) => ({ ...link, group: g.label })),
);

export const adminPageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/workspace': 'Inventory dashboard',
  '/admin/workspace/inventory': 'Parts register',
  '/admin/workspace/inventory/out': 'Stock out',
  '/admin/workspace/suppliers': 'Suppliers',
  '/admin/workspace/employees': 'Employees',
  '/admin/workspace/inventory/movements': 'Stock movements',
  '/admin/projects': 'Projects',
  '/admin/services': 'Services',
  '/admin/products': 'Software products',
  '/admin/industries': 'Sector expertise',
  '/admin/faq': 'FAQ',
  '/admin/stats': 'Homepage stats',
  '/admin/highlights': 'Why choose us',
  '/admin/process-steps': 'Process steps',
  '/admin/technologies': 'Technologies',
  '/admin/portfolio': 'Portfolio',
  '/admin/clients': 'Clients',
  '/admin/testimonials': 'Testimonials',
  '/admin/blog': 'Blog',
  '/admin/messages': 'Messages',
  '/admin/subscribers': 'Newsletter subscribers',
  '/admin/applications': 'Job applications',
  '/admin/careers': 'Careers',
  '/admin/users': 'Users',
  '/admin/media': 'Media library',
  '/admin/activity': 'Activity log',
  '/admin/settings': 'Settings',
  '/admin/seo': 'SEO',
};
