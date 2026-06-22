import PageUnavailable from '@/components/pages/page-unavailable';
import { GetServerFlags } from '@/models/Flags';

export default async function About() {
	const enabled = (await GetServerFlags()).includes('page_about');

	if (!enabled) return <PageUnavailable />;

	return <h1>About</h1>;
}
