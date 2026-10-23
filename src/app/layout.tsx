import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '../components/partials/navbar/navbar';
import Frame from '../components/partials/frame/frame';
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
					<Frame navbar={<Navbar />}>{children}</Frame>
				</Providers>
			</body>
		</html>
	);
}
