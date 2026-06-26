'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import Pagination from '@/components/base/pagination';
import { usePending } from './PendingContext';

export default function PaginationClient({
	currentPage,
	totalPages,
	query,
	total,
}: {
	currentPage: number;
	totalPages: number;
	query: string;
	total: number;
}) {
	const router = useRouter();
	const { setPending } = usePending();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setPending(isPending);
	}, [isPending, setPending]);

	const goToPage = (p: number) => {
		const target = query
			? `/archive?q=${encodeURIComponent(query)}&page=${p}`
			: `/archive?page=${p}`;
		startTransition(() => {
			router.push(target);
			router.refresh();
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={goToPage}
			summary={`(${total} comics)`}
			hideOnSinglePage={false}
		/>
	);
}
