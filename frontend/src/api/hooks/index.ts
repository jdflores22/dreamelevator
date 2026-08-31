import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { authApi, publicApiClient } from '@/api/client';
import { createResourceHooks } from '@/api/hooks/createResourceHooks';
import type {
  ApiResponse,
  AuthUser,
  Blog,
  Career,
  Client,
  ContactFormRequest,
  ContactMessage,
  CreateBlog,
  CreateCareer,
  CreateClient,
  CreatePortfolio,
  CreateProject,
  CreateService,
  CreateSoftwareProduct,
  CreateIndustry,
  CreateFaqItem,
  CreateSiteStat,
  CreateCompanyHighlight,
  CreateProcessStep,
  CreateSeoSetting,
  CreateSiteSetting,
  CreateTechnology,
  CreateTestimonial,
  CreateUser,
  DashboardStats,
  EmailStatus,
  EmailTestResult,
  Industry,
  FaqItem,
  SiteStat,
  CompanyHighlight,
  ProcessStep,
  LoginRequest,
  Portfolio,
  Project,
  SeoSetting,
  Service,
  SiteSetting,
  SoftwareProduct,
  SubscribeRequest,
  Technology,
  Testimonial,
  UpdateBlog,
  UpdateCareer,
  UpdateClient,
  UpdatePortfolio,
  UpdateProject,
  UpdateService,
  UpdateSoftwareProduct,
  UpdateIndustry,
  UpdateFaqItem,
  UpdateSiteStat,
  UpdateCompanyHighlight,
  UpdateProcessStep,
  UpdateSeoSetting,
  UpdateSiteSetting,
  UpdateTechnology,
  UpdateTestimonial,
  UpdateUser,
  User,
  ActivityLog,
  MediaFile,
  Role,
  Subscriber,
  JobApplication,
  InventoryDashboard,
  InventoryFilters,
  InventoryIssuance,
  InventoryIssuanceListParams,
  InventoryIssuanceOptions,
  InventoryListParams,
  InventoryPart,
  Employee,
  EmployeeListParams,
  EmployeeProfile,
  StockLedger,
  StockMovement,
  StockMovementListParams,
  Supplier,
  SupplierListParams,
  UpsertEmployee,
  UpsertInventoryIssuance,
  UpsertInventoryPart,
  UpsertStockMovement,
  UpsertSupplier,
} from '@/types';
import { isCmsRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

function invalidateSettings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['settings'] });
  queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
}

export const servicesHooks = createResourceHooks<Service, CreateService, UpdateService>(
  'services',
  true,
);
export const useServices = servicesHooks.useList;
export const useAdminServices = servicesHooks.useAdminList;
export const useService = servicesHooks.useBySlug;
export const useServiceById = servicesHooks.useById;
export const useCreateService = servicesHooks.useCreate;
export const useUpdateService = servicesHooks.useUpdate;
export const useDeleteService = servicesHooks.useDelete;
export const useReorderServices = servicesHooks.useReorder;

export const productsHooks = createResourceHooks<
  SoftwareProduct,
  CreateSoftwareProduct,
  UpdateSoftwareProduct
>('products', true);
export const useProducts = productsHooks.useList;
export const useAdminProducts = productsHooks.useAdminList;
export const useProductBySlug = productsHooks.useBySlug;
export const useCreateProduct = productsHooks.useCreate;
export const useUpdateProduct = productsHooks.useUpdate;
export const useDeleteProduct = productsHooks.useDelete;
export const useReorderProducts = productsHooks.useReorder;

export const industriesHooks = createResourceHooks<
  Industry,
  CreateIndustry,
  UpdateIndustry
>('industries', true);
export const useIndustries = industriesHooks.useList;
export const useAdminIndustries = industriesHooks.useAdminList;
export const useCreateIndustry = industriesHooks.useCreate;
export const useUpdateIndustry = industriesHooks.useUpdate;
export const useDeleteIndustry = industriesHooks.useDelete;
export const useReorderIndustries = industriesHooks.useReorder;

export const faqHooks = createResourceHooks<FaqItem, CreateFaqItem, UpdateFaqItem>('faq', true);
export const useFaqItems = faqHooks.useList;
export const useAdminFaqItems = faqHooks.useAdminList;
export const useCreateFaqItem = faqHooks.useCreate;
export const useUpdateFaqItem = faqHooks.useUpdate;
export const useDeleteFaqItem = faqHooks.useDelete;
export const useReorderFaqItems = faqHooks.useReorder;

export const siteStatsHooks = createResourceHooks<SiteStat, CreateSiteStat, UpdateSiteStat>('SiteStats', true);
export const useSiteStats = siteStatsHooks.useList;
export const useAdminSiteStats = siteStatsHooks.useAdminList;
export const useCreateSiteStat = siteStatsHooks.useCreate;
export const useUpdateSiteStat = siteStatsHooks.useUpdate;
export const useDeleteSiteStat = siteStatsHooks.useDelete;
export const useReorderSiteStats = siteStatsHooks.useReorder;

export const companyHighlightsHooks = createResourceHooks<CompanyHighlight, CreateCompanyHighlight, UpdateCompanyHighlight>('CompanyHighlights', true);
export const useCompanyHighlights = companyHighlightsHooks.useList;
export const useAdminCompanyHighlights = companyHighlightsHooks.useAdminList;
export const useCreateCompanyHighlight = companyHighlightsHooks.useCreate;
export const useUpdateCompanyHighlight = companyHighlightsHooks.useUpdate;
export const useDeleteCompanyHighlight = companyHighlightsHooks.useDelete;
export const useReorderCompanyHighlights = companyHighlightsHooks.useReorder;

export const processStepsHooks = createResourceHooks<ProcessStep, CreateProcessStep, UpdateProcessStep>('ProcessSteps', true);
export const useProcessSteps = processStepsHooks.useList;
export const useAdminProcessSteps = processStepsHooks.useAdminList;
export const useCreateProcessStep = processStepsHooks.useCreate;
export const useUpdateProcessStep = processStepsHooks.useUpdate;
export const useDeleteProcessStep = processStepsHooks.useDelete;
export const useReorderProcessSteps = processStepsHooks.useReorder;

export const technologiesHooks = createResourceHooks<Technology, CreateTechnology, UpdateTechnology>(
  'technologies',
  true,
);
export const useTechnologies = technologiesHooks.useList;
export const useAdminTechnologies = technologiesHooks.useAdminList;
export const useCreateTechnology = technologiesHooks.useCreate;
export const useUpdateTechnology = technologiesHooks.useUpdate;
export const useDeleteTechnology = technologiesHooks.useDelete;
export const useReorderTechnologies = technologiesHooks.useReorder;

export const portfolioHooks = createResourceHooks<Portfolio, CreatePortfolio, UpdatePortfolio>(
  'portfolio',
  true,
);
export const usePortfolio = portfolioHooks.useList;
export const useAdminPortfolio = portfolioHooks.useAdminList;
export const usePortfolioItem = portfolioHooks.useBySlug;
export const useCreatePortfolio = portfolioHooks.useCreate;
export const useUpdatePortfolio = portfolioHooks.useUpdate;
export const useDeletePortfolio = portfolioHooks.useDelete;
export const useReorderPortfolio = portfolioHooks.useReorder;

export const blogsHooks = createResourceHooks<Blog, CreateBlog, UpdateBlog>('blogs', true);
export const useBlogs = blogsHooks.useList;
export const useAdminBlogs = blogsHooks.useAdminList;
export const useBlog = blogsHooks.useBySlug;
export const useCreateBlog = blogsHooks.useCreate;
export const useUpdateBlog = blogsHooks.useUpdate;
export const useDeleteBlog = blogsHooks.useDelete;

export const clientsHooks = createResourceHooks<Client, CreateClient, UpdateClient>('clients', true);
export const useClients = clientsHooks.useList;
export const useAdminClients = clientsHooks.useAdminList;
export const useCreateClient = clientsHooks.useCreate;
export const useUpdateClient = clientsHooks.useUpdate;
export const useDeleteClient = clientsHooks.useDelete;
/** @deprecated use useClients */
export const usePublicClients = useClients;

export const careersHooks = createResourceHooks<Career, CreateCareer, UpdateCareer>('careers', true);
export const useCareers = careersHooks.useList;
export const useAdminCareers = careersHooks.useAdminList;
export const useCareer = careersHooks.useBySlug;
export const useCreateCareer = careersHooks.useCreate;
export const useUpdateCareer = careersHooks.useUpdate;
export const useDeleteCareer = careersHooks.useDelete;

export const projectsHooks = createResourceHooks<Project, CreateProject, UpdateProject>('projects');
export const useProjects = projectsHooks.useList;
export const useAdminProjects = projectsHooks.useAdminList;
export const useCreateProject = projectsHooks.useCreate;
export const useUpdateProject = projectsHooks.useUpdate;
export const useDeleteProject = projectsHooks.useDelete;

export const testimonialsHooks = createResourceHooks<
  Testimonial,
  CreateTestimonial,
  UpdateTestimonial
>('testimonials', true);
export const useTestimonials = testimonialsHooks.useList;
export const useAdminTestimonials = testimonialsHooks.useAdminList;
export const useCreateTestimonial = testimonialsHooks.useCreate;
export const useUpdateTestimonial = testimonialsHooks.useUpdate;
export const useDeleteTestimonial = testimonialsHooks.useDelete;
export const useReorderTestimonials = testimonialsHooks.useReorder;

export function useAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await authApi.login(payload);
      return data.data;
    },
    onSuccess: (data) => {
      const user: AuthUser = {
        ...data.user,
        role: data.user.roleName ?? data.user.role,
      };
      setAuth(user, data.accessToken, data.refreshToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        logout();
      }
    },
  });

  return { user, isAuthenticated, loginMutation, logoutMutation };
}

export function useDashboardStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    enabled: isAuthenticated && isCmsRole(role),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return data.data;
    },
  });
}

export function useMessages() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['messages'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ContactMessage[]>>('/messages');
      return data.data;
    },
  });
}

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await apiClient.patch<ApiResponse<ContactMessage>>(`/messages/${id}`, {
        status,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (payload: ContactFormRequest) => {
      const { data } = await apiClient.post<ApiResponse<void>>('/messages', payload);
      return data;
    },
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async (payload: SubscribeRequest) => {
      const { data } = await apiClient.post<ApiResponse<void>>('/subscribers', payload);
      return data;
    },
    onSuccess: () => toast.success('Subscribed successfully'),
    onError: () => toast.error('Could not subscribe — try again'),
  });
}

export function useSubscribers(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['subscribers', page, pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Subscriber[]>>('/subscribers', {
        params: { page, pageSize },
      });
      return { items: data.data, meta: data.meta };
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/subscribers/${id}/unsubscribe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Subscriber unsubscribed');
    },
  });
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Subscriber removed');
    },
  });
}

export function useJobApplications(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: ['job-applications', page, pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<JobApplication[]>>('/careers/applications', {
        params: { page, pageSize },
      });
      return { items: data.data, meta: data.meta };
    },
  });
}

export function useSubmitJobApplication() {
  return useMutation({
    mutationFn: async (payload: {
      careerId: string;
      fullName: string;
      email: string;
      phone: string;
      coverLetter: string;
      resumeUrl: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<JobApplication>>('/careers/applications', payload);
      return data.data;
    },
    onSuccess: () => toast.success('Application submitted'),
    onError: () => toast.error('Could not submit application'),
  });
}

export function useUpdateJobApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await apiClient.put<ApiResponse<JobApplication>>(`/careers/applications/${id}`, {
        status,
      });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-applications'] }),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Role[]>>('/users/roles');
      return data.data;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
      return data.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUser) => {
      const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpdateUser }) => {
      const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SiteSetting[]>>('/settings');
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpdateSiteSetting }) => {
      const { data } = await apiClient.put<ApiResponse<SiteSetting>>(`/settings/${id}`, payload);
      return data.data;
    },
    onSuccess: () => invalidateSettings(queryClient),
  });
}

export function useUpsertSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: CreateSiteSetting[]) => {
      const { data } = await apiClient.put<ApiResponse<SiteSetting[]>>('/settings/bulk', items);
      return data.data;
    },
    onSuccess: () => invalidateSettings(queryClient),
  });
}

export function useCreateSiteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSiteSetting) => {
      const { data } = await apiClient.post<ApiResponse<SiteSetting>>('/settings', payload);
      return data.data;
    },
    onSuccess: () => invalidateSettings(queryClient),
  });
}

export function useDeleteSiteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/settings/${id}`);
    },
    onSuccess: () => invalidateSettings(queryClient),
  });
}

export function useSeoSettings() {
  return useQuery({
    queryKey: ['seo'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SeoSetting[]>>('/seo');
      return data.data;
    },
  });
}

export function useSeoByPageKey(pageKey: string) {
  return useQuery({
    queryKey: ['seo', 'page', pageKey],
    queryFn: async () => {
      const { data } = await publicApiClient.get<ApiResponse<SeoSetting>>(`/seo/page/${pageKey}`);
      return data.data;
    },
    enabled: !!pageKey,
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateSeoSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpdateSeoSetting }) => {
      const { data } = await apiClient.put<ApiResponse<SeoSetting>>(`/seo/${id}`, payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo'] }),
  });
}

export function useCreateSeoSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSeoSetting) => {
      const { data } = await apiClient.post<ApiResponse<SeoSetting>>('/seo', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo'] }),
  });
}

export function useDeleteSeoSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/seo/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo'] }),
  });
}

export function useActivityLogs(page: number, pageSize: number, search = '') {
  return useQuery({
    queryKey: ['activity-logs', page, pageSize, search],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ActivityLog[]>>('/ActivityLogs', {
        params: { page, pageSize, search: search || undefined },
      });
      return { items: data.data, meta: data.meta };
    },
  });
}

export function useMediaFiles(folder?: string) {
  return useQuery({
    queryKey: ['media', folder ?? 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<MediaFile[]>>('/upload', {
        params: folder ? { folder } : undefined,
      });
      return data.data;
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (path: string) => {
      await apiClient.delete('/upload', { params: { path } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useEmailStatus() {
  return useQuery({
    queryKey: ['email', 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EmailStatus>>('/email/status');
      return data.data!;
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (to?: string) => {
      const { data } = await apiClient.post<ApiResponse<EmailTestResult>>('/email/test', to ? { to } : {});
      return data.data!;
    },
  });
}

const inventoryHooks = createResourceHooks<InventoryPart, UpsertInventoryPart, UpsertInventoryPart>(
  'InventoryParts',
);
export const useCreateInventoryPart = inventoryHooks.useCreate;
export const useUpdateInventoryPart = inventoryHooks.useUpdate;
export const useDeleteInventoryPart = inventoryHooks.useDelete;

export function useAdminInventory(params: InventoryListParams = {}, options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryParts', 'list', params],
    enabled: isAuthenticated && (options?.enabled ?? true),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryPart[]>>('/InventoryParts', {
        params: {
          search: params.search || undefined,
          supplier: params.supplier || undefined,
          project: params.project || undefined,
          lineKind: params.lineKind || undefined,
          from: params.from || undefined,
          to: params.to || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 50,
        },
      });
      return { items: data.data ?? [], meta: data.meta };
    },
  });
}

export function useInventoryDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryParts', 'dashboard'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryDashboard>>('/InventoryParts/dashboard');
      return data.data;
    },
  });
}

export function useInventoryFilters() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryParts', 'filters'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryFilters>>('/InventoryParts/filters');
      return data.data;
    },
  });
}

export function useAdminInventoryIssuances(params: InventoryIssuanceListParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryIssuances', 'list', params],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryIssuance[]>>('/InventoryIssuances', {
        params: {
          search: params.search || undefined,
          clientId: params.clientId || undefined,
          inventoryPartId: params.inventoryPartId || undefined,
          employeeId: params.employeeId || undefined,
          from: params.from || undefined,
          to: params.to || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 25,
        },
      });
      return { items: data.data ?? [], meta: data.meta };
    },
  });
}

export function useInventoryIssuance(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryIssuances', 'detail', id],
    enabled: isAuthenticated && Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryIssuance>>(`/InventoryIssuances/${id}`);
      return data.data!;
    },
  });
}

export function useInventoryIssuanceOptions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['InventoryIssuances', 'options'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<InventoryIssuanceOptions>>('/InventoryIssuances/options');
      return data.data;
    },
  });
}

function inventoryApiError(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const maybe = error as {
      response?: { data?: { message?: string; errors?: string[] } };
      message?: string;
    };
    return maybe.response?.data?.errors?.[0] ?? maybe.response?.data?.message ?? maybe.message ?? fallback;
  }
  return fallback;
}

export function useCreateInventoryIssuance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertInventoryIssuance) => {
      const { data } = await apiClient.post<ApiResponse<InventoryIssuance>>('/InventoryIssuances', payload);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['InventoryIssuances'] });
      queryClient.invalidateQueries({ queryKey: ['InventoryParts'] });
      toast.success('Stock out recorded');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to record stock out')),
  });
}

export function useUpdateInventoryIssuance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpsertInventoryIssuance }) => {
      const { data } = await apiClient.put<ApiResponse<InventoryIssuance>>(`/InventoryIssuances/${id}`, payload);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['InventoryIssuances'] });
      queryClient.invalidateQueries({ queryKey: ['InventoryParts'] });
      toast.success('Stock out updated');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to update stock out')),
  });
}

export function useDeleteInventoryIssuance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<ApiResponse<object>>(`/InventoryIssuances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['InventoryIssuances'] });
      queryClient.invalidateQueries({ queryKey: ['InventoryParts'] });
      toast.success('Stock out deleted');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to delete stock out')),
  });
}

/** Renaming a supplier rewrites register lines, so refresh inventory queries too. */
function invalidateSuppliers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['Suppliers'] });
  queryClient.invalidateQueries({ queryKey: ['InventoryParts'] });
}

export function useSuppliers(params: SupplierListParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['Suppliers', 'list', params],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Supplier[]>>('/Suppliers', {
        params: {
          search: params.search || undefined,
          activeOnly: params.activeOnly ? true : undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
        },
      });
      return { items: data.data ?? [], meta: data.meta };
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertSupplier) => {
      const { data } = await apiClient.post<ApiResponse<Supplier>>('/Suppliers', payload);
      return data.data!;
    },
    onSuccess: () => {
      invalidateSuppliers(queryClient);
      toast.success('Supplier added');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to add supplier')),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpsertSupplier }) => {
      const { data } = await apiClient.put<ApiResponse<Supplier>>(`/Suppliers/${id}`, payload);
      return data.data!;
    },
    onSuccess: () => {
      invalidateSuppliers(queryClient);
      toast.success('Supplier updated');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to update supplier')),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<ApiResponse<object>>(`/Suppliers/${id}`);
    },
    onSuccess: () => {
      invalidateSuppliers(queryClient);
      toast.success('Supplier deleted');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to delete supplier')),
  });
}

/** Renaming an employee rewrites past slips, so refresh stock-out queries too. */
function invalidateEmployees(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['Employees'] });
  queryClient.invalidateQueries({ queryKey: ['InventoryIssuances'] });
}

export function useEmployees(params: EmployeeListParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['Employees', 'list', params],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Employee[]>>('/Employees', {
        params: {
          search: params.search || undefined,
          department: params.department || undefined,
          activeOnly: params.activeOnly ? true : undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
        },
      });
      return { items: data.data ?? [], meta: data.meta };
    },
  });
}

export function useEmployeeProfile(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['Employees', 'profile', id],
    enabled: isAuthenticated && Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EmployeeProfile>>(`/Employees/${id}/profile`);
      return data.data!;
    },
  });
}

export function useEmployeeDepartments() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['Employees', 'departments'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<string[]>>('/Employees/departments');
      return data.data ?? [];
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertEmployee) => {
      const { data } = await apiClient.post<ApiResponse<Employee>>('/Employees', payload);
      return data.data!;
    },
    onSuccess: () => {
      invalidateEmployees(queryClient);
      toast.success('Employee added');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to add employee')),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: UpsertEmployee }) => {
      const { data } = await apiClient.put<ApiResponse<Employee>>(`/Employees/${id}`, payload);
      return data.data!;
    },
    onSuccess: () => {
      invalidateEmployees(queryClient);
      toast.success('Employee updated');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to update employee')),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<ApiResponse<object>>(`/Employees/${id}`);
    },
    onSuccess: () => {
      invalidateEmployees(queryClient);
      toast.success('Employee removed');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to remove employee')),
  });
}

/** A movement changes on-hand, so every stock view has to refetch. */
function invalidateStock(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['StockMovements'] });
  queryClient.invalidateQueries({ queryKey: ['InventoryParts'] });
  queryClient.invalidateQueries({ queryKey: ['InventoryIssuances'] });
  queryClient.invalidateQueries({ queryKey: ['Employees'] });
}

export function useStockMovements(params: StockMovementListParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['StockMovements', 'list', params],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StockMovement[]>>('/StockMovements', {
        params: {
          search: params.search || undefined,
          movementType: params.movementType || undefined,
          inventoryPartId: params.inventoryPartId || undefined,
          employeeId: params.employeeId || undefined,
          from: params.from || undefined,
          to: params.to || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 25,
        },
      });
      return { items: data.data ?? [], meta: data.meta };
    },
  });
}

export function useStockLedger(partId?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['StockMovements', 'ledger', partId],
    enabled: isAuthenticated && Boolean(partId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StockLedger>>(`/StockMovements/ledger/${partId}`);
      return data.data!;
    },
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertStockMovement) => {
      const { data } = await apiClient.post<ApiResponse<StockMovement>>('/StockMovements', payload);
      return data.data!;
    },
    onSuccess: (movement) => {
      invalidateStock(queryClient);
      toast.success(movement.delta > 0 ? 'Stock added back' : 'Stock deducted');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to record movement')),
  });
}

export function useDeleteStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<ApiResponse<object>>(`/StockMovements/${id}`);
    },
    onSuccess: () => {
      invalidateStock(queryClient);
      toast.success('Movement deleted');
    },
    onError: (err: unknown) => toast.error(inventoryApiError(err, 'Failed to delete movement')),
  });
}
