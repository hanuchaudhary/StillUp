export const FREE_PLAN = {
  name: "Free",
  price: 0,
  intervals: [300, 600, 900, 1800],
  regions: ["us-east"],
  maxRegions: 3,
  minInterval: 300,
} as const;

export const PRO_PLAN = {
  name: "Pro",
  price: 500,
  priceDisplay: "$5",
  intervals: [30, 60, 300, 600],
  regions: ["us-east", "eu-west", "ap-south"],
  maxRegions: 5,
  minInterval: 30,
} as const;

export const ALL_REGIONS = {
  "us-east": "America (US East)",
  "eu-west": "Europe (EU West)",
  "ap-south": "Asia Pacific (AP South)",
} as const;

export const INTERVAL_OPTIONS = [
  { label: "30 seconds", value: 30, premium: true },
  { label: "1 minute", value: 60, premium: true },
  { label: "5 minutes", value: 300, premium: false },
  { label: "10 minutes", value: 600, premium: false },
  { label: "15 minutes", value: 900, premium: false },
  { label: "30 minutes", value: 1800, premium: false },
] as const;

export type PlanType = "free" | "pro";

export function getPlanLimits(isPro: boolean) {
  return isPro ? PRO_PLAN : FREE_PLAN;
}

export function isIntervalAllowed(interval: number, isPro: boolean): boolean {
  const plan = getPlanLimits(isPro);
  return plan.intervals.includes(interval as any);
}

export function isRegionAllowed(region: string, isPro: boolean): boolean {
  const plan = getPlanLimits(isPro);
  return plan.regions.includes(region as any);
}

export function getAvailableRegions(isPro: boolean): string[] {
  return [...getPlanLimits(isPro).regions];
}
