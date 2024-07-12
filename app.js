const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const bookNameRouter = require('./Routes/BooknameRoutes');
const moneyTransRouter = require('./Routes/MoneyTransRoutes');
const UserRouter = require('./Routes/UserRoutes');
const ErrorMiddleware = require('./utils/ErrorMiddleware');
const AppError = require('./utils/AppError');
const functions = require('firebase-functions');

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
});
app.use(limiter);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/bookname', bookNameRouter);
app.use('/api/v1/moneyTrans', moneyTransRouter);

app.use('/api/v1/Users', UserRouter);

app.all('*', (req, res, next) => {
  next(new AppError('this api is not valid . Please check your apis', 400));
});

// middleware that will print error message
app.use(ErrorMiddleware);
const mongoose = require('mongoose');
const DB = process.env.DATABASE_URL.replace('<password>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then((res) => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.error(err);
  });

// for firebase commet this
// const PORT = process.env.PORT || 8000;
// const server = app.listen(PORT, () => {
//   console.log(`Listening to server on port ${PORT}`);
// });
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
exports.api = functions.https.onRequest(app);
