export async function verifyAdminRightsForPublicKey(publicKey: string): Promise<boolean> {
	if (publicKey === process.env.OWNER_PUBLIC_KEY) {
		return true
	}

	return false
}