import { prisma } from "@stillup/database";
import { queues, type Region } from "@stillup/shared/redis";

export async function scheduleMonitor(monitor: {
  id: string;
  url: string;
  interval: number;
  regions: string[];
}) {
  for (const region of monitor.regions as Region[]) {
    await queues[region].upsertJobScheduler(
      `${monitor.id}|${region}`,
      { every: monitor.interval * 1000 },
      {
        name: "check",
        data: { monitorId: monitor.id, url: monitor.url },
        opts: {
          removeOnComplete: { count: 1 },
          removeOnFail: { count: 50 },
        },
      }
    );
  }
}

export async function unscheduleMonitor(monitorId: string) {
  for (const [region, queue] of Object.entries(queues)) {
    await queue.removeJobScheduler(`${monitorId}|${region}`);
  }
}

export async function scheduleAll() {
  const monitors = await prisma.monitor.findMany({ where: { isActive: true } });
  console.log(`Monitors in DB to Schedule: `, monitors.length);

  for (const [region, queue] of Object.entries(queues)) {
    const schedulers = await queue.getJobSchedulers();
    const activeIds = new Set(monitors.map((m) => `${m.id}|${region}`));

    for (const scheduler of schedulers) {
      if (!activeIds.has(scheduler.id!)) {
        await queue.removeJobScheduler(scheduler.id!);
        console.log(`Removed stale scheduler ${scheduler.id}`);
      }
    }
  }

  for (const monitor of monitors) {
    await scheduleMonitor(monitor);
    console.log(
      `Scheduled ${monitor.id} in regions: ${monitor.regions.join(", ")}`
    );
  }
}
