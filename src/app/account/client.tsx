'use client';

import Button from '@/components/base/button';
import { IUser } from '@/models/User';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AccountPageClient({ user }: { user: IUser }) {
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const logoutMutation = useMutation({
		mutationFn: async () => {
			setLoading(true);
			const res = await fetch('/api/logout');
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.error ?? 'Internal Server Error');
			}

			return res.json();
		},
		onError: (err) => alert(err.message),
		onSuccess: () => {
			router.push('/account');
			router.refresh();
		},
		onSettled: () => {
			setLoading(false);
		},
	});

	return (
		<>
			<h2 className='text-center text-xl'>Hi there, {user.username}</h2>
			<div className='mt-4 flex w-full flex-row justify-center gap-2'>
				<Button onClick={logoutMutation.mutate} disabled={loading}>
					Log Out
				</Button>
				{user.admin && (
					<Link href={'/admin'}>
						<Button disabled={loading}>Administration</Button>
					</Link>
				)}
			</div>
		</>
	);
}
