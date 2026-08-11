import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetServiceProvidersStatsQuery,
  useGetServiceProvidersQuery,
  useUpdateServiceProviderStatusMutation,
} from "@/services/serviceProvidersApi";

export default function ServiceProvidersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: statsResponse } = useGetServiceProvidersStatsQuery();
  const { data: providersResponse, isLoading } = useGetServiceProvidersQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateServiceProviderStatusMutation();

  const providers = providersResponse?.data || [];
  const stats = statsResponse?.data || {
    totalProviders: 0,
    activeProviders: 0,
    inactiveProviders: 0,
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return providers;
    return providers.filter(
      (p) =>
        p._id?.toLowerCase().includes(s) ||
        p.name?.toLowerCase().includes(s) ||
        p.specialty?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s),
    );
  }, [q, providers]);

  const handleStatusChange = async (
    id: string,
    newStatus: "active" | "inactive",
  ) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <PageShell
      title="Service Providers"
      description="Onboard providers, review credentials, and monitor job performance."
      right={
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Invite provider
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total", value: stats.totalProviders },
          { label: "Active", value: stats.activeProviders },
          { label: "Inactive", value: stats.inactiveProviders },
        ].map((c) => (
          <Card key={c.label} className="border-[#EEE7DF] shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums text-foreground">
                {c.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#EEE7DF] shadow-soft">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle className="text-base">Directory</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, specialty, location…"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="min-w-40 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p._id}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.specialty === "N/A" || !p.specialty
                          ? "—"
                          : p.specialty}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.location || "—"}
                      </TableCell>
                      <TableCell>
                        <label
                          className="relative inline-flex items-center cursor-pointer"
                          title={p.status}
                        >
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={p.status === "active"}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(
                                p._id,
                                e.target.checked ? "active" : "inactive",
                              )
                            }
                          />
                          <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 opacity-90 disabled:opacity-50"></div>
                        </label>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {p.jobs}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {p.rating > 0 ? Number(p.rating).toFixed(1) : "—"}
                      </TableCell>
                      <TableCell className="min-w-40 pr-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-xl border border-[#89512925] bg-white px-4 text-sm font-medium hover:border-[#89512940] hover:bg-[#faf7f3]"
                          onClick={() =>
                            navigate(
                              `/admin/service-providers/${encodeURIComponent(p._id)}`,
                            )
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No providers match your search.
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
