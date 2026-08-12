import { useMemo, useState } from "react";
import { useGetDashboardStatsQuery } from "@/services/dashboardApi";
import { PageShell } from "@/components/PageShell";
import { AnalyticsKPI } from "@/features/shop/components/analytics/AnalyticsKPI";
import {
  RevenueChart,
  type AnalyticsRevenuePoint,
} from "@/features/shop/components/analytics/RevenueChart";

export default function ShopAnalyticsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();

  const chartPoints = useMemo<AnalyticsRevenuePoint[]>(() => {
    if (!stats?.revenueTrend) return [];
    return stats.revenueTrend.map((d) => ({
      label: d.date,
      revenue: d.revenue,
      ordersJobs: stats.ordersTrend.find((o) => o.date === d.date)?.orders || 0,
    }));
  }, [stats]);

  return (
    <PageShell
      title="Shop Analytics"
      description="Track performance, sales, and customer engagement for your shop."
    >
      <div className="space-y-6">
        {isError ? (
          <p className="text-destructive text-sm">Failed to load analytics.</p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <AnalyticsKPI
            title="Total Revenue"
            value={stats?.totals.revenue}
            loading={isLoading}
            format="currency"
          />
          <AnalyticsKPI
            title="Total Orders"
            value={stats?.totals.orders}
            loading={isLoading}
          />
          <AnalyticsKPI
            title="Total Customers"
            value={stats?.totals.users}
            loading={isLoading}
          />
          <AnalyticsKPI
            title="Active Deliveries"
            value={stats?.activeDeliveries.length}
            loading={isLoading}
          />
        </div>

        <RevenueChart
          year={year}
          onChangeYear={setYear}
          points={chartPoints}
          isLoading={isLoading}
        />
      </div>
    </PageShell>
  );
}
