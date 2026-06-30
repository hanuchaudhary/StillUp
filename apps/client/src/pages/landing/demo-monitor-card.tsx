import { useEffect, useRef, useState } from "react";

import { IconAsterisk } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TickStatus = "good" | "bad" | "unknown";

interface Tick {
  id: number;
  status: TickStatus;
  responseTime?: number;
  region?: "us-east" | "eu-west" | "asia-south";
}

function getRandomStatus(): TickStatus {
  const rand = Math.random();
  if (rand > 0.12) return "good";
  if (rand > 0.04) return "unknown";
  return "bad";
}

function generateInitialTicks(): Tick[] {
  return Array.from({ length: 44 }, (_, i) => ({
    id: i,
    status: getRandomStatus(),
    responseTime: Math.floor(Math.random() * 500) + 50,
    region: ["us-east", "eu-west", "asia-south"][
      Math.floor(Math.random() * 3)
    ] as "us-east" | "eu-west" | "asia-south",
  }));
}

function getStatusColor(status: TickStatus) {
  switch (status) {
    case "good":
      return "bg-emerald-500";
    case "bad":
      return "bg-destructive";
    case "unknown":
      return "bg-amber-400";
  }
}

function AnimatedUptimeTicks({ monitorIndex }: { monitorIndex: number }) {
  const [ticks, setTicks] = useState<Tick[]>(() => generateInitialTicks());
  const nextIdRef = useRef(44);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setTicks((prev) => {
          const newTick: Tick = {
            id: nextIdRef.current++,
            status: getRandomStatus(),
          };
          return [...prev.slice(1), newTick];
        });
      },
      2000 + monitorIndex * 400
    );

    return () => clearInterval(interval);
  }, [monitorIndex]);

  return (
    <div className="flex gap-0.5 overflow-x-auto">
      <AnimatePresence mode="popLayout" initial={false}>
        {ticks.map((tick,idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger>
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    layout: { type: "spring", stiffness: 500, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                  }}
                  className={cn(
                    "w-1 md:w-1.5 min-h-8 md:min-h-12 rounded-sm shrink-0 cursor-pointer",
                    getStatusColor(tick.status)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p>Status: {tick.status.toUpperCase()}</p>
                  {tick.responseTime && (
                    <p>Response Time: {tick.responseTime} ms</p>
                  )}
                  {tick.region && (
                    <p>
                      Region:{" "}
                      {tick.region === "us-east"
                        ? "US East"
                        : tick.region === "eu-west"
                          ? "EU West"
                          : "Asia South"}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
        ))}
      </AnimatePresence>
    </div>
  );
}

export interface DemoMonitor {
  url: string;
  name: string;
  uptimePercentage: number;
  isUp: boolean;
}

interface DemoMonitorCardProps {
  monitor: DemoMonitor;
  index: number;
}

export function DemoMonitorCard({ monitor, index }: DemoMonitorCardProps) {
  return (
    <div className="group relative ring-1 h-fit ring-border ring-inset p-3 md:p-5 bg-background rounded-xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={cn(
                "animate-spin duration-2000 shrink-0",
                monitor.isUp ? "text-emerald-500" : "text-destructive"
              )}
            >
              <IconAsterisk className="size-3 md:size-4" />
            </div>
            <h3 className="truncate text-xs md:text-sm font-mono">
              {monitor.url.replace("https://", "")}
            </h3>
          </div>
          <h4 className="font-semibold text-foreground truncate md:ml-7 ml-5 uppercase text-[8px] md:text-[10px] font-montreal-mono text-left">
            {monitor.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="text-right">
            <p
              className={cn(
                "text-xs md:text-sm font-semibold tabular-nums font-montreal-mono",
                monitor.uptimePercentage >= 95
                  ? "text-emerald-500"
                  : monitor.uptimePercentage >= 90
                    ? "text-amber-500"
                    : "text-destructive"
              )}
            >
              {monitor.uptimePercentage.toFixed(1)}%
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              uptime
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 md:mt-8">
        <div className="flex items-end justify-between md:pl-8">
          <AnimatedUptimeTicks monitorIndex={index} />
        </div>
      </div>
    </div>
  );
}
