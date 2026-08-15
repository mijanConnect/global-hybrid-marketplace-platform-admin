import { baseApi } from "@/services/baseApi";
import type {
  DeliveryDriver,
  DeliveryDriverDetail,
  DeliveryDriversOverview,
} from "@/features/delivery-drivers/types";

export const deliveryDriversApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryDriversOverview: build.query<DeliveryDriversOverview, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const statsRes = await fetchWithBQ("/admin-dashboard/drivers/stats");
        const driversRes = await fetchWithBQ("/admin-dashboard/drivers");

        if (statsRes.error) return { error: statsRes.error as any };
        if (driversRes.error) return { error: driversRes.error as any };

        const statsData = (statsRes.data as any).data;
        const driversData = (driversRes.data as any).data;

        const drivers: DeliveryDriver[] = driversData.map((d: any) => ({
          id: d._id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          country: "N/A",
          vehicleType: d.vehicleType,
          accountStatus: d.status,
          verified: d.isRiderVerified,
          liveStatus: d.liveStatus || "offline",
          rating: d.rating,
          ratingCount: 0,
          completedOrders: d.completedCount,
          cancelledOrders: 0,
          totalEarnings: d.totalEarnings,
          weeklyEarnings: 0,
          joinDate: new Date(d.createdAt).toLocaleDateString(),
          avgDeliveryMinutes: 0,
          avatarUrl: d.profileImage,
          completedToday: 0,
          documents: [],
          reviews: [],
          deliveries: [],
          weeklyEarningsSeries: [],
          monthlyEarningsSeries: [],
          deliveryGrowthSeries: [],
        }));

        return {
          data: {
            stats: statsData,
            drivers,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "DeliveryDrivers", id: "LIST" },
              ...result.drivers.map((d) => ({
                type: "DeliveryDrivers" as const,
                id: d.id,
              })),
            ]
          : [{ type: "DeliveryDrivers", id: "LIST" }],
    }),

    getDeliveryDriver: build.query<DeliveryDriverDetail, string>({
      async queryFn(id, _queryApi, _extraOptions, fetchWithBQ) {
        const res = await fetchWithBQ(`/admin-dashboard/drivers/${id}`);
        if (res.error) return { error: res.error as any };

        const data = (res.data as any).data;
        const driver = data.driver;
        const overview = data.overview;
        const earnings = data.earnings;
        const documents = data.documents;

        const deliveriesRes = await fetchWithBQ(
          `/admin-dashboard/drivers/${id}/deliveries`,
        );
        const deliveriesData = deliveriesRes.data
          ? (deliveriesRes.data as any).data
          : [];

        const detail: DeliveryDriverDetail = {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          country: "N/A",
          vehicleType: driver.vehicleType,
          accountStatus: driver.status,
          verified: driver.isRiderVerified,
          liveStatus: driver.liveStatus || "offline",
          rating: 0,
          ratingCount: 0,
          completedOrders: overview.completed,
          cancelledOrders: overview.cancelled,
          totalEarnings: overview.totalEarnings,
          weeklyEarnings: overview.weekly,
          joinDate: new Date(driver.createdAt).toLocaleDateString(),
          avgDeliveryMinutes: overview.avgTime,
          avatarUrl: driver.profileImage,
          completedToday: 0,

          deliveries: deliveriesData.map((d: any) => ({
            id: d._id || d.id,
            customer: d.customer?.name || "N/A",
            vendor: d.vendor?.name || "N/A",
            deliveryFee: d.deliveryFee || 0,
            distanceKm: d.distanceKm || 0,
            status: d.status || "completed",
            completedAt: d.completedAt || null,
            date: d.createdAt
              ? new Date(d.createdAt).toLocaleDateString()
              : "N/A",
            pickup: d.pickup?.address || "N/A",
            dropoff: d.dropoff?.address || "N/A",
            durationMinutes: d.durationMinutes || 0,
          })),
          yearlyEarningsSeries: Object.entries(earnings.yearlyEarnings).map(
            ([k, v]) => ({ label: k, amount: v as number }),
          ),
          monthlyEarningsFull: earnings.monthlyEarnings.map(
            (v: number, i: number) => ({ label: String(i + 1), amount: v }),
          ),
          payouts: earnings.payouts,
          commissions: [],
          activityLogs: [],
          documentsDetail: documents.map((doc: any) => ({
            id: doc.key,
            kind: doc.type,
            label: doc.type,
            fileName: doc.key,
            uploadedAt: doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString()
              : "N/A",
            previewUrl: doc.key,
            status: doc.status,
          })),
          profileCompletion: overview.profileCompletion,
          verificationSummary: overview.profileCompletenessDetails,
          emergencyContact: { name: "N/A", phone: "N/A", relation: "N/A" },
          walletBalance: 0,
          assignedRegion: "N/A",
          deviceInfo: { model: "N/A", os: "N/A", app: "N/A", lastSync: "N/A" },
          currentDelivery: overview.activeDelivery,
          mapCoords: { lat: 0, lng: 0, label: "N/A" },
          routePreview: [],
          supportReports: [],
          activityHeatmap: [],
          satisfactionSeries: [],
          monthlyEarningsTotal: overview.monthly,
          activeDeliveries: overview.active,
          reviews: [],
          weeklyEarningsSeries: earnings.weeklyEarnings.map(
            (v: number, i: number) => ({ label: `Week ${i + 1}`, amount: v }),
          ),
          monthlyEarningsSeries: [],
          deliveryGrowthSeries: [],
        };

        return { data: detail };
      },
      providesTags: (_result, _err, id) => [{ type: "DeliveryDrivers", id }],
    }),

    approveDriver: build.mutation<DeliveryDriver, { id: string }>({
      query: ({ id }) => ({
        url: `/admin-dashboard/drivers/${id}/verify`,
        method: "PATCH",
        body: { status: "approved" },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "DeliveryDrivers", id },
        { type: "DeliveryDrivers", id: "LIST" },
      ],
    }),

    rejectDriver: build.mutation<
      DeliveryDriver,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin-dashboard/drivers/${id}/verify`,
        method: "PATCH",
        body: { status: "rejected", reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "DeliveryDrivers", id },
        { type: "DeliveryDrivers", id: "LIST" },
      ],
    }),

    suspendDriver: build.mutation<DeliveryDriver, { id: string }>({
      query: ({ id }) => ({
        url: `/admin-dashboard/drivers/${id}/verify`,
        method: "PATCH",
        body: { status: "suspended" },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "DeliveryDrivers", id },
        { type: "DeliveryDrivers", id: "LIST" },
      ],
    }),

    blockDriver: build.mutation<DeliveryDriver, { id: string }>({
      query: ({ id }) => ({
        url: `/admin-dashboard/drivers/${id}/verify`,
        method: "PATCH",
        body: { status: "blocked" },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "DeliveryDrivers", id },
        { type: "DeliveryDrivers", id: "LIST" },
      ],
    }),

    messageDriver: build.mutation<{ ok: true }, { id: string; name: string }>({
      queryFn: async () => {
        return { data: { ok: true } };
      },
    }),
  }),
});

export const {
  useGetDeliveryDriversOverviewQuery,
  useGetDeliveryDriverQuery,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useSuspendDriverMutation,
  useBlockDriverMutation,
  useMessageDriverMutation,
} = deliveryDriversApi;
