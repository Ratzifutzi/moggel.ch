import type { Metadata } from 'next';
import './globals.css';

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
				<main className="flex h-screen w-screen items-center justify-center">
					<div className="relative h-screen w-screen max-w-300 md:aspect-3/4 md:h-auto md:max-h-[80vh] md:w-[40%] md:max-w-225">
						<div className="h-full w-full bg-black" id="content">
							{children}
						</div>
					</div>
				</main>
			</body>
		</html>
	);
}
