const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const User = require('../models/user');
const router = express.Router();

router.get('/:id', function (req, res) {
    Answer.findOne({id: req.params.id}, function (err, ans) {
        if (err || !ans)
            return res.status(404).json({status: "error", error: err ? err.toString() : "Answer not found"});
        Question.findOne({id: ans.question_id}, function (err, quest) {
            if (err || !ans)
                return res.status(404).json({status: "error", error: err ? err.toString() : "Question not found"});
            res.json({status: "OK", question: {id: ans.question_id, title: quest.title}, answer: ans.body});
        });
    });
});

router.post('/:id/upvote', function (req, res) {
    if (!req.session.userId) return res.status(404).json({status: "error"});
    let upvote = req.body.upvote === undefined ? true : req.body.upvote;
    upvote = upvote ? 1 : -1;

    Answer.findOne({id: req.params.id}, function (err, answer) {
        if (err || !answer)
            return res.status(404).json({status: "error"});
        User.findOne({username: answer.user}, function (err, user) {
            if (err || !user)
                return res.status(404).json({status: "error"});
            let index = answer.votes.findIndex(function (element) {
                return element.id === req.session.userId;
            });

            let waived = false;
            let u_vote;
            // Add my vote to list of votes
            if (index === -1) {
                answer.votes.push({id: req.session.userId, vote: upvote});
                u_vote = answer.votes[answer.votes.length - 1];
            } else {
                u_vote = answer.votes[index];
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
                            user.reputation -= 1;
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

            answer.score += upvote;
            if (user.reputation + upvote < 1) {
                u_vote.vote = -2;
                user.reputation = 1;
            } else if (!waived)
                user.reputation += upvote;
            user.real_reputation += upvote;
            user.save(() => answer.save(() => res.json({status: "OK"})));
        })
    })
});

router.post('/:id/accept', function (req, res) {
    if (!req.session.userId)
        return res.status(404).json({status: "error", error: "User not logged in."});
    Answer.findOne({id: req.params.id}, function (err, answer) {
        if (err || answer.is_accepted)
            return res.status(404).json({status: "error", error: err ? err.toString() : "Answer already accepted"});
        let q_id = answer.question_id;
        Question.findOne({id: q_id}, function (err, question) {
            if (err)
                return res.status(404).json({status: "error", error: err.toString()});
            let cur_user = req.session.username;
            if (question.user.username != cur_user) {
                return res.status(404).json({status: "error", error: "Only user who posted the question can accept the answer."});
            }
            if (question.accepted_answer_id != null) {
                return res.status(404).json({status: "error", error: "You already accepted another answer for this question."});
            }
            answer.is_accepted = true;
            answer.save();
            question.accepted_answer_id = answer._id;
            question.save();
            res.json({status: "OK"});
        });
    });
});

module.exports = router;