import PageUnavailable from '@/components/pages/page-unavailable';
import { GetServerFlags } from '@/models/Flags';

import Slide1 from '@public/assets/pages/applesauce/s01.png';
import Slide2 from '@public/assets/pages/applesauce/s02.png';
import Slide3 from '@public/assets/pages/applesauce/s03.png';
import Slide4 from '@public/assets/pages/applesauce/s04.png';
import Image from 'next/image';

export default async function Applesauce() {
	const enabled = (await GetServerFlags()).includes('page_applesauce');

	if (!enabled) return <PageUnavailable />;

	return (
		<div className='flex flex-col gap-4'>
			<Image src={Slide1} alt='S1' />
			<Image src={Slide2} alt='S2' />
			<Image src={Slide3} alt='S3' />
			<Image src={Slide4} alt='S4' />
		</div>
	);
}
