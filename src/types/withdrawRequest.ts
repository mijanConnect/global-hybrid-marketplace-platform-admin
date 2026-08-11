export type WithdrawRequestStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'hold';

export interface WithdrawRequestUser {
  _id: string;
  name: string;
  email: string;
}

export interface WithdrawRequest {
  _id: string;
  wallet: string;
  user: WithdrawRequestUser;
  amount: number;
  status: WithdrawRequestStatus;
  method: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawRequestsResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: WithdrawRequest[];
}
