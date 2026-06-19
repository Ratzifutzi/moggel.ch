'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { ErrorMessage, Field, Form, Formik } from 'formik';

declare global {
	interface Window {
		privateCaptcha?: {
			setup: (opts?: { autoWidget?: boolean }) => Promise<void> | void;
		};
	}
}

interface LoginFormValues {
	username: string;
	password: string;
}

export default function Login() {
	const [isMounted, setIsMounted] = useState(false);
	const captchaRef = useRef<HTMLDivElement | null>(null);
	const initialValues: LoginFormValues = { username: '', password: '' };

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isMounted || !captchaRef.current) return;

		let cancelled = false;
		const trySetup = () => {
			if (cancelled) return;
			if (window.privateCaptcha?.setup) {
				window.privateCaptcha.setup();
			} else {
				// Script not loaded yet, retry shortly
				setTimeout(trySetup, 50);
			}
		};
		trySetup();

		return () => {
			cancelled = true;
		};
	}, [isMounted]);

	const inputClass =
		'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';
	const errorTextClass = 'text-red-500';
	const groupClass = 'mb-3';

	return (
		<>
			<h1 className='text-center text-3xl'>Account Management</h1>
			<h2 className='text-center'>Log in</h2>

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
					return errors;
				}}
				onSubmit={(values, { setSubmitting, setErrors }) => {
					setTimeout(() => {
						try {
							// Simulated failure for testing
							setErrors({
								username: 'Invalid username or password',
								password: 'Invalid username or password',
							});
						} finally {
							setSubmitting(false);
						}
					}, 1000);
				}}
			>
				{({ isSubmitting }) => (
					<Form
						method='POST'
						action='https://captcha.hyper-tech.ch/form/0d8d516ee9f44d26a2777f535232574b'
					>
						<div className={groupClass}>
							<label>
								Username <RequiredIndicator />
							</label>
							<Field
								type='username'
								name='username'
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
							<label>
								Password <RequiredIndicator />
							</label>
							<Field
								type='password'
								name='password'
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

						<div className='min-h-25 font-normal'>
							{isMounted && (
								<div
									ref={captchaRef}
									className='private-captcha'
									data-sitekey='81551d8e59144070b02190624bbf6d26'
								></div>
							)}
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
