'use client';

import Button from '@/components/base/button';
import { GetServerFlags, ServerFlags, ToggleFlag } from '@/models/Flags';
import Link from 'next/link';

export default function SignUp() {
	return (
		<>
			<h1 className='mb-4 text-center text-3xl'>Account Management</h1>
			<p className='text-center'>Sign Up is not allowed.</p>
		</>
	);
}
