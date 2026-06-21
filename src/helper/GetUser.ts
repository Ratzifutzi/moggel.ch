import { NextRequest } from 'next/server';
import User, { type IUser } from '@/models/User';
import {
	findSessionByToken,
	getSessionTokenFromCookies,
	getSessionTokenFromRequest,
} from '@/lib/session';
import type { HydratedDocument } from 'mongoose';

export default async function GetUser(
	req?: NextRequest,
): Promise<HydratedDocument<IUser> | undefined> {
	const token = req
		? getSessionTokenFromRequest(req)
		: await getSessionTokenFromCookies();
	if (!token) return undefined;

	const session = await findSessionByToken(token);
	if (!session) return undefined;

	const user = await User.findById(session.user);
	if (!user) return undefined;

	// Refuse to authenticate locked accounts even if they still hold a session.
	if (user.locked) return undefined;

	return user;
}
