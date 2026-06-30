import { useEffect } from "react";

import { Footer } from "../landing/footer";
import { Header } from "../landing/header";

export function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background font-montreal-mono">
      <Header />
      <main className="max-w-6xl mx-auto border-x">
        <div className="mx-auto px-4 py-10 md:px-8">
          <div>
            <header className="border-b px-6 py-6 md:px-10">
              <h1 className="text-3xl font-heading text-primary">Privacy Policy</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Effective date: April 12, 2026
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                This policy explains what data StillUp collects and how we use
                it to provide uptime monitoring, alerts, and subscription
                billing.
              </p>
            </header>

            <div className="space-y-8 px-6 py-8 text-sm leading-7 md:px-10">
              <section>
                <h2 className="text-xl">1. Data We Collect</h2>
                <p className="mt-2 text-muted-foreground">
                  StillUp collects the minimum information needed to operate the
                  platform:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    Account data: email, optional name and image, password
                    hash, and email verification status.
                  </li>
                  <li>
                    Session/security data: session token metadata, optional IP
                    address, and user-agent information.
                  </li>
                  <li>
                    Monitor configuration: monitor name, URL, check interval,
                    selected regions, active state, and notification email.
                  </li>
                  <li>
                    Monitor telemetry: check status, response time, status code,
                    region, errors, and timestamps.
                  </li>
                  <li>
                    Alert history: alert type (UP or DOWN), destination email,
                    success state, and failure details.
                  </li>
                  <li>
                    Billing data: Stripe customer/subscription identifiers,
                    subscription status, period dates, and transaction records.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">2. How We Use Data</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Authenticate users and secure accounts.</li>
                  <li>Schedule and execute regional uptime checks.</li>
                  <li>
                    Calculate uptime/performance statistics in the dashboard.
                  </li>
                  <li>Send service alerts and account emails.</li>
                  <li>Process and manage subscriptions and payments.</li>
                  <li>
                    Prevent abuse, troubleshoot issues, and improve reliability.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">3. Data Sharing</h2>
                <p className="mt-2 text-muted-foreground">
                  We do not sell your personal data. We share data only with
                  service providers needed to operate StillUp, including:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Stripe for subscription payments and billing management.</li>
                  <li>Resend for account and monitoring email delivery.</li>
                  <li>
                    Hosting/database/queue infrastructure that processes monitor
                    jobs and stores application data.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">4. Data Retention</h2>
                <p className="mt-2 text-muted-foreground">
                  We retain account and monitor data while your account is
                  active. Associated monitor checks, alert logs, and billing
                  records may be retained as required for product
                  functionality, compliance, dispute handling, and fraud
                  prevention.
                </p>
              </section>

              <section>
                <h2 className="text-xl">5. Your Controls</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>You can update monitor settings and notification emails.</li>
                  <li>
                    You can disable or delete monitors, which stops scheduling
                    new checks.
                  </li>
                  <li>You can manage subscription state from billing settings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl">6. Security</h2>
                <p className="mt-2 text-muted-foreground">
                  StillUp uses authentication/session controls and
                  infrastructure safeguards designed to protect your data. No
                  method of storage or transmission is completely secure, but we
                  continuously improve our controls.
                </p>
              </section>

              <section>
                <h2 className="text-xl">7. Contact</h2>
                <p className="mt-2 text-muted-foreground">
                  For privacy questions, contact support at support@stillup.sh.
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
