const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    id: {type: String, index: true, default: shortid.generate},
    question_id: String,
    user: {type: String, index: true},// id of poster
    body: {type: String, required: true},
    score: {type: Number, default: 0},
    is_accepted: {type: Boolean, default: false},
    votes : [{id: String, vote: Number}],
    timestamp: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    media: [String]
});


module.exports = mongoose.model('Answer', answerSchema);

