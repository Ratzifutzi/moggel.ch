import Button from '@/components/base/button';
import GetUser from '@/helper/GetUser';
import { GetServerFlags, ServerFlags, ToggleFlag } from '@/models/Flags';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Account() {
	const FLAGS: ServerFlags[] = await GetServerFlags();
	const SIGNUP_ALLOWED = FLAGS.includes('signup_allowed');

	const user = await GetUser();

	return (
		<>
			<h1 className='text-center text-3xl'>Account Management</h1>
			{!user ? (
				<div className='mt-4 flex h-45 w-full flex-row'>
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
			) : (
				<h2 className='text-center text-xl'>Hi there, {user.username}</h2>
			)}
		</>
	);
}
