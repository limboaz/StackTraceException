const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const app = express.Router();
const __dir = 'public';

const db = mongoose.connect('mongodb://localhost:27017/ttt');
let UserModel;

db.on('open', function(){
    const userSchema = new Schema({
        username: {type: String, index: true},
        password: String,
        email: {type: String, index: true},
        enabled: {type: String, default: "False"}
    });
    UserModel = mongoose.model('User', userSchema);
});

/* GET home page. */
app.get('/', function(req, res) {
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
    let user_req = req.body; // username, password, email
    let user = new UserModel(user_req);

    user.save(function(err, user){
        if (err) return console.error(err);
        console.log("success created user " + user.username);
    });

    send_verify_mail(user.username, user.email).then(function(){
        console.log("Yay");
    });
});

app.post('/verify', function(req, res){
    let em = req.body.email;
    let key = req.body.key;

    UserModel.find({email: em}, function(err, users){
        if (err) return console.error(err);
        for (let i = 0; i < users.length; i++){
            if (key === 'abracadabra') {
                users[i].enabled = "True";
                return;
            }
            if (users[i].enabled === key) {
                users[i].enabled = "True";
                return;
            }
        }
        console.log("could not verify user");
    });
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
