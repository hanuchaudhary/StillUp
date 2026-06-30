import { prisma } from "@stillup/database";
import { type AlertJobData, alertQueue } from "@stillup/shared/redis";

const MIN_CONSECUTIVE_CHECKS = 2;

export async function evaluateAndAlert(monitorId: string): Promise<void> {
  await prisma.monitorState.upsert({
    where: { monitorId },
    update: {},
    create: {
      monitorId,
      globalStatus: "UP",
      lastEvaluatedAt: new Date(),
    },
  });

  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { regions: true },
  });

  if (!monitor) return;

  const totalRegions = monitor.regions.length;
  const minDownRegions = Math.ceil(totalRegions / 2);

  const checks = await prisma.check.findMany({
    where: { monitorId },
    orderBy: { createdAt: "desc" },
    take: MIN_CONSECUTIVE_CHECKS * totalRegions,
    select: { status: true, region: true },
  });

  if (checks.length === 0) return;

  const regionStatusMap = new Map<string, string[]>();

  for (const check of checks) {
    if (!regionStatusMap.has(check.region)) {
      regionStatusMap.set(check.region, []);
    }

    const arr = regionStatusMap.get(check.region)!;

    if (arr.length < MIN_CONSECUTIVE_CHECKS) {
      arr.push(check.status);
    }
  }

  let downRegionCount = 0;
  const downRegions: string[] = [];

  for (const [region, statuses] of regionStatusMap) {
    if (statuses.length < MIN_CONSECUTIVE_CHECKS) continue;

    const isStableDown = statuses.every((s) => s === "DOWN");

    if (isStableDown) {
      downRegionCount++;
      downRegions.push(region);
    }
  }

  const isDown = downRegionCount >= minDownRegions;

  if (isDown) {
    const updated = await prisma.monitorState.updateMany({
      where: {
        monitorId,
        globalStatus: "UP",
      },
      data: {
        globalStatus: "DOWN",
        lastEvaluatedAt: new Date(),
        lastNotifiedAt: new Date(),
      },
    });

    if (updated.count > 0) {
      const alertData: AlertJobData = {
        monitorId,
        type: "DOWN",
        downRegions,
        timestamp: Date.now(),
      };

      await alertQueue.add("alert", alertData, {
        jobId: `${monitorId}-DOWN`,
      });

      console.log(
        `[ALERT] Monitor ${monitorId} DOWN in: ${downRegions.join(", ")}`
      );
    }

    return;
  }

  const updated = await prisma.monitorState.updateMany({
    where: {
      monitorId,
      globalStatus: "DOWN",
    },
    data: {
      globalStatus: "UP",
      lastEvaluatedAt: new Date(),
      lastNotifiedAt: new Date(),
    },
  });

  if (updated.count > 0) {
    const alertData: AlertJobData = {
      monitorId,
      type: "UP",
      timestamp: Date.now(),
    };

    await alertQueue.add("alert", alertData, {
      jobId: `${monitorId}-UP`,
    });

    console.log(`[RECOVERY] Monitor ${monitorId} UP`);
  }
}
