import PageUnavailable from '@/components/pages/page-unavailable';
import { GetServerFlags } from '@/models/Flags';

export default async function Home() {
	const enabled = (await GetServerFlags()).includes('page_deso');

	if (!enabled) return <PageUnavailable />;

	return <h1>Deso</h1>;
}
