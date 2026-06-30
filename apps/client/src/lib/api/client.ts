import { BACKEND_URL } from "@stillup/shared/constants";
import type { CreateMonitorInput } from "@stillup/shared/validation";
import axios, { type AxiosInstance } from "axios";

import type {
  CheckLogsResponse,
  CheckoutResponse,
  LatencyResponse,
  Monitor,
  MonitorDetailResponse,
  MonitorListResponse,
  PortalResponse,
  SubscriptionResponse,
} from "@/types/types";

export const API_BASE_URL = BACKEND_URL!;

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "An error occurred";
        throw new Error(message);
      }
    );
  }

  async getMonitors(page = 1, limit = 10) {
    const { data } = await this.client.get<MonitorListResponse>(
      `/api/monitor/all?page=${page}&limit=${limit}`
    );
    return data;
  }

  async getMonitor(id: string) {
    const { data } = await this.client.get<MonitorDetailResponse>(
      `/api/monitor/${id}`
    );
    return data;
  }

  async getMonitorLogs(id: string, page = 1, limit = 50, region = "all") {
    const { data } = await this.client.get<CheckLogsResponse>(
      `/api/monitor/${id}/logs?page=${page}&limit=${limit}&region=${region}`
    );
    return data;
  }

  async getMonitorLatency(
    id: string,
    range: "day" | "week" | "month" = "day",
    region = "all"
  ) {
    const { data } = await this.client.get<LatencyResponse>(
      `/api/monitor/${id}/latency?range=${range}&region=${region}`
    );
    return data;
  }

  async createMonitor(payload: CreateMonitorInput) {
    const { data } = await this.client.post<{
      success: boolean;
      message: string;
      monitor: Monitor;
    }>("/api/monitor", payload);
    return data;
  }

  async updateMonitor(id: string, payload: Partial<CreateMonitorInput>) {
    const { data } = await this.client.put<{
      success: boolean;
      message: string;
      monitor: Monitor;
    }>(`/api/monitor/${id}`, payload);
    return data;
  }

  async deleteMonitor(id: string) {
    const { data } = await this.client.delete(`/api/monitor/${id}`);
    return data;
  }

  async toggleMonitorPause(id: string, isActive: boolean) {
    const { data } = await this.client.put<{
      success: boolean;
      message: string;
      monitor: Monitor;
    }>(`/api/monitor/${id}`, { isActive });
    return data;
  }

  async getMonitorStats(id: string, fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);
    const { data } = await this.client.get<{
      success: boolean;
      stats: {
        today: { availability: number; downtime: number };
        last7Days: { availability: number; downtime: number };
        last30Days: { availability: number; downtime: number };
        last365Days: { availability: number; downtime: number };
        allTime: { availability: number; downtime: number; upFor: number };
        custom?: { availability: number; downtime: number };
      };
    }>(`/api/monitor/${id}/stats?${params.toString()}`);
    return data;
  }

  async getSubscription() {
    const { data } =
      await this.client.get<SubscriptionResponse>("/api/subscription");
    return data;
  }

  async createCheckoutSession() {
    const { data } = await this.client.post<CheckoutResponse>(
      "/api/subscription/checkout"
    );
    return data;
  }

  async createPortalSession() {
    const { data } = await this.client.post<PortalResponse>(
      "/api/subscription/portal"
    );
    return data;
  }
}

export const apiClient = new ApiClient();
