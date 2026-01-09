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
			<body className="flex h-screen w-screen items-center justify-center overflow-hidden">
				<div className="flex h-screen w-screen flex-row gap-5 md:max-h-[80vh] md:w-[85%] lg:aspect-3/4 lg:h-auto lg:w-[55%] lg:max-w-225">
					<div className="hidden h-full w-65 md:flex" id="navbar">
						<Navbar />
					</div>

					<div className="h-full w-full bg-gray-300" id="content">
						{children}
					</div>
				</div>
			</body>
		</html>
	);
}
