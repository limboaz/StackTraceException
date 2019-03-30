const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Question = require('../models/question');
const mongoStore = require('../mongoose');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function(req, res){
	Question.findOne({id: req.params.id}).
		populate({path: 'user', select: 'username'}).
		exec(function(err, question){
			if (err || !question){
				return res.render('error');
			}
			res.render('question', {question: question, user_link: '/user/' + question.user.username + '/questions'})
		});
});

router.get(/.*\..*/, function(req, res){
	console.log(req.path);
	res.status(404);
	res.send('Not found');
});

module.exports = router;