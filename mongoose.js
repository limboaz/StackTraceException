const mongoose = require('mongoose');
const session = require('express-session');
const Mongoose = require('connect-mongo')(session);

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

mongoose.connect('mongodb://10.3.6.100:27017/STE');
const mongoStore = new Mongoose({mongooseConnection: mongoose.connection});

module.exports = mongoStore;