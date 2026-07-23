export type UserRole = "customer" | "vendor" | "driver";
export type UserStatus = "active" | "blocked";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  status: UserStatus;
};

export type UsersListResponse = {
  items: UserRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type GetUsersParams = {
  q?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  pageSize?: number;
};

export type UserProfileResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    profileImage: string;
    coverImage: string;
    about: string;
    address: string;
    status: string;
    isVerified: boolean;
  };
};
