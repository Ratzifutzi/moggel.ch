'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { usePending } from './PendingContext';

export default function SearchForm({ initialQuery }: { initialQuery: string }) {
	const router = useRouter();
	const { setPending } = usePending();
	const [value, setValue] = useState(initialQuery);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setValue(initialQuery);
	}, [initialQuery]);

	useEffect(() => {
		setPending(isPending);
	}, [isPending, setPending]);

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmed = value.trim();
		const target = trimmed
			? `/archive?q=${encodeURIComponent(trimmed)}`
			: '/archive';
		startTransition(() => {
			router.push(target);
			router.refresh();
		});
	};

	return (
		<form onSubmit={onSubmit} className='flex flex-row items-center gap-2'>
			<input
				type='text'
				name='q'
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder='Search comics...'
				className='flex-1 rounded-lg border-2 border-dotted bg-white px-3 py-2 text-black'
			/>
			<button
				type='submit'
				disabled={isPending}
				className='rounded-lg border-2 border-dotted bg-white px-4 py-2 text-black disabled:opacity-60'
			>
				Search
			</button>
		</form>
	);
}
