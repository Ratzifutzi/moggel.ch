import Comic from '@/models/Comic';
import Link from 'next/link';
import Button from '@/components/base/button';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

type SearchParams = Promise<{ page?: string | string[] }>;

export default async function Archive({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { page: rawPage } = await searchParams;
	const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
	const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

	const total = await Comic.countDocuments();
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const docs = await Comic.find()
		.select('title permalink slide1 views createdAt')
		.sort({ createdAt: -1 })
		.skip((currentPage - 1) * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.lean();

	const comics = docs.map((c) => ({
		_id: String(c._id),
		title: c.title,
		permalink: c.permalink,
		slide1: c.slide1,
		viewCount: c.views?.length ?? 0,
	}));

	return (
		<div className='flex flex-col gap-5'>
			<h1 className='text-3xl'>Archive</h1>

			{comics.length === 0 ? (
				<p>No comics yet.</p>
			) : (
				<>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						{comics.map((c) => (
							<Link
								key={c._id}
								href={`/comic/${c.permalink}`}
								className='group flex flex-col overflow-hidden rounded-lg border-2 border-dotted bg-white text-black transition-all md:hover:-translate-y-0.5'
							>
								<div className='aspect-square w-full overflow-hidden bg-gray-100'>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={c.slide1.url}
										alt={c.slide1.alt}
										className='h-full w-full object-cover transition-transform group-hover:scale-105'
									/>
								</div>
								<div className='flex flex-col gap-1 p-3'>
									<span className='line-clamp-2 text-lg leading-tight'>
										{c.title}
									</span>
									<span className='text-sm text-gray-600'>
										{c.viewCount} {c.viewCount === 1 ? 'view' : 'views'}
									</span>
								</div>
							</Link>
						))}
					</div>

					{totalPages > 1 && (
						<div className='flex flex-row items-center justify-center gap-3'>
							{currentPage > 1 ? (
								<Link href={`/archive?page=${currentPage - 1}`}>
									<Button>Previous</Button>
								</Link>
							) : (
								<Button disabled>Previous</Button>
							)}
							<span>
								Page {currentPage} of {totalPages}
							</span>
							{currentPage < totalPages ? (
								<Link href={`/archive?page=${currentPage + 1}`}>
									<Button>Next</Button>
								</Link>
							) : (
								<Button disabled>Next</Button>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
