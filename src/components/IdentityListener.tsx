'use client';

import { useEffect } from 'react';
import useIdentityStore from '@/stores/IdentityStore';

export default function IdentityListener() {
	const handleMessage = useIdentityStore((s) => s.handleMessage);
	const onPageFocus = useIdentityStore((s) => s.onPageFocus);

	useEffect(() => {
		window.addEventListener('message', handleMessage);
		window.addEventListener('focus', onPageFocus);

		return () => {
			window.removeEventListener('message', handleMessage);
			window.removeEventListener('focus', onPageFocus);
		};
	}, [handleMessage, onPageFocus]);

	return null;
}
