var express = require('express');
var path = require('path');
var logger = require('morgan');
var hbs = require('express-handlebars');


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
