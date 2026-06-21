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
		.select('title description meta')
		.lean();

	if (!doc) return { title: 'Comic not found' };

	return {
		title: doc.title,
		description: doc.meta || doc.description.slice(0, 160),
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
