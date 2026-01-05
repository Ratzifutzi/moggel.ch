export default function Home() {
	return (
		<main className="grid min-h-screen grid-rows-[1fr_auto_1fr] place-items-center p-24">
			<img
				src="/assets/images/maintenance.png"
				alt="Moggel Character hitting a Server"
				className="mb-8 h-100"
			/>
			<div className="flex flex-col items-center">
				<h1 className="text-center text-7xl font-bold">Maintenance</h1>
				<p className="mt-6 max-w-prose text-center">
					The website is currently under maintenance. Please check back later.
				</p>
			</div>
		</main>
	);
}
