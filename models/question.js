const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;

//DONE
const questionSchema = new Schema({
	id: {type: String, index: 'hashed', default: shortid.generate},
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
	history: {
		ips: [],
		users: []
	},
	votes : [{id: String, vote: Number}],
	timestamp: {
		type: Number,
		default: () => Math.floor(Date.now() / 1000) // Date in unix time, Date.now returns in milliseconds so need seconds ID
	},
	media: [String],
	tags: [String],
	accepted_answer_id: String,
}, {shardKey: {id: "hashed"}});

questionSchema.index({title: 'text', body: 'text'}, {default_language: "none"});

module.exports = mongoose.model('Question', questionSchema);
