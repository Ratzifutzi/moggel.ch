export async function verifyAdminRightsForPublicKey(publicKey: string): Promise<[boolean, string]> {
	if (publicKey === process.env.OWNER_PUBLIC_KEY) {
		return [ true, "Site Owner"];
	}

	// Test hardcode
	if (publicKey === "BC1YLgCTkGwjBjD6c6dGogWwMuDmuRYVCSGvN8gqQmajVDaoTg4hAKj") {
		return [ true, "Moggel"];
	}

	return [false, "User"];
}