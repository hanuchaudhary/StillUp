import { Link } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import Prism from "@/components/prism";

export function HeroSection() {
  return (
    <section className="pt-12 font-geist text-center relative min-h-[90vh] overflow-hidden dark:bg-transparent">
      <div className="absolute w-full h-full top-40 left-0">
        <Prism
          animationType="3drotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={1.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={2}
        />
      </div>
      <div className="max-w-4xl lg:px-0 px-4 mx-auto mb-20 relative">
        <div className="inline-flex items-start gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary md:text-xs text-[10px] font-medium mb-4">
          Free to start · No credit card required
        </div>
        <h1 className="md:text-5xl font-heading text-4xl leading-none mb-6">
          Catch downtime
          <br />
          <span>before your customers do</span>
        </h1>
        <p className="font-extralight md:max-w-2xl max-w-xs mx-auto mb-10 md:text-lg text-sm md:leading-6 text-muted-foreground">
          Monitor your sites and APIs from 3 global regions. Get email alerts
          within 30 seconds of an outage—so you fix problems before users
          complain or churn.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="px-5 h-10">
              Start monitoring free
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs">
          Set up your first monitor in under 2 minutes
        </p>
      </div>
    </section>
  );
}