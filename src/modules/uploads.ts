import { existsSync, mkdirSync } from "fs"
import path from "path";

export default {
	init: async function() {
		const uploadsPath = path.join(__dirname, '../../uploads');

		try {
			if(!existsSync(uploadsPath)) {
				mkdirSync(uploadsPath, { recursive: true });
				console.log("✅ Uploads directory created successfully at:", uploadsPath);
			}
		} catch (error) {
			console.error("❌ Failed to create uploads directory:", error);
			throw new Error("Uploads directory initialization failed.");
		}
	},

	getUploadsPath: function(): string {
		const uploadsPath = path.join(__dirname, '../../uploads');
		if (!existsSync(uploadsPath)) {
			throw new Error("Uploads directory does not exist. Please initialize it first.");
		}
		return uploadsPath;
	},
}