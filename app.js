const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

const bookNameRouter = require('./Routes/BooknameRoutes');
const moneyTransRouter = require('./Routes/MoneyTransRoutes');
const UserRouter = require('./Routes/UserRoutes');
const ErrorMiddleware = require('./utils/ErrorMiddleware');
const AppError = require('./utils/AppError');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/bookname', bookNameRouter);
app.use('/api/v1/moneyTrans', moneyTransRouter);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
});
app.use(limiter);
app.use('/api/v1/Users', UserRouter);

app.all('*', (req, res, next) => {
  next(new AppError('this api is not valid . Please check your apis', 400));
});

// middleware that will print error message
app.use(ErrorMiddleware);
module.exports = app;
