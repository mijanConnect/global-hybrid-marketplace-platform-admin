export type DisclaimerData = {
  _id?: string;
  type: string;
  __v?: number;
  content: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DisclaimerResponse = {
  success: boolean;
  message: string;
  data: DisclaimerData | null;
};

export type UpdateDisclaimerRequest = {
  type: string;
  content: string;
  version?: string;
};
