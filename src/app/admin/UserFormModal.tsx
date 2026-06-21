'use client';

import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { useEffect, useState } from 'react';

export type UserFormValues = {
	username: string;
	password: string;
	admin: boolean;
	locked: boolean;
};

type Props = {
	title: string;
	initial?: Partial<UserFormValues>;
	passwordRequired: boolean;
	submitting: boolean;
	error?: string;
	onClose: () => void;
	onSubmit: (values: UserFormValues) => void;
};

export default function UserFormModal({
	title,
	initial,
	passwordRequired,
	submitting,
	error,
	onClose,
	onSubmit,
}: Props) {
	const [values, setValues] = useState<UserFormValues>({
		username: initial?.username ?? '',
		password: '',
		admin: initial?.admin ?? false,
		locked: initial?.locked ?? false,
	});

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	const inputClass =
		'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
			onClick={onClose}
		>
			<div
				className='w-full max-w-md rounded-lg bg-white p-5 text-black'
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className='mb-3 text-2xl'>{title}</h2>

				{error && <p className='mb-3 text-red-500'>{error}</p>}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(values);
					}}
					className='flex flex-col gap-3'
				>
					<div>
						<label htmlFor='username'>
							Username <RequiredIndicator />
						</label>
						<input
							id='username'
							type='text'
							value={values.username}
							onChange={(e) =>
								setValues((v) => ({ ...v, username: e.target.value }))
							}
							className={inputClass}
							disabled={submitting}
							required
						/>
					</div>

					<div>
						<label htmlFor='password'>
							Password{' '}
							{passwordRequired ? (
								<RequiredIndicator />
							) : (
								<span className='text-sm text-gray-500'>
									(leave empty to keep)
								</span>
							)}
						</label>
						<input
							id='password'
							type='password'
							value={values.password}
							onChange={(e) =>
								setValues((v) => ({ ...v, password: e.target.value }))
							}
							className={`${inputClass} font-mono`}
							disabled={submitting}
							required={passwordRequired}
							minLength={passwordRequired ? 8 : undefined}
						/>
					</div>

					<label className='flex flex-row items-center gap-2'>
						<input
							type='checkbox'
							checked={values.admin}
							onChange={(e) =>
								setValues((v) => ({ ...v, admin: e.target.checked }))
							}
							disabled={submitting}
						/>
						Admin
					</label>

					<label className='flex flex-row items-center gap-2'>
						<input
							type='checkbox'
							checked={values.locked}
							onChange={(e) =>
								setValues((v) => ({ ...v, locked: e.target.checked }))
							}
							disabled={submitting}
						/>
						Locked
					</label>

					<div className='mt-2 flex flex-row justify-end gap-2'>
						<Button type='button' onClick={onClose} disabled={submitting}>
							Cancel
						</Button>
						<Button type='submit' disabled={submitting}>
							Save
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
