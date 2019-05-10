const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const Media = require('../models/media');
const cassandra = require('../cassandra');
const filter = require('../filter');
const search = require('../binary-search');
const router = express.Router();

let compare = function (a, b) {
	return a.localeCompare(b)
};

router.get('/:id', function (req, res) {
	Question.findOne({id: req.params.id})
		.populate({path: 'user', select: 'username reputation -_id'})
		.exec(function (err, quest) {
			if (err || !quest)
				return res.status(404).json({status: "error", error: err ? err.toString() : "Question not found"});

			let history = quest.history;
			let result, arr, insert;

			if (!req.session.userId) {
				let ip = req.connection.remoteAddress;
				result = search(history.ips, compare, ip);
				if (!result.found) {
					quest.view_count++;
					arr = history.ips;
					insert = ip;
				}
			} else if (!(result = search(history.users, compare, req.session.userId)).found) {
				quest.view_count++;
				arr = history.users;
				insert = req.session.userId;
			}

			let filtered = filter(quest._doc, [], ['answers', '_id', 'votes', 'history', '__v']);
			res.json({status: "OK", question: filtered});

			if (!result.found)
				arr.splice(result.c === -1 ? result.index : result.index + 1, 0, insert);

			quest.save();
		});
});

//create new question
router.post('/add', function (req, res) {
	if (!req.session.userId)
		return res.status(404).json({status: "error", error: "User not logged in."});
	let question = new Question({
		title: req.body.title,
		body: req.body.body,
		tags: req.body.tags,
		media: req.body.media
	});
	question.user = req.session.userId;

	Media.find({
		_id: {$in: question.media},
		used: {$eq: false},
		user: {$eq: req.session.userId}
	}, function (err, media) {
		if (err) {
			console.error(err.toString());
			return res.status(404).json({status: "error", error: err.toString()});
		}
		if (media.length !== question.media.length) {
			console.error("Invalid media:", question.media);
			return res.status(404).json({status: "error", error: "Media already in use"});
		}
		res.json({status: "OK", id: question.id});
		question.save(function (err, question) {
			if (err) {
				console.error(err.toString());
				return res.status(404).json({status: "error", error: err.toString()});
			}
			Media.updateMany({_id: {$in: question.media}}, {used: true}, function (err, result) {
			});
		});
	});
});

//create new answer
router.post('/:id/answers/add', function (req, res) {
	if (!req.session.userId) {
		console.error("Add Answer Not logged in");
		return res.status(404).json({status: "error", error: "User not logged in."});
	}
	Question.findOne({id: req.params.id}, function (err, question) {
		if (err || !question) {
			console.error(err);
			return res.status(404).json({status: "error", error: err ? err.toString() : "Question not found"});
		}
		let answer = new Answer({body: req.body.body, media: req.body.media});
		answer.question_id = question.id;
		answer.user = req.session.username;
		Media.find({
			_id: {$in: answer.media},
			used: {$eq: false},
			user: {$eq: req.session.userId}
		}, function (err, media) {
			if (err) {
				console.error(err.toString());
				return res.status(404).json({status: "error", error: err.toString()});
			}
			if (media.length !== answer.media.length) {
				console.error("Invalid media:", answer.media);
				return res.status(404).json({status: "error", error: "Media already in use"});
			}
			answer.save(function (err, answer) {
				if (err) {
					console.error(err.toString());
					return res.status(404).json({status: "error", error: err.toString()});
				}
				question.answer_count++;
				question.answers.push(answer);
				question.save();
				res.json({status: "OK", id: answer.id, user: answer.user});
				Media.updateMany({_id: {$in: answer.media}}, {used: true}, function (err, result) {
				})
			});
		});
	});
});

router.get('/:id/answers', function (req, res) {
	Question.findOne({id: req.params.id}).populate({
		path: 'answers',
		select: '-_id -is_accepted'
	}).select('answers').exec((err, question) => {
		if (err) {
			res.status(404).json({status: "error", error: err.toString()});
			return console.error(err.toString());
		}
		// console.log("Populated answers + answers);
		res.json({status: 'OK', answers: question.answers});
	});
});

//
router.delete('/:id', function (req, res) {
	//check if the user is asker.
	if (!req.session.userId) {
		res.status(404).json({status: "error 404", error: "User not logged in. "});
		return console.error("User not logged in when deleting question. ");
	}
	Question.findOne({id: req.params.id}, function (err, question) {
		if (err) {
			res.status(400).json({status: "error 400", error: err.toString()});
			return console.error(err.toString());
		}
		if (question.user.toString() !== req.session.userId) {
			res.status(401).json({status: "error 401", error: "You are not authorized to perform this operation."});
			return console.error("You are not authorized to perform this operation.");
		} else {
			Question.findOneAndRemove({id: req.params.id}, function (err, question) {
				if (err) {
					res.status(404).json({status: "error 404", error: err.toString()});
					return console.error(err.toString());
				}
				//remove the answers associated with it
				Answer.find({question_id: question.id}, function (err, answers) {
					if (err) {
						res.status(404).json({status: "error 404", error: err.toString()});
						return console.error(err.toString());
					}
					let media_files = [];
					console.error(question.media);
					answers.forEach(function (answer) {
						media_files = media_files.concat(answer.media);
						console.error(answer.media);
					});
					media_files = media_files.concat(question.media);

					Answer.deleteMany({question_id: question.id}, function (err) {
						if (err) {
							res.status(404).json({status: "error 404", error: err.toString()});
							return console.error(err.toString());
						}
						res.status(200).json({status: "OK"});
					});
					console.error(media_files);
					cassandra.execute(create_batch("DELETE", media_files), function (err) {
						if (err) console.error(err.toString());
					});
					Media.deleteMany({_id: {$in: media_files}}, function (err) {
						if (err) console.error(err.toString());
					});
				});
			});
		}
	});
});

router.post('/:id/upvote', function (req, res) {
	if (!req.session.userId) {
		console.error("Upvote not logged in");
		return res.status(404).json({status: "error"});
	}
	let upvote = req.body.upvote === undefined ? true : req.body.upvote;
	upvote = upvote ? 1 : -1;

	Question.findOne({id: req.params.id})
		.populate('user')
		.exec(function (err, question) {
			if (err || !question)
				return res.status(404).json({status: "error"});
			console.log(upvote, question.score, req.session.username, question.user.reputation, question.user.real_reputation);
			let index = question.votes.findIndex(function (element) {
				return element.id === req.session.userId;
			});

			let waived = false;
			let u_vote;
			// Add my vote to list of votes
			if (index === -1) {
				question.votes.push({id: req.session.userId, vote: upvote});
				u_vote = question.votes[question.votes.length - 1];
			} else {
				u_vote = question.votes[index];
				// If I already voted then undo that vote
				if (u_vote.vote !== 0) {
					if (u_vote.vote === upvote) {
						upvote = (-1) * u_vote.vote;
						u_vote.vote = 0;
					} else if (u_vote.vote === -2) {
						// vote was waived so do not affect reputation
						// just revert score
						if (upvote === -1) {
							upvote = 1;
							waived = true;
							u_vote.vote = 0;
						} else {
							question.user.reputation -= 1;
							upvote = 2;
							u_vote.vote = 1;
						}
					} else {
						upvote *= 2;
						u_vote.vote *= -1;
					}
				} else // Set my vote to the new vote
					u_vote.vote = upvote;
			}

			question.score += upvote;
			let user = question.user;
			if (user.reputation + upvote < 1) {
				u_vote.vote = -2;
				user.reputation = 1;
			} else if (!waived)
				user.reputation += upvote;
			user.real_reputation += upvote;
			user.save(() => question.save(() => res.json({status: "OK"})));
		})
});

let create_batch = function (statement, ids) {
	let start = "BEGIN BATCH\n";
	let statements = "";

	ids.forEach(function (id) {
		statements += statement + " FROM media WHERE id='" + id + "';\n";
	});

	let end = "APPLY BATCH;";
	return start + statements + end;
};

module.exports = router;
