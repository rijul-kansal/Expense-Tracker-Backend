const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

const app = require('./app');
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
    console.log(err);
  });
const Port = process.env.PORT || 3000;
const server = app.listen(Port, () => {
  console.log('Listining to server');
});
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
