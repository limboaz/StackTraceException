const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const app = express.Router();
const __dir = 'public';
// Characters avaiable for key generation
const az09 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Set up Database connection and Schemas
mongoose.connect('mongodb://localhost:27017/ttt');
const db = mongoose.connection;
let UserModel, GameModel;
db.on('error', console.error.bind(console, 'error connecting to database'));
db.once('open', function () {
    const userSchema = new Schema({
        username: {type: String, index: true},
        password: String,
        email: {type: String, index: true},
        enabled: {type: String, default: "False"},
        games: [{id:Number, start_date:String}]
    });

    const gameSchema = new Schema({
        user: {type: String, index: true},
        id: {type: Number, index: true},
        grid: [String],
        winner: String
    });
    UserModel = mongoose.model('User', userSchema);
    GameModel = mongoose.model('Game', gameSchema);
});

/* GET home page. */
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dir});
});

//when user makes a move
// TODO Save games into database with associated user and only play if user is logged in
app.post('/play', function (req, res) {
    var data = req.body;   //array
    var changed = false;
    var game = {
        grid: data.grid,
        winner: ''
    };
    if (data.move == null) {
        res.json(game);
        return;
    }

    check_win(game,'O');

    if (game.winner === 'O') {
        game.grid = [' ',' ',' ',' ',' ',' ',' ',' ',' '];
        res.json(game);
        return;
    }
    //check if there's a space to put a new checker
    for (var i = 0; i < data.grid.length; i++) {
        if (data.grid[i] === " ") {
            changed = true; //at least should have one free space
        }
    }
    if (changed === false) { //no place found
        game.winner = " ";
        game.grid = [' ',' ',' ',' ',' ',' ',' ',' ',' '];
        res.json(game);
        return;
    }
    changed = false;    //reset changed back to false
    while (changed !== true) {
        var ranIndex = Math.floor(Math.random() * Math.floor(9));
        if (data.grid[ranIndex] === " ") {
            game.grid[ranIndex] = "X";
            changed = true;
        }
    }

    check_win(game, 'X');
    if (game.winner !== '')
        game.grid = [' ',' ',' ',' ',' ',' ',' ',' ',' '];
    res.json(game);
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

app.get(/(javascripts)|(stylesheets)/, function (req, res) {
    res.sendFile(req.path, {root: __dir});
});

let check_win = function (game, player) {
    let inARow = 0, inACol = 0, diag = 0, rdiag = 0;

    for (let i = 0; i < 3; i++) {
        if (game.grid[3 * i + i] === player) diag++;
        if (game.grid[3 * i + 2 - i] === player) rdiag++;

        for (let j = 0; j < 3; j++) {
            if (game.grid[3 * i + j] === player) inARow++;
            if (game.grid[3 * j + i] === player) inACol++;

            if (inARow === 3 || inACol === 3) {
                game.winner = player;
                return;
            }
        }
        inACol = 0; inARow = 0;
    }
    if (diag === 3 || rdiag === 3)
        game.winner = player;
};

// TODO Warm Up Project 2
// TODO potentially change email
app.post('/adduser', function (req, res) {
    let user_req = req.body; // username, password, email
    let user = new UserModel(user_req);
    user.enabled = random_key();
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
        text: 'Click on this link to verify your account http://localhost:3000/ttt/verify?email=' + user.email + "&key=" + user.enabled
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json({status: 'ERROR'});
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

//TODO Test /getgame
app.post('/getgame', function (req, res) {
    GameModel.find({user:user, id: req.body.id}, function(err, game){
        if (err || game.length === 0) {
            console.log(err);
            res.json({status:"ERROR"});
        } else
            res.json({status:'OK', grid: game[0].grid, winner: game[0].winner});
    });
});

app.post('/getscore', function (req, res) {

});

async function verify_user(em, key) {
    let found = false;
    await UserModel.find({email: em}, function (err, users) {
        if (err) return console.error(err);
        for (let i = 0; i < users.length; i++) {
            if (users[i].enabled !== 'True' && (key === 'abracadabra' || users[i].enabled === key)) {
                users[i].enabled = "True";
                users[i].save(function (err, user) {
                    if (err) return console.log(err);
                    console.log("success validated " + user.username);
                });
                found = true;
            }
        }
    });
    return found;
}

function random_key(){
    let key = "";
    for (let i = 0; i < 7; i++)
        key += az09.charAt(Math.floor(Math.random() * az09.length));
    return key;
}

module.exports = app;
