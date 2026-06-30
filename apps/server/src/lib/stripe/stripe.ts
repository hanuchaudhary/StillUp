import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRODUCT_ID = "prod_UJNRKl3cR0gqSv";
export const PRICE_ID = "price_1TKkgrA90mYRaRB4dyKHhpLg";