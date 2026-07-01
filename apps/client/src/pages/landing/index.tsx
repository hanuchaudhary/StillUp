import { FeaturesSection } from "./features-section";
import { Footer } from "./footer";
import { Header } from "./header";
// import { HeroSection } from "./hero-section";
import { PricingSection } from "./pricing-section";
import { RegionsSection } from "./regions-section";
import { DemoSection } from "./demo-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto border-x">
        {/* <HeroSection /> */}
        <DemoSection />
        <FeaturesSection />
        <RegionsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
