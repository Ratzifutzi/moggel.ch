import Comic from '@/models/Comic';
import { notFound } from 'next/navigation';
import ComicView from '@/components/pages/comic-view';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
	const doc = await Comic.findOne({})
		.sort({ createdAt: -1 })
		.select('title description meta')
		.lean();

	if (!doc) return { title: 'No comics yet' };

	return {
		title: doc.title,
		description: doc.meta || doc.description.slice(0, 160),
	};
}

export default async function Home() {
	const doc = await Comic.findOne({})
		.sort({ createdAt: -1 })
		.select('title description permalink slide1 slide2')
		.lean();

	if (!doc) notFound();

	return <ComicView comic={doc} />;
}
