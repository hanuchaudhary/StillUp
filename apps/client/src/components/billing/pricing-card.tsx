import { FREE_PLAN, PRO_PLAN } from "@stillup/shared/plans";
import { Check, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PricingCardProps {
  isPro: boolean;
  isLoading: boolean;
  onSubscribe: () => void;
  onManage: () => void;
}

export function PricingCard({
  isPro,
  isLoading,
  onSubscribe,
  onManage,
}: PricingCardProps) {
  const freeFeatures = [
    `Check interval from ${FREE_PLAN.minInterval} seconds`,
    `Up to ${FREE_PLAN.maxRegions} monitoring regions`,
    "Email alerts",
    "Core status tracking",
  ];

  const proFeatures = [
    `Check interval: ${PRO_PLAN.minInterval} seconds`,
    `Up to ${PRO_PLAN.maxRegions} monitoring regions`,
    "Email alerts",
    "Advanced analytics",
    "Priority support",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="relative overflow-hidden border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Free</span>
            </CardTitle>
            {!isPro && <Badge variant="secondary">Current</Badge>}
          </div>
          <CardDescription>For personal and starter usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">
            $0
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </div>
          <ul className="space-y-2">
            {freeFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full" variant="secondary" disabled>
            {isPro ? "Basic Plan" : "Current Plan"}
          </Button>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border border-primary/35 bg-linear-to-b from-primary/6 via-card to-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_0_1px_rgba(196,104,73,0.28),0_18px_45px_-26px_rgba(196,104,73,0.65)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-primary/12 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -left-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        </div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4 text-primary" />
              <span>Pro</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 h-7 text-primary border border-primary/30 hover:bg-primary/20">
                Most Popular
              </Badge>
              {isPro && <Badge>Current</Badge>}
            </div>
          </div>
          <CardDescription>For teams and businesses</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="text-3xl font-bold">
            {PRO_PLAN.priceDisplay}
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </div>
          <ul className="space-y-2">
            {proFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            onClick={isPro ? onManage : onSubscribe}
            disabled={isLoading}
          >
            {isLoading
              ? isPro
                ? "Opening portal..."
                : "Redirecting..."
              : isPro
                ? "Manage Subscription"
                : "Upgrade to Pro"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
