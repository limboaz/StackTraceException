var express = require('express');
var path = require('path');
var logger = require('morgan');
var hbs = require('express-handlebars');
var session = require('express-session');
var uuid = require('uuid/v4');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

var indexRouter = require('./routes/index');
var tttRouter = require('./routes/ttt');

var app = express();

app.engine('hbs', hbs({extname: 'hbs', layoutsDir: 'public'}));
app.set('views', 'public');
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


//passport
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
    genid: (req) => {
        console.log('Inside session middleware');
        console.log(req.sessionID);
        return uuid();
    },
    secret: 'keyboard cat', //meow meow
    resave: false,
    saveUninitialized: true,
    cookie:{ secure: false }
}));

/*
//validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));
*/
app.use('/', indexRouter);
app.use('/ttt', tttRouter);

module.exports = app;
