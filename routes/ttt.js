var express = require('express');

var bodyParser = require('body-parser');
var app = express.Router();

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var __dir = 'public';

/* GET home page. */
app.get('/', function(req, res, next) {
    res.sendFile('index.html', {root: __dir});
});

app.get('/play', function(req, res, next) {
	res.sendFile('play.html', {root : __dir});
});

//when user makes a move
app.post('/move', function (req, res) {
    var data = req.body;   //array
    var changed = false;
    //check if there's a space to put a new checker
    for(var i = 0; i < data.grid.length; i++){
        if (data.grid[i] === " "){
            changed = true; //at least should have one free space
        }
    }
    if (changed === false){ //no place found
        data.winner = " ";
        res.json(data);
    }
    changed = false;    //reset changed back to false
    while (changed !== true){
        var ranIndex = Math.floor(Math.random() * Math.floor(9));
        if (data.grid[ranIndex] === " " ){
            data.grid[ranIndex] = "X";
            changed = true;
        }
    }
    res.json(data);
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
