export async function generateRandomString(length: number) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return Array.from(
		{ length },
		() => chars[Math.floor(Math.random() * chars.length)]
	).join('');
};