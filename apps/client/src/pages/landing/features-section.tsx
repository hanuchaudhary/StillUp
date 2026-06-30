import type React from "react";
import { Activity, Bell, Globe2, LineChart, Shield, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Globe2,
    title: "Multi-Region Monitoring",
    description:
      "Monitor from US East, EU West, and Asia Pacific simultaneously for global coverage.",
  },
  {
    icon: Zap,
    title: "30-Second Intervals",
    description:
      "Catch issues fast with checks as frequent as every 30 seconds on Pro plans.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified immediately via email when your services go down or recover.",
  },
  {
    icon: LineChart,
    title: "Response Analytics",
    description:
      "Track response times, uptime percentages, and historical performance data.",
  },
  {
    icon: Shield,
    title: "Smart Detection",
    description:
      "Consecutive check failures across regions prevent false positives.",
  },
  {
    icon: Activity,
    title: "Real-time Dashboard",
    description:
      "Beautiful dashboard with live status updates and detailed insights.",
  },
];

type FeatureType = (typeof features)[number];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 font-geist">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-1 lg:text-3xl text-2xl font-heading">
            Everything you need to stay online
          </h2>
          <p className="mx-auto max-w-2xl font-light text-muted-foreground">
            Powerful monitoring tools designed for modern teams. Simple to set
            up, reliable to use.
          </p>
        </div>

        <div className="mx-auto w-full max-w-5xl border-x border-border/80">
          <div className="border-y border-border/80 bg-background">
            <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard feature={feature} key={feature.title} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  feature: FeatureType;
}) {
  return (
    <article
      className={cn(
        "group flex min-h-52 flex-col justify-between bg-background p-5 sm:min-h-56 sm:p-6",
        className
      )}
      {...props}
    >
      <div className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 sm:mb-10 sm:h-11 sm:w-11">
        <feature.icon className="size-5" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium text-foreground sm:text-lg">
          {feature.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {feature.description}
        </p>
      </div>
    </article>
  );
}
