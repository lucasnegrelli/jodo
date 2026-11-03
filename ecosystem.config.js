module.exports = {
    apps: [
      {
        name: "jodo",
        script: "node_modules/next/dist/bin/next",
        args: "dev",
        env: {
          NODE_ENV: "development",
          PORT: 3002
        }
      }
    ]
  };