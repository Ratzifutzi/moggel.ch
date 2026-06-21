import Comic from '@/models/Comic';
import { notFound } from 'next/navigation';
import ComicView from '@/components/pages/comic-view';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Params = Promise<{ permalink: string }>;

export async function generateMetadata({
	params,
}: {
	params: Params;
}): Promise<Metadata> {
	const { permalink } = await params;
	const doc = await Comic.findOne({ permalink })
		.select('title description meta titleImage slide1 faviconUrl')
		.lean();

	if (!doc) return { title: 'Comic not found' };

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moggel.ch';
	const pageUrl = `${siteUrl}/comic/${doc.permalink ?? permalink}`;

	const rawImage = doc.titleImage || doc.slide1?.url || '';
	const imageUrl = rawImage
		? rawImage.startsWith('http')
			? rawImage
			: `${siteUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
		: undefined;

	const description = doc.meta || doc.description.slice(0, 160);

	return {
		metadataBase: new URL(siteUrl),
		title: doc.title,
		description,
		alternates: { canonical: pageUrl },
		openGraph: {
			type: 'article',
			siteName: 'Moggel',
			title: doc.title,
			description,
			url: pageUrl,
			images: imageUrl
				? [
						{
							url: imageUrl,
							alt: doc.slide1?.alt || doc.title,
						},
					]
				: undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title: doc.title,
			description,
			images: imageUrl ? [imageUrl] : undefined,
		},
		icons: doc.faviconUrl ? { icon: doc.faviconUrl } : undefined,
		other: {
			// Generic image meta consumed by some embeds (e.g. DeSocialWorld)
			...(imageUrl ? { image: imageUrl } : {}),
		},
	};
}

export default async function ComicPage({ params }: { params: Params }) {
	const { permalink } = await params;

	const doc = await Comic.findOne({ permalink })
		.select('title description permalink slide1 slide2')
		.lean();

	if (!doc) notFound();

	return <ComicView comic={doc} />;
}
