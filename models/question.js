

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Answer'
    }, // either populate or add field question id in answers model.. VP
    // user: {
    //     id: String,
    //     username: String,
    //     reputation: Number
    // },
    body: String,
    score: Number,
    view_count: Number,
    answer_count: Number,
    timestamp: {
        type: Date,
        default: Date.now
    },
    media: [Number],
    tags: [String],
    accepted_answer_id: Number

});


module.exports = mongoose.model('Question', questionSchema);
