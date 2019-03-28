const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
	_id: {type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId()},
	ips: [],
	users: [],
});

module.exports = mongoose.model('History', historySchema);
