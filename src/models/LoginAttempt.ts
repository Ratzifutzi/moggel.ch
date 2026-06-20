import { Schema, model } from 'mongoose';

const LoginAttemptSchema = new Schema({
	ip: { type: String, required: true, index: true },
	username: { type: String, required: true, index: true },
	userAgent: { type: String },

	timestamp: { type: Date, default: Date.now, index: true },

	successful: { type: Boolean, required: true, index: true },
	failureReason: {
		type: String,
		enum: [
			'invalid_password',
			'unknown_user',
			'account_locked',
			'rate_limited',
			null,
		],
		default: null,
	},
});

LoginAttemptSchema.index({ ip: 1, timestamp: -1 });
LoginAttemptSchema.index({ username: 1, timestamp: -1 });
LoginAttemptSchema.index({ username: 1, successful: 1, timestamp: -1 });

LoginAttemptSchema.index(
	{ timestamp: 1 },
	{ expireAfterSeconds: 60 * 60 * 24 * 90 },
);

export const LoginAttempt = model('LoginAttempt', LoginAttemptSchema);
