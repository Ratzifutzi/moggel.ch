declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Node provided
			NODE_ENV: 'development' | 'production' | 'test';
			
			// If running on plesk, plesk provided
			PORT: string;

			// .env file provided
			MONGODB_URI: string,
			FALLBACK_PORT: number,
			OWNER_PUBLIC_KEY: string,
		}
	}
}

export { };