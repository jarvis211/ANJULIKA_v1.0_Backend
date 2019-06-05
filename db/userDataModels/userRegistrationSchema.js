'strict';

module.exports = {
	local: {
		email: { type: String },
		password: { type: String },
		subscribed: { type: Boolean },
		accessToken: { type: String },
		refreshToken: { type: String }
	},
	google: {
		email: { type: String },
		password: { type: String },
		subscribed: { type: Boolean },
		accessToken: { type: String },
		refreshToken: { type: String }
	},
	facebook: {
		email: { type: String },
		password: { type: String },
		subscribed: { type: Boolean },
		accessToken: { type: String },
		refreshToken: { type: String }
	}
};
