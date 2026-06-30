export type MONITOR_STATUS = "UP" | "DOWN" | "UNKNOWN";

export interface RegionBreakdown {
  region: string;
  status: MONITOR_STATUS;
  responseTime: number | null;
}

export interface UptimeWindow {
  status: "good" | "bad" | "unknown";
  timestamp: string;
  regionBreakdown: RegionBreakdown[];
}

export interface MonitorStats {
  currentStatus: MONITOR_STATUS;
  uptimePercentage: number;
  lastCheckedAt: string | null;
  uptimeWindows: UptimeWindow[];
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number;
  regions: string[];
  isActive: boolean;
  performance: boolean;
  createdAt: string;
  updatedAt: string;
  stats: MonitorStats;
}

export interface Check {
  id: string;
  monitorId?: string;
  status: MONITOR_STATUS;
  responseTime: number;
  region: string;
  statusCode: number;
  error: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MonitorListResponse {
  success: boolean;
  monitors: Monitor[];
  pagination: Pagination;
}

export interface MonitorDetailResponse {
  success: boolean;
  monitor: Monitor;
}

export interface CheckLogsResponse {
  success: boolean;
  logs: Check[];
  pagination: Pagination;
}

export interface LatencyDataPoint {
  timestamp: string;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  region?: string;
}

export interface LatencyResponse {
  success: boolean;
  range: "day" | "week" | "month";
  region: string;
  dataPoints: LatencyDataPoint[];
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "TRIALING";

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription | null;
  isPro: boolean;
}

export interface CheckoutResponse {
  success: boolean;
  url: string;
}

export interface PortalResponse {
  success: boolean;
  url: string;
}
