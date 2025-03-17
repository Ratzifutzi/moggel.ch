import { v4 as uuidv4 } from 'uuid';

export async function generateRandomString(length: number) {
	return uuidv4();
};