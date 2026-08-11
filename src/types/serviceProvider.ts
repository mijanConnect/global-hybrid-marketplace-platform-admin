export type ServiceProvider = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: 'active' | 'inactive';
  createdAt: string;
  specialty: string;
  location: string;
  jobs: number;
  rating: number;
};

export type ServiceProvidersStatsData = {
  totalProviders: number;
  activeProviders: number;
  inactiveProviders: number;
};

export type ServiceProvidersStatsResponse = {
  success: boolean;
  message: string;
  data: ServiceProvidersStatsData;
};

export type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ServiceProvidersResponse = {
  success: boolean;
  message: string;
  pagination: PaginationData;
  data: ServiceProvider[];
};

export type UpdateServiceProviderStatusRequest = {
  id: string;
  status: 'active' | 'inactive';
};

export type UpdateServiceProviderStatusResponse = {
  success: boolean;
  message: string;
};
