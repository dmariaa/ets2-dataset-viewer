var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var helmet = require('helmet')
var compression = require('compression');

var indexRouter = require('./routes');
var apiRouter = require('./routes/api');

var app = express();
app.use(logger('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(process.env.STATIC_DIR));

app.use('/data', express.static(process.env.DATA_DIR));
app.use('/api', apiRouter);
app.use('/', indexRouter);

module.exports = app;
