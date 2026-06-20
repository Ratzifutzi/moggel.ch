import { Schema, model, models, type Model, Types } from 'mongoose';

export interface ISession {
	/** SHA-256 hash of the raw token. The raw token is never stored. */
	tokenHash: string;
	user: Types.ObjectId;
	createdAt: Date;
	expiresAt: Date;
	lastSeenAt: Date;
	ip?: string;
	userAgent?: string;
}

const SessionSchema = new Schema<ISession>({
	tokenHash: { type: String, required: true, unique: true, index: true },
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	createdAt: { type: Date, default: Date.now },
	expiresAt: { type: Date, required: true },
	lastSeenAt: { type: Date, default: Date.now },
	ip: { type: String },
	userAgent: { type: String },
});

// TTL index
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> =
	(models.Session as Model<ISession>) ||
	model<ISession>('Session', SessionSchema);
