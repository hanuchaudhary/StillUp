import { useNavigate } from "react-router-dom";

import { IconAsterisk } from "@tabler/icons-react";

import {
  formatCountdown,
  useNextCheckCountdown,
} from "@/hooks/use-next-check-countdown";
import { cn } from "@/lib/utils";
import type { Monitor, UptimeWindow } from "@/types/types";

import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MonitorCardProps {
  monitor: Monitor;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function UptimeTicks({ windows }: { windows: UptimeWindow[] }) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-0.5 max-w-full overflow-hidden">
        {windows.map((window, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div
                className={cn(
                  "w-1.5 min-h-10 rounded-sm cursor-pointer transition-all hover:scale-110",
                  window.status === "good"
                    ? "bg-emerald-500"
                    : window.status === "bad"
                      ? "bg-destructive"
                      : "bg-neutral-300 dark:bg-neutral-700"
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-medium text-[10px] pr-2 flex flex-col">
                <span>Timestamp:</span>
                {formatTime(window.timestamp)}
              </p>
              {window.regionBreakdown.length > 0 ? (
                <div className="space-y-1">
                  {window.regionBreakdown.map((rb) => (
                    <div
                      key={rb.region}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-muted-foreground">{rb.region}</span>
                      <span
                        className={cn(
                          "font-medium",
                          rb.status === "UP"
                            ? "text-emerald-500"
                            : rb.status === "DOWN"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        )}
                      >
                        {`${rb.responseTime}ms`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const navigate = useNavigate();
  const { stats } = monitor;

  const isUp = stats.currentStatus === "UP";
  const isDown = stats.currentStatus === "DOWN";

  const secondsRemaining = useNextCheckCountdown({
    lastCheckedAt: stats.lastCheckedAt,
    interval: monitor.interval,
  });

  return (
    <div
      onClick={() => navigate(`/monitors/${monitor.id}`)}
      className="group relative ring-1 h-fit ring-border ring-inset rounded-2xl p-4 sm:p-5 hover:border-background transition-all cursor-pointer bg-background"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "",
                "animate-spin duration-2000",
                isUp && "text-emerald-500",
                isDown && "text-destructive",
                !isUp && !isDown && "text-neutral-400"
              )}
            >
              <IconAsterisk className="size-4" />
            </div>
            <h3 className="truncate text-sm sm:text-base font-mono min-w-0">
              {monitor.url.includes("https://")
                ? monitor.url.replace("https://", "")
                : monitor.url}
            </h3>
            {!monitor.isActive && (
              <Badge variant="destructive" className="text-[10px] shrink-0">
                Paused
              </Badge>
            )}
          </div>
          <h4 className="font-semibold text-foreground truncate ml-7 uppercase text-[10px] font-montreal-mono">
            {monitor.name}
          </h4>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p
              className={cn(
                "text-sm font-semibold tabular-nums font-montreal-mono",
                stats.uptimePercentage >= 95
                  ? "text-emerald-500"
                  : stats.uptimePercentage >= 90
                    ? "text-amber-500"
                    : "text-destructive"
              )}
            >
              {stats.uptimePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">uptime</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <UptimeTicks windows={stats.uptimeWindows} />
          <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold tabular-nums">
            {monitor.isActive
              ? `Next check in ${formatCountdown(secondsRemaining)}`
              : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
}
