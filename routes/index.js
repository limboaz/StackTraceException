const express = require('express');
const request = require('request');
const router = express.Router();
const __dir = 'public';

router.get('/quest/:id', function (req, res) {
	request.get('http://localhost:3000/questions/' + req.params.id, function (err, resp, body) {
		let b = JSON.parse(body);
		if (err || b.status !== 'OK') {
			return res.render('error');
		}
		let question = b.question;
		res.render('question', {question: question, user_link: '/user/' + question.user.username + '/questions'})
	});
});

router.get('/', function(req, res){
	res.render('index');
});


router.get(/.*\..*/, function (req, res) {
	res.status(404);
	res.send('Not found');
});

module.exports = router;