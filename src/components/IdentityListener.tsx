'use client';

import { useEffect, useRef } from 'react';
import useIdentityStore from '@/stores/IdentityStore';

export default function IdentityListener() {
	const handleMessage = useIdentityStore((s) => s.handleMessage);
	const setIframe = useIdentityStore((s) => s.setIframe);
	const init = useIdentityStore((s) => s.init);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		init();
	}, [init]);

	useEffect(() => {
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [handleMessage]);

	useEffect(() => {
		setIframe(iframeRef.current);
		return () => setIframe(null);
	}, [setIframe]);

	return (
		<iframe
			ref={iframeRef}
			title="DeSo Identity"
			src="https://identity.deso.org/embed"
			style={{
				height: '100vh',
				width: '100vw',
				display: 'none',
				position: 'fixed',
				zIndex: 1000,
				left: 0,
				top: 0,
			}}
		/>
	);
}
