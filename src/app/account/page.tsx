import Button from '@/components/base/button';

export default function Home() {
	return (
		<>
			<h1 className='mb-4 text-center text-3xl'>Account Management</h1>
			<div className='flex h-45 w-full flex-row'>
				{/* Sign Up */}
				<div className='relative flex flex-1 flex-col items-center justify-center'>
					<Button disabled={!process.env.NEXT_PUBLIC_SIGNUP_ENABLED}>
						Create Account
					</Button>
					{!process.env.NEXT_PUBLIC_SIGNUP_ENABLED && (
						<p className='absolute translate-y-8 text-sm'>
							Account creation is disabled.
						</p>
					)}
				</div>

				<div className='h-full border border-dashed border-black' />

				{/* Log In */}
				<div className='flex flex-1 flex-col items-center justify-center'>
					<Button>Log In</Button>
				</div>
			</div>
		</>
	);
}
