import { model, Schema } from 'mongoose';

const UserSchema = new Schema({
	publicKey: String,
	authorizationCookie: String,
});

const User = model('User', UserSchema);

export default User;
