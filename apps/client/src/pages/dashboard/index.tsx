import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";

import { MonitorCard } from "@/components/monitors/monitor-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/queries";

export function DashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [...queryKeys.monitors.all, page],
    queryFn: async () => apiClient.getMonitors(page, 10),
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b py-10 px-6 sticky top-14 bg-background z-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-[min(32rem,80vw)]" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-900 p-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="ring-1 ring-border ring-inset rounded-none p-5 bg-background"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-5 w-[60%]" />
                  </div>
                  <Skeleton className="h-3 w-[38%] ml-7" />
                </div>
                <div className="hidden sm:block space-y-2">
                  <Skeleton className="h-4 w-12 ml-auto" />
                  <Skeleton className="h-3 w-10 ml-auto" />
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="flex gap-0.5">
                  {[...Array(24)].map((__, tickIndex) => (
                    <Skeleton key={tickIndex} className="w-1.5 h-10" />
                  ))}
                </div>
                <Skeleton className="h-3 w-28 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const monitors = data?.monitors || [];
  const pagination = data?.pagination;

  const upCount = monitors.filter((m) => m.stats.currentStatus === "UP").length;
  const downCount = monitors.filter(
    (m) => m.stats.currentStatus === "DOWN"
  ).length;

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b py-10 px-4 sm:px-6 sticky top-14 bg-background z-10">
        <div>
          <h1 className="text-2xl max-w-lg leading-none mb-2">
            Monitor your endpoints
          </h1>
          <p className="text-muted-foreground">See your endpoints across regions to ensure they're always up and running</p>
          <p className="text-muted-foreground text-sm mt-1">
            {monitors.length > 0 ? (
              <>
                <span className="text-emerald-500 font-medium">{upCount}</span>{" "}
                operational
                {downCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-red-500 font-medium">
                      {downCount}
                    </span>{" "}
                    down
                  </>
                )}
              </>
            ) : (
              "No monitors configured"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => navigate("/monitors/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Monitor
          </Button>
        </div>
      </div>

      {monitors.length > 0 ? (
        <>
          <div className="bg-neutral-100 dark:bg-neutral-900 p-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {monitors.map((monitor) => (
              <MonitorCard key={monitor.id} monitor={monitor} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No monitors yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Get started by creating your first monitor
          </p>
          <Button onClick={() => navigate("/monitors/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Monitor
          </Button>
        </div>
      )}
    </div>
  );
}
