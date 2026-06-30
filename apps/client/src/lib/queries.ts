import type { CreateMonitorInput } from "@stillup/shared/validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "../lib/api/client";

export const queryKeys = {
  monitors: {
    all: ["monitors"] as const,
    detail: (id: string) => ["monitors", id] as const,
    checks: (id: string) => ["monitors", id, "checks"] as const,
  },
  user: {
    profile: ["user", "profile"] as const,
  },
};

export function useCreateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonitorInput) => apiClient.createMonitor(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monitors.all });
      toast.success(data.message || "Monitor created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create monitor");
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateMonitorInput>;
    }) => apiClient.updateMonitor(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monitors.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.monitors.detail(variables.id),
      });
      toast.success(data.message || "Monitor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update monitor");
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monitors.all });
      toast.success("Monitor deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete monitor");
    },
  });
}

export function useToggleMonitorPause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.toggleMonitorPause(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monitors.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.monitors.detail(variables.id),
      });
      toast.success(variables.isActive ? "Monitor resumed" : "Monitor paused");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update monitor");
    },
  });
}
