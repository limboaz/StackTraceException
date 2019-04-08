const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const History = require('../models/history');
const router = express.Router();
const __dir = 'public';

router.get('/:id', function (req, res) {
    console.log("We are in questions id");
    console.log(req.params.id);

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
    }).select('-answers -_id -history_id -__v').exec(function (err, quest) {
        if (err || !quest)
            return res.json({status: "error", error: err ? err.toString() : "Question not found"});
        console.log(quest);
        res.json({status: "OK", question: quest});
    });
}

router.get('/add', function (req, res) {
    res.render(res.render('add_question', {user_name: req.session.username, logged_in: req.session.userId !== undefined}))
});
//create new question
router.post('/add', function (req, res) {
    if (!req.session.userId)
        return res.json({status: "error", error: "User not logged in."});
    req.body.media = null;
    console.log(req.body);
    let question = new Question(req.body);
    question.tags = req.body.tags.value.split(',');
    console.log("Let's check tags")
    console.log(tags)
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
        });
        question.answer_count++;
        question.answers.push(answer);
        question.save();
        console.log("Added answer to the question: " + question.id);
        res.json({status: "OK", id: answer.id});
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
                // .exec(function(err, res){
                // if(err){
                //     res.status(404).json({status: "error 404", error: err.toString()});
                //     return console.log(err.toString());
                //     }
                // });

                res.status(200).json({status: "OK"});
            });
        }
    });
});

module.exports = router;
