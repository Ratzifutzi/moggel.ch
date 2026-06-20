import { log } from 'console';
import { captcha } from './lib/captcha';

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { execSync } = await import('child_process');
		const { logger } = await import('./lib/logger');
		const mongoose = (await import('mongoose')).default;
		const User = (await import('./models/User')).default;

		logger.info('Preparing app...');
		const errors: string[] = [];

		//////////////////////////////////////////////////////
		// Verify environment variables
		const requiredEnvVars = [
			'MONGODB_URI',
			'NEXT_PUBLIC_PC_SITEKEY',
			'PC_API_KEY',
			'ADMIN_USER_PASSWORD',
		];
		for (const envVar of requiredEnvVars) {
			if (!process.env[envVar]) {
				errors.push(`Environment variable ${envVar} is not set`);
			}
		}

		//////////////////////////////////////////////////////
		// Security audit
		try {
			execSync('npm audit --audit-level=high', { stdio: 'ignore' });
		} catch {
			if (process.env.NODE_ENV == 'production') {
				errors.push(
					'Aduit reported high severity vulnerabilities. Please fix the vulnerabilities before running the app.',
				);
			} else {
				logger.warn(
					'Audit failed, ignoring this error in development. Current setup WONT run in production.',
				);
			}
		}

		//////////////////////////////////////////////////////
		// Database
		try {
			await mongoose.connect(process.env.MONGODB_URI);
		} catch {
			errors.push(
				'Failed to connect to MongoDB. Please check the .env and if the database is reachable.',
			);
		}

		//////////////////////////////////////////////////////
		// Finalize
		if (errors.length > 0) {
			logger.error(
				`Preparation completed with ${errors.length} error(s). Please fix the following issues before trying again:`,
			);
			errors.forEach((error) => logger.error(error));
			process.exit(1);
		}

		logger.info('App prepared with 0 errors.');
	}
}
