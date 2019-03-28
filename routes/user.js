const express = require('express');
const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const router = express.Router();
const __dir = 'public';

router.get('/:username/questions', function(req, res){
	User.findOne({username: req.params.username}, function(err, user){
		if (err || !user)
			return res.json({status: "error", error: err ? err.toString() : "User not found"});

		Question.find({user: user._id}, function(err, questions){
			if (err)
				return res.json({status : "error", error : err.toString()});

			let ids = [];
			questions.forEach((q) => ids.push(q.id));
			res.json({status: "OK", questions: ids});
		});
	});
});

router.get('/:username/answers', function(req, res){
	User.findOne({username: req.params.username}, function(err, user){
		if (err || !user)
			return res.json({status: "error", error: err ? err.toString() : "User not found"});

		Answer.find({user: req.params.username}, function(err, answers){
			if (err)
				return res.json({status : "error", error : err.toString()});

			let ids = [];
			answers.forEach((a) => ids.push(a.id));
			res.json({status: "OK", answers: ids});
		});
	});
});

module.exports = router;