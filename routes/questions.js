const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const History = require('../models/history');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function (req, res) {
    Question.findOne({id: req.params.id}, function (err, quest) {
        if (err || !quest)
            return res.json({status: "error", error: err ? err.toString() : "Question not found"});
        History.findById(quest.history_id, function (err, history) {
            if (!req.session.userId) {
                let ip = req.connection.remoteAddress;
                if (!history.ips.includes(ip)) {
                    quest.view_count++;
                    history.ips.push(ip);
                }
            } else if (!history.users.includes(req.session.userId)) {
                quest.view_count++;
                history.users.push(req.session.userId);
            }
            quest.save().then((quest) => send_question(quest, req, res));
            history.save();
        });
    });
});

function send_question(quest, req, res) {
    Question.findOne({id: req.params.id}).populate({
        path: 'user',
        select: 'username reputation -_id'
    }).select('-answers -_id -history_id -votes -history -__v').exec(function (err, quest) {
        if (err || !quest)
            return res.json({status: "error", error: err ? err.toString() : "Question not found"});
        res.json({status: "OK", question: quest});
    });
}

//create new question
router.post('/add', function (req, res) {
    if (!req.session.userId)
        return res.json({status: "error", error: "User not logged in."});
    req.body.media = null;
    let question = new Question(req.body);
    question.user = req.session.userId;
    question.save(function (err, question) {
        if (err) return res.json({status: "error", error: err.toString()});
        console.log("successfully created questions " + question.title);
        res.json({status: "OK", id: question.id});
    });
});

//create new answer
router.post('/:id/answers/add', function (req, res) {
    if (!req.session.userId)
        return res.json({status: "error", error: "User not logged in."});
    Question.findOne({id: req.params.id}, function (err, question) {
        if (err)
            return res.json({status: "error", error: err.toString()});
        let answer = new Answer(req.body);
        answer.question_id = question.id;
        answer.user = req.session.username;
        answer.save(function (err, answer) {
            if (err)
                return res.json({status: "error", error: err.toString()});
            console.log("answer generated: id = " + answer.id);
            question.answer_count++;
            question.answers.push(answer);
            question.save();
            console.log("Added answer to the question: " + question.id);
            res.json({status: "OK", id: answer.id, user: answer.user});
        });
    });
});

router.get('/:id/answers', function (req, res) {
    Question.findOne({id: req.params.id}).populate({
        path: 'answers',
        select: '-_id'
    }).select('answers').exec((err, question) => {
        if (err) {
            res.json({status: "error", error: err.toString()});
            return console.log(err.toString());
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
        return console.log("User not logged in when deleting question. ");
    }
    Question.findOne({id: req.params.id}, function (err, question) {
        if (err) {
            res.status(400).json({status: "error 400", error: err.toString()});
            return console.log(err.toString());
        }
        if (question.user.toString() !== req.session.userId.toString()) {
            res.status(401).json({status: "error 401", error: "You are not authorized to perform this operation."});
            return console.log("You are not authorized to perform this operation.");
        } else {
            Question.findOneAndRemove({id: req.params.id}, function (err, question) {
                if (err) {
                    res.status(404).json({status: "error 404", error: err.toString()});
                    return console.log(err.toString());
                }
                //remove the answers associated with it
                Answer.deleteMany({question_id: question.id}, function (err) {
                    if (err) {
                        res.status(404).json({status: "error 404", error: err.toString()});
                        return console.log(err.toString());
                    }
                });

                res.status(200).json({status: "OK"});
            });
        }
    });
});

router.post('/:id/upvote', function (req, res) {
    if (!req.session.userId) return res.json({status: "error"});
    let upvote = req.body.upvote === undefined ? true : req.body.upvote;
    upvote = upvote ? 1 : -1;

    Question.findOne({id: req.params.id})
        .populate('user')
        .exec(function (err, question) {
            if (err || !question)
                return res.json({status: "error"});

            let index = question.votes.findIndex(function (element) {
                return element.id === req.session.userId;
            });

            // Add my vote to list of votes
            if (index === -1)
                question.votes.push({id: req.session.userId, vote: upvote});
            else {
                let u_vote = question.votes[index];
                // If I already voted then undo that vote
                if (u_vote.vote !== 0) {
                    if (u_vote.vote === upvote) {
                        upvote = (-1) * u_vote.vote;
                        u_vote.vote = 0;
                    } else {
                        upvote *= 2;
                        u_vote.vote *= -1;
                    }
                }
                else // Set my vote to the new vote
                    u_vote.vote = upvote;
            }
            question.score += upvote;
            let user = question.user;
            user.real_reputation += upvote;
            if (user.real_reputation < 1)
                user.reputation = 1;
            else
                user.reputation = user.real_reputation;
            user.save(() => question.save(() => res.json({status: "OK"})));
        })
});

module.exports = router;
