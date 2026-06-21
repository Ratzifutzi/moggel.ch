import Comic from '@/models/Comic';
import Button from '@/components/base/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ViewTracker from './ViewTracker';
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
		.select('title description desoLink permalink slide1 slide2')
		.lean();

	if (!doc) notFound();

	return (
		<div className='flex flex-col gap-4'>
			<ViewTracker permalink={doc.permalink} />

			<h1 className='text-center text-3xl'>{doc.title}</h1>
			<p className='text-center whitespace-pre-line'>{doc.description}</p>

			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={doc.slide1.url}
				alt={doc.slide1.alt}
				className='w-full rounded'
			/>

			<div
				className='relative w-full overflow-hidden rounded'
				style={{
					maskImage:
						'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
					WebkitMaskImage:
						'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={doc.slide2.url} alt={doc.slide2.alt} className='w-full' />
			</div>

			<div className='flex justify-center pb-6'>
				<Link href={`/redirect?permalink=${encodeURIComponent(doc.permalink)}`}>
					<Button>Continue reading on DeSo</Button>
				</Link>
			</div>
		</div>
	);
}
