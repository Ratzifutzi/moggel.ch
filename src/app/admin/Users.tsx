'use client';

import Button from '@/components/base/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import UserFormModal, { type UserFormValues } from './UserFormModal';

type UserRow = {
	_id: string;
	username: string;
	locked: boolean;
	admin: boolean;
};

type UsersResponse = {
	ok: boolean;
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	users: UserRow[];
};

type ModalState = { mode: 'create' } | { mode: 'edit'; user: UserRow } | null;

async function parseError(res: Response): Promise<string> {
	const body = await res.json().catch(() => null);
	return body?.error ?? 'Request failed';
}

export default function Users() {
	const [page, setPage] = useState(1);
	const [modal, setModal] = useState<ModalState>(null);
	const [modalError, setModalError] = useState<string | undefined>();

	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery<UsersResponse>({
		queryKey: ['admin', 'users', page],
		queryFn: async () => {
			const res = await fetch(`/api/admin/users?page=${page}`);
			if (!res.ok) throw new Error('Failed to load users');
			return res.json();
		},
		placeholderData: (prev) => prev,
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

	const createMutation = useMutation({
		mutationFn: async (values: UserFormValues) => {
			const res = await fetch('/api/admin/users', {
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
			values: Partial<UserFormValues>;
		}) => {
			const res = await fetch(`/api/admin/users/${id}`, {
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
			const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await parseError(res));
			return res.json();
		},
		onSuccess: () => invalidate(),
		onError: (err: Error) => alert(err.message),
	});

	if (isLoading) return <p>Loading...</p>;
	if (isError || !data) return <p>Failed to load users.</p>;

	const totalPages = data.totalPages;

	const handleSubmit = (values: UserFormValues) => {
		setModalError(undefined);
		if (modal?.mode === 'create') {
			createMutation.mutate(values);
		} else if (modal?.mode === 'edit') {
			const payload: Partial<UserFormValues> = {
				username: values.username,
				admin: values.admin,
				locked: values.locked,
			};
			if (values.password) payload.password = values.password;
			updateMutation.mutate({ id: modal.user._id, values: payload });
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
					Add User
				</Button>
			</div>

			<table className='w-full border-collapse'>
				<thead>
					<tr className='border-b-2 border-dotted text-left'>
						<th className='py-2'>Username</th>
						<th className='py-2'>Admin</th>
						<th className='py-2'>Locked</th>
						<th className='py-2'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.users.map((u) => (
						<tr key={u._id} className='border-b border-dotted'>
							<td className='py-2'>{u.username}</td>
							<td className='py-2'>{u.admin ? 'Yes' : 'No'}</td>
							<td className='py-2'>{u.locked ? 'Yes' : 'No'}</td>
							<td className='flex flex-row gap-2 py-2'>
								<Button
									onClick={() => {
										setModalError(undefined);
										setModal({ mode: 'edit', user: u });
									}}
								>
									Edit
								</Button>
								<Button
									onClick={() => {
										if (
											confirm(
												`Delete user "${u.username}"? This cannot be undone.`,
											)
										) {
											deleteMutation.mutate(u._id);
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

			<div className='flex flex-row items-center gap-2'>
				<Button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page <= 1}
				>
					Previous
				</Button>
				<span>
					Page {data.page} of {totalPages} ({data.total} users)
				</span>
				<Button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page >= totalPages}
				>
					Next
				</Button>
			</div>

			{modal && (
				<UserFormModal
					title={modal.mode === 'create' ? 'Add User' : 'Edit User'}
					initial={modal.mode === 'edit' ? modal.user : undefined}
					passwordRequired={modal.mode === 'create'}
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
