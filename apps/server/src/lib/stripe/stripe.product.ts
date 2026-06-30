import { stripe } from "./stripe";

export const createStripeProduct = async () => {
  await stripe.products
    .create({
      name: "Uptime Premium",
      description: "5$/month subscription for uptime monitoring service",
    })
    .then(async (product) => {
      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: 500,
        recurring: { interval: "month" },
        product: product.id,
      });
      return { product, price };
    })
    .then(({ product, price }) => {
      console.log("Stripe product and price created successfully:");
      console.log("ProductId:", product.id);
      console.log("PriceId:", price.id);
    })
    .catch((error) => {
      console.error("Error creating Stripe product or price:", error);
    });
};

createStripeProduct();