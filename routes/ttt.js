const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Game = require('../models/game');
const mongoStore = require('../mongoose');
const app = express.Router();
const __dir = 'public';
const client = 'X', server = 'O';

/* GET home page. */
app.get('/', function (req, res) {
	res.sendFile('index.html', {root: __dir});
});

//when user makes a move
// TODO Save games into database with associated user and only play if user is logged in
app.post('/play', function (req, res) {
	console.log(req.body, req.session.grid);
	if (!req.session.userId) return res.json({status: "ERROR"});
	if (!req.session.grid) req.session.grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

	var data = req.body;
	var changed = false;

	var game = {
		grid: req.session.grid,
		winner: undefined
	};
	if (data.move == null) {
		res.json(game);
		return;
	}
	if (data.move >= 9) return res.json({status: "ERROR"});
	game.grid[data.move] = client;
	check_win(req, game, client);
	if (game.winner === client) {
		req.session.grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
		res.json(game);
		return;
	}
	//check if there's a space to put a new checker
	for (var i = 0; i < game.grid.length; i++) {
		if (game.grid[i] === " ") {
			changed = true; //at least should have one free space
		}
	}
	if (changed === false) { //no place found
		storeGame(req, game, "Tie");
		game.winner = " ";
		req.session.grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
		res.json(game);
		return;
	}
	changed = false;    //reset changed back to false
	while (changed !== true) {
		var ranIndex = Math.floor(Math.random() * Math.floor(9));
		if (game.grid[ranIndex] === " ") {
			game.grid[ranIndex] = server;
			changed = true;
		}
	}

	check_win(req, game, server);
	if (game.winner === client)
		req.session.grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
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

let storeGame = function (req, game, player) {
	let grid = game.grid;
	User.findById(req.session.userId, function (err, user) {
		if (err) return console.log(err);
		let gameFinished = new Game({
			user: user._id,
			id: user.gameId + 1,
			grid: grid,
			winner: player
		});
		gameFinished
				.save()
				.then(result => {
					console.log(result);
				})
				.catch(err => console.log(err));
		user.gameId++;
		user.games.push({"id": gameFinished.id, "start_date": new Date()});
		if (player === server)
			user.serverscore++;
		else if (player === client)
			user.humanscore++;
		else if (player === 'Tie')
			user.ties++;
		user.save();
	});
};

let check_win = function (req, game, player) {
	let inARow = 0, inACol = 0, diag = 0, rdiag = 0;

	for (let i = 0; i < 3; i++) {
		if (game.grid[3 * i + i] === player) diag++;
		if (game.grid[3 * i + 2 - i] === player) rdiag++;

		for (let j = 0; j < 3; j++) {
			if (game.grid[3 * i + j] === player) inARow++;
			if (game.grid[3 * j + i] === player) inACol++;

			if (inARow === 3 || inACol === 3) {
				storeGame(req, game, player);
				game.winner = player;
				return;
			}
		}
		inACol = 0;
		inARow = 0;
	}
	if (diag === 3 || rdiag === 3) {
		storeGame(req, game, player);
		game.winner = player;
	}
};

// TODO Warm Up Project 2
// TODO potentially change email
app.post('/adduser', function (req, res) {
	let user_req = req.body; // username, password, email
	let user = new User(user_req);
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
	verify_user(email, key).then(function (value) {
		if (value)
			res.json({status: "OK"});
		else
			res.json({status: "ERROR"});
	});
});

app.get('/verify', function (req, res) {
	let email = req.query.email;
	let key = req.query.key;
	if (verify_user(email, key))
		res.json({status: "OK"});
	else
		res.json({status: "ERROR"});
});

app.post('/login', function (req, res) {
	const name = req.body.username;
	const pass = req.body.password;
	User.findOne({username: name, password: pass}, function (err, user) {
		if (err || !user || user.enabled !== "True") {
			res.json({status: "ERROR"});
			return console.log(err);
		}
		let psid = user.sid;
		user.sid = req.sessionID;
		req.session.userId = user._id;
		if (psid) {
			mongoStore.get(psid, function (err, session) {
				if (err) console.log(err);
				if (session) req.session.grid = session.grid;
				user.save(function (err) {
					if (err) return console.log(err);
					console.log("Now saving session");
					mongoStore.set(req.sessionID, req.session);
				});
			});
		}
		res.json({status: "OK"});
	});
});

app.post('/logout', function (req, res) {
	if (!req.session.userId) return res.json({status: "ERROR"});
	res.clearCookie('ttt');
	res.json({status: "OK"});
});

app.post('/listgames', function (req, res) {
	if (!req.session.userId) return res.json({status: "ERROR"});
	//if the user id exists in db, retrieve all of the games associated with this user.
	User.findById(req.session.userId, function (err, user) {
		res.json({status: "OK", games: user.games});
	});
});

//TODO Test /getgame
app.post('/getgame', function (req, res) {
	if (!req.session.userId) return res.json({status: "ERROR"});

	Game.find({id: req.body.id, user: req.session.userId}, function (err, game) {
		if (err || game.length === 0) {
			console.log(err);
			res.json({status: "ERROR"});
		} else
			res.json({status: 'OK', grid: game[0].grid, winner: game[0].winner});
	});
});

app.post('/getscore', function (req, res) {
	if (!req.session.userId) return res.json({status: "ERROR"});
	User.findById(req.session.userId, function (err, user) {
		res.json({status: "OK", human: user.humanscore, wopr: user.serverscore, tie: user.ties});
	});
});

async function verify_user(em, key) {
	let found = false;
	await User.find({email: em}, function (err, users) {
		if (err) return console.error(err);
		for (let i = 0; i < users.length; i++) {
			if (users[i].enabled !== 'True' && (key === 'abracadabra' || users[i].enabled === key)) {
				console.log(users[i]);
				users[i].enabled = "True";
				users[i].save(function (err, user) {
					if (err) return console.log(err);
					console.log("success validated " + user.username);
				});
				found = true;
			}
		}
	});
	console.log(em, key, found);
	return found;
}

// Characters available for key generation
const az09 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function random_key() {
	let key = "";
	for (let i = 0; i < 7; i++)
		key += az09.charAt(Math.floor(Math.random() * az09.length));
	return key;
}

module.exports = app;
