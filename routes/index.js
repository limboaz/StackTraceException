const express = require('express');
const request = require('request');
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
			res.render('question', {question: question, answers: answers})
		});
	});
});

router.get('/', function (req, res) {
	res.render('index');
});

router.get(/(javascript)|(stylesheets)/, function (req, res) {
	let i = req.path.search(/(javascript)|(stylesheets)/);
	res.sendFile(req.path.substr(i), {root: __dir});
});

handlebars.registerHelper('user_url', function(user, path){
	return "/user/" + user + path;
});

module.exports = router;