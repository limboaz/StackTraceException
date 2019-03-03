const mongoose = require('mongoose');
const session = require('express-session');
const Mongoose = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost:27017/ttt');
const mongoStore = new Mongoose({mongooseConnection: mongoose.connection});

module.exports = mongoStore;