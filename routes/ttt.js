var express = require('express');
var app = express.Router();
var __dir = 'public';
var nodemailer = require("nodemailer");

/* GET home page. */
app.get('/', function(req, res, next) {
    res.sendFile('index.html', {root: __dir});
});

//when user makes a move
app.post('/play', function (req, res) {
    var data = req.body;   //array
    var changed = false;

    if (data.winner === 'O') {
        res.json(data);return;
    }
    //check if there's a space to put a new checker
    for(var i = 0; i < data.grid.length; i++){
        if (data.grid[i] === " "){
            changed = true; //at least should have one free space
        }
    }
    if (changed === false){ //no place found
        data.winner = " ";
        res.json(data);
        return;
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
    var ret = "Hello " + user_name + ", " + dateStr;
	res.render('play', {message: ret});
});

app.get(/(javascripts)|(stylesheets)/, function(req, res, next) {
    res.sendFile(req.path, { root:  __dir});
});

// TODO Warm Up Project 2
app.post('/adduser', function(req, res){
    let user = req.body; // username, password, email
    console.log(user);
    send_verify_mail(user.username, user.email).then(function(){
        console.log("Yay");
    });
});

app.post('/verify', function(req, res){
    let email = req.body.email;
    let key = req.body.key;
});

app.get('/verify', function(req, res){
    let email = req.query.email;
    let key = req.query.key;
});

app.post('/login', function(req, res){
    let user = req.body; //username, password
});

app.post('/logout', function(req, res){

});

app.post('/listgames', function(req, res){

});

app.post('/getgame', function(req, res){
    let id = req.body.id;
});

app.post('/getscore', function(req, res){

});

// TODO Send Email {Currently getting "Error: connect ECONNREFUSED 127.0.0.1:3001"}
// TODO Send Email {Currently getting "}
async function send_verify_mail(username, email){
    let account = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "localhost",//"152.44.36.183",
        port: 3000,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    let mailOptions = {
        from: '"Tic Tac Toe Server" <auth@localhost>',
        to: email,
        subject: "Verify your Tic Tac Toe account",
        text: "Click on this link to verify your account https://152.44.36.183/ttt/verify?email=" + email + "&key=abracadabra"
    };

    let info = await transporter.sendMail(mailOptions);
}

module.exports = app;
