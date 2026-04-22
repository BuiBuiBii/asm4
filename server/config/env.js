const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const parsePort = (value) => {
  const parsedPort = Number(value);
  return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
};

const parseOrigins = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const nodeEnv = process.env.NODE_ENV || 'development';
const missingRequiredVars = ['MONGO_URI', 'JWT_SECRET'].filter((key) => {
  const value = process.env[key];
  return typeof value !== 'string' || value.trim() === '';
});

if (nodeEnv === 'production') {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (typeof corsOrigin !== 'string' || corsOrigin.trim() === '') {
    missingRequiredVars.push('CORS_ORIGIN');
  }
}

if (missingRequiredVars.length > 0) {
  const message = `[config] Missing required environment variables: ${missingRequiredVars.join(
    ', '
  )}. Please set these environment variables in your deployment platform or create server/.env with the required values.`;
  console.error(message);
  throw new Error(message);
}

module.exports = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
});
