'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { usePending } from './PendingContext';

export default function ClearSearchLink({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const router = useRouter();
	const { setPending } = usePending();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setPending(isPending);
	}, [isPending, setPending]);

	const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		startTransition(() => {
			router.push('/archive');
			router.refresh();
		});
	};

	return (
		<Link href='/archive' onClick={onClick} className={className}>
			{children}
		</Link>
	);
}
