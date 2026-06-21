import Comic from '@/models/Comic';
import { notFound } from 'next/navigation';
import ComicView from '@/components/pages/comic-view';
import type { Metadata } from 'next';
import Link from 'next/link';

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

	return (
		<>
			<div className='text-center'>
				<h1 className='mb-1 text-5xl'>Welcome to Moggel!</h1>
				<h2 className=''>
					Below is the most recent cartoon! All the other cartoons can be found
					in the{' '}
					<Link href={'/archive'} className='underline'>
						Archive!
					</Link>
				</h2>
				<div className='mt-2 mb-2 w-full border-t-2 border-dotted' />
			</div>

			<ComicView comic={doc} />
		</>
	);
}
