const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    id: {type: String, index: true},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    title: {type: String, required: true},
    body: {type: String, required: true},
    score: {type: Number, default: 0},
    view_count: {type: Number, default: 0},
    answer_count: {type: Number, default: 0},
    timestamp: {
        type: Number,
        default: Date.now() / 1000 // Date in unix time, Date.now returns in milliseconds so need seconds ID
    },
    media: [Number],
    tags: [String],
    accepted_answer_id: {type: Schema.Types.ObjectId, ref: 'Answer'}

});


module.exports = mongoose.model('Question', questionSchema);
