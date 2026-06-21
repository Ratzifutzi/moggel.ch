'use client';

import { useEffect } from 'react';

export default function ViewTracker({ permalink }: { permalink: string }) {
	useEffect(() => {
		const utm =
			typeof window !== 'undefined'
				? new URLSearchParams(window.location.search).get('utm') ?? ''
				: '';

		const url = `/api/comics/${encodeURIComponent(permalink)}/view${
			utm ? `?utm=${encodeURIComponent(utm)}` : ''
		}`;

		fetch(url, { method: 'POST' }).catch(() => {});
	}, [permalink]);

	return null;
}
