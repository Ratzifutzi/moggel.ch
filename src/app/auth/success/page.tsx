'use client';

import { useEffect } from 'react';

export default function AuthSuccess() {
	useEffect(() => {
		window.close();
	}, []);

	return <></>;
}
