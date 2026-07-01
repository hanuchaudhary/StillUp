import { cn } from "@/lib/utils";
import type { UptimeWindow } from "@/types/types";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UptimeTicks({ windows }: { windows: UptimeWindow[] }) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-0.5 max-w-full overflow-x-auto pb-1">
        {windows.map((window, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div
                className={cn(
                  "w-1.5 min-h-10 rounded-sm shrink-0 cursor-pointer transition-transform hover:scale-110",
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
                        {rb.responseTime != null ? `${rb.responseTime}ms` : "—"}
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
