import type { ConnectionOptions } from "bullmq";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
}).on("error", (err) => {
}) as ConnectionOptions;

export const queues = {
  "us-east": new Queue("checks|us-east", { connection }),
  "eu-west": new Queue("checks|eu-west", { connection }),
  "ap-south": new Queue("checks|ap-south", { connection }),
} as const;

export const alertQueue = new Queue("alerts", { connection });

export type Region = keyof typeof queues;

export interface AlertJobData {
  monitorId: string;
  type: "DOWN" | "UP";
  downRegions?: string[];
  timestamp: number;
}
