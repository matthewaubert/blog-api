require('dotenv').config();
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const express = require('express'); // https://expressjs.com/en/api.html
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const compression = require('compression');
const helmet = require('helmet'); // https://helmetjs.github.io/
const cors = require('cors'); // https://expressjs.com/en/resources/middleware/cors.html

const app = express();

// set up rate limiter
const rateLimit = require('express-rate-limit'); // https://express-rate-limit.mintlify.app/quickstart/usage
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 60, // limit each IP to 60 requests per `window`
});
app.use(limiter); // apply rate limiter to all requests

app.use(helmet()); // protect app from well-known vulnerabilities

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI_DEV;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(compression()); // compress all routes
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : 'http://horizons-ma.pages.dev',
  }),
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);

  // return error
  res.status(err.status || 500).json({
    success: false,
    message: err.status
      ? `${err.status} ${err.message}`
      : `${res.status} Internal Server Error`,
    errors: [err],
  });
});

module.exports = app;
