import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import {
  useGetDeliveriesQuery,
  useUpdateDeliveryStatusMutation,
} from "@/services/deliveriesApi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopDeliveryPage() {
  const {
    data: deliveriesResponse,
    isLoading,
    isError,
  } = useGetDeliveriesQuery({ limit: 100 });
  const [updateStatus, { isLoading: updating }] =
    useUpdateDeliveryStatusMutation();

  const [activeTab, setActiveTab] = useState<"local" | "international">(
    "local",
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const data = deliveriesResponse?.data || [];

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((d: any) => {
      const status = String(d.status ?? "").toLowerCase();
      if (filters.status) {
        if (filters.status !== status) return false;
      }
      if (q) {
        const customer = (d.customer?.name ?? "").toLowerCase();
        const orderId = (d.orderId ?? "").toLowerCase();
        if (!orderId.includes(q) && !customer.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, filters.status]);

  const local = useMemo(
    () => filteredSorted.filter((d: any) => d.deliveryType === "local"),
    [filteredSorted],
  );
  const international = useMemo(
    () => filteredSorted.filter((d: any) => d.deliveryType === "international"),
    [filteredSorted],
  );

  const activeRows = activeTab === "local" ? local : international;
  const totalPages = Math.max(1, Math.ceil(activeRows.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return activeRows.slice(start, start + itemsPerPage);
  }, [activeRows, safePage, itemsPerPage]);

  useMemo(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page]);

  return (
    <PageShell
      title="Shop Delivery Management"
      description="Manage local deliveries and international shipments for your shop."
    >
      <div className="space-y-6">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Delivery Requests</CardTitle>
            <CardDescription>
              Track local and international deliveries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError ? (
              <p className="text-destructive mb-3 text-sm">
                Could not load deliveries.
              </p>
            ) : null}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-4 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by Order ID or Customer name"
                    className="bg-white border border-gray-200 rounded-xl shadow-sm"
                  />
                  <select
                    className="h-9 bg-white border border-gray-200 rounded-xl shadow-sm px-3 text-sm"
                    value={filters.status}
                    onChange={(e) => {
                      setFilters((p) => ({ ...p, status: e.target.value }));
                      setPage(1);
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setFilters({ status: "" });
                      setPage(1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4 flex space-x-2 border-b border-gray-200 pb-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "local" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("local")}
              >
                Local Delivery
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "international" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("international")}
              >
                International
              </button>
            </div>

            {isLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paged.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 col-span-full text-center">
                    No deliveries found.
                  </p>
                ) : (
                  paged.map((d: any) => (
                    <Card
                      key={d._id}
                      className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-sm">
                              Order: {d.orderId}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Customer: {d.customer?.name}
                            </div>
                          </div>
                          <Badge
                            variant={
                              d.status === "delivered"
                                ? "success"
                                : d.status === "in_transit"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {d.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pickup:</span>
                            <span className="font-medium text-right ml-4 truncate">
                              {d.pickupAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dropoff:</span>
                            <span className="font-medium text-right ml-4 truncate">
                              {d.dropoffAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Driver:</span>
                            <span className="font-medium text-right ml-4 truncate">
                              {d.rider?.name || "Unassigned"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating}
                            onClick={() =>
                              updateStatus({ id: d._id, status: "in_transit" })
                            }
                          >
                            In Transit
                          </Button>
                          <Button
                            size="sm"
                            disabled={updating}
                            onClick={() =>
                              updateStatus({ id: d._id, status: "delivered" })
                            }
                          >
                            Delivered
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {!isLoading ? (
              <div className="mt-5 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {activeRows.length ? (safePage - 1) * itemsPerPage + 1 : 0}–
                    {Math.min(safePage * itemsPerPage, activeRows.length)}
                  </span>{" "}
                  of <span className="font-semibold">{activeRows.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <div className="text-sm text-gray-700">
                    Page <span className="font-semibold">{safePage}</span> /{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
