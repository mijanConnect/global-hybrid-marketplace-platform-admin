export interface Customer {
  _id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  profileImage: string;
  address?: string;
  status: string;
  createdAt: string;
  ordersCount: number;
  totalSpend: number;
}

export interface CustomersListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: Customer[];
}

export interface CustomerDetailsResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
    productOrders: any[];
    serviceOrders: any[];
  };
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}
