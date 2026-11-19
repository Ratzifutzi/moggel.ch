'use client';

import Button from '@/components/base/button';
import { useEffect, useRef } from 'react';

type Props = {
	heading: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export default function ConfirmModal({
	heading,
	message,
	confirmLabel,
	onConfirm,
	onCancel,
}: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);

	// Move focus into the dialog so Tab reaches its buttons first.
	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onCancel();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onCancel]);

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
			onClick={onCancel}
		>
			<div
				ref={dialogRef}
				role='alertdialog'
				aria-modal='true'
				aria-labelledby='confirm-modal-heading'
				aria-describedby='confirm-modal-message'
				tabIndex={-1}
				className='w-full max-w-md rounded-lg bg-white p-5 text-black focus:outline-none'
				onClick={(e) => e.stopPropagation()}
			>
				<h2 id='confirm-modal-heading' className='mb-3 text-2xl'>
					{heading}
				</h2>

				<p id='confirm-modal-message'>{message}</p>

				<div className='mt-4 flex flex-row justify-end gap-2'>
					<Button type='button' onClick={onCancel}>
						Cancel
					</Button>
					<Button type='button' onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
