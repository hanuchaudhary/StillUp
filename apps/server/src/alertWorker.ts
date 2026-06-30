import { prisma } from "@stillup/database";
import { type AlertJobData, connection } from "@stillup/shared/redis";
import { Worker } from "bullmq";

import { sendDownAlert, sendRecoveryAlert } from "./lib/resend";

const alertWorker = new Worker<AlertJobData>(
  "alerts",
  async (job) => {
    const { monitorId, type, downRegions, timestamp } = job.data;

    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      include: {
        user: true,
      },
    });

    if (!monitor) {
      console.error(`Monitor ${monitorId} not found`);
      return;
    }

    const email = monitor.notificationEmail || monitor.user.email;

    let result: { success: boolean; error?: string };

    if (type === "DOWN") {
      result = await sendDownAlert(email, {
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        downRegions: downRegions || [],
        timestamp: new Date(timestamp),
      });
    } else {
      result = await sendRecoveryAlert(email, {
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        timestamp: new Date(timestamp),
      });
    }

    await prisma.alertLog.create({
      data: {
        monitorId,
        type,
        email,
        success: result.success,
        error: result.error,
      },
    });

    if (result.success) {
      console.log(`[ALERT] Sent ${type} alert for ${monitor.name} to ${email}`);
    } else {
      console.error(`[ALERT] Failed to send ${type} alert: ${result.error}`);
    }
  },
  { connection }
);

alertWorker.on("completed", (job) => {
  console.log(`Alert job ${job.id} completed`);
});

alertWorker.on("failed", (job, err) => {
  console.error(`Alert job ${job?.id} failed:`, err);
});

alertWorker.on("error", (err) => {
  console.error("Alert worker error:", err);
});

console.log("Alert worker started");
