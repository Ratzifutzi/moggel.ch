import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/partials/navbar/navbar';

export const metadata: Metadata = {
	title: 'Moggel',
	description: '',
};
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<div className="fixed inset-0 flex items-center justify-center">
					<div className="flex h-full w-full flex-row gap-5 md:max-h-[80svh] md:w-[85%] lg:aspect-3/4 lg:h-auto lg:w-[55%] lg:max-w-225">
						<div className="h-full w-65 md:flex" id="navbar">
							<Navbar />
						</div>
						<div className="h-full w-full" id="content">
							{children}
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
