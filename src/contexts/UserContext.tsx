'use client';

import { useEffect, useState } from 'react';
import useIdentityStore from '@/stores/IdentityStore';

const DESO_NODE = 'https://node.deso.org/api/v0';

export interface User {
	loggedIn: boolean;
	publicKey: string | null;
	displayName: string;
	profilePictureURL: string;
}

async function fetchDisplayName(publicKey: string): Promise<string> {
	const res = await fetch(`${DESO_NODE}/get-single-profile`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ PublicKeyBase58Check: publicKey }),
	});

	if (!res.ok) return `${publicKey.slice(0, 12)}...`;

	const data = await res.json();
	return data?.Profile?.Username || `${publicKey.slice(0, 12)}...`;
}

export function useUser(): User {
	const currentPublicKey = useIdentityStore((s) => s.currentPublicKey);
	const initialized = useIdentityStore((s) => s.initialized);
	const [displayName, setDisplayName] = useState('');

	useEffect(() => {
		if (!currentPublicKey) return;

		fetchDisplayName(currentPublicKey).then(setDisplayName);

		return () => setDisplayName('');
	}, [currentPublicKey]);

	if (!initialized || !currentPublicKey) {
		return {
			loggedIn: false,
			publicKey: null,
			displayName: '',
			profilePictureURL: '',
		};
	}

	return {
		loggedIn: true,
		publicKey: currentPublicKey,
		displayName,
		profilePictureURL: `${DESO_NODE}/get-single-profile-picture/${currentPublicKey}`,
	};
}

export function UserProvider({ children }: React.PropsWithChildren) {
	return <>{children}</>;
}
