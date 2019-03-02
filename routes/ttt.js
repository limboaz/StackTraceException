const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const app = express.Router();
const __dir = 'public';

mongoose.connect('mongodb://localhost:27017/ttt');
const db = mongoose.connection;
let UserModel;

db.on('error', console.error.bind(console, 'error connecting to database'));
db.once('open', function () {
    const userSchema = new Schema({
        username: {type: String, index: true},
        password: String,
        email: {type: String, index: true},
        enabled: {type: String, default: "False"}
    });
    UserModel = mongoose.model('User', userSchema);
});

/* GET home page. */
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dir});
});

//when user makes a move
app.post('/play', function (req, res) {
    var data = req.body;   //array
    var changed = false;

    if (data.winner === 'O') {
        res.json(data);
        return;
    }
    //check if there's a space to put a new checker
    for (var i = 0; i < data.grid.length; i++) {
        if (data.grid[i] === " ") {
            changed = true; //at least should have one free space
        }
    }
    if (changed === false) { //no place found
        data.winner = " ";
        res.json(data);
        return;
    }

    changed = false;    //reset changed back to false
    while (changed !== true) {
        var ranIndex = Math.floor(Math.random() * Math.floor(9));
        if (data.grid[ranIndex] === " ") {
            data.grid[ranIndex] = "X";
            changed = true;
        }
    }
    res.json(data);
});

app.post('/', function (req, res) {
    var user_name = req.body.name;
    var date = new Date();
    var currentDate = date.getDate();
    var currentMonth = date.getMonth();
    var currentYear = date.getFullYear();
    var dateStr = ((currentMonth + 1) + "/" + currentDate + "/" + currentYear);
    var ret = "Hello " + user_name + ", " + dateStr;
    res.render('play', {message: ret});
});

app.get(/(javascripts)|(stylesheets)/, function (req, res, next) {
    res.sendFile(req.path, {root: __dir});
});

// TODO Warm Up Project 2
app.post('/adduser', function (req, res) {
    let user_req = req.body; // username, password, email
    let user = new UserModel(user_req);

    user.save(function (err, user) {
        if (err) return console.error(err);
        console.log("success created user " + user.username);
    });

    let transporter = nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        service: 'yahoo',
        secure: false,
        auth: {
            user: 'tictactoeppg@yahoo.com',
            pass: 'helloppg2019'
        }
    });
    let mailOptions = {
        from: 'tictactoeppg@yahoo.com',
        to: user.email,
        subject: 'Verifying your Tic Tac Toe account',
        text: 'Click on this link to verify your account http://localhost:3000/ttt/verify?email=' + user.email + "&key=abracadabra"
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.json({status: 'OK'});
    });
});

app.post('/verify', function (req, res) {
    let email = req.body.email;
    let key = req.body.key;
    if (verify_user(email, key))
        res.json({status:"OK"});
    else
        res.json({status:"ERROR"});
});

app.get('/verify', function (req, res) {
    let email = req.query.email;
    let key = req.query.key;
    if (verify_user(email, key))
        res.json({status:"OK"});
    else
        res.json({status:"ERROR"});
});


app.post('/login', function (req, res) {
    let user = req.body; //username, password
});

app.post('/logout', function (req, res) {

});

app.post('/listgames', function (req, res) {

});

app.post('/getgame', function (req, res) {
    let id = req.body.id;
});

app.post('/getscore', function (req, res) {

});

function verify_user(em, key) {
    UserModel.find({email: em}, function (err, users) {
        if (err) return console.error(err);
        for (let i = 0; i < users.length; i++) {
            if (key === 'abracadabra') {
                users[i].enabled = "True";
                users[i].save(function (err, user) {
                    if (err) return console.log(err);
                    console.log("success validated " + user.username)
                });
                return true;
            }
            if (users[i].enabled === key) {
                users[i].enabled = "True";
                users[i].save(function (err, user) {
                    if (err) return console.log(err);
                    console.log("success validated " + user.username)
                });
                return true;
            }
        }
        console.log("could not verify user");
        return false;
    });
}

module.exports = app;
