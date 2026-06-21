'use client';

import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { useEffect, useState } from 'react';

export type ComicFormValues = {
	title: string;
	description: string;
	desoLink: string;
	faviconUrl: string;
	permalink: string;
	titleImage: string;
	slide1: { url: string; alt: string };
	slide2: { url: string; alt: string };
	meta: string;
};

type Props = {
	heading: string;
	initial?: Partial<ComicFormValues>;
	submitting: boolean;
	error?: string;
	onClose: () => void;
	onSubmit: (values: ComicFormValues) => void;
};

const EMPTY: ComicFormValues = {
	title: '',
	description: '',
	desoLink: '',
	faviconUrl: '',
	permalink: '',
	titleImage: '',
	slide1: { url: '', alt: '' },
	slide2: { url: '', alt: '' },
	meta: '',
};

export default function ComicFormModal({
	heading,
	initial,
	submitting,
	error,
	onClose,
	onSubmit,
}: Props) {
	const [values, setValues] = useState<ComicFormValues>({
		...EMPTY,
		...initial,
		slide1: { ...EMPTY.slide1, ...initial?.slide1 },
		slide2: { ...EMPTY.slide2, ...initial?.slide2 },
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
				className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 text-black'
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className='mb-3 text-2xl'>{heading}</h2>

				{error && <p className='mb-3 text-red-500'>{error}</p>}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(values);
					}}
					className='flex flex-col gap-3'
				>
					<div>
						<label htmlFor='title'>
							Title <RequiredIndicator />
						</label>
						<input
							id='title'
							type='text'
							value={values.title}
							onChange={(e) =>
								setValues((v) => ({ ...v, title: e.target.value }))
							}
							className={inputClass}
							disabled={submitting}
							required
						/>
					</div>

					<div>
						<label htmlFor='description'>
							Description <RequiredIndicator />
						</label>
						<textarea
							id='description'
							value={values.description}
							onChange={(e) =>
								setValues((v) => ({ ...v, description: e.target.value }))
							}
							className={`${inputClass} min-h-24`}
							disabled={submitting}
							required
						/>
					</div>

					<div>
						<label htmlFor='desoLink'>
							DeSo Link <RequiredIndicator />
						</label>
						<input
							id='desoLink'
							type='url'
							value={values.desoLink}
							onChange={(e) =>
								setValues((v) => ({ ...v, desoLink: e.target.value }))
							}
							className={inputClass}
							disabled={submitting}
							required
						/>
					</div>

					<div>
						<label htmlFor='faviconUrl'>Favicon URL</label>
						<input
							id='faviconUrl'
							type='url'
							value={values.faviconUrl}
							onChange={(e) =>
								setValues((v) => ({ ...v, faviconUrl: e.target.value }))
							}
							className={inputClass}
							disabled={submitting}
						/>
					</div>

					<div>
						<label htmlFor='permalink'>
							Permalink <RequiredIndicator />
						</label>
						<input
							id='permalink'
							type='text'
							value={values.permalink}
							onChange={(e) =>
								setValues((v) => ({ ...v, permalink: e.target.value }))
							}
							className={`${inputClass} font-mono`}
							placeholder='my-comic-slug'
							pattern='[a-z0-9-]+'
							disabled={submitting}
							required
						/>
						<span className='text-sm text-gray-500'>
							Lowercase letters, numbers and dashes only.
						</span>
					</div>

					<div>
						<label htmlFor='titleImage'>Title Image URL</label>
						<input
							id='titleImage'
							type='url'
							value={values.titleImage}
							onChange={(e) =>
								setValues((v) => ({ ...v, titleImage: e.target.value }))
							}
							className={inputClass}
							disabled={submitting}
						/>
						<span className='text-sm text-gray-500'>
							Shown on the archive list. Falls back to slide 1 if empty.
						</span>
					</div>

					<fieldset className='rounded-md border border-dotted p-3'>
						<legend className='px-1'>Slide 1</legend>
						<div className='flex flex-col gap-2'>
							<div>
								<label htmlFor='slide1-url'>
									URL <RequiredIndicator />
								</label>
								<input
									id='slide1-url'
									type='text'
									value={values.slide1.url}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											slide1: { ...v.slide1, url: e.target.value },
										}))
									}
									className={inputClass}
									disabled={submitting}
									required
								/>
							</div>
							<div>
								<label htmlFor='slide1-alt'>
									Alt Text <RequiredIndicator />
								</label>
								<input
									id='slide1-alt'
									type='text'
									value={values.slide1.alt}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											slide1: { ...v.slide1, alt: e.target.value },
										}))
									}
									className={inputClass}
									disabled={submitting}
									required
								/>
							</div>
						</div>
					</fieldset>

					<fieldset className='rounded-md border border-dotted p-3'>
						<legend className='px-1'>Slide 2</legend>
						<div className='flex flex-col gap-2'>
							<div>
								<label htmlFor='slide2-url'>
									URL <RequiredIndicator />
								</label>
								<input
									id='slide2-url'
									type='text'
									value={values.slide2.url}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											slide2: { ...v.slide2, url: e.target.value },
										}))
									}
									className={inputClass}
									disabled={submitting}
									required
								/>
							</div>
							<div>
								<label htmlFor='slide2-alt'>
									Alt Text <RequiredIndicator />
								</label>
								<input
									id='slide2-alt'
									type='text'
									value={values.slide2.alt}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											slide2: { ...v.slide2, alt: e.target.value },
										}))
									}
									className={inputClass}
									disabled={submitting}
									required
								/>
							</div>
						</div>
					</fieldset>

					<div>
						<label htmlFor='meta'>Meta</label>
						<textarea
							id='meta'
							value={values.meta}
							onChange={(e) =>
								setValues((v) => ({ ...v, meta: e.target.value }))
							}
							className={`${inputClass} min-h-16`}
							disabled={submitting}
						/>
					</div>

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
