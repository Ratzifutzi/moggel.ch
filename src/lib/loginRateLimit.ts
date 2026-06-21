import { LoginAttempt } from '@/models/LoginAttempt';

/**
 * Rate limit rules for login attempts.
 *
 * Layered defense:
 *  - Per-IP failed attempts: stops brute force from one source.
 *  - Per-IP total attempts:  stops credential stuffing where some succeed.
 *  - Per-username failures:  protects a single account from distributed attacks.
 *  - Per-IP long window:     catches slow/low attacks that creep under the short window.
 *
 */
export const LOGIN_RATE_LIMITS = {
	IP_FAILED_PER_15_MIN: 10,
	IP_TOTAL_PER_15_MIN: 30,
	USERNAME_FAILED_PER_15_MIN: 60,
	IP_TOTAL_PER_HOUR: 100,
} as const;

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export type RateLimitCheck =
	| { limited: false }
	| { limited: true; retryAfterSeconds: number };

/**
 * Checks whether the (ip, username) pair is currently rate-limited.
 * Returns the retry-after hint (seconds) when limited.
 */
export async function checkLoginRateLimit(
	ip: string,
	username: string,
): Promise<RateLimitCheck> {
	const now = Date.now();
	const since15 = new Date(now - FIFTEEN_MIN_MS);
	const since60 = new Date(now - ONE_HOUR_MS);

	const [ipFailed15, ipTotal15, userFailed15, ipTotal60] = await Promise.all([
		LoginAttempt.countDocuments({
			ip,
			successful: false,
			timestamp: { $gte: since15 },
		}),
		LoginAttempt.countDocuments({
			ip,
			timestamp: { $gte: since15 },
		}),
		LoginAttempt.countDocuments({
			username,
			successful: false,
			timestamp: { $gte: since15 },
		}),
		LoginAttempt.countDocuments({
			ip,
			timestamp: { $gte: since60 },
		}),
	]);

	const exceeded15Min =
		ipFailed15 >= LOGIN_RATE_LIMITS.IP_FAILED_PER_15_MIN ||
		ipTotal15 >= LOGIN_RATE_LIMITS.IP_TOTAL_PER_15_MIN ||
		userFailed15 >= LOGIN_RATE_LIMITS.USERNAME_FAILED_PER_15_MIN;

	const exceeded60Min = ipTotal60 >= LOGIN_RATE_LIMITS.IP_TOTAL_PER_HOUR;

	if (!exceeded15Min && !exceeded60Min) {
		return { limited: false };
	}

	// Hint when the oldest attempt in the active window expires.
	const window = exceeded60Min ? ONE_HOUR_MS : FIFTEEN_MIN_MS;
	const oldest = await LoginAttempt.findOne(
		exceeded60Min
			? { ip, timestamp: { $gte: new Date(now - window) } }
			: {
					$or: [
						{ ip, timestamp: { $gte: new Date(now - window) } },
						{ username, timestamp: { $gte: new Date(now - window) } },
					],
				},
		{ timestamp: 1 },
	)
		.sort({ timestamp: 1 })
		.lean();

	const retryAfterSeconds = oldest
		? Math.max(1, Math.ceil((oldest.timestamp.getTime() + window - now) / 1000))
		: Math.ceil(window / 1000);

	return { limited: true, retryAfterSeconds };
}
