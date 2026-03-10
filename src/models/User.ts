import { model, models, Schema } from 'mongoose';

const UserSchema = new Schema({
	publicKey: { type: String, required: true, index: true },
	authCookieCode: { type: String, required: true, unique: true },
});

const User = models.User || model('User', UserSchema);

export default User;
