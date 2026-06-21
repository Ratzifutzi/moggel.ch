import { model, models, Schema, type Model } from 'mongoose';

export interface IUser {
	username: string;
	password: string;
	locked: boolean;
	admin: boolean;
}

const UserSchema = new Schema<IUser>({
	username: { type: String, required: true, index: true, unique: true },
	password: { type: String, required: true },
	locked: { type: Boolean, default: false },
	admin: { type: Boolean, default: false },
});

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default User;
