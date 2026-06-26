import Comic from '@/models/Comic';
import Link from 'next/link';
import PaginationClient from './PaginationClient';
import GetUser from '@/helper/GetUser';
import { GetServerFlags } from '@/models/Flags';
import PageUnavailable from '@/components/pages/page-unavailable';
import SearchForm from './SearchForm';
import ClearSearchLink from './ClearSearchLink';
import { PendingProvider, FadeWhilePending } from './PendingContext';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

type SearchParams = Promise<{
	page?: string | string[];
	q?: string | string[];
}>;

function escapeRegex(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function Archive({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const enabled = (await GetServerFlags()).includes('page_archive');

	if (!enabled) return <PageUnavailable />;

	const { page: rawPage, q: rawQ } = await searchParams;
	const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
	const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
	const qParam = Array.isArray(rawQ) ? rawQ[0] : rawQ;
	const query = (qParam ?? '').trim();

	const user = await GetUser();
	const isLoggedIn = !!user;

	const filter = query
		? (() => {
				const regex = new RegExp(escapeRegex(query), 'i');
				return {
					$or: [
						{ title: regex },
						{ description: regex },
						{ permalink: regex },
						{ meta: regex },
					],
				};
			})()
		: {};

	const total = await Comic.countDocuments(filter);
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const docs = await Comic.find(filter)
		.select('title description permalink titleImage slide1 views createdAt')
		.sort({ createdAt: -1 })
		.skip((currentPage - 1) * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.lean();

	const comics = docs.map((c) => ({
		_id: String(c._id),
		title: c.title,
		description: c.description,
		permalink: c.permalink,
		listImageUrl: c.titleImage || c.slide1.url,
		viewCount: c.views?.length ?? 0,
	}));

	return (
		<PendingProvider>
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-3xl'>Archive</h1>
				</div>

				<SearchForm initialQuery={query} />
				{query && (
					<p className='-mt-4 text-sm text-gray-600'>
						Showing results for: {query}.{' '}
						<ClearSearchLink className='underline'>
							Show all comics
						</ClearSearchLink>
					</p>
				)}

				<FadeWhilePending>
					{comics.length === 0 ? (
						<p>
							{query ? `No comics found for "${query}".` : 'No comics yet.'}
						</p>
					) : (
						<>
							{/* Mobile: compact list layout */}
							<div className='flex flex-col gap-3 sm:hidden'>
								{comics.map((c) => (
									<Link
										key={c._id}
										href={`/comic/${c.permalink}`}
										className='group flex flex-row items-stretch overflow-hidden rounded-lg border-2 border-dotted bg-white text-black transition-all active:scale-[0.99]'
									>
										<div className='aspect-square h-24 w-24 flex-shrink-0 overflow-hidden bg-gray-100'>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={c.listImageUrl}
												alt={c.title}
												className='h-full w-full object-cover'
											/>
										</div>
										<div className='flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2'>
											<span className='line-clamp-2 text-base leading-tight'>
												{c.title}
											</span>
											{isLoggedIn ? (
												<span className='text-xs text-gray-600'>
													{c.description} - {c.viewCount}{' '}
													{c.viewCount === 1 ? 'view' : 'views'}
												</span>
											) : (
												<span className='line-clamp-2 text-xs text-gray-600'>
													{c.description}
												</span>
											)}
										</div>
									</Link>
								))}
							</div>

							{/* Tablet/Desktop: grid layout */}
							<div className='hidden gap-4 sm:grid sm:grid-cols-2'>
								{comics.map((c) => (
									<Link
										key={c._id}
										href={`/comic/${c.permalink}`}
										className='group flex flex-col overflow-hidden rounded-lg border-2 border-dotted bg-white text-black transition-all md:hover:-translate-y-0.5'
									>
										<div className='aspect-2/1 w-full overflow-hidden bg-gray-100'>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={c.listImageUrl}
												alt={c.title}
												className='h-full w-full object-cover transition-transform group-hover:scale-105'
											/>
										</div>
										<div className='flex flex-col gap-1 p-3'>
											<span className='line-clamp-2 text-lg leading-tight'>
												{c.title}
											</span>
											{isLoggedIn ? (
												<span className='text-sm text-gray-600'>
													{c.description} - {c.viewCount}{' '}
													{c.viewCount === 1 ? 'view' : 'views'}
												</span>
											) : (
												<span className='line-clamp-3 text-sm text-gray-600'>
													{c.description}
												</span>
											)}
										</div>
									</Link>
								))}
							</div>

							<PaginationClient
								currentPage={currentPage}
								totalPages={totalPages}
								query={query}
								total={total}
							/>
						</>
					)}
				</FadeWhilePending>
			</div>
		</PendingProvider>
	);
}
