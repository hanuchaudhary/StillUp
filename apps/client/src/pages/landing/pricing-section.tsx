import { IconAsterisk } from "@tabler/icons-react";
import { Heading, PricingWrapper, Price, Paragraph } from "@/components/pricing-card";

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
    <section>
      <div className="text-center mt-16">
        <h2 className="text-3xl font-heading tracking-wide mb-1">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground font-light">
          Start free, upgrade when you need more power.
        </p>
      </div>
      <div className={'h-[700px] w-full flex gap-12 items-center justify-center'}>
        <PricingWrapper onContact={() => { }} type={'crosses'} className={'bg-primary/50 w-full max-w-5xl'}>
          <Heading className="font-montreal-regular font-normal text-neutral-800">StillUp Enterprise</Heading>
          <Price className="font-fustat font-normal">
            $5
            /mo
          </Price>
          <div className={'flex flex-col gap-2'}>
            {
              features.map((feature) => (
                <Paragraph key={feature.label} className="flex items-center gap-2 font-fustat font-normal">
                  <IconAsterisk className={'size-5 text-primary-foreground font-bold'} /> {feature.label}
                </Paragraph>
              ))
            }
          </div>
        </PricingWrapper>
      </div>
    </section>
  );
}
