import { z } from "zod";

export const createMonitorSchema = z.object({
  name: z.string().min(1, "Monitor name is required"),
  url: z.string().url("Please enter a valid URL"),
  interval: z.coerce
    .number()
    .int()
    .positive()
    .min(10, "Interval must be at least 30 seconds"),
  regions: z.array(z.string()).min(1, "At least one region is required"),
  isActive: z.boolean().default(true),
  notificationEmail: z.string().email().optional().nullable(),
});
export type CreateMonitorInput = z.input<typeof createMonitorSchema>;

export const updateMonitorSchema = z.object({
  name: z.string().min(1, "Monitor name is required").optional(),
  url: z.string().url("Please enter a valid URL").optional(),
  interval: z.coerce
    .number()
    .int()
    .positive()
    .min(10, "Interval must be at least 30 seconds")
    .optional(),
  regions: z
    .array(z.string())
    .min(1, "At least one region is required")
    .optional(),
  isActive: z.boolean().optional(),
  notificationEmail: z.string().email().optional().nullable(),
});

export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;
