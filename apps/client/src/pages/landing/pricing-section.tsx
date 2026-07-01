import { IconAsterisk } from "@tabler/icons-react";
import {
  ENTERPRISE_FEATURES,
  Heading,
  Paragraph,
  Price,
  PricingWrapper,
} from "@/components/pricing-card";

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
      <div className={"h-[700px] w-full flex gap-12 items-center justify-center"}>
        <PricingWrapper
          contactHref="/billing"
          type={"crosses"}
          className={"bg-primary/50 w-full max-w-5xl"}
        >
          <Heading className="font-montreal-regular font-normal">
            StillUp Enterprise
          </Heading>
          <Price className="font-fustat font-normal">$5/mo</Price>
          <div className={"flex flex-col gap-2"}>
            {ENTERPRISE_FEATURES.map((feature) => (
              <Paragraph
                key={feature}
                className="flex items-center gap-2 font-fustat font-normal"
              >
                <IconAsterisk className={"size-5 text-primary-foreground font-bold"} />{" "}
                {feature}
              </Paragraph>
            ))}
          </div>
        </PricingWrapper>
      </div>
    </section>
  );
}
