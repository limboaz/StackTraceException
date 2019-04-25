const express = require('express');
const router = express.Router();
const multer = require('multer');
const cassandra = require('../cassandra');
const Media = require('../models/media');
const shortID = require('shortid');
let upload = multer();

router.post('/addmedia', upload.single("content"), function (req, res) {
    if (!req.session.userId)
        return res.status(404).json({status: "error", error: "User not logged in."});
    let uid = shortID.generate();
    let query = 'INSERT INTO media (id, content, type) VALUES (?, ?, ?)';
    let params = {
        id : uid,
        content: req.file.buffer,
        type : req.file.mimetype
    };
    cassandra.execute(query, params, {prepare: true}, function(err, result){
        if(err)
            return res.status(404).json({status: "error", error: err.toString()});
        res.json({status: "OK", id: uid});
        let m = new Media({_id: uid, user: req.session.userId});
        m.save();
    });
});

router.get('/media/:id', function (req, res) {
    let query = 'SELECT content, type FROM media WHERE id = ?';
    Media.find({id: req.params.id}, function (err, media) {
        if (err || !media)
            return res.status(404).json({status: "error", error: err ? err.toString() : "media does not exist"});
        cassandra.execute(query, [req.params.id],function(err, result){
            if(err || !result)
                return res.status(404).json({status: "error", error: err.toString()});
            res.type(result.rows[0].type).send(result.rows[0].content);
        });
    });
});

module.exports = router;

