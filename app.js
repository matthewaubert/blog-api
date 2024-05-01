require('dotenv').config();
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.set('trust proxy', 2);

// set up rate limiter
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 20, // limit each IP to 20 requests per `window`
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // compress all routes

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
