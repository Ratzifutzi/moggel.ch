'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import PrivateCaptcha from '@private-captcha/private-captcha-react';

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
	captcha: string;
}

export default function Login() {
	const [mounted, setMounted] = useState(false);
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
						errors.password = 'Please complete the captcha.';
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
				{({ isSubmitting, setFieldValue }) => (
					<Form
						method='POST'
						action='https://captcha.hyper-tech.ch/form/d9dbc07371cc45ffa1de68311319b789'
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

						{mounted && (
							<PrivateCaptcha
								siteKey='2401f0d3593642eb9347568afc1c3211'
								theme='light'
								puzzleEndpoint='https://captcha.hyper-tech.ch/puzzle'
								onFinish={(detail) => {
									setFieldValue('captcha', 'TBD');
								}}
							/>
						)}

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
