import Button from '@/components/base/button';
import GetUser from '@/helper/GetUser';
import { GetServerFlags, ServerFlags } from '@/models/Flags';
import Link from 'next/link';
import AccountPageClient from './client';
import Image from 'next/image';

import CreateAccountIcon from '@public/assets/images/icons/CreateAccount.png';
import LoginIcon from '@public/assets/images/icons/Login.png';
import PageUnavailable from '@/components/pages/page-unavailable';

export const dynamic = 'force-dynamic';

export default async function Account() {
	const FLAGS: ServerFlags[] = await GetServerFlags();
	const SIGNUP_ALLOWED = FLAGS.includes('signup_allowed');

	const user = await GetUser();

	const enabled = (await GetServerFlags()).includes('page_account');

	if (!enabled) return <PageUnavailable />;

	return (
		<>
			<h1 className='text-center text-3xl'>Account Management</h1>
			{!user ? (
				<div className='mt-4 flex h-45 w-full flex-row'>
					{/* Sign Up */}
					<div className='relative flex flex-1 flex-col items-center justify-center'>
						<Image
							src={CreateAccountIcon}
							alt='Create Account Icon'
							className='mb-5 size-20 object-contain'
						/>
						<Button disabled={!SIGNUP_ALLOWED}>Create Account</Button>
						{!SIGNUP_ALLOWED && (
							<p className='text-sm'>Account creation is disabled.</p>
						)}
					</div>

					<div className='h-full border border-dashed border-black' />

					{/* Log In */}
					<div className='flex flex-1 flex-col items-center justify-center'>
						<Image
							src={LoginIcon}
							alt='Login Icon'
							className='mb-5 size-20 object-contain'
						/>
						<Link href='/account/login'>
							<Button>Log In</Button>
						</Link>
						{!SIGNUP_ALLOWED && <div className='h-5' />}
					</div>
				</div>
			) : (
				<AccountPageClient
					user={{
						username: user.username,
						password: '',
						locked: user.locked,
						admin: user.admin,
					}}
				/>
			)}
		</>
	);
}
