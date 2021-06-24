var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config();

var indexRouter = require('./src/routes/index');
var authRouter = require('./src/routes/authRouter');
var userRouter = require('./src/routes/userRouter');
var productRouter = require('./src/routes/productRouter');
var orderRouter = require('./src/routes/orderRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Database connection
 */
mongoose.connect(process.env.CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const connection = mongoose.connection;

connection.on('error', () => {
  console.log("Error to connect database");
});

connection.once('open', () => {
  console.log("Connection DB Successful");
});


app.use('/', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);
app.use('/api/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, 'Endpoint does not exist.'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send json error
  res.status(err.status || 500);
  res.json({
    errorCode: err.status || 500,
    error: err.status === 200 ? "Exitoso" : "Error",
    message: res.locals.message,
    date: new Date(),
    data: null
  });
});

module.exports = app;
