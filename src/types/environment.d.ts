declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Database
			MONGODB_URI: string;
			MONGODB_NAME: string;

			// Authentication
			OWNER_PUBLIC_KEY: string;

			// Client Configs
			NEXT_PUBLIC_SIGNUP_ENABLED: boolean;
		}
	}
}

export {};
