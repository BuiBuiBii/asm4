const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./server');

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`[bootstrap] Server listening on port ${env.port} in ${env.nodeEnv} mode`);
  });
};

startServer().catch((error) => {
  console.error('[bootstrap] Failed to start server:', error.stack || error);
  process.exit(1);
});
