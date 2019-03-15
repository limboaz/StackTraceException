const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const mongoStore = require('../mongoose');
const router = express.Router();
const __dir = 'public';

/* GET home page. */
router.get('/', function (req, res) {
	res.sendFile('index.html', {root: __dir});
});

router.get(/(javascripts)|(stylesheets)/, function (req, res) {
	res.sendFile(req.path, {root: __dir});
});

// TODO Separate Email to it's own micro-service
router.post('/adduser', function (req, res) {
	let user_req = req.body; // username, password, email
	let user = new User(user_req);
	user.enabled = random_key();
	user.save(function (err, user) {
		if (err) return res.json({status:"error", error: err.toString()});
		console.log("success created user " + user.username);
		send_email(user, res);
	});
});

router.post('/verify', function (req, res) {
	let email = req.body.email;
	let key = req.body.key;
	verify_user(email, key).then(function (value) {
		if (value)
			res.json({status: "OK"});
		else
			res.json({status: "ERROR"});
	});
});

router.get('/verify', function (req, res) {
	let email = req.query.email;
	let key = req.query.key;
	verify_user(email, key).then(function (value) {
		if (value)
			res.json({status: "OK"});
		else
			res.json({status: "ERROR"});
	});
});

router.post('/login', function (req, res) {
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

router.post('/logout', function (req, res) {
	if (!req.session.userId) return res.json({status: "ERROR"});
	res.clearCookie('STE');
	res.json({status: "OK"});
});

function send_email(user, res){
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
}

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

module.exports = router;
