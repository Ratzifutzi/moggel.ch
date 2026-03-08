'use client';

import Button from '@/components/base/button';
import Image from 'next/image';

export default function AuthError() {
	function handleClose() {
		window.close();
	}

	return (
		<div className="flex flex-col items-center">
			<Image
				src={'/assets/images/error.png'}
				alt="Error"
				height={262}
				width={350}
			/>
			<h1 className="mb-2 text-4xl">Authentication Error</h1>
			<p className="mb-5">
				There was an error during authentication. Please try again.
			</p>
			<Button onClick={handleClose}>Close</Button>
		</div>
	);
}
