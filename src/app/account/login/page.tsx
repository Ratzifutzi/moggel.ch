'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/base/button';
import RequiredIndicator from '@/components/form/RequiredIndicator';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import PrivateCaptcha from '@private-captcha/private-captcha-react';
import Image from 'next/image';

import WarnIcon from '@public/assets/images/icons/warn.png';

interface CaptchaWidgetInstance {
	reset: () => void;
	solution: () => string;
}

interface LoginFormValues {
	username: string;
	password: string;
	captcha: string;
}

export default function Login() {
	const [mounted, setMounted] = useState(false);
	const [submitError, setSubmitError] = useState<string | undefined>(undefined);

	const widgetRef = useRef<CaptchaWidgetInstance | null>(null);

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
				onSubmit={(values, { setSubmitting, resetForm }) => {
					setTimeout(() => {
						try {
							// Simulated failure for testing
							setSubmitError('Invalid Username or password.');
						} finally {
							setSubmitting(false);

							widgetRef.current?.reset();
							resetForm();
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

						<div
							className={`${groupClass} flex min-h-25 flex-col items-center`}
						>
							{mounted && (
								<PrivateCaptcha
									siteKey='2401f0d3593642eb9347568afc1c3211'
									theme='light'
									puzzleEndpoint='https://captcha.hyper-tech.ch/puzzle'
									onInit={(detail) => {
										widgetRef.current = detail.widget as CaptchaWidgetInstance;
									}}
									onFinish={(detail) => {
										widgetRef.current = detail.widget as CaptchaWidgetInstance;
										setFieldValue('captcha', detail.widget.solution());
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
