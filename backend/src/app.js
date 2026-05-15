const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const frontendDirectory = path.resolve(process.cwd(), 'frontend');

const allowedOriginPatterns = [
  /^http:\/\/localhost(?::\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/i
];

const globalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (origin === env.clientUrl || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(compression());
app.use(hpp());
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.env === 'development' ? 'dev' : 'combined'));
app.use('/uploads', express.static('uploads'));
app.use(express.static(frontendDirectory));

app.get('/health', (req, res) => {
  res.json({ success: true, message: `${env.appName} API is healthy` });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDirectory, 'index.html'));
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
