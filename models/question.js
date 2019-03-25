const mongoose = require('mongoose');
const History = require('./history');
const shortid = require('shortid');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
	id: {type: String, index: true, default: shortid.generate},
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
	history_id: {
		type: Schema.Types.ObjectId,
		ref: 'History',
		default: function(){
			let hist = new History();
			hist.save((err, hist) => console.log(err, hist));
			return hist._id;
		}
	},
	timestamp: {
		type: Number,
		default: () => Math.floor(Date.now() / 1000) // Date in unix time, Date.now returns in milliseconds so need seconds ID
	},
	media: [Number],
	tags: [String],
	accepted_answer_id: {type: Schema.Types.ObjectId, ref: 'Answer'}

});


module.exports = mongoose.model('Question', questionSchema);
