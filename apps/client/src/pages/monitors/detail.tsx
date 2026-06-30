import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { QUEUES } from "@stillup/shared/constants";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarIcon,
  Loader2,
  Pause,
  Play,
  Settings,
} from "lucide-react";

import { ResponseTimeChart } from "@/components/monitors/response-time-chart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCountdown,
  useNextCheckCountdown,
} from "@/hooks/use-next-check-countdown";
import { apiClient } from "@/lib/api";
import {
  queryKeys,
  useDeleteMonitor,
  useToggleMonitorPause,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatDowntime(ms: number): string {
  if (ms === 0) return "0m";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function MonitorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [region, setRegion] = useState("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [customStats, setCustomStats] = useState<{
    availability: number;
    downtime: number;
  } | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.monitors.detail(id!),
    queryFn: async () => await apiClient.getMonitor(id!),
    enabled: !!id,
    refetchInterval: 3 * 60 * 1000,
  });

  const { data: latencyData, isLoading: isLatencyLoading } = useQuery({
    queryKey: ["monitor", id, "latency", range, region],
    queryFn: async () => await apiClient.getMonitorLatency(id!, range, region),
    enabled: !!id,
    refetchInterval: 3 * 60 * 1000,
  });

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["monitor", id, "stats"],
    queryFn: async () => await apiClient.getMonitorStats(id!),
    enabled: !!id,
    refetchInterval: 3 * 60 * 1000,
  });

  const deleteMutation = useDeleteMonitor();
  const togglePauseMutation = useToggleMonitorPause();

  const secondsRemaining = useNextCheckCountdown({
    lastCheckedAt: data?.monitor?.stats?.lastCheckedAt ?? null,
    interval: data?.monitor?.interval ?? 60,
  });

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate("/dashboard");
  };

  const handleTogglePause = async () => {
    if (!id || !data?.monitor) return;
    await togglePauseMutation.mutateAsync({
      id,
      isActive: !data.monitor.isActive,
    });
  };

  const handleCalculateCustomStats = async () => {
    if (!id || !fromDate || !toDate) return;
    setIsCalculating(true);
    try {
      const result = await apiClient.getMonitorStats(
        id,
        fromDate.toISOString(),
        toDate.toISOString()
      );
      if (result.stats.custom) {
        setCustomStats(result.stats.custom);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-secondary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:h-38 py-3 sm:py-0 dark:bg-background bg-white">
          <div className="flex flex-col gap-2 h-full pl-4 sm:pl-6 justify-center min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <Skeleton className="h-7 w-7 " />
              <Skeleton className="h-9 w-[min(28rem,70vw)] " />
            </div>
            <div className="flex gap-2 items-center ml-8 sm:ml-11 min-w-0">
              <Skeleton className="h-5 w-30 " />
              <Skeleton className="h-5 w-14 " />
            </div>
          </div>
          <div className="flex gap-2 p-2 rounded-xl w-full sm:w-auto border divide-x mr-2 sm:mr-8">
            <Skeleton className="h-9 w-36 " />
            <Skeleton className="h-9 w-36 " />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pb-6 px-4 sm:px-6 gap-2 dark:bg-background bg-white">
          {[...Array(4)].map((_, cardIndex) => (
            <div
              key={`metric-skeleton-${cardIndex}`}
              className="border p-5 rounded-xl bg-card flex flex-col justify-between min-h-28"
            >
              <Skeleton className="h-3 w-20 " />
              <Skeleton className="h-8 w-24 " />
            </div>
          ))}
        </div>

        <div className="border-y dark:bg-background bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 border-b py-3 sm:py-0 sm:h-14">
            <Skeleton className="h-5 w-28 " />
            <div className="flex h-full items-center gap-2 w-full sm:w-auto justify-between sm:justify-normal">
              <Skeleton className="h-10 w-32 " />
              <Skeleton className="h-10 w-48 " />
            </div>
          </div>
          <div className="pt-8 pr-5 pb-4">
            <div className="space-y-3 pl-6">
              <Skeleton className="h-3 w-16 " />
              <div className="space-y-2">
                <Skeleton className="h-px w-full " />
                <Skeleton className="h-px w-full " />
                <Skeleton className="h-px w-full " />
              </div>
              <Skeleton className="h-72 w-full " />
            </div>
          </div>
        </div>

        <div className="border m-1 dark:bg-background bg-white">
          <div className="p-3 border-b">
            <Skeleton className="h-3 w-32 " />
          </div>
          <div className="p-3 space-y-4">
            {[...Array(5)].map((_, rowIndex) => (
              <div
                key={`table-row-skeleton-${rowIndex}`}
                className="grid grid-cols-3 gap-4 items-center"
              >
                <Skeleton className="h-4 w-24 " />
                <div className="flex justify-end">
                  <Skeleton className="h-4 w-16 " />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-4 w-20 " />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-34 " />
            <Skeleton className="h-8 w-34 " />
            <Skeleton className="h-8 w-24 " />
          </div>
        </div>

        <div className="m-1 border border-destructive/30 p-5 dark:bg-background bg-white">
          <Skeleton className="h-6 w-28  mb-3" />
          <Skeleton className="h-4 w-[min(26rem,80vw)]  mb-4" />
          <Skeleton className="h-8 w-32 " />
        </div>
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

  const { monitor } = data;
  const { stats } = monitor;
  // const isUp = stats.currentStatus === "UP";
  // const isDown = stats.currentStatus === "DOWN";

  const showAllRegions = region === "all";

  const chartData = (() => {
    if (!latencyData?.dataPoints) return [];

    if (showAllRegions) {
      const grouped: Record<string, Record<string, number>> = {};

      for (const dp of latencyData.dataPoints) {
        const time = new Date(dp.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!grouped[time]) {
          grouped[time] = {};
        }

        if (dp.region) {
          grouped[time][dp.region] = dp.avgLatency;
        }
      }

      return Object.entries(grouped).map(([time, regions]) => ({
        time,
        ...regions,
      }));
    }

    return latencyData.dataPoints.map((dp) => ({
      time: new Date(dp.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avg: dp.avgLatency,
    }));
  })();

  const statsRows = [
    { period: "Today", data: statsData?.stats?.today },
    { period: "Last 7 Days", data: statsData?.stats?.last7Days },
    { period: "Last 30 Days", data: statsData?.stats?.last30Days },
    { period: "Last 365 Days", data: statsData?.stats?.last365Days },
    { period: "All Time", data: statsData?.stats?.allTime },
  ];

  return (
    <div className="bg-secondary">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:h-38 py-3 sm:py-0 dark:bg-background bg-white">
        <div className="flex flex-col gap-1 h-full pl-2 sm:pl-6 justify-center min-w-0 flex-1">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              onClick={() => navigate("/dashboard")}
              size="icon"
              variant={"ghost"}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:underline flex items-center gap-2 min-w-0"
            >
              <span className="truncate">{monitor.url}</span>
              <ArrowUpRight className="size-5" />
            </a>
          </div>
          <div className="flex gap-2 items-center flex-wrap ml-12 min-w-0">
            <h2 className="font-medium text-foreground truncate uppercase text-xs font-montreal-mono">
              {monitor.name}
            </h2>
            {!monitor.isActive && <Badge variant="destructive">Paused</Badge>}
            {togglePauseMutation.isPending && (
              <span className="text-[10px] uppercase font-montreal-mono text-muted-foreground animate-pulse">
                Updating status...
              </span>
            )}
          </div>
        </div>
        <div className="flex lg:w-fit flex-wrap border rounded-xl divide-x p-1 gap-2 mr-0 sm:mr-6">
          <Button
            className="flex-1 sm:flex-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleTogglePause}
            disabled={togglePauseMutation.isPending}
          >
            {togglePauseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {monitor.isActive ? "Pausing..." : "Resuming..."}
              </>
            ) : monitor.isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant={"secondary"}
            className="flex-1 sm:flex-none"
            onClick={() => navigate(`/monitors/${id}/edit`)}
            disabled={togglePauseMutation.isPending}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pb-6 px-4 sm:px-6 gap-2 dark:bg-background bg-white">
        <div className="border p-5 bg-card flex flex-col justify-between rounded-xl">
          <p className="text-xs text-muted-foreground font-montreal-mono uppercase font-semibold">
            Uptime
          </p>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums",
              stats.uptimePercentage >= 99
                ? "text-emerald-500"
                : stats.uptimePercentage >= 95
                  ? "text-amber-500"
                  : "text-red-500"
            )}
          >
            {stats.uptimePercentage.toFixed(2)}%
          </p>
        </div>
        <div className="border rounded-xl p-5 bg-card flex flex-col justify-between">
          <p className="text-xs text-muted-foreground font-montreal-mono uppercase font-semibold">
            Up For
          </p>
          <p className="text-xl font-semibold">
            {statsData?.stats?.allTime?.upFor
              ? formatDuration(statsData.stats.allTime.upFor)
              : "—"}
          </p>
        </div>
        <div className="border p-5 rounded-xl bg-card flex flex-col justify-between">
          <p className="text-xs text-muted-foreground font-montreal-mono uppercase font-semibold">
            Next Check
          </p>
          <p className="text-xl font-semibold tabular-nums">
            {monitor.isActive ? formatCountdown(secondsRemaining) : "Paused"}
          </p>
        </div>
        <div className="border p-5 rounded-xl bg-card flex flex-col justify-between">
          <p className="text-xs text-muted-foreground font-montreal-mono uppercase font-semibold">
            Regions
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {monitor.regions.map((r) => (
              <span key={r} className="text-sm font-normal">
                {QUEUES[r as keyof typeof QUEUES] || r}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-y dark:bg-background bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 border-b py-3 sm:py-0 sm:h-14">
          <h2 className="font-semibold">Response Time</h2>
          <div className="flex h-full items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-normal">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-32 text-sm bg-transparent border-0">
                <SelectValue className="bg-transparent h-14" />
              </SelectTrigger>
              <SelectContent className="border-none font-fustat">
                <SelectItem className="border-0" value="all">
                  All Regions
                </SelectItem>
                {monitor.regions.map((r) => (
                  <SelectItem
                    key={r}
                    value={r}
                    className="border-0 h-10 hover:border-0"
                  >
                    {QUEUES[r as keyof typeof QUEUES] || r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-xl border p-1">
              {(["day", "week", "month"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "w-16 h-8 text-sm capitalize rounded-lg transition-colors",
                    range === r
                      ? "bg-foreground text-background"
                      : "hover:bg-accent"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 sm:pt-8 pr-3 sm:pr-5">
          {isLatencyLoading ? (
            <div className="space-y-4 pb-4 pl-6">
              <Skeleton className="h-3 w-16 " />
              <div className="space-y-2">
                <Skeleton className="h-px w-full " />
                <Skeleton className="h-px w-full " />
                <Skeleton className="h-px w-full " />
              </div>
              <Skeleton className="h-72 w-full " />
            </div>
          ) : (
            <ResponseTimeChart
              data={chartData}
              showAllRegions={showAllRegions}
            />
          )}
        </div>
      </div>

      <div className="border m-1 dark:bg-background bg-white">
        <div className="p-5 border-b">
          <h2 className="text-xs font-montreal-mono font-semibold uppercase">
            Availability Stats
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time Period</TableHead>
              <TableHead className="text-right">Availability</TableHead>
              <TableHead className="text-right">Downtime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isStatsLoading
              ? [...Array(5)].map((_, index) => (
                  <TableRow key={`stats-skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-28 " />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-4 w-16 " />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-4 w-20 " />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : statsRows.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell className="font-medium">{row.period}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={cn(
                          (row.data?.availability ?? 0) >= 99
                            ? "text-emerald-500"
                            : (row.data?.availability ?? 0) >= 95
                              ? "text-amber-500"
                              : "text-red-500"
                        )}
                      >
                        {row.data?.availability?.toFixed(2) ?? "—"}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.data?.downtime !== undefined
                        ? formatDowntime(row.data.downtime)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
            {customStats && (
              <TableRow>
                <TableCell className="font-medium">
                  Custom Range
                  {fromDate && toDate && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({format(fromDate, "MMM d")} - {format(toDate, "MMM d")})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span
                    className={cn(
                      customStats.availability >= 99
                        ? "text-emerald-500"
                        : customStats.availability >= 95
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  >
                    {customStats.availability.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatDowntime(customStats.downtime)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="p-3 border-t flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "MMM d, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} />
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            onClick={handleCalculateCustomStats}
            disabled={!fromDate || !toDate || isCalculating}
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate"
            )}
          </Button>
        </div>
      </div>

      <div className="m-1 border border-destructive/30 p-5 dark:bg-background bg-white">
        <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete a monitor, there is no going back. Please be certain.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete Monitor
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="min-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete monitor?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{monitor.name}" and all its check
                history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Type{" "}
                <span className="font-mono font-semibold">{monitor.name}</span>{" "}
                to confirm:
              </p>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={monitor.name}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmName("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={
                  deleteConfirmName !== monitor.name || deleteMutation.isPending
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
