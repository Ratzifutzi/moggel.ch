'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import PrivateCaptcha from '@private-captcha/private-captcha-react';
import Image from 'next/image';

import WarnIcon from '@public/assets/images/icons/warn.png';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LoginFormValues } from '@/Schemas/LoginForm';

interface CaptchaWidgetInstance {
	reset: () => void;
	solution: () => string;
}

export default function Login() {
	const [mounted, setMounted] = useState(false);
	const [submitError, setSubmitError] = useState<string | undefined>(undefined);

	const router = useRouter();
	const widgetRef = useRef<CaptchaWidgetInstance | null>(null);

	const loginMutation = useMutation({
		mutationFn: async (values: LoginFormValues) => {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.error ?? 'Internal Server Error');
			}

			return res.json();
		},
		onError: (err) => setSubmitError(err.message),
		onSuccess: () => router.push('/account'),
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	const initialValues: LoginFormValues = {
		username: '',
		password: '',
		captcha: '',
	};

	const inputClass =
		'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';
	const errorTextClass = 'text-red-500';
	const groupClass = 'mb-3';

	return (
		<>
			<h1 className='text-center text-3xl'>Account Management</h1>
			<h2 className='text-center'>Log in</h2>

			{submitError && (
				<div className='mt-3 flex flex-row justify-center gap-2'>
					<Image src={WarnIcon} alt='Warning Triangle' className='size-5' />
					<span>{submitError}</span>
				</div>
			)}

			<Formik
				initialValues={initialValues}
				validate={(values: LoginFormValues) => {
					const errors: Partial<LoginFormValues> = {};
					if (!values.username) {
						errors.username = 'Required';
					}
					if (!values.password) {
						errors.password = 'Required';
					}
					if (!values.captcha) {
						errors.captcha = 'Please complete the captcha.';
					}
					return errors;
				}}
				onSubmit={async (values, { setSubmitting, resetForm }) => {
					try {
						await loginMutation.mutateAsync(values);
					} finally {
						setSubmitting(false);

						widgetRef.current?.reset();
						resetForm();
					}
				}}
			>
				{({ isSubmitting, setFieldValue }) => (
					<Form>
						<div className={groupClass}>
							<label htmlFor='username'>
								Username <RequiredIndicator />
							</label>
							<Field
								id='username'
								type='text'
								name='username'
								autoComplete='username'
								className={inputClass}
								disabled={isSubmitting}
								required
							/>
							<ErrorMessage
								name='username'
								component='div'
								className={errorTextClass}
							/>
						</div>

						<div className={groupClass}>
							<label htmlFor='password'>
								Password <RequiredIndicator />
							</label>
							<Field
								id='password'
								type='password'
								name='password'
								autoComplete='current-password'
								className={`${inputClass} font-mono`}
								disabled={isSubmitting}
								required
							/>
							<ErrorMessage
								name='password'
								component='div'
								className={errorTextClass}
							/>
						</div>

						<div
							className={`${groupClass} flex min-h-25 flex-col items-center font-[Open_Sans]`}
						>
							{mounted && (
								<PrivateCaptcha
									siteKey={process.env.NEXT_PUBLIC_PC_SITEKEY}
									theme='light'
									puzzleEndpoint='https://captcha.hyper-tech.ch/puzzle'
									onInit={(detail) => {
										widgetRef.current = detail.widget as CaptchaWidgetInstance;
										setSubmitError(undefined);
									}}
									onFinish={(detail) => {
										widgetRef.current = detail.widget as CaptchaWidgetInstance;
										setFieldValue('captcha', detail.widget.solution());
									}}
									onError={() => {
										setSubmitError(
											'Could not load Captcha. Please verify your Adblock & Privacy Settings, and allow the domain captcha.hyper-tech.ch',
										);
									}}
								/>
							)}
							<ErrorMessage
								name='captcha'
								component='div'
								className={errorTextClass}
							/>
						</div>

						<div className='flex w-full flex-col items-center'>
							<Button type='submit' disabled={isSubmitting}>
								Sign In
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</>
	);
}
