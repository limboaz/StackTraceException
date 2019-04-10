const express = require('express');
const request = require('request');
const handlebars = require('handlebars');
const router = express.Router();
const __dir = 'public';
const prefix = 'http://localhost:3000/';
const async = require('async');

router.get('/quest/:id', function (req, res) {
    let quest = 'questions/' + req.params.id;
    request.get(prefix + quest, function (err, resp, body) {
        let b = JSON.parse(body);
        if (err || b.status !== 'OK') {
            return res.render('error');
        }
        let question = b.question;
        request.get(prefix + quest + '/answers', function (err, resp, body) {
            b = JSON.parse(body);
            if (err || b.status !== 'OK') {
                return res.render('error');
            }
            let answers = b.answers;
            res.render('question', {question: question, answers: answers, logged_in: req.session.userId !== undefined})
        });
    });
});

router.get('/u/:id', async function (req, res) {
    let usr = 'user/' + req.params.id;
    let question_display = [];
    let answer_display = [];
    let user = null;
    let userFound = false;
    let questionFound = false;
    let answerFound = false;

    request.get(prefix + usr, function (err, resp, body) {
        let b = JSON.parse(body);
        if (err || b.status !== 'OK') {
            return res.render('error');
        }
        user = b.user;
        console.log("the first request" + user);
        userFound = true;
    });

    request.get(prefix + usr + '/questions', function (err, resp, body) {
        let b = JSON.parse(body);
        if (err || b.status !== 'OK') {
            return res.render('error');
        }
        let questions = b.questions;
        questions.forEach(function (question) {
            request.get(prefix + "questions/" + question, function (err, resp, body) {
                let b = JSON.parse(body);
                if (err || b.status !== 'OK') {
                    return res.render('error');
                }
                question_display.push(b.question.title);
            });
        });
        console.log("the second request"+question_display);
    });

    request.get(prefix + usr + "/answers", function (err, resp, body) {
        let b = JSON.parse(body);
        if (err || b.status !== 'OK') {
            return res.render('error');
        }
        let answers = b.answers;
        answers.forEach(function (answer) {
            request.get(prefix + "answers/" + answer, function (err, resp, body) {
                let b = JSON.parse(body);
                if (err || b.status !== 'OK') {
                    return res.render('error');
                }
                answer_display.push({title: b.question, answer: b.answer});
            });
        });
        console.log("the third request" + answer_display);
        answerFound = true;
    });
    while(!userFound || !answerFound || !questionFound){
        await sleep(100);
    }
    res.render('u', {
        username: req.params.id,
        user: user,
        questions: question_display,
        answers: answer_display,
        logged_in: req.session.userId !== undefined
    });
});

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/', function (req, res) {
    res.render('index', {logged_in: req.session.userId !== undefined});
});
router.get('/add', function (req, res) {
    res.render('add_question', {user_name: req.session.username, logged_in: req.session.userId !== undefined})
});

router.get(/(javascript)|(stylesheets)/, function (req, res) {
    let i = req.path.search(/(javascript)|(stylesheets)/);
    res.sendFile(req.path.substr(i), {root: __dir});
});

handlebars.registerHelper('user_url', function (user) {
    return "/u/" + user;
});

module.exports = router;