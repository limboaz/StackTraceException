const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const User = require('../models/user');
const router = express.Router();

router.get('/:id', function(req, res){
   Answer.findOne({id: req.params.id}, function(err, ans){
       if(err || ! ans)
           return res.json({status: "error", error: err ? err.toString() : "Answer not found"});
       Question.findOne({id: ans.question_id}, function(err, quest){
           if(err || ! ans)
               return res.json({status: "error", error: err ? err.toString() : "Question not found"});
           res.json({status: "OK", question: {id: ans.question_id, title: quest.title}, answer: ans.body});
       });
   });
});

router.post('/:id/upvote', function (req, res) {
    if (!req.session.userId) return res.json({status: "error"});
    let upvote = req.body.upvote === undefined ? true : req.body.upvote;
    upvote = upvote ? 1 : -1;

    Answer.findOne({id: req.params.id}, function (err, answer) {
        if (err || !answer)
            return res.json({status: "error"});
        User.findOne({username: answer.user}, function(err, user){
            if (err || !user)
                return res.json({status: "error"});
            let index = answer.votes.findIndex(function (element) {
                return element.id === req.session.userId;
            });
            // Add my vote to list of votes
            if (index === -1)
                answer.votes.push({id: req.session.userId, vote: upvote});
            else {
                let u_vote = answer.votes[index];
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
            answer.score += upvote;
            user.real_reputation += upvote;
            if (user.real_reputation < 1)
                user.reputation = 1;
            else
                user.reputation = user.real_reputation;
            user.save(() => answer.save(() => res.json({status: "OK"})));
        })
        })
});

module.exports = router;