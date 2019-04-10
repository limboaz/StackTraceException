const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const History = require('../models/history');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function(req, res){
   Answer.findOne({id: req.params.id}, function(err, ans){
       if(err || ! ans)
           return res.json({status: "error", error: err ? err.toString() : "Answer not found"});
       Question.findOne({id: ans.question_id}, function(err, quest){
           if(err || ! ans)
               return res.json({status: "error", error: err ? err.toString() : "Question not found"});
           res.json({status: "OK", question: quest.title, answer: ans.body});
       });
   });
});

module.exports = router;