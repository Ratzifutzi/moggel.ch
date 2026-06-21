import Comic from '@/models/Comic';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{ permalink?: string | string[] }>;

export default async function RedirectPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const raw = params.permalink;
	const permalink = Array.isArray(raw) ? raw[0] : raw;

	if (!permalink) {
		redirect('/');
	}

	const comic = await Comic.findOneAndUpdate(
		{ permalink },
		{ $inc: { desoClicks: 1 } },
		{ new: true },
	)
		.select('desoLink')
		.lean();

	if (!comic) {
		redirect('/');
	}

	redirect(comic.desoLink);
}
