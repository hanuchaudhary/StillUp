import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ALL_REGIONS,
  INTERVAL_OPTIONS,
  isIntervalAllowed,
  isRegionAllowed,
} from "@stillup/shared/plans";
import {
  type CreateMonitorInput,
  createMonitorSchema,
} from "@stillup/shared/validation";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";

import { apiClient } from "@/lib/api";
import { useSession } from "@/lib/auth.client";
import { useCreateMonitor, useUpdateMonitor } from "@/lib/queries";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface MonitorFormProps {
  monitor?: {
    id: string;
    name: string;
    url: string;
    interval: number;
    regions: string[];
    isActive: boolean;
    notificationEmail?: string | null;
  };
  onSuccess?: () => void;
}

export function MonitorForm({ monitor, onSuccess }: MonitorFormProps) {
  const isEditing = !!monitor;
  const { data: session } = useSession();
  const navigate = useNavigate();

  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiClient.getSubscription(),
  });

  const isPro = subscriptionData?.isPro ?? false;

  const createMutation = useCreateMonitor();
  const updateMutation = useUpdateMonitor();

  const [initialValues, setInitialValues] = useState<CreateMonitorInput | null>(
    null
  );

  const defaultEmail = monitor?.notificationEmail || session?.user?.email || "";

  const form = useForm<CreateMonitorInput>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: {
      name: monitor?.name || "",
      url: monitor?.url || "",
      interval: monitor?.interval || 300,
      isActive: monitor?.isActive ?? true,
      regions: monitor?.regions || [],
      notificationEmail: defaultEmail,
    },
  });

  useEffect(() => {
    if (
      !isEditing &&
      session?.user?.email &&
      !form.getValues("notificationEmail")
    ) {
      form.setValue("notificationEmail", session.user.email);
    }
  }, [session?.user?.email, isEditing, form]);

  useEffect(() => {
    if (isEditing && monitor) {
      setInitialValues({
        name: monitor.name,
        url: monitor.url,
        interval: monitor.interval,
        isActive: monitor.isActive,
        regions: monitor.regions,
        notificationEmail: monitor.notificationEmail || "",
      });
    }
  }, [isEditing, monitor]);

  const regions = form.watch("regions");

  const handleToggleRegion = (region: string) => {
    if (regions.includes(region)) {
      form.setValue(
        "regions",
        regions.filter((r) => r !== region),
        { shouldValidate: true }
      );
    } else {
      form.setValue("regions", [...regions, region], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: CreateMonitorInput) => {
    try {
      if (isEditing) {
        const changedFields: Partial<CreateMonitorInput> = {};

        if (initialValues) {
          if (data.name !== initialValues.name) changedFields.name = data.name;
          if (data.url !== initialValues.url) changedFields.url = data.url;
          if (data.interval !== initialValues.interval)
            changedFields.interval = data.interval;
          if (data.isActive !== initialValues.isActive)
            changedFields.isActive = data.isActive;
          if (
            JSON.stringify(data.regions) !==
            JSON.stringify(initialValues.regions)
          ) {
            changedFields.regions = data.regions;
          }
          if (data.notificationEmail !== initialValues.notificationEmail) {
            changedFields.notificationEmail = data.notificationEmail;
          }
        }

        if (Object.keys(changedFields).length > 0) {
          await updateMutation.mutateAsync({
            id: monitor!.id,
            data: changedFields,
          });
        }
      } else {
        await createMutation.mutateAsync(data);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monitor Name</FormLabel>
              <FormControl>
                <Input placeholder="My Website" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name to identify this monitor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Must include http:// or https://
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Check Interval
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {INTERVAL_OPTIONS.map((option) => {
                    const isAllowed = isIntervalAllowed(option.value, isPro);
                    const isSelected = field.value === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (isAllowed) field.onChange(option.value);
                          else navigate("/billing");
                        }}
                        className="relative"
                      >
                        {option.label}
                        {option.premium && !isPro && (
                          <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </FormControl>
              <FormDescription>How often to check your website</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regions"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Regions</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ALL_REGIONS).map(([key, label]) => {
                    const isAllowed = isRegionAllowed(key, isPro);
                    const isSelected = regions.includes(key);

                    return (
                      <Button
                        key={key}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (isAllowed) handleToggleRegion(key);
                          else navigate("/billing");
                        }}
                        className="relative"
                      >
                        {label}
                        {!isAllowed && (
                          <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </FormControl>
              <FormDescription>
                Select at least one region to monitor from
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="alerts@example.com"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Email to receive alerts when this monitor goes down
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <FormLabel className="mt-0">
                  Active (start monitoring immediately)
                </FormLabel>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Monitor"
              : "Create Monitor"}
        </Button>
      </form>
    </Form>
  );
}
