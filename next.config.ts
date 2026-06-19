import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['@private-captcha/private-captcha-react'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'node.deso.org',
			},
		],
	},
};

export default nextConfig;
