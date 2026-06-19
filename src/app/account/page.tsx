import Button from '@/components/base/button';
import { GetServerFlags, ServerFlags, ToggleFlag } from '@/models/Flags';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Account() {
	const FLAGS: ServerFlags[] = await GetServerFlags();
	const SIGNUP_ALLOWED = FLAGS.includes('signup_allowed');

	return (
		<>
			<h1 className='mb-4 text-center text-3xl'>Account Management</h1>
			<div className='flex h-45 w-full flex-row'>
				{/* Sign Up */}
				<div className='relative flex flex-1 flex-col items-center justify-center'>
					<div className='mb-5 aspect-square h-20 bg-black'></div>
					<Button disabled={!SIGNUP_ALLOWED}>Create Account</Button>
					{!SIGNUP_ALLOWED && (
						<p className='text-sm'>Account creation is disabled.</p>
					)}
				</div>

				<div className='h-full border border-dashed border-black' />

				{/* Log In */}
				<div className='flex flex-1 flex-col items-center justify-center'>
					<div className='mb-5 aspect-square h-20 bg-black'></div>
					<Link href='/account/login'>
						<Button>Log In</Button>
					</Link>
					{!SIGNUP_ALLOWED && <div className='h-5' />}
				</div>
			</div>
		</>
	);
}
