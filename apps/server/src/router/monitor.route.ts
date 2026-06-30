import { prisma } from "@stillup/database";
import { isIntervalAllowed, isRegionAllowed } from "@stillup/shared/plans";
import {
  createMonitorSchema,
  updateMonitorSchema,
} from "@stillup/shared/validation";
import Elysia from "elysia";
import { z } from "zod";

import { betterAuth } from "../lib/plugin";
import { scheduleMonitor, unscheduleMonitor } from "../lib/scheduler";
import { getAvailabilityStats, getMonitorStats } from "../lib/stats";

async function getUserIsPro(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });
  return subscription?.status === "ACTIVE";
}

export const monitorRouter = new Elysia();

monitorRouter.use(betterAuth).group("/api/monitor", (app) =>
  app
    .post(
      "/",
      async ({ user, body, status }) => {
        try {
          const { name, url, interval, regions, isActive, notificationEmail } =
            body;

          const isPro = await getUserIsPro(user.id);

          if (!isIntervalAllowed(interval, isPro)) {
            return status(403, {
              error: "This interval requires a Pro subscription",
            });
          }

          for (const region of regions) {
            if (!isRegionAllowed(region, isPro)) {
              return status(403, {
                error: `Region "${region}" requires a Pro subscription`,
              });
            }
          }

          // const existingMonitorsWithUrl = await prisma.monitor.findMany({
          //   where: {
          //     url,
          //     userId: user.id,
          //   },
          // });

          // if (existingMonitorsWithUrl.length > 0) {
          //   return status(400, {
          //     error: "You already have a monitor with this URL",
          //   });
          // }

          const monitor = await prisma.monitor.create({
            data: {
              name,
              url,
              interval,
              userId: user.id,
              regions,
              isActive: isActive ?? true,
              notificationEmail: notificationEmail || user.email,
            },
          });

          await scheduleMonitor(monitor);

          return {
            success: true,
            message: `Successfully started monitoring ${url}`,
            monitor,
          };
        } catch (error) {
          console.error("Error creating monitor:", error);
          return status(500, {
            error: "Failed to create monitor",
          });
        }
      },
      {
        auth: true,
        body: createMonitorSchema,
        tags: ["Monitoring"],
      }
    )
    .get(
      "/all",
      async ({ user, query, status }) => {
        try {
          const page = Math.max(1, Number(query.page) || 1);
          const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
          const skip = (page - 1) * limit;

          const [monitors, total] = await Promise.all([
            prisma.monitor.findMany({
              where: { userId: user.id },
              skip,
              take: limit,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                url: true,
                interval: true,
                regions: true,
                isActive: true,
                performance: true,
                notificationEmail: true,
                createdAt: true,
                updatedAt: true,
              },
            }),
            prisma.monitor.count({ where: { userId: user.id } }),
          ]);

          const monitorsWithStats = await Promise.all(
            monitors.map(async (monitor) => ({
              ...monitor,
              stats: await getMonitorStats(monitor.id),
            }))
          );

          return {
            success: true,
            monitors: monitorsWithStats,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          };
        } catch (error) {
          console.error("Error fetching monitors:", error);
          return status(500, {
            error: "Failed to fetch monitors",
          });
        }
      },
      {
        auth: true,
        query: z.object({
          page: z.string().optional(),
          limit: z.string().optional(),
        }),
        tags: ["Monitoring"],
      }
    )
    .get(
      "/:id",
      async ({ user, params, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: {
              id: params.id,
              userId: user.id,
            },
            select: {
              id: true,
              name: true,
              url: true,
              interval: true,
              regions: true,
              isActive: true,
              performance: true,
              notificationEmail: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          if (!monitor) {
            return status(404, {
              error: "Monitor not found",
            });
          }

          const stats = await getMonitorStats(monitor.id);

          return {
            success: true,
            monitor: {
              ...monitor,
              stats,
            },
          };
        } catch (error) {
          return status(500, {
            error: "Failed to fetch monitor",
          });
        }
      },
      {
        auth: true,
        params: z.object({
          id: z.string(),
        }),
        tags: ["Monitoring"],
      }
    )
    .put(
      "/:id",
      async ({ user, params, body, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: {
              id: params.id,
              userId: user.id,
            },
          });

          if (!monitor) {
            return status(404, {
              error: "Monitor not found",
            });
          }

          const updateData: any = {};
          if (body.name !== undefined) updateData.name = body.name;
          if (body.url !== undefined) updateData.url = body.url;
          if (body.interval !== undefined) updateData.interval = body.interval;
          if (body.regions !== undefined) updateData.regions = body.regions;
          if (body.isActive !== undefined) updateData.isActive = body.isActive;
          if (body.notificationEmail !== undefined)
            updateData.notificationEmail = body.notificationEmail;

          const updatedMonitor = await prisma.monitor.update({
            where: {
              id: monitor.id,
            },
            data: updateData,
          });

          // console.log("Updated monitor:", updatedMonitor.id);

          const wasActive = monitor.isActive;
          const isNowActive = updatedMonitor.isActive;

          if (wasActive && !isNowActive) {
            console.log(
              "Deactivating monitor - removing from queue:",
              monitor.id
            );
            await unscheduleMonitor(monitor.id);
          } else if (!wasActive && isNowActive) {
            console.log("Activating monitor - adding to queue:", monitor.id);
            await scheduleMonitor(updatedMonitor);
          } else if (isNowActive) {
            const jobFieldsChanged =
              (body.url !== undefined && body.url !== monitor.url) ||
              (body.interval !== undefined &&
                body.interval !== monitor.interval) ||
              (body.regions !== undefined &&
                JSON.stringify(body.regions) !==
                  JSON.stringify(monitor.regions));

            if (jobFieldsChanged) {
              console.log(
                "Rescheduling monitor due to job field changes:",
                monitor.id
              );
              await unscheduleMonitor(monitor.id);
              await scheduleMonitor(updatedMonitor);
            }
          }

          return {
            success: true,
            message: `Successfully updated monitor`,
            monitor: updatedMonitor,
          };
        } catch (error) {
          console.error("Error updating monitor:", error);
          return status(500, {
            error: "Failed to update monitor",
          });
        }
      },
      {
        auth: true,
        params: z.object({
          id: z.string(),
        }),
        body: updateMonitorSchema,
        tags: ["Monitoring"],
      }
    )
    .delete(
      "/:id",
      async ({ user, params, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: {
              id: params.id,
              userId: user.id,
            },
          });

          if (!monitor) {
            return status(404, {
              error: "Monitor not found",
            });
          }

          await prisma.monitor.delete({
            where: {
              id: monitor.id,
            },
          });

          await unscheduleMonitor(monitor.id);

          return {
            success: true,
            message: `Successfully deleted monitor ${monitor.url}`,
          };
        } catch (error) {
          return status(500, {
            error: "Failed to delete monitor",
          });
        }
      },
      {
        auth: true,
        params: z.object({
          id: z.string(),
        }),
        tags: ["Monitoring"],
      }
    )
    .get(
      "/:id/logs",
      async ({ user, params, query, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: { id: params.id, userId: user.id },
            select: { id: true },
          });

          if (!monitor) {
            return status(404, { error: "Monitor not found" });
          }

          const page = Math.max(1, Number(query.page) || 1);
          const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
          const skip = (page - 1) * limit;
          const region = query.region === "all" ? undefined : query.region;

          const where = {
            monitorId: params.id,
            ...(region && { region }),
          };

          const [logs, total] = await Promise.all([
            prisma.check.findMany({
              where,
              orderBy: { createdAt: "desc" },
              skip,
              take: limit,
              select: {
                id: true,
                status: true,
                responseTime: true,
                region: true,
                statusCode: true,
                error: true,
                createdAt: true,
              },
            }),
            prisma.check.count({ where }),
          ]);

          return {
            success: true,
            logs,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          };
        } catch (error) {
          console.error("Error fetching logs:", error);
          return status(500, { error: "Failed to fetch logs" });
        }
      },
      {
        auth: true,
        params: z.object({ id: z.string() }),
        query: z.object({
          page: z.string().optional(),
          limit: z.string().optional(),
          region: z.string().optional(),
        }),
        tags: ["Monitoring"],
      }
    )
    .get(
      "/:id/latency",
      async ({ user, params, query, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: { id: params.id, userId: user.id },
            select: { id: true, regions: true },
          });

          if (!monitor) {
            return status(404, { error: "Monitor not found" });
          }

          const range = (query.range as "day" | "week" | "month") || "day";
          const region = query.region === "all" ? undefined : query.region;

          const now = new Date();
          let startDate: Date;
          let intervalMs: number;

          switch (range) {
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              intervalMs = 60 * 60 * 1000;
              break;
            case "month":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              intervalMs = 4 * 60 * 60 * 1000;
              break;
            default:
              startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              intervalMs = 15 * 60 * 1000;
          }

          const where = {
            monitorId: params.id,
            createdAt: { gte: startDate },
            ...(region && { region }),
          };

          const checks = await prisma.check.findMany({
            where,
            orderBy: { createdAt: "asc" },
            select: {
              responseTime: true,
              region: true,
              createdAt: true,
            },
          });

          const buckets = new Map<
            string,
            { times: number[]; region?: string }
          >();

          for (const check of checks) {
            const bucketTime =
              Math.floor(check.createdAt.getTime() / intervalMs) * intervalMs;
            const key = region
              ? String(bucketTime)
              : `${bucketTime}-${check.region}`;

            if (!buckets.has(key)) {
              buckets.set(key, {
                times: [],
                region: region ? undefined : check.region,
              });
            }
            buckets.get(key)!.times.push(check.responseTime);
          }

          const dataPoints = Array.from(buckets.entries())
            .map(([key, data]) => {
              const timestamp = region
                ? new Date(Number(key)).toISOString()
                : new Date(Number(key.split("-")[0])).toISOString();
              const times = data.times;

              return {
                timestamp,
                avgLatency: Math.round(
                  times.reduce((a, b) => a + b, 0) / times.length
                ),
                minLatency: Math.min(...times),
                maxLatency: Math.max(...times),
                ...(data.region && { region: data.region }),
              };
            })
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );

          return {
            success: true,
            range,
            region: query.region || "all",
            dataPoints,
          };
        } catch (error) {
          console.error("Error fetching latency:", error);
          return status(500, { error: "Failed to fetch latency data" });
        }
      },
      {
        auth: true,
        params: z.object({ id: z.string() }),
        query: z.object({
          range: z.enum(["day", "week", "month"]).optional(),
          region: z.string().optional(),
        }),
        tags: ["Monitoring"],
      }
    )
    .get(
      "/:id/stats",
      async ({ user, params, query, status }) => {
        try {
          const monitor = await prisma.monitor.findFirst({
            where: { id: params.id, userId: user.id },
            select: { id: true },
          });

          if (!monitor) {
            return status(404, { error: "Monitor not found" });
          }

          const customFrom = query.from ? new Date(query.from) : undefined;
          const customTo = query.to ? new Date(query.to) : undefined;

          const stats = await getAvailabilityStats(
            params.id,
            customFrom,
            customTo
          );

          return {
            success: true,
            stats,
          };
        } catch (error) {
          console.error("Error fetching stats:", error);
          return status(500, { error: "Failed to fetch stats" });
        }
      },
      {
        auth: true,
        params: z.object({ id: z.string() }),
        query: z.object({
          from: z.string().optional(),
          to: z.string().optional(),
        }),
        tags: ["Monitoring"],
      }
    )
);
