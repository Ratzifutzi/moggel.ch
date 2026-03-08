import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/partials/navbar/navbar';
import { UserProvider } from '@/contexts/UserContext';
import IdentityListener from '@/components/IdentityListener';

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
		<UserProvider>
			<html lang="en">
				<body>
					<IdentityListener />
					<div className="fixed inset-0 flex items-start justify-center lg:items-center">
						<div className="h-100% flex w-full flex-col gap-5 md:max-h-[80svh] md:w-[85%] lg:aspect-3/4 lg:h-auto lg:w-[55%] lg:max-w-225 lg:flex-row">
							<div className="mt-5 lg:mt-0 lg:flex lg:w-65" id="navbar">
								<Navbar />
							</div>
							<div className="mr-2 ml-2 w-full" id="content">
								{children}
							</div>
						</div>
					</div>
				</body>
			</html>
		</UserProvider>
	);
}
