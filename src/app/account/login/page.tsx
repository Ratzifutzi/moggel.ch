'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { ErrorMessage, Field, Form, Formik } from 'formik';

interface LoginFormValues {
	username: string;
	password: string;
}

export default function Login() {
	const [isMounted, setIsMounted] = useState(false);
	const initialValues: LoginFormValues = { username: '', password: '' };

	useEffect(() => {
		console.log('Mounted');
		setIsMounted(true);
	}, []);

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

						{isMounted && (
							<div
								className='private-captcha'
								data-sitekey='81551d8e59144070b02190624bbf6d26'
							></div>
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
