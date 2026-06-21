declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Database
			MONGODB_URI: string;

			NEXT_PUBLIC_PC_SITEKEY: string;
			PC_API_KEY: string;

			ADMIN_USER_PASSWORD: string;

			PROXY_IP_HEADER: string;
		}
	}
}

export {};
