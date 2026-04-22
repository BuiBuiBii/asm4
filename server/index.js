let env;
let connectDB;
let app;

try {
  env = require('./config/env');
  connectDB = require('./config/db');
  app = require('./server');
} catch (error) {
  console.error('[bootstrap] Configuration error during startup:', error.message);
  console.error('[bootstrap] Full error:', error.stack);
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`[bootstrap] Server listening on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('[bootstrap] Failed to start server:', error.message);
    console.error('[bootstrap] Full error:', error.stack);
    process.exit(1);
  }
};

startServer();
