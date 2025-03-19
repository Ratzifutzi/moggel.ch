export async function verifyAdminRightsForPublicKey(publicKey: string): Promise<[boolean, string]> {
	if (publicKey === process.env.OWNER_PUBLIC_KEY) {
		return [ true, "Site Owner"];
	}

	return [false, "User"];
}