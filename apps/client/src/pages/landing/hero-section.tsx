import { Link } from "react-router-dom";

import { ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { type DemoMonitor, DemoMonitorCard } from "./demo-monitor-card";

const demoMonitors: DemoMonitor[] = [
  {
    url: "https://api.stripe.com",
    name: "Payment Gateway",
    uptimePercentage: 99.98,
    isUp: true,
  },
  {
    url: "https://dashboard.example.io",
    name: "Main Dashboard",
    uptimePercentage: 76.5,
    isUp: false,
  },
  {
    url: "https://cdn.myapp.com",
    name: "CDN Assets",
    uptimePercentage: 54.3,
    isUp: false,
  },
  {
    url: "https://auth.myapp.com",
    name: "Authentication Service",
    uptimePercentage: 99.99,
    isUp: true,
  },
];

export function HeroSection() {
  return (
    <section className="pt-12 font-geist text-center">
      <div className="max-w-4xl lg:px-0 px-4 mx-auto mb-20">
        <div className="inline-flex items-start gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary md:text-xs text-[10px] font-medium mb-4">
          Trusted by 1,000+ developers
        </div>
        <h1 className="md:text-5xl font-heading text-4xl leading-none mb-6">
          Never miss a
          <br />
          <span>second of downtime again</span>
        </h1>
        <p className="font-extralight md:max-w-2xl max-w-xs mx-auto mb-10 md:text-lg text-sm md:leading-6 text-muted-foreground">
          Real-time website and API monitoring from 3 global regions. <br />{" "}
          Detect outages in seconds, get instant alerts via email, and resolve
          issues <br />
          before your users even notice. Built for teams who can't afford to be
          offline.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="px-5 h-10">
              Start Monitoring Free
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid mx-auto w-full max-w-2xl gap-3 sm:grid-cols-2 relative z-10">
          <Stat title="No Credit Card Required" desc="Get started instantly " />
          <Stat
            title="Free plan available"
            desc="Monitor up to 3 services for free"
          />
        </div>
      </div>

      <div className="mx-auto md:p-10 pt-12 md:pt-20 border-y">
        <div className="p-2 md:p-4">
          <div className="flex-1 text-center mb-4 md:mb-6">
            <span className="text-lg md:text-2xl font-geist">
              stillup.sh/dashboard
            </span>
            <p className="text-muted-foreground mt-1 font-light text-xs md:text-sm">
              See real-time monitoring in action with our public demo dashboard
            </p>
          </div>
          <div className="p-3 md:p-6 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 bg-secondary/50 p-1.5 rounded-2xl">
              {demoMonitors.map((monitor, index) => (
                <DemoMonitorCard
                  key={monitor.url}
                  monitor={monitor}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group  bg-linear-to-br from-primary/30 via-secondary/30 to-primary/30 p-1 rounded-xl">
      <div className=" bg-card/80 p-4 ring-1 ring-border/50 backdrop-blur rounded-lg">
        <div className="flex items-start gap-3">
          <div>
            <BadgeCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          </div>
          <div className="text-left">
            <p className="text-sm">{title}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
