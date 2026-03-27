'use client';

import Image from 'next/image';
import Button from './base/button';

export default function DesoIdentityButton() {
	<Button>
		<Image
			src="/assets/images/deso-logo.svg"
			alt="DeSo logo"
			width={24}
			height={24}
			className="min-h-7"
		/>{' '}
		Login with DeSo
	</Button>;
}
