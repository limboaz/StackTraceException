const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    id: String,
    question_id: String, // either have a field with question id we answered here or populate answers in question model.. VP
    user: String, // id of poster
    body: String,
    score: Number,
    is_accepted: Boolean,
    timestamp: {
        type: Date,
        default: Date.now
    },
    media: [Number]
});


module.exports = mongoose.model('Answer', answerSchema);

