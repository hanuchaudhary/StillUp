import { useEffect } from "react";

import { Footer } from "../landing/footer";
import { Header } from "../landing/header";

export function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background font-geist">
      <Header />
      <main className="max-w-6xl mx-auto border-x font-montreal-mono">
        <div className="mx-auto px-4 py-10 md:px-8">
          <div className="">
            <header className="border-b px-6 py-6 md:px-10">
              <h1 className="text-3xl font-heading text-primary">Terms of Service</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Effective date: April 12, 2026
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                These terms govern your use of StillUp uptime monitoring
                services.
              </p>
            </header>

            <div className="space-y-8 px-6 py-8 text-sm leading-7 md:px-10">
              <section>
                <h2 className="text-xl">1. Service Overview</h2>
                <p className="mt-2 text-muted-foreground">
                  StillUp provides distributed website and API monitoring,
                  performance telemetry, incident alerting, and
                  subscription-based premium features.
                </p>
              </section>

              <section>
                <h2 className="text-xl">2. Accounts</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials.
                  </li>
                  <li>
                    You are responsible for activity under your account and
                    configuration changes made through it.
                  </li>
                  <li>
                    You must provide accurate signup information and a reachable
                    email address.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">3. Acceptable Use</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    You may monitor endpoints you own or are authorized to test.
                  </li>
                  <li>
                    You must not use StillUp to perform abusive scanning, denial
                    of service, or unlawful activity.
                  </li>
                  <li>
                    You must not attempt to bypass plan limits, security
                    measures, or access restrictions.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">4. Monitoring and Alerts</h2>
                <p className="mt-2 text-muted-foreground">
                  Monitor checks and alerting are best-effort services.
                  Temporary false positives, false negatives, or delivery delays
                  can occur due to network conditions, provider outages, or
                  destination filtering.
                </p>
              </section>

              <section>
                <h2 className="text-xl">5. Billing and Subscriptions</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    Paid plans are billed through Stripe and may renew
                    automatically unless canceled.
                  </li>
                  <li>
                    Subscription status and billing periods are managed through
                    StillUp billing settings and Stripe customer portal flows.
                  </li>
                  <li>Fees are non-refundable except where required by law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">6. Suspension and Termination</h2>
                <p className="mt-2 text-muted-foreground">
                  We may suspend or terminate access for violations of these
                  terms, abuse, security risks, or legal requirements. You may
                  stop using the service at any time.
                </p>
              </section>

              <section>
                <h2 className="text-xl">7. Disclaimer and Liability</h2>
                <p className="mt-2 text-muted-foreground">
                  StillUp is provided on an "as is" and "as available" basis. To
                  the maximum extent permitted by law, StillUp disclaims
                  warranties and is not liable for indirect, incidental,
                  special, consequential, or punitive damages arising from use
                  of the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl">8. Changes to Terms</h2>
                <p className="mt-2 text-muted-foreground">
                  We may update these terms as the product evolves. Continued
                  use of StillUp after updates means you accept the revised
                  terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl">9. Contact</h2>
                <p className="mt-2 text-muted-foreground">
                  For questions about these terms, contact support@stillup.sh.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
