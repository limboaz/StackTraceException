var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var __dir = '../public';
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended: false});

/* GET home page. */
app.get('/', function(req, res, next) {
    res.sendFile('public/index.html', {root : __dirname + "/../"});

});

app.post('/', urlencodedParser, function(req, res) {
    var user_name = req.body.name;
    var date = new Date();
    var currentDate = date.getDate();
    var currentMonth = date.getMonth();
    var currentYear = date.getFullYear();
    var dateStr = ((currentMonth + 1) + "/" + currentDate + "/" + currentYear);
    res.send("Hello " + user_name + ", " + dateStr);
});

app.get('/play', /(javascripts)|(stylesheets)/, function(req, res, next) {
    res.sendFile(req.path, { root:  __dir});
});

module.exports = app;
