const express = require('express');
const request = require('request');
const Question = require('../models/question');
const handlebars = require('handlebars');
const router = express.Router();
const __dir = 'public';
const prefix = 'http://localhost:3000/';

router.get('/quest/:id', function (req, res) {
	let quest = 'questions/' + req.params.id;
	request.get(prefix + quest, function (err, resp, body) {
		let b = JSON.parse(body);
		if (err || b.status !== 'OK') {
			return res.render('error');
		}
		let question = b.question;
		request.get(prefix + quest + '/answers', function (err, resp, body) {
			b = JSON.parse(body);
			if (err || b.status !== 'OK') {
				return res.render('error');
			}
			let answers = b.answers;
			res.render('question', {question: question, answers: answers, logged_in: req.session.userId !== undefined})
		});
	});
});

router.get('/', function (req, res) {
	res.render('index', {logged_in: req.session.userId !== undefined});
});
router.get('/add', function (req, res) {
	res.render('add_question', {user_name: req.session.username, logged_in: req.session.userId !== undefined})
});
//create new question
router.post('/add', function (req, res) {
	if (!req.session.userId)
		return res.json({status: "error", error: "User not logged in."});
	req.body.media = null;

	req.body.tags = req.body.tags.split(',');
	console.log(req.body.tags);

	let question = new Question(req.body);

	question.user = req.session.userId;
	question.save(function (err, question) {
		if (err) return res.json({status: "error", error: err.toString()});
		console.log("successfully created questions " + question.title);
		res.json({status: "OK", id: question.id});
	});
});
router.get(/(javascript)|(stylesheets)/, function (req, res) {
	let i = req.path.search(/(javascript)|(stylesheets)/);
	res.sendFile(req.path.substr(i), {root: __dir});
});

handlebars.registerHelper('user_url', function(user){
	return "/u/" + user;
});

module.exports = router;