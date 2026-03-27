declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Database
			MONGODB_URI: string;
			MONGODB_NAME: string;

			// Authentication
			OWNER_PUBLIC_KEY: string;
		}
	}
}

export {};
