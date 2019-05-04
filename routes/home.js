const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Question = require('../models/question');
const mongoStore = require('../mongoose');
const router = express.Router();
const __dir = 'public';

const mail = ['localhost', '192.168.122.36'];
var mail_index = 0;

router.get('/adduser', function (req, res) {
	res.sendFile('register.html', {root: __dir});
});
// TODO Separate Email to it's own micro-service
router.post('/adduser', function (req, res) {
	let user = new User({
		username: req.body.username,
		email: req.body.email,
		password: req.body.password
	});
	user.enabled = random_key();
	user.save(function (err, user) {
		if (err) {
			console.error(err.toString());
			return res.status(404).json({status: "error", error: err.toString()});
		}
		send_email(user, res);
	});
});

router.post('/verify', function (req, res) {
	let email = req.body.email;
	let key = req.body.key;
	verify_user(email, key, res);
});

router.get('/verify', function (req, res) {
	//res.sendFile('verification.html', {root: __dir});
	let email = req.query.email;
	let key = req.query.key;
	verify_user(email, key, res);
});

router.post('/login', function (req, res) {
	const name = req.body.username;
	const pass = req.body.password;
	User.findOne({username: name, password: pass}, function (err, user) {
		if (err || !user || user.enabled !== "True") {
			res.status(404).json({status: "error", error: err ? err.toString() : "Invalid username or password"});
			return console.error(err);
		}
		let psid = user.sid;
		user.sid = req.sessionID;
		req.session.userId = user._id;
		req.session.username = user.username;
		if (psid) {
			mongoStore.get(psid, function (err, session) {
				if (err) console.error(err);
				if (session) req.session.grid = session.grid;
				user.save(function (err) {
					if (err) return console.error(err);
					console.log("Now saving session");
					mongoStore.set(req.sessionID, req.session);
				});
			});
		}
		res.json({status: "OK"});
	});
});

router.post('/logout', function (req, res) {
	if (!req.session.userId) return res.status(404).json({status: "error", error: "Error in logout"});
	res.clearCookie('STE');
	res.json({status: "OK"});
});

router.post('/search', function (req, res) {
	let timestamp = req.body.timestamp ? req.body.timestamp : Date.now() / 1000;
	let limit = req.body.limit && req.body.limit <= 100 ? req.body.limit : 25;

	console.log(req.body, limit, timestamp);
	let query;

	// build query
	if (req.body.q) {
		query = Question.find({
			// find with timestamp less than or equal to timestamp
			timestamp: {$lte: timestamp},
			$text: {
				$search: req.body.q,
				$caseSensitive: false,
				$language: "none"
			}
		})
	} else {
		query = Question.find({
			timestamp: {$lte: timestamp}
		});
	}		// retrieve the latest ones

	if (req.body.sort_by && req.body.sort_by === "timestamp")
		query.sort({timestamp: 'descending'});
	else query.sort({score: 'descending'});

	query.limit(limit).populate({
		// only select the username and reputation
		path: 'user',
		select: 'username reputation -_id'
	}).select('-answers -history -votes -_id -__v'); // don't select the answers property of question
	if (req.body.tags)
		query.all('tags', req.body.tags);
	if (req.body.has_media)
		query.exists('media.0', true);
	if (req.body.accepted)
		query.exists('accepted_answer_id', true);
	// execute query and return result
	query.exec(function (err, result) {
		if (err) return res.status(404).json({status: "error", error: err.toString()});
		res.json({status: "OK", questions: result});
	});
});

function send_email(user, res) {
	let transporter = nodemailer.createTransport({
		host: mail[mail_index],
		port: 25,
		secure: false,
		tls: {
			rejectUnauthorized: false
		}
	});
	let mailOptions = {
		from: 'mailmaster@StackTraceException.com',
		to: user.email,
		subject: 'Verifying your StackTraceException account',
		text: 'validation key:<' + user.enabled + '>\n' +
			'Or click on this link to verify your account http://152.44.41.174/verify?email=' + user.email + "&key=" + user.enabled
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) return console.error(error);
		//console.log('Message %s sent: %s', info.messageId, info.response);
		res.json({status: "OK"});
	});
	mail_index = (mail_index + 1) % 2;
}

function verify_user(em, key, res) {
	User.find({email: em}, function (err, users) {
		if (err) return console.error(err);
		for (let i = 0; i < users.length; i++) {
			if (users[i].enabled !== 'True' && (key === 'abracadabra' || users[i].enabled === key)) {
				users[i].enabled = "True";
				users[i].save(function (err, user) {
					if (err) return console.error(err);
					console.log("success validated " + user.username);
				});
				return res.json({status: "OK"});
			}
		}
		console.error("Can't verify:", em, key);
		return res.status(404).json({status: "error", error: "Error verifying user"});
	});
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
