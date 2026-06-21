import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '../components/partials/navbar/navbar';
import Providers from './providers';

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
		<html lang='en'>
			<body>
				<Script
					src='https://captcha.hyper-tech.ch/widget/js/privatecaptcha.js'
					strategy='afterInteractive'
				/>
				<Providers>
					<div className='fixed inset-0 flex items-start justify-center lg:items-center'>
						<div className='flex h-full min-h-0 w-full flex-col gap-5 md:max-h-[80svh] md:w-[85%] lg:aspect-3/4 lg:h-auto lg:w-[55%] lg:max-w-225 lg:flex-row'>
							<div className='mt-5 lg:mt-0 lg:flex lg:w-65' id='navbar'>
								<Navbar />
							</div>
							<div
								className='min-h-0 w-full flex-1 overflow-y-auto px-2 lg:flex-none'
								id='content'
							>
								{children}
							</div>
						</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}
