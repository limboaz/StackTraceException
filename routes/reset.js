const express = require('express');
const router = express.Router();
const cassandra = require('../cassandra');
const Answer = require('../models/answer');
const Question = require('../models/question');
const User = require('../models/user');
const Media = require('../models/media');


router.get('/reset_null', function (req, res) {
	Answer.deleteMany({}, function (err, result) {
		if (err)
			return res.status(400).json({status: "error", error: "Error removing Mongo Collection: Answer"});
		Media.deleteMany({}, function (err, result) {
			if (err)
				return res.status(400).json({status: "error", error: "Error removing Mongo Collection: Media"});
			Question.deleteMany({}, function (err, result) {
				if (err)
					return res.status(400).json({status: "error", error: "Error removing Mongo Collection: Question"});
				User.deleteMany({}, function (err, result) {
					if (err)
						return res.status(400).json({status: "error", error: "Error removing Mongo Collection: User"});
					cassandra.execute("TRUNCATE media;", function (err, result) {
						if (err)
							return res.status(400).json({status: "error", error: "Error truncating cassandra " + err.toString()});
						res.json({status: "OK", message: "Successfully deleted everything from database."})
					});
				});
			});
		});
	});
});

module.exports = router;