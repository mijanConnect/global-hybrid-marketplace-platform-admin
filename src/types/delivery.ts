export type DeliveryType = "international" | "local";
export type DeliveryStatus = "pending" | "confirmed" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface DeliveryCustomer {
  _id: string;
  name: string;
  email: string;
}

export interface Delivery {
  _id: string;
  orderId: string;
  customer: DeliveryCustomer;
  deliveryType: DeliveryType;
  createdAt: string;
  rider: any | null; // Expand as needed if rider info becomes available
  pickupAddress: string;
  dropoffAddress: string;
  status: DeliveryStatus;
}

export interface DeliveryTimelineEvent {
  stage: string;
  completed: boolean;
  timestamp: string;
  note: string;
}

export interface DeliveryDetails {
  overview: {
    orderId: string;
    type: string;
    status: DeliveryStatus;
  };
  driverInfo: any | null;
  locations: {
    pickup: string;
    drop: string;
  };
  timeline: DeliveryTimelineEvent[];
}

export interface DeliveryStats {
  activeDeliveries: number;
  pendingAssignments: number;
  deliveredToday: number;
  avgDeliveryTime: string;
}

export interface DeliveriesResponse {
  success: boolean;
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Delivery[];
}

export interface DeliveryDetailsResponse {
  success: boolean;
  message: string;
  data: DeliveryDetails;
}

export interface DeliveryStatsResponse {
  success: boolean;
  message: string;
  data: DeliveryStats;
}
