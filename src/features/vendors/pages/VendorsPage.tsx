import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorStatsCards } from "@/features/vendors/components/VendorStatsCards";
import {
  useGetVendorsQuery,
  useGetVendorStatsQuery,
  useUpdateVendorStatusMutation,
} from "@/features/vendors/vendorsApi";
import type { Vendor } from "@/features/vendors/vendorsApi";

function Money({ value }: { value: number }) {
  return (
    <span>
      {new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(value)}
    </span>
  );
}

const MotionTableRow = motion(TableRow);

function StatusBadge({ status }: { status: string }) {
  if (status === "inactive" || status === "blocked")
    return <Badge variant="danger">{status}</Badge>;
  if (status === "pending") return <Badge variant="warning">pending</Badge>;
  return <Badge variant="success">active</Badge>;
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <svg
        width="120"
        height="90"
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-70"
      >
        <rect
          x="10"
          y="16"
          width="100"
          height="64"
          rx="10"
          fill="rgba(0,0,0,0.04)"
        />
        <rect
          x="22"
          y="30"
          width="56"
          height="10"
          rx="5"
          fill="rgba(137,81,41,0.18)"
        />
        <rect
          x="22"
          y="46"
          width="76"
          height="8"
          rx="4"
          fill="rgba(0,0,0,0.08)"
        />
        <rect
          x="22"
          y="58"
          width="60"
          height="8"
          rx="4"
          fill="rgba(0,0,0,0.08)"
        />
      </svg>
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </div>
  );
}

export default function VendorsPage() {
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: statsData } = useGetVendorStatsQuery();
  const { data: vendorsData, isLoading } = useGetVendorsQuery({
    page,
    limit: pageSize,
    search: q || undefined,
    status: tab !== "all" ? tab : undefined,
  });
  const [updateStatus] = useUpdateVendorStatusMutation();

  const vendors = vendorsData?.data || [];
  const totalPages = vendorsData?.pagination?.totalPage || 1;

  const counts = {
    total: statsData?.data.totalVendors || 0,
    pending: 0,
    active: statsData?.data.activeVendors || 0,
    blocked: statsData?.data.inactiveVendors || 0,
  };

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const nums: number[] = [];
    for (let p = start; p <= end; p++) nums.push(p);
    return nums;
  }, [page, totalPages]);

  const [selected, setSelected] = useState<Vendor | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Vendor | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "inactive" | "active" | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const allVisibleSelected =
    vendors.length > 0 && vendors.every((v) => selectedIds.has(v._id));

  function requestAction(v: Vendor, action: "inactive" | "active") {
    setConfirmTarget(v);
    setPendingAction(action);
  }

  async function applyAction() {
    if (!confirmTarget || !pendingAction) return;
    try {
      await updateStatus({
        id: confirmTarget._id,
        status: pendingAction,
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(confirmTarget._id);
      return next;
    });
    setConfirmTarget(null);
    setPendingAction(null);
  }

  async function applyBulk(action: "active" | "inactive") {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          updateStatus({ id, status: action }).unwrap(),
        ),
      );
    } catch (err) {
      console.error(err);
    }
    setSelectedIds(new Set());
  }

  const tabLabel = tab[0].toUpperCase() + tab.slice(1);

  return (
    <PageShell
      title="Vendors"
      description="Approve vendors, monitor performance, and take enforcement actions."
      right={
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search business/owner…"
            className="w-full md:w-65"
          />
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <VendorStatsCards counts={counts} />

        <Card className="mt-4">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Vendor management</CardTitle>
            <div className="text-sm text-muted-foreground">
              {vendorsData?.pagination.total || 0} shown • {tabLabel}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v);
                setPage(1);
                setSelectedIds(new Set());
              }}
            >
              <TabsList>
                <TabsTrigger value="all">
                  All{" "}
                  <Badge className="ml-2" variant="secondary">
                    {counts.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active{" "}
                  <Badge className="ml-2" variant="secondary">
                    {counts.active}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive/Blocked{" "}
                  <Badge className="ml-2" variant="secondary">
                    {counts.blocked}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    Bulk actions: select vendors to block.
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={selectedIds.size === 0}
                      onClick={() => applyBulk("inactive")}
                    >
                      Block selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selectedIds.size === 0}
                      onClick={() => setSelectedIds(new Set())}
                    >
                      Clear selection
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inactive">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    Bulk actions: select vendors to unblock.
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                      disabled={selectedIds.size === 0}
                      onClick={() => applyBulk("active")}
                    >
                      Unblock selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selectedIds.size === 0}
                      onClick={() => setSelectedIds(new Set())}
                    >
                      Clear selection
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (checked) vendors.forEach((v) => next.add(v._id));
                          else vendors.forEach((v) => next.delete(v._id));
                          return next;
                        });
                      }}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="min-w-60 w-[18%] pr-6 text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <EmptyState
                        title="No vendors found"
                        subtitle="Try adjusting search or filters."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((v) => (
                    <MotionTableRow
                      key={v._id}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.12 }}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(v._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(v._id);
                              else next.delete(v._id);
                              return next;
                            });
                          }}
                          aria-label={`Select ${v._id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {v.businessName || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.ownerName || "-"}
                      </TableCell>
                      <TableCell>{v.country || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell>{v.totalOrders || 0}</TableCell>
                      <TableCell>
                        <Money value={v.earnings || 0} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="min-w-60 w-[18%] align-middle py-4 pr-6">
                        <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
                          <motion.div
                            className="inline-flex shrink-0 items-center justify-center leading-none"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="box-border h-9 w-9 min-h-9 min-w-9 shrink-0 rounded-lg border border-[#89512925] bg-white p-0 hover:border-[#89512940] hover:bg-[#faf7f3]"
                              onClick={() => setSelected(v)}
                              aria-label="View vendor"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>

                          {v.status === "inactive" ? (
                            <motion.div
                              className="inline-flex shrink-0 items-center justify-center leading-none"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button
                                size="sm"
                                className="box-border h-9 shrink-0 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-600/90"
                                onClick={() => requestAction(v, "active")}
                              >
                                Unblock
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div
                              className="inline-flex shrink-0 items-center justify-center leading-none"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="box-border h-9 shrink-0 rounded-lg border-red-200 bg-[#fff1f1] px-3 text-sm font-medium text-red-600 hover:bg-[#ffe6e6]"
                                onClick={() => requestAction(v, "inactive")}
                              >
                                Block
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                {pageNumbers.map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-9 px-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vendor details</DialogTitle>
            <DialogDescription>
              Basic details for {selected?.businessName || selected?.name}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {selected.businessName || selected.name || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selected.email}
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#EEE7DF] p-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                  <div className="font-medium">{selected.ownerName || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="font-medium">{selected.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Country</div>
                  <div className="font-medium">{selected.country || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                  <div className="font-medium">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Total Orders
                  </div>
                  <div className="font-medium">{selected.totalOrders || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Earnings</div>
                  <div className="font-medium">
                    {<Money value={selected.earnings || 0} />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmTarget && !!pendingAction}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
            setPendingAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "inactive"
                ? "Block vendor?"
                : "Unblock vendor?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget
                ? `${pendingAction === "inactive" ? "Blocking" : "Unblocking"} ${
                    confirmTarget.businessName || confirmTarget.name
                  } will immediately change their platform access.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmTarget(null);
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            {pendingAction === "inactive" ? (
              <Button variant="destructive" onClick={applyAction}>
                Block
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                onClick={applyAction}
              >
                Unblock
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
