export default function Home() {
	return (
		<main className="grid min-h-screen grid-rows-[1fr_auto_1fr] place-items-center p-24">
			<img
				src="/assets/images/maintenance.png"
				alt="Moggel Character hitting a Server"
				className="mb-8 h-100"
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
