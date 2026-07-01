import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { IconAsterisk } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { SubscriptionStatus } from "@/components/billing/subscription-status";
import {
  ENTERPRISE_FEATURES,
  Heading,
  Paragraph,
  Price,
  PricingWrapper,
} from "@/components/pricing-card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

export function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const isCheckoutSuccess = searchParams.get("success") === "true";
  const isCheckoutCanceled = searchParams.get("canceled") === "true";

  const { data, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiClient.getSubscription(),
  });

  useEffect(() => {
    if (isCheckoutSuccess) {
      toast.success("Subscription activated successfully!");
      refetch();
    } else if (isCheckoutCanceled) {
      toast.info("Checkout was canceled");
    }
  }, [isCheckoutSuccess, isCheckoutCanceled, refetch]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.createCheckoutSession();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.createPortalSession();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to open billing portal");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = data?.isPro ?? false;

  return (
    <div className="lg:p-6 p-3">
      <div className="flex items-center gap-2 max-w-sm lg:pt-6 p-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl">Manage Your Subscriptions</h1>
      </div>
      <p className="mb-8 lg:pt-0 pt-5 lg:pl-10 pl-0 text-muted-foreground">
        See your current subscription status, manage your plan
      </p>

      <div className="lg:px-10 px-0">
        {isCheckoutSuccess ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden border border-emerald-500/40 bg-emerald-500/10 p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Subscription activated successfully
                  </p>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-200/80 mt-1">
                    Your workspace is now on Pro and premium monitoring limits
                    are active.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        ) : isCheckoutCanceled ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden border border-amber-500/40 bg-amber-500/10 p-5">
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <CircleAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    Checkout canceled
                  </p>
                  <p className="text-sm text-amber-700/80 dark:text-amber-200/80 mt-1">
                    No charge was made. You are still on your current plan and
                    can upgrade anytime.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/billing")}>
              Back to billing overview
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <SubscriptionStatus
              subscription={data?.subscription ?? null}
              isPro={isPro}
            />
            <div>
              <h2 className="text-lg font-semibold mb-1">Plans</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {isPro
                  ? "You're on StillUp Enterprise. Manage your subscription below."
                  : "Upgrade to unlock faster checks, all regions, and priority alerts."}
              </p>
              <div className="w-full flex items-center justify-center">
                <PricingWrapper
                  type="crosses"
                  className="bg-primary/50 w-full max-w-5xl"
                  onAction={isPro ? handleManage : handleSubscribe}
                  actionLabel={
                    isPro ? "Manage Subscription" : "Start Premium"
                  }
                  actionDisabled={isLoading}
                  actionLoading={isLoading}
                >
                  <Heading className="font-montreal-regular font-normal">
                    StillUp Enterprise
                  </Heading>
                  <Price className="font-fustat font-normal">$5/mo</Price>
                  <div className="flex flex-col gap-2">
                    {ENTERPRISE_FEATURES.map((feature) => (
                      <Paragraph
                        key={feature}
                        className="flex items-center gap-2 font-fustat font-normal"
                      >
                        <IconAsterisk className="size-5 text-primary-foreground font-bold" />{" "}
                        {feature}
                      </Paragraph>
                    ))}
                  </div>
                </PricingWrapper>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
