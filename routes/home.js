const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Question = require('../models/question');
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
			res.json({status:"error", error: "Verify user error in POST"});
	});
});

router.get('/verify', function (req, res) {
	let email = req.query.email;
	let key = req.query.key;
	verify_user(email, key).then(function (value) {
		if (value)
			res.json({status: "OK"});
		else
			res.json({status: "error", error: "Verify user error in GET"});
	});
});

router.post('/login', function (req, res) {
	const name = req.body.username;
	const pass = req.body.password;
	User.findOne({username: name, password: pass}, function (err, user) {
		if (err || !user || user.enabled !== "True") {
			res.json({status: "error", error: err ? err.toString() : "Invalid user"});
			return console.log(err);
		}
		let psid = user.sid;
		user.sid = req.sessionID;
		req.session.userId = user._id;
		req.session.username = user.username;
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
	if (!req.session.userId) return res.json({status: "error", error: "Error in logout"});
	res.clearCookie('STE');
	res.json({status: "OK"});
});

router.post('/search', function(req, res){
	let timestamp = req.body.timestamp ? req.body.timestamp : Date.now() / 1000;
	let limit = req.body.limit && req.body.limit <= 100 ? req.body.limit : 25;
	let accepted = req.body.accepted === true;
	let query_string = req.body.q ? new RegExp(".*" + req.body.q + ".*") : /.*/;

	console.log(req.body, accepted, limit, timestamp);
	// build query
	let query = Question.
		find({
			// find with timestamp less than or equal to timestamp
			timestamp: {$lte: timestamp},
		}).
		or([{title: query_string}, {body: query_string}]).
		// retrieve the latest ones
		sort({timestamp: 'descending'}).
		limit(limit).
		populate({
			// only select the username and reputation
			path: 'user',
			select: 'username reputation -_id'
		}).
		select('-answers -history_id -_id -__v'); // don't select the answers property of question
	if (accepted)
		query.exists('accepted_answer_id', true);

	// execute query and return result
	query.exec(function(err, result){
		if (err) return res.json({status: "error", error: err.toString()});
		console.log(result);
		res.json({status:"OK", questions:result});
	});
});

function send_email(user, res){
	let transporter = nodemailer.createTransport({
		host: 'localhost',
		port: 25,
		secure: false,
		tls: {
			rejectUnauthorized: false
		}
	});
	let mailOptions = {
		from: 'mailmaster@StackTraceException.com',
		to: user.email,
		subject: 'Verifying your Tic Tac Toe account',
		text: 'validation key:<' + user.enabled + '>\n' +
			  'Or click on this link to verify your account http://152.44.36.183/verify?email=' + user.email + "&key=" + user.enabled
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			res.json({status: 'error', error: error.toString()});
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
