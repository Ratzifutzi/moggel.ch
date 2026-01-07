export default function Home() {
	return (
		<main className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
			<img
				src="/assets/images/maintenance.png"
				alt="Maintenance Illustration"
				className="mb-4 h-auto w-full max-w-md object-contain"
			/>
			<div className="flex flex-col items-center">
				<p className="mt-6 max-w-prose text-center text-lg">
					The server didn't want to serve, and then Moggel broke something.
					Check back later please, and visit Moggel on{' '}
					<a
						href="https://desocialworld.com/u/Moggel"
						className="text-blue-500 underline"
					>
						DeSo
					</a>{' '}
					meanwhile.
				</p>
			</div>
		</main>
	);
}
