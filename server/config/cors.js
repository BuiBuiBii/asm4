const env = require('./env');

const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeOrigin = (origin) => origin.replace(/\/+$/, '');

const toOriginPattern = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  const pattern = `^${escapeRegex(normalizedOrigin).replace(/\\\*/g, '.*')}$`;
  return new RegExp(pattern);
};

const allowedOrigins = Array.from(
  new Set([
    ...env.corsOrigins.map(normalizeOrigin),
    ...(env.nodeEnv === 'production' ? [] : developmentOrigins),
  ])
);

const allowedOriginPatterns = allowedOrigins.map(toOriginPattern);

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  return allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));
};

module.exports = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    const error = new Error(`CORS blocked for origin: ${origin}`);
    error.status = 403;
    error.code = 'CORS_NOT_ALLOWED';
    return callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
