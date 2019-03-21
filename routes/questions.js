const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const History = require('../models/history');
const mongoose = require('mongoose');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function (req, res) {
    console.log("We are in questions id");
    console.log(req.params.id);

    Question.findOne({id: req.params.id}).
        populate({path: 'user', select: 'username reputation'}).
        select('-answers').
        exec(function (err, quest) {
					if (err || !quest ) {
							res.json({status: "error11"});
							return console.log(err); // TODO add reasonable error message
					}
					quest.user.id = quest.user._id;
					res.json({status: "OK", question: quest});
					History.findById(quest.history_id, function(err, history){
              if (!req.session.userId){
                  let ip = req.connection.remoteAddress;
                  if (!history.ips.includes(ip)) {
                      quest.view_count++;
                      history.ips.push(ip);
                  }
              } else if (!history.users.includes(req.session.userId)){
                  quest.view_count++;
                  history.users.push(req.session.userId);
              }
              quest.save();
              history.save();
          });
			});
});

//create new question
router.post('/add', function(req, res){
    if(!req.session.userId)
        return res.json({status: "error", error: "User not logged in."});
    let question = new Question(req.body);
    question.user = req.session.userId;
    question.save(function(err, question){
       if(err) return res.json({status:"error", error: err.toString()});
       console.log("successfully created questions " + question.title);
       res.json({status: "OK", id: question.id});
    });
});

//create new answer
router.post('/:id/answers/add', function (req,res) {
    Question.findOne({id: req.params.id}, function(err, question){
        if(err)
            return res.json({status: "error", error: err.toString()});
        let answer = new Answer(req.body);
        answer.question_id = question.id;
        answer.user = req.session.userId;
        answer.save(function(err, answer){
           if(err)
               return res.json({status: "error", error: err.toString()});
            console.log("answer generated: id = " + answer.id);
        });
        question.answer_count++;
        question.answers.push(answer);
        question.save();
        console.log("Added answer to the question: " + question.id);
        res.json({status:"OK", id:answer.id});
    });

});

router.get('/:id/answers', function (req, res) {
    Question.findOne({id: req.params.id}).populate('answers').select('answers').exec((err, question) => {
        if (err) {
            res.json({status: "error", error: err.toString()});
            return console.log(err);
        }
        // console.log("Populated answers + answers);
        res.json({status: 'OK', answers: question.answers});
    });
});

module.exports = router;