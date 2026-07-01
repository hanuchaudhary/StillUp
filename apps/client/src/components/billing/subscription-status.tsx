import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Subscription, SubscriptionStatus } from "@/types/types";

interface SubscriptionStatusProps {
  subscription: Subscription | null;
  isPro: boolean;
}

const statusConfig: Record<
  SubscriptionStatus,
  {
    label: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    tone: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    icon: CheckCircle,
    variant: "default",
    tone: "border-emerald-500/30 bg-emerald-500/8",
  },
  INACTIVE: {
    label: "Inactive",
    icon: XCircle,
    variant: "secondary",
    tone: "border-border bg-muted/30",
  },
  PAST_DUE: {
    label: "Past Due",
    icon: AlertCircle,
    variant: "destructive",
    tone: "border-destructive/40 bg-destructive/10",
  },
  CANCELED: {
    label: "Canceled",
    icon: XCircle,
    variant: "secondary",
    tone: "border-amber-500/35 bg-amber-500/10",
  },
  TRIALING: {
    label: "Trial",
    icon: Clock,
    variant: "outline",
    tone: "border-blue-500/35 bg-blue-500/10",
  },
};

export function SubscriptionStatus({
  subscription,
  isPro,
}: SubscriptionStatusProps) {
  if (!subscription || !isPro || subscription.status === "INACTIVE") {
    return null;
  }

  const config = statusConfig[subscription.status];
  const StatusIcon = config.icon;

  return (
    <Card className={`border ${config.tone}`}>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          {isPro ? "You have access to all Pro features" : "Upgrade to unlock premium features"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10">
              Cancels at period end
            </Badge>
          )}
        </div>

        {subscription.currentPeriodEnd && (
          <div className="text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd ? "Access until: " : "Renews on: "}
            {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
