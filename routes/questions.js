const express = require('express');
const nodemailer = require('nodemailer');
const Answer = require('../models/answer');
const Question = require('../models/question');
const mongoStore = require('../mongoose');
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
        res.json({status: "OK", question: quest});
    });
});

router.get('/:id/answers', function (req, res) {
    Question.findOne({id: req.params.id}).populate('answers').exec((err, answers) => {
        if (err) {
            res.json({status: "error"});
            return console.log(err); // TODO add reasonable error message
        }
        console.log("Populated answers " + answers);
    });
});

module.exports = router;