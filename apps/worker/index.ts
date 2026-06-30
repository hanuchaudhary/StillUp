import { prisma } from "@stillup/database";
import { connection } from "@stillup/shared/redis";
import { Worker } from "bullmq";

import { evaluateAndAlert } from "./lib/state-evaluator";

const REGION = process.env.REGION || "us-east";
if (!["us-east", "eu-west", "ap-south"].includes(REGION)) {
  throw new Error(`Invalid REGION: ${REGION}`);
}

const worker = new Worker(
  `checks|${REGION}`,
  async (job) => {
    const { monitorId, url } = job.data;
    console.log(`[${REGION}] Checking ${url}`);

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - start;

      await prisma.check.create({
        data: {
          monitorId,
          status: res.status >= 200 && res.status < 400 ? "UP" : "DOWN",
          responseTime,
          region: REGION,
          statusCode: res.status,
        },
      });

      console.log(`[${REGION}]: UP (${responseTime}ms)`);

      await evaluateAndAlert(monitorId);
    } catch (err) {
      clearTimeout(timeout);

      console.error(`[${REGION}]: DOWN`, err);

      await prisma.check.create({
        data: {
          monitorId,
          status: "DOWN",
          responseTime: Date.now() - start,
          region: REGION,
          statusCode: 0,
        },
      });

      await evaluateAndAlert(monitorId);
    }
  },
  {
    connection,
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    drainDelay: 10000, // Wait 10 seconds before processing the next job to prevent rapid retries
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

worker.on("stalled", (job) => {
  console.warn(`Job stalled and will be retried`);
});

console.log(`Worker started for region ${REGION}`);
