import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { auth } from "./lib/auth";
import { betterAuth, OpenAPI } from "./lib/plugin";
import { scheduleAll } from "./lib/scheduler";
import { monitorRouter } from "./router/monitor.route";
import { subscriptionRouter } from "./router/subscription.route";

const app = new Elysia()
  .use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://stillup.sh",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "StillUp API",
          description:
            "API for StillUp, a website monitoring service that helps you keep track of your website's uptime and performance.",
          version: "1.0.0",
        },

        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        tags: [
          {
            name: "Monitoring",
            description:
              "Endpoints for managing monitors and retrieving monitoring data",
          },
          {
            name: "Payment",
            description:
              "Endpoints for handling payment and subscription management",
          },
        ],
      },
    })
  )
  .mount(auth.handler)
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toLocaleTimeString(),
      message: "Welcome to StillUp API! Visit /docs for API documentation.",
    };
  })
  .use(betterAuth)
  .use(monitorRouter)
  .use(subscriptionRouter)
  .listen(4000);

scheduleAll()
  .then(() => {
    console.log("All scheduled tasks have been set up.");
  })
  .catch((error) => {
    console.error("Error setting up scheduled tasks:", error);
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
