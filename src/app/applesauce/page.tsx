import PageUnavailable from '@/components/pages/page-unavailable';
import { GetServerFlags } from '@/models/Flags';

export default async function Applesauce() {
	const enabled = (await GetServerFlags()).includes('page_applesauce');

	if (!enabled) return <PageUnavailable />;

	return <h1>Applesauce</h1>;
}
