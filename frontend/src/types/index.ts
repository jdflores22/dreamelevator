export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isDeleted: boolean;
}

export const ProjectStatus = {
  Planning: 0,
  InProgress: 1,
  Completed: 2,
  OnHold: 3,
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const MessageStatus = {
  New: 0,
  InProgress: 1,
  Closed: 2,
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const ApplicationStatus = {
  Pending: 0,
  Reviewing: 1,
  Accepted: 2,
  Rejected: 3,
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export interface Service extends BaseEntity {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  sortOrder: number;
}

export interface Technology extends BaseEntity {
  name: string;
  category: string;
  iconUrl: string;
  sortOrder: number;
}

export interface SoftwareProduct extends BaseEntity {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuresJson: string;
  screenshotsJson: string;
  logoUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  homepageRow: number;
}

export interface Industry extends BaseEntity {
  name: string;
  slug: string;
  shortDescription: string;
  iconUrl: string;
  sortOrder: number;
}

export interface FaqItem extends BaseEntity {
  question: string;
  answer: string;
  sortOrder: number;
}

export interface SiteStat extends BaseEntity {
  value: string;
  label: string;
  icon: string;
  sortOrder: number;
}

export interface CompanyHighlight extends BaseEntity {
  title: string;
  description: string;
  sortOrder: number;
  homepageRow: number;
}

export interface ProcessStep extends BaseEntity {
  stepLabel: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface Client extends BaseEntity {
  name: string;
  logoUrl: string;
  location: string;
  website: string;
}

export interface Portfolio extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  content: string;
  clientId?: string;
  client?: Client;
  logoUrl: string;
  imagesJson: string;
  techStackJson: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface BlogCategory extends BaseEntity {
  name: string;
  slug: string;
}

export interface Blog extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  categoryId?: string;
  category?: BlogCategory;
  authorId?: string;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  serviceId?: string;
  service?: Service;
  status: ProjectStatus;
}

export interface Testimonial extends BaseEntity {
  name: string;
  company: string;
  quote: string;
  avatarUrl: string;
  sortOrder: number;
  rating: number;
}

export interface Career extends BaseEntity {
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
}

export interface JobApplication {
  id: string;
  careerId: string;
  careerTitle?: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  companyName: string;
  senderType: string;
  subject: string;
  body: string;
  status: MessageStatus;
  assignedToId?: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName?: string;
  role?: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  group: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface SeoSetting {
  id: string;
  pageKey: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  isPublished: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface MediaFile {
  url: string;
  fileName: string;
  folder: string;
  sizeBytes: number;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface DashboardStats {
  totalProjects: number;
  totalServices: number;
  totalPortfolio: number;
  totalMessages: number;
  totalBlogs: number;
  totalCareers: number;
  unreadMessages: number;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  companyName: string;
  senderType: string;
  subject: string;
  body: string;
}

export interface SubscribeRequest {
  email: string;
}

export type CreateService = Omit<Service, keyof BaseEntity>;
export type UpdateService = Partial<Omit<Service, keyof BaseEntity>>;

export type CreateTechnology = Omit<Technology, keyof BaseEntity>;
export type UpdateTechnology = Partial<Omit<Technology, keyof BaseEntity>>;

export type CreateSoftwareProduct = Omit<SoftwareProduct, keyof BaseEntity>;
export type UpdateSoftwareProduct = Partial<Omit<SoftwareProduct, keyof BaseEntity>> &
  Partial<Pick<BaseEntity, 'isPublished'>>;
export type CreateIndustry = Omit<Industry, keyof BaseEntity>;
export type UpdateIndustry = Partial<Omit<Industry, keyof BaseEntity>>;
export type CreateFaqItem = Omit<FaqItem, keyof BaseEntity>;
export type UpdateFaqItem = Partial<Omit<FaqItem, keyof BaseEntity>>;
export type CreateSiteStat = Omit<SiteStat, keyof BaseEntity>;
export type UpdateSiteStat = Partial<Omit<SiteStat, keyof BaseEntity>>;
export type CreateCompanyHighlight = Omit<CompanyHighlight, keyof BaseEntity>;
export type UpdateCompanyHighlight = Partial<Omit<CompanyHighlight, keyof BaseEntity>>;
export type CreateProcessStep = Omit<ProcessStep, keyof BaseEntity>;
export type UpdateProcessStep = Partial<Omit<ProcessStep, keyof BaseEntity>>;

export type CreatePortfolio = Omit<Portfolio, keyof BaseEntity | 'client'>;
export type UpdatePortfolio = Partial<Omit<Portfolio, keyof BaseEntity | 'client'>>;

export type CreateBlog = Omit<Blog, keyof BaseEntity | 'category'>;
export type UpdateBlog = Partial<Omit<Blog, keyof BaseEntity | 'category'>> &
  Partial<Pick<BaseEntity, 'isPublished'>>;

export type CreateClient = Omit<Client, keyof BaseEntity>;
export type UpdateClient = Partial<Omit<Client, keyof BaseEntity>>;

export type CreateCareer = Omit<Career, keyof BaseEntity>;
export type UpdateCareer = Partial<Omit<Career, keyof BaseEntity>>;

export type CreateProject = Omit<Project, keyof BaseEntity | 'service'>;
export type UpdateProject = Partial<Omit<Project, keyof BaseEntity | 'service'>>;

export type CreateTestimonial = Omit<Testimonial, keyof BaseEntity>;
export type UpdateTestimonial = Partial<Omit<Testimonial, keyof BaseEntity>>;

export type CreateUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
};

export type UpdateUser = Partial<Omit<CreateUser, 'password'>> & { password?: string };

export type CreateSeoSetting = Omit<SeoSetting, 'id' | 'updatedAt'>;
export type UpdateSeoSetting = Partial<CreateSeoSetting>;

export type CreateSiteSetting = Omit<SiteSetting, 'id' | 'updatedAt'>;
export type UpdateSiteSetting = Partial<CreateSiteSetting>;

export interface EmailStatus {
  isConfigured: boolean;
  provider: string;
  host?: string | null;
  port: number;
  from?: string | null;
  username?: string | null;
  enableSsl: boolean;
  companyEmail: string;
  configurationHint?: string | null;
  configSource: string;
  usesContactEmailAsLogin: boolean;
  hasPassword: boolean;
  hasApiToken: boolean;
}

export interface EmailTestResult {
  success: boolean;
  outcome: string;
  to: string;
  message: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  notes: string;
  sortOrder: number;
  lineCount: number;
}

export type UpsertSupplier = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  notes: string;
  sortOrder: number;
  isPublished: boolean;
};

export interface SupplierListParams {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export type InventoryLineKind = 'Part' | 'Charge' | 'Note';

export interface InventoryPart extends BaseEntity {
  purchasedAt: string | null;
  supplier: string;
  item: string;
  specification: string;
  quantity: number | null;
  issuedQuantity: number;
  returnedQuantity: number;
  adjustedQuantity: number;
  onHand: number;
  unitPrice: number | null;
  totalPrice: number | null;
  amountInPeso: number | null;
  projectBuilding: string;
  lineKind: InventoryLineKind | string;
  currency: string;
  notes: string;
  sortOrder: number;
}

export type UpsertInventoryPart = {
  purchasedAt?: string | null;
  supplier: string;
  item: string;
  specification: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  amountInPeso: number | null;
  projectBuilding: string;
  lineKind: string;
  currency: string;
  notes: string;
  sortOrder: number;
  isPublished: boolean;
};

export interface InventoryNamedTotal {
  name: string;
  total: number;
  totalUsd: number;
  totalPhp: number;
  count: number;
  quantity: number;
}

export interface InventoryIssuance {
  id: string;
  inventoryPartId: string | null;
  item: string;
  specification: string;
  quantity: number;
  issuedAt: string | null;
  receivedByEmployeeId: string | null;
  receivedByUserId: string | null;
  receivedByName: string;
  receivedByPosition: string;
  receivedByCode: string;
  receivedByDepartment: string;
  receivedByPhotoUrl: string;
  clientId: string | null;
  clientName: string;
  projectBuilding: string;
  purpose: string;
  notes: string;
  issuedByUserId: string | null;
  issuedByName: string;
  onHandAfter?: number | null;
  returnedQuantity: number;
  returnableQuantity: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpsertInventoryIssuance = {
  inventoryPartId?: string | null;
  item: string;
  specification: string;
  quantity: number;
  issuedAt?: string | null;
  receivedByEmployeeId?: string | null;
  receivedByUserId?: string | null;
  receivedByName: string;
  clientId?: string | null;
  clientName: string;
  projectBuilding: string;
  purpose: string;
  notes: string;
  isPublished: boolean;
};

export interface InventoryAvailablePart {
  id: string;
  item: string;
  specification: string;
  supplier: string;
  projectBuilding: string;
  purchasedAt: string | null;
  purchasedQuantity: number;
  issuedQuantity: number;
  onHand: number;
}

export interface InventoryRecipientOption {
  id: string;
  name: string;
  email: string;
}

export type StockMovementType = 'Return' | 'Damage' | 'Loss' | 'Adjustment';

export interface StockMovement {
  id: string;
  inventoryPartId: string;
  item: string;
  specification: string;
  supplier: string;
  movementType: StockMovementType;
  quantity: number;
  damagedQuantity: number;
  delta: number;
  occurredAt: string | null;
  sourceIssuanceId: string | null;
  employeeId: string | null;
  employeeName: string;
  reason: string;
  notes: string;
  recordedByUserId: string | null;
  recordedByName: string;
  onHandAfter: number;
  createdAt: string;
  updatedAt: string;
}

export type UpsertStockMovement = {
  inventoryPartId: string;
  movementType: StockMovementType;
  quantity: number;
  damagedQuantity: number;
  increase: boolean;
  occurredAt?: string | null;
  sourceIssuanceId?: string | null;
  employeeId?: string | null;
  employeeName: string;
  reason: string;
  notes: string;
};

export interface StockMovementListParams {
  search?: string;
  movementType?: string;
  inventoryPartId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface StockLedgerEntry {
  id: string;
  kind: string;
  occurredAt: string | null;
  delta: number;
  balance: number;
  reference: string;
  notes: string;
}

export interface StockLedger {
  inventoryPartId: string;
  item: string;
  specification: string;
  supplier: string;
  purchasedQuantity: number;
  issuedQuantity: number;
  returnedQuantity: number;
  adjustedQuantity: number;
  damagedQuantity: number;
  onHand: number;
  entries: StockLedgerEntry[];
}

export interface InventoryEmployeeOption {
  id: string;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  photoUrl: string;
}

export interface InventoryIssuanceOptions {
  recipients: InventoryRecipientOption[];
  employees: InventoryEmployeeOption[];
  availableParts: InventoryAvailablePart[];
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photoUrl: string;
  hiredAt: string | null;
  notes: string;
  sortOrder: number;
  userId: string | null;
  isPublished: boolean;
  issuanceCount: number;
  totalQuantityIssued: number;
  lastIssuedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpsertEmployee = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photoUrl: string;
  hiredAt?: string | null;
  notes: string;
  sortOrder: number;
  userId?: string | null;
  isPublished: boolean;
};

export interface EmployeeItemTotal {
  item: string;
  quantity: number;
  count: number;
}

export interface EmployeeProfile {
  employee: Employee;
  issuances: InventoryIssuance[];
  topItems: EmployeeItemTotal[];
}

export interface EmployeeListParams {
  search?: string;
  department?: string;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface InventoryIssuanceListParams {
  search?: string;
  clientId?: string;
  inventoryPartId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryDashboard {
  totalLines: number;
  partCount: number;
  chargeCount: number;
  supplierCount: number;
  totalQuantity: number;
  totalSpendUsd: number;
  totalSpendPhp: number;
  averageUnitPriceUsd: number;
  averageUnitPricePhp: number;
  usdToPhpRate: number;
  phpEnteredCount: number;
  phpEstimatedCount: number;
  missingPriceCount: number;
  unassignedProjectCount: number;
  totalIssuedQuantity: number;
  totalReturnedQuantity: number;
  totalAdjustedQuantity: number;
  issuanceCount: number;
  totalOnHandQuantity: number;
  zeroStockCount: number;
  spendBySupplier: InventoryNamedTotal[];
  spendByMonth: InventoryNamedTotal[];
  topItems: InventoryNamedTotal[];
  recent: InventoryPart[];
  recentIssuances: InventoryIssuance[];
}

export interface InventoryFilters {
  suppliers: string[];
  projects: string[];
  lineKinds: string[];
}

export interface InventoryListParams {
  search?: string;
  supplier?: string;
  project?: string;
  lineKind?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
