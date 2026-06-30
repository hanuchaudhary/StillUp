module.exports = {
  apps: [
    {
      name: "api",
      script: "bun",
      cwd: "/root/still-up/apps/server",
      args: "run start",
      env: {
        PORT: 4000,
      },
    },
    {
      name: "worker:us-east",
      script: "bun",
      cwd: "/root/still-up/apps/worker",
      args: "run start:us-east",
    },
    {
      name: "worker:alert",
      script: "bun",
      cwd: "/root/still-up/apps/server",
      args: "run worker",
    },
  ],
};
