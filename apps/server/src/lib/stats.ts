import { prisma } from "@stillup/database";

const WINDOW_COUNT = 30;
const WINDOW_DURATION_MS = 5 * 60 * 1000;

interface RegionBreakdown {
  region: string;
  status: "UP" | "DOWN" | "UNKNOWN";
  responseTime: number | null;
}

interface UptimeWindow {
  status: "good" | "bad" | "unknown";
  timestamp: string;
  regionBreakdown: RegionBreakdown[];
}

interface MonitorStats {
  currentStatus: "UP" | "DOWN" | "UNKNOWN";
  uptimePercentage: number;
  lastCheckedAt: string | null;
  uptimeWindows: UptimeWindow[];
}

interface PeriodStats {
  availability: number;
  downtime: number;
}

interface AvailabilityStats {
  today: PeriodStats;
  last7Days: PeriodStats;
  last30Days: PeriodStats;
  last365Days: PeriodStats;
  allTime: PeriodStats & { upFor: number };
  custom?: PeriodStats;
}

async function getStatsForPeriod(
  monitorId: string,
  startDate: Date,
  endDate: Date
): Promise<PeriodStats> {
  const stats = await prisma.check.groupBy({
    by: ["status"],
    where: {
      monitorId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: true,
  });

  const totalChecks = stats.reduce((sum, s) => sum + s._count, 0);
  const upChecks = stats.find((s) => s.status === "UP")?._count || 0;
  const downChecks = stats.find((s) => s.status === "DOWN")?._count || 0;

  const availability = totalChecks === 0 ? 100 : (upChecks / totalChecks) * 100;
  const periodMs = endDate.getTime() - startDate.getTime();
  const downtime =
    totalChecks === 0 ? 0 : Math.round((downChecks / totalChecks) * periodMs);

  return {
    availability: Math.round(availability * 100) / 100,
    downtime,
  };
}

export async function getAvailabilityStats(
  monitorId: string,
  customFrom?: Date,
  customTo?: Date
): Promise<AvailabilityStats> {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last365DaysStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const firstCheck = await prisma.check.findFirst({
    where: { monitorId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const allTimeStart = firstCheck?.createdAt || now;

  const [today, last7Days, last30Days, last365Days, allTime] =
    await Promise.all([
      getStatsForPeriod(monitorId, todayStart, now),
      getStatsForPeriod(monitorId, last7DaysStart, now),
      getStatsForPeriod(monitorId, last30DaysStart, now),
      getStatsForPeriod(monitorId, last365DaysStart, now),
      getStatsForPeriod(monitorId, allTimeStart, now),
    ]);

  const upFor = now.getTime() - allTimeStart.getTime() - allTime.downtime;

  const result: AvailabilityStats = {
    today,
    last7Days,
    last30Days,
    last365Days,
    allTime: { ...allTime, upFor: Math.max(0, upFor) },
  };

  if (customFrom && customTo) {
    result.custom = await getStatsForPeriod(monitorId, customFrom, customTo);
  }

  return result;
}

export async function getMonitorStats(
  monitorId: string
): Promise<MonitorStats> {
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_COUNT * WINDOW_DURATION_MS);

  const [recentChecks, totalStats] = await Promise.all([
    prisma.check.findMany({
      where: { monitorId, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "desc" },
      select: {
        status: true,
        region: true,
        responseTime: true,
        createdAt: true,
      },
    }),
    prisma.check.groupBy({
      by: ["status"],
      where: { monitorId },
      _count: true,
    }),
  ]);

  const windows: UptimeWindow[] = [];

  for (let i = 0; i < WINDOW_COUNT; i++) {
    const windowEnd = new Date(now - i * WINDOW_DURATION_MS);
    const windowStartTime = new Date(now - (i + 1) * WINDOW_DURATION_MS);

    const windowChecks = recentChecks.filter((c) => {
      const t = new Date(c.createdAt).getTime();
      return t >= windowStartTime.getTime() && t < windowEnd.getTime();
    });

    const regionMap = new Map<
      string,
      { status: string; responseTime: number | null }
    >();

    for (const check of windowChecks) {
      if (!regionMap.has(check.region)) {
        regionMap.set(check.region, {
          status: check.status,
          responseTime: check.responseTime,
        });
      }
    }

    const regionBreakdown: RegionBreakdown[] = Array.from(
      regionMap.entries()
    ).map(([region, data]) => ({
      region,
      status: data.status as "UP" | "DOWN" | "UNKNOWN",
      responseTime: data.responseTime,
    }));

    let windowStatus: "good" | "bad" | "unknown" = "unknown";
    if (regionBreakdown.length > 0) {
      const upCount = regionBreakdown.filter((r) => r.status === "UP").length;
      windowStatus = upCount / regionBreakdown.length >= 0.5 ? "good" : "bad";
    }

    windows.unshift({
      status: windowStatus,
      timestamp: windowStartTime.toISOString(),
      regionBreakdown,
    });
  }

  const totalChecks = totalStats.reduce((sum, s) => sum + s._count, 0);
  const upChecks = totalStats.find((s) => s.status === "UP")?._count || 0;
  const uptimePercentage =
    totalChecks === 0 ? 100 : (upChecks / totalChecks) * 100;

  const latestCheck = recentChecks[0];
  const currentStatus =
    windows[WINDOW_COUNT - 1]?.status === "good"
      ? "UP"
      : windows[WINDOW_COUNT - 1]?.status === "bad"
        ? "DOWN"
        : "UNKNOWN";

  return {
    currentStatus,
    uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    lastCheckedAt: latestCheck?.createdAt.toISOString() || null,
    uptimeWindows: windows,
  };
}

export type { MonitorStats, UptimeWindow, RegionBreakdown, AvailabilityStats };
