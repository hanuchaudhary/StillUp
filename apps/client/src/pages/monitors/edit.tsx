import { useNavigate, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { MonitorForm } from "@/components/monitors/monitor-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/queries";

export function EditMonitorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.monitors.detail(id!),
    queryFn: async () => await apiClient.getMonitor(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data?.monitor) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">
          {error instanceof Error ? error.message : "Monitor not found"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-start gap-4 pt-6 pb-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/monitors/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="max-w-sm">
          <h1 className="text-xl">
            Configure Monitor to keep an eye on your website's uptime and
            performance.
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data.monitor.name}
          </p>
        </div>
      </div>

      <div className="mx-12">
        <MonitorForm
          monitor={data.monitor}
          onSuccess={() => navigate(`/monitors/${id}`)}
        />
      </div>
    </div>
  );
}
