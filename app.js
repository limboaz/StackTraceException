const express = require('express');
const path = require('path');
const logger = require('morgan');
const hbs = require('express-handlebars');
const session = require('express-session');

const mongoStore = require('./mongoose');
const userRouter = require('./routes/user');
const app = express();

app.engine('hbs', hbs({extname: 'hbs', layoutsDir: 'public'}));
app.set('views', 'public');
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	name: 'STE',
	secret: 'keyboard cat', //meow meow
	resave: false,
	saveUninitialized: false,
	store: mongoStore,
	cookie: {secure: false}
}));

app.use('/', userRouter);

module.exports = app;
