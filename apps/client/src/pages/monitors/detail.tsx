import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { QUEUES } from "@stillup/shared/constants";
import { IconAsterisk } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarIcon,
  Globe2,
  Loader2,
  Pause,
  Play,
  Settings,
  Timer,
} from "lucide-react";

import { ResponseTimeChart } from "@/components/monitors/response-time-chart";
import { UptimeTicks } from "@/components/monitors/uptime-ticks";
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

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

function availabilityColor(value: number) {
  if (value >= 99) return "text-emerald-500";
  if (value >= 95) return "text-amber-500";
  return "text-destructive";
}

function MetricCard({
  label,
  value,
  valueClassName,
  subtext,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  subtext?: string;
}) {
  return (
    <div className="ring-1 ring-border ring-inset rounded-xl bg-background p-4 sm:p-5 flex flex-col justify-between min-h-[5.5rem]">
      <p className="text-[10px] sm:text-xs text-muted-foreground font-montreal-mono uppercase font-semibold tracking-wide">
        {label}
      </p>
      <div>
        <p className={cn("text-xl sm:text-2xl font-semibold tabular-nums", valueClassName)}>
          {value}
        </p>
        {subtext ? (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        ) : null}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="pb-8">
      <div className="sticky top-14 z-10 border-b bg-background px-4 sm:px-6 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9" />
          <Skeleton className="size-5" />
          <Skeleton className="h-7 w-[min(20rem,60vw)]" />
        </div>
        <Skeleton className="h-4 w-40 ml-12" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="p-1 bg-neutral-100 dark:bg-neutral-900 space-y-1">
        <div className="ring-1 ring-border ring-inset rounded-2xl bg-background p-5 space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
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

  if (isLoading) return <DetailSkeleton />;

  if (error || !data?.monitor) {
    return (
      <div className="m-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
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
  const isUp = stats.currentStatus === "UP";
  const isDown = stats.currentStatus === "DOWN";
  const showAllRegions = region === "all";
  const displayUrl = monitor.url.replace(/^https?:\/\//, "");

  const chartData = (() => {
    if (!latencyData?.dataPoints) return [];

    if (showAllRegions) {
      const grouped: Record<string, Record<string, number>> = {};

      for (const dp of latencyData.dataPoints) {
        const time = new Date(dp.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!grouped[time]) grouped[time] = {};
        if (dp.region) grouped[time][dp.region] = dp.avgLatency;
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
    <div className="pb-8">
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3 min-w-0">
              <Button
                onClick={() => navigate("/dashboard")}
                size="icon"
                variant="ghost"
                className="shrink-0 mt-0.5"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div
                className={cn(
                  "shrink-0 mt-1",
                  isUp && "text-emerald-500",
                  isDown && "text-destructive",
                  !isUp && !isDown && "text-muted-foreground"
                )}
              >
                <IconAsterisk
                  className={cn("size-5", monitor.isActive && "animate-spin duration-2000")}
                />
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={monitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 max-w-full text-lg sm:text-xl font-mono hover:underline"
                >
                  <span className="truncate">{displayUrl}</span>
                  <ArrowUpRight className="size-4 shrink-0 opacity-60 group-hover:opacity-100" />
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="font-semibold uppercase text-[10px] sm:text-xs font-montreal-mono text-muted-foreground truncate">
                    {monitor.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase font-montreal-mono",
                      isUp && "border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
                      isDown && "border-destructive/40 text-destructive bg-destructive/10",
                      !isUp && !isDown && "text-muted-foreground"
                    )}
                  >
                    {stats.currentStatus}
                  </Badge>
                  {!monitor.isActive && (
                    <Badge variant="destructive" className="text-[10px]">
                      Paused
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePause}
              disabled={togglePauseMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              {togglePauseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {monitor.isActive ? "Pausing..." : "Resuming..."}
                </>
              ) : monitor.isActive ? (
                <>
                  <Pause className="mr-2 size-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Resume
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => navigate(`/monitors/${id}/edit`)}
              disabled={togglePauseMutation.isPending}
            >
              <Settings className="mr-2 size-4" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      <div className="p-1 bg-neutral-100 dark:bg-neutral-900 space-y-1">
        <section className="ring-1 ring-border ring-inset rounded-2xl bg-background p-4 sm:p-6 space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold">Recent uptime</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hover bars for per-region response times
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-semibold tabular-nums">
                {monitor.isActive
                  ? `Next check in ${formatCountdown(secondsRemaining)}`
                  : "Checks paused"}
              </p>
            </div>
            <UptimeTicks windows={stats.uptimeWindows} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            <MetricCard
              label="Uptime"
              value={`${stats.uptimePercentage.toFixed(2)}%`}
              valueClassName={availabilityColor(stats.uptimePercentage)}
            />
            <MetricCard
              label="Up for"
              value={
                statsData?.stats?.allTime?.upFor
                  ? formatDuration(statsData.stats.allTime.upFor)
                  : "—"
              }
            />
            <MetricCard
              label="Check interval"
              value={formatInterval(monitor.interval)}
              subtext={monitor.isActive ? "Active schedule" : "Paused"}
            />
            <MetricCard
              label="Regions"
              value={
                <span className="text-sm sm:text-base font-medium leading-snug">
                  {monitor.regions
                    .map((r) => QUEUES[r as keyof typeof QUEUES] || r)
                    .join(" · ")}
                </span>
              }
              valueClassName="text-sm sm:text-base font-medium"
            />
          </div>
        </section>

        <section className="ring-1 ring-border ring-inset rounded-2xl bg-background overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
            <div>
              <h2 className="text-sm font-semibold">Response time</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latency trends across your selected range
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[9.5rem] h-9 text-xs bg-background">
                  <Globe2 className="size-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {monitor.regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {QUEUES[r as keyof typeof QUEUES] || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border bg-muted/40 p-0.5">
                {(["day", "week", "month"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-3 h-8 text-xs capitalize rounded-md transition-colors font-medium",
                      range === r
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-2 sm:px-4 py-4 sm:py-6">
            {isLatencyLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                No latency data for this range yet
              </div>
            ) : (
              <ResponseTimeChart
                data={chartData}
                showAllRegions={showAllRegions}
              />
            )}
          </div>
        </section>

        <section className="ring-1 ring-border ring-inset rounded-2xl bg-background overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border/60">
            <h2 className="text-sm font-semibold">Availability history</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uptime and downtime across standard reporting windows
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase font-montreal-mono">
                  Period
                </TableHead>
                <TableHead className="text-right text-xs uppercase font-montreal-mono">
                  Availability
                </TableHead>
                <TableHead className="text-right text-xs uppercase font-montreal-mono">
                  Downtime
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isStatsLoading
                ? [...Array(5)].map((_, index) => (
                    <TableRow key={`stats-skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : statsRows.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell className="font-medium text-sm">
                        {row.period}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        <span
                          className={availabilityColor(row.data?.availability ?? 0)}
                        >
                          {row.data?.availability?.toFixed(2) ?? "—"}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                        {row.data?.downtime !== undefined
                          ? formatDowntime(row.data.downtime)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              {customStats && (
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium text-sm">
                    Custom range
                    {fromDate && toDate && (
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                        {format(fromDate, "MMM d, yyyy")} –{" "}
                        {format(toDate, "MMM d, yyyy")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    <span className={availabilityColor(customStats.availability)}>
                      {customStats.availability.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                    {formatDowntime(customStats.downtime)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="px-4 sm:px-6 py-4 border-t border-border/60 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <Timer className="size-3.5" />
              Calculate availability for a custom date range
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start flex-1 sm:flex-none sm:min-w-[10rem]">
                    <CalendarIcon className="mr-2 size-4" />
                    {fromDate ? format(fromDate, "MMM d, yyyy") : "From date"}
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
                  <Button variant="outline" size="sm" className="justify-start flex-1 sm:flex-none sm:min-w-[10rem]">
                    <CalendarIcon className="mr-2 size-4" />
                    {toDate ? format(toDate, "MMM d, yyyy") : "To date"}
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
                className="sm:ml-auto"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
            </div>
          </div>
        </section>

        <section className="ring-1 ring-destructive/25 ring-inset rounded-2xl bg-background p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xl">
            Deleting this monitor removes all check history permanently. This
            cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete monitor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  );
}
