'use client';

import Button from '@/components/base/button';
import Pagination from '@/components/base/pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ComicFormModal, { type ComicFormValues } from './ComicFormModal';

type ComicRow = {
	_id: string;
	title: string;
	permalink: string;
	desoLink: string;
	desoClicks: number;
	viewCount: number;
	createdAt: string;
};

type ComicsResponse = {
	ok: boolean;
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	comics: ComicRow[];
};

type ComicFull = ComicFormValues & { _id: string };

type ModalState =
	| { mode: 'create' }
	| { mode: 'edit'; comic: ComicFull }
	| null;

async function parseError(res: Response): Promise<string> {
	const body = await res.json().catch(() => null);
	return body?.error ?? 'Request failed';
}

export default function Comics() {
	const [page, setPage] = useState(1);
	const [modal, setModal] = useState<ModalState>(null);
	const [modalError, setModalError] = useState<string | undefined>();
	const [loadingEditId, setLoadingEditId] = useState<string | undefined>();

	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery<ComicsResponse>({
		queryKey: ['admin', 'comics', page],
		queryFn: async () => {
			const res = await fetch(`/api/admin/comics?page=${page}`);
			if (!res.ok) throw new Error('Failed to load comics');
			return res.json();
		},
		placeholderData: (prev) => prev,
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ['admin', 'comics'] });

	const createMutation = useMutation({
		mutationFn: async (values: ComicFormValues) => {
			const res = await fetch('/api/admin/comics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});
			if (!res.ok) throw new Error(await parseError(res));
			return res.json();
		},
		onSuccess: () => {
			setModal(null);
			setModalError(undefined);
			invalidate();
		},
		onError: (err: Error) => setModalError(err.message),
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			values,
		}: {
			id: string;
			values: ComicFormValues;
		}) => {
			const res = await fetch(`/api/admin/comics/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});
			if (!res.ok) throw new Error(await parseError(res));
			return res.json();
		},
		onSuccess: () => {
			setModal(null);
			setModalError(undefined);
			invalidate();
		},
		onError: (err: Error) => setModalError(err.message),
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/admin/comics/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await parseError(res));
			return res.json();
		},
		onSuccess: () => invalidate(),
		onError: (err: Error) => alert(err.message),
	});

	const openEdit = async (id: string) => {
		setLoadingEditId(id);
		try {
			const res = await fetch(`/api/admin/comics/${id}`);
			if (!res.ok) throw new Error(await parseError(res));
			const body = await res.json();
			setModalError(undefined);
			setModal({ mode: 'edit', comic: body.comic });
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to load comic');
		} finally {
			setLoadingEditId(undefined);
		}
	};

	if (isLoading) return <p>Loading...</p>;
	if (isError || !data) return <p>Failed to load comics.</p>;

	const totalPages = data.totalPages;

	const handleSubmit = (values: ComicFormValues) => {
		setModalError(undefined);
		if (modal?.mode === 'create') {
			createMutation.mutate(values);
		} else if (modal?.mode === 'edit') {
			updateMutation.mutate({ id: modal.comic._id, values });
		}
	};

	const submitting = createMutation.isPending || updateMutation.isPending;

	return (
		<div className='flex flex-col gap-3'>
			<div>
				<Button
					onClick={() => {
						setModalError(undefined);
						setModal({ mode: 'create' });
					}}
				>
					Add Comic
				</Button>
			</div>

			<table className='w-full border-collapse'>
				<thead>
					<tr className='border-b-2 border-dotted text-left'>
						<th className='py-2'>Title</th>
						<th className='py-2'>Permalink</th>
						<th className='py-2'>Views</th>
						<th className='py-2'>DeSo Clicks</th>
						<th className='py-2'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.comics.map((c) => (
						<tr key={c._id} className='border-b border-dotted'>
							<td className='py-2'>{c.title}</td>
							<td className='py-2 font-mono'>{c.permalink}</td>
							<td className='py-2'>{c.viewCount}</td>
							<td className='py-2'>{c.desoClicks}</td>
							<td className='flex flex-row gap-2 py-2'>
								<Button
									onClick={() => openEdit(c._id)}
									disabled={loadingEditId === c._id}
								>
									Edit
								</Button>
								<Button
									onClick={() => {
										if (
											confirm(
												`Delete comic "${c.title}"? This cannot be undone.`,
											)
										) {
											deleteMutation.mutate(c._id);
										}
									}}
									disabled={deleteMutation.isPending}
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<Pagination
				currentPage={data.page}
				totalPages={totalPages}
				summary={`(${data.total} comics)`}
				onPageChange={setPage}
				className='flex flex-row items-center gap-2'
				hideOnSinglePage={false}
			/>

			{modal && (
				<ComicFormModal
					heading={modal.mode === 'create' ? 'Add Comic' : 'Edit Comic'}
					initial={modal.mode === 'edit' ? modal.comic : undefined}
					submitting={submitting}
					error={modalError}
					onClose={() => {
						setModal(null);
						setModalError(undefined);
					}}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
}
