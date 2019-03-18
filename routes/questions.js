const express = require('express');
const nodemailer = require('nodemailer');
const Answer = require('../models/answer');
const Question = require('../models/question');
const mongoose = require('mongoose');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function (req, res) {
    console.log("We are in questions id");
    console.log(req.params.id);

    Question.findOne({id: req.params.id}, function (err, quest) {
        if (err || !quest ) {
            res.json({status: "error11"});
            return console.log(err); // TODO add reasonable error message
        }
        quest.id = quest._id;
        res.json({status: "OK", question: quest});
    });
});

//create new question
router.post('/add', function(req, res){
    if(!req.session.userId)
        return res.json({status: "error", error: "User not logged in."});
    let question = new Question(req.body);
    question.user = req.session.userId;
    question.id = new mongoose.Types.ObjectId();
    question.save(function(err, question){
       if(err) return res.json({status:"error", error: err.toString()});
       console.log("successfully created questions " + question.title);
        res.json({status: "OK", id: question._id});
    });
});

//create new answer
router.post('/:id/answers/add', function (req,res) {
    Question.findOne({id: req.params.id}, function(err, question){
        if(err)
            return res.json({status: "error", error: err.toString()});
        let answer = new Answer(req.body);
        answer.id = new mongoose.Types.ObjectId();
        answer.question_id = question.id;
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