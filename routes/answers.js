const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
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

module.exports = router;