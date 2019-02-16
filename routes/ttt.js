var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({extended: false});

/* GET home page. */
app.get('/', function(req, res, next) {
    res.send('at ttt now');
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


module.exports = app;
