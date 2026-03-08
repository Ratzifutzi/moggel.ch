'use client';

import Image from 'next/image';
import Button from './base/button';
import useIdentityStore from '@/stores/IdentityStore';

export default function DesoIdentityButton() {
	const login = useIdentityStore((s) => s.login);
	const logout = useIdentityStore((s) => s.logout);
	const currentPublicKey = useIdentityStore((s) => s.currentPublicKey);

	if (currentPublicKey) {
		return (
			<Button onClick={logout}>
				<Image
					src="/assets/images/deso-logo.svg"
					alt="DeSo logo"
					width={24}
					height={24}
					className="min-h-7"
				/>{' '}
				Logout
			</Button>
		);
	}

	return (
		<Button onClick={login}>
			<Image
				src="/assets/images/deso-logo.svg"
				alt="DeSo logo"
				width={24}
				height={24}
				className="min-h-7"
			/>{' '}
			Login with DeSo
		</Button>
	);
}
