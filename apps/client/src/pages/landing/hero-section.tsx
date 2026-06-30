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
      </div>
    </section>
  );
}