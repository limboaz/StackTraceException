var express = require('express');
var app = express.Router();
var __dir = 'public';

/* GET home page. */
app.get('/', function(req, res, next) {
    res.sendFile('index.html', {root: __dir});
});

app.get('/play', function(req, res, next) {
	res.sendFile('play.html', {root : __dir});
});

app.post('/', function(req, res) {
    var user_name = req.body.name;
    var date = new Date();
    var currentDate = date.getDate();
    var currentMonth = date.getMonth();
    var currentYear = date.getFullYear();
    var dateStr = ((currentMonth + 1) + "/" + currentDate + "/" + currentYear);
    res.send("Hello " + user_name + ", " + dateStr);
});

app.get(/(javascripts)|(stylesheets)/, function(req, res, next) {
	res.sendFile(req.path, { root:  __dir});
});

module.exports = app;
