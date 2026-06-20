import { Schema, model, models, type Model } from 'mongoose';

export type LoginFailureReason =
	| 'invalid_password'
	| 'unknown_user'
	| 'account_locked'
	| 'rate_limited'
	| 'captcha_failed'
	| 'malformed_form';

export interface ILoginAttempt {
	ip: string;
	username: string;
	timestamp: Date;
	successful: boolean;
	failureReason: LoginFailureReason | null;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
	ip: { type: String, required: true, index: true },
	username: { type: String, required: true, index: true },

	timestamp: { type: Date, default: Date.now, index: true },

	successful: { type: Boolean, required: true, index: true },
	failureReason: {
		type: String,
		enum: [
			'invalid_password',
			'unknown_user',
			'account_locked',
			'rate_limited',
			'captcha_failed',
			'malformed_form',
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

export const LoginAttempt: Model<ILoginAttempt> =
	(models.LoginAttempt as Model<ILoginAttempt>) ||
	model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
