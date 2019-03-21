const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    id: {type: String, index: true, default: new mongoose.Types.ObjectId()},
    question_id: String, // either have a field with question id we answered here or populate answers in question model.. VP
    user: {type: String, index: true},// id of poster
    body: {type: String, required: true},
    score: {type: Number, default: 0},
    is_accepted: {type: Boolean, default: false},
    timestamp: {
        type: Number,
        default: () => Date.now() / 1000
    },
    media: [Number]
});


module.exports = mongoose.model('Answer', answerSchema);

