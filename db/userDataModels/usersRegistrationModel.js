'strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersRegistrationSchema = require('./userRegistrationSchema');

module.exports = mongoose.model(
	'UsersRegistrationModel',
	Schema(usersRegistrationSchema)
);
