import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetServiceProvidersQuery,
  useUpdateServiceProviderStatusMutation,
} from "@/services/serviceProvidersApi";
import { format } from "date-fns";

function StatusBadge({
  status,
}: {
  status: "active" | "inactive" | "pending" | "suspended" | string;
}) {
  if (status === "pending") return <Badge variant="warning">pending</Badge>;
  if (status === "suspended") return <Badge variant="danger">suspended</Badge>;
  if (status === "inactive") return <Badge variant="secondary">inactive</Badge>;
  return <Badge variant="success">active</Badge>;
}

export default function ServiceProviderDetailsPage() {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";

  const { data: providersResponse, isLoading } = useGetServiceProvidersQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateServiceProviderStatusMutation();

  const provider = providersResponse?.data?.find((p) => p._id === decodedId);

  if (isLoading) {
    return (
      <PageShell
        title="Loading..."
        description="Fetching service provider details."
      ></PageShell>
    );
  }

  if (!provider) {
    return (
      <PageShell
        title="Provider not found"
        description="This service provider ID was not found."
      >
        <Button asChild variant="outline">
          <Link to="/admin/service-providers">Back to Service Providers</Link>
        </Button>
      </PageShell>
    );
  }

  const handleStatusChange = async (newStatus: "active" | "inactive") => {
    try {
      await updateStatus({ id: provider._id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <PageShell
      title={provider.name}
      description={`${provider.specialty === "N/A" || !provider.specialty ? "No specialty" : provider.specialty} · ${provider._id}`}
      right={<StatusBadge status={provider.status} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/admin/service-providers">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Status ({provider.status}):
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={provider.status === "active"}
              disabled={isUpdating}
              onChange={(e) =>
                handleStatusChange(e.target.checked ? "active" : "inactive")
              }
            />
            <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 opacity-90 disabled:opacity-50"></div>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-4">
        <Card className="border-[#EEE7DF] shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a
                href={`mailto:${provider.email}`}
                className="text-foreground hover:underline"
              >
                {provider.email}
              </a>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground">{provider.phone || "—"}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground">
                {provider.location || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#EEE7DF] shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jobs completed</span>
              <span className="font-medium tabular-nums">{provider.jobs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating</span>
              <span className="font-medium tabular-nums">
                {provider.rating > 0 ? provider.rating.toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span className="font-medium">
                {provider.createdAt
                  ? format(new Date(provider.createdAt), "yyyy-MM-dd")
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
