import { Link } from "react-router-dom";

import { IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const features = [
  {
    label: "Unlimited monitors",
    info: "Monitor as many endpoints as you need with our flexible plan.",
  },
  {
    label: "30-second check intervals",
    info: "Get real-time updates on your infrastructure health.",
  },
  {
    label: "All 3 monitoring regions",
    info: "Ensure your applications are always available globally.",
  },
  {
    label: "Priority email alerts",
    info: "Never miss an important notification with our priority alerting system.",
  },
  {
    label: "365-day data retention",
    info: "Keep all your monitoring data for a full year without any hassle.",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 font-geist">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading tracking-wide mb-1">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground font-light">
            Start free, upgrade when you need more power.
          </p>
        </div>
        <TooltipProvider>
          <Card className="md:w-116 mx-auto rounded-[38px] border border-border bg-card text-card-foreground p-5.75 flex flex-col gap-6 shadow-sm">
            <div>
              <h2 className="text-xl leading-[24px] mb-1">
                StillUp Enterprise
              </h2>
              <p className="text-base text-muted-foreground leading-[19px] font-light">
                Custom solutions for large teams with advanced needs.
              </p>
            </div>

            <CardContent className="rounded-[33px] border border-border bg-background px-[27px] py-[30px] flex flex-col gap-[25px]">
              {features.map((f, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                      <IconCheck className="text-primary w-5 h-5 flex-shrink-0" />
                      <span className="text-base leading-[19px]">
                        {f.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[260px] text-sm bg-popover text-popover-foreground border border-border rounded-xl px-3 py-2 shadow-md"
                  >
                    {f.info}
                  </TooltipContent>
                </Tooltip>
              ))}
            </CardContent>

            <div className="flex items-center justify-between px-[6px]">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Starting from
                </span>
                <span className="text-[34px] font-medium leading-[41px]">
                  $5
                </span>
              </div>
              <Link to="/billing">
                <Button
                  className={cn(
                    "flex items-center justify-center gap-3 md:w-[220px] md:h-[64px] rounded-[39px] md:text-[20px] text-lg h-10 w-40 font-medium text-white",
                    "bg-gradient-to-r from-[#C46849] via-[#C46849] to-[#C46849]",
                    "border-[3px] border-[#C46849]",
                    "shadow-sm hover:opacity-90 transition-all duration-150"
                  )}
                >
                  <span>Start Premium</span>
                </Button>
              </Link>
            </div>
          </Card>
        </TooltipProvider>
      </div>
    </section>
  );
}
