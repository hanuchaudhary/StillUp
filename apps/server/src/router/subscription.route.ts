import { prisma } from "@stillup/database";
import Elysia from "elysia";

import { betterAuth } from "../lib/plugin";
import { PRICE_ID, stripe } from "../lib/stripe/stripe";

export const subscriptionRouter = new Elysia()
  .use(betterAuth)
  .group("/api/subscription", (app) =>
    app
      .get(
        "/",
        async ({ user }) => {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: user.id },
            select: {
              id: true,
              status: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
            },
          });

          const isPro = subscription?.status === "ACTIVE";

          return {
            success: true,
            subscription,
            isPro,
          };
        },
        {
          auth: true,
          tags: ["Payment"],
        }
      )
      .post(
        "/checkout",
        async ({ user }) => {
          let subscription = await prisma.subscription.findUnique({
            where: { userId: user.id },
          });

          let customerId = subscription?.stripeCustomerId;

          if (!customerId) {
            const customer = await stripe.customers.create({
              email: user.email,
              metadata: {
                userId: user.id,
              },
            });
            customerId = customer.id;

            subscription = await prisma.subscription.create({
              data: {
                userId: user.id,
                stripeCustomerId: customerId,
                status: "INACTIVE",
              },
            });
          }

          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
              {
                price: PRICE_ID,
                quantity: 1,
              },
            ],
            success_url: `https://stillup.sh/billing?success=true`,
            cancel_url: `https://stillup.sh/billing?canceled=true`,
            metadata: {
              userId: user.id,
            },
          });

          return {
            success: true,
            url: session.url,
          };
        },
        {
          auth: true,
          tags: ["Payment"],
        }
      )
      .post(
        "/portal",
        async ({ user }) => {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: user.id },
          });

          if (!subscription?.stripeCustomerId) {
            throw new Error("No subscription found");
          }

          const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripeCustomerId,
            return_url: `https://stillup.sh/billing`,
          });

          return {
            success: true,
            url: session.url,
          };
        },
        {
          auth: true,
          tags: ["Payment"],
        }
      )
  )
  .post(
    "/webhook/stripe",
    async ({ request }) => {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        throw new Error("Missing stripe-signature header");
      }

      let event;
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        throw new Error(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          const stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const item = stripeSubscription.items.data[0];

          await prisma.$transaction(async (tx) => {
            const sub = await tx.subscription.update({
              where: { stripeCustomerId: customerId },
              data: {
                stripeSubscriptionId: subscriptionId,
                stripePriceId: item?.price.id,
                status: "ACTIVE",
                currentPeriodStart: new Date(
                  item?.current_period_start! * 1000
                ),
                currentPeriodEnd: new Date(item?.current_period_end! * 1000),
              },
            });

            await tx.transaction.create({
              data: {
                userId: sub.userId,
                stripeInvoiceId: session.invoice as string,
                amount: session.amount_total || 500,
                currency: session.currency || "usd",
                status: "SUCCEEDED",
                description: "Pro subscription",
              },
            });
          });
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const customerId = subscription.customer as string;
          const item = subscription.items.data[0];

          let status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" =
            "ACTIVE";
          if (subscription.status === "past_due") status = "PAST_DUE";
          if (subscription.status === "canceled") status = "CANCELED";
          if (subscription.status === "trialing") status = "TRIALING";
          if (subscription.status === "active") status = "ACTIVE";

          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status,
              currentPeriodStart: new Date(item?.current_period_start! * 1000),
              currentPeriodEnd: new Date(item?.current_period_end! * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer as string;

          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: "CANCELED",
              stripeSubscriptionId: null,
            },
          });
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const customerId = invoice.customer as string;

          if (invoice.billing_reason === "subscription_cycle") {
            await prisma.$transaction(async (tx) => {
              const sub = await tx.subscription.findUnique({
                where: { stripeCustomerId: customerId },
                select: { userId: true },
              });

              if (sub) {
                await tx.transaction.create({
                  data: {
                    userId: sub.userId,
                    stripeInvoiceId: invoice.id,
                    amount: invoice.amount_paid,
                    currency: invoice.currency,
                    status: "SUCCEEDED",
                    description: "Pro subscription renewal",
                  },
                });
              }
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const customerId = invoice.customer as string;

          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: "PAST_DUE",
            },
          });
          break;
        }
      }

      return { received: true };
    },
    {
      tags: ["Payment"],
    }
  );
