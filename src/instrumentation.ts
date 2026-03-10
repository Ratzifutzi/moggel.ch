import { execSync } from 'child_process';
import { logger } from './lib/logger';
import mongoose from 'mongoose';
import User from './models/User';

export async function register() {
	logger.info('Preparing app...');
	const errors: string[] = [];

	//////////////////////////////////////////////////////
	// Verify environment variables
	const requiredEnvVars = ['MONGODB_URI', 'MONGODB_NAME', 'OWNER_PUBLIC_KEY'];
	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			errors.push(`Environment variable ${envVar} is not set`);
		}
	}

	//////////////////////////////////////////////////////
	// Security audit
	try {
		execSync('npm audit', { stdio: 'ignore' });
	} catch {
		errors.push(
			'npm audit returned with errors. Please fix the vulnerabilities before running the app.',
		);
	}

	//////////////////////////////////////////////////////
	// Database
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		const user = new User({
			publicKey: 'test1',
			authorizationCookie: 'test2',
		});
		await user.save();
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
