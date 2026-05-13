
module.exports = {
  apps: [
    {
      name: "tynimail-server-dev",
      script: "npm",
      args: "run start",
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: "development",
      }
    },
  ],
};