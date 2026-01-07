import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/partials/navbar/navbar';

export const metadata: Metadata = {
	title: 'Moggel',
	description: '',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<main className="flex h-screen w-screen items-center justify-center overflow-hidden">
					<div className="flex h-screen w-screen flex-row gap-5 md:aspect-3/4 md:h-auto md:max-h-[80vh] md:w-[55%] md:max-w-225">
						<div className="hidden h-full w-65 md:flex" id="navbar">
							<Navbar />
						</div>

						<div className="h-full w-full bg-black" id="content">
							{children}
						</div>
					</div>
				</main>
			</body>
		</html>
	);
}
