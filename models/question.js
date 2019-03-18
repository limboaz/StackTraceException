const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    title: String,
    body: String,
    score: Number,
    view_count: Number,
    answer_count: Number,
    timestamp: {
        type: Date,
        default: Date.now() / 1000 // Date in unix time, Date.now returns in milliseconds so need seconds ID
    },
    media: [Number],
    tags: [String],
    accepted_answer_id: Number

});


module.exports = mongoose.model('Question', questionSchema);
