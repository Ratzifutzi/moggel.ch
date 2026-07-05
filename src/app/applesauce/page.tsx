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
		<div>
			<div className='flex flex-col gap-25'>
				<Image src={Slide1} alt='This is my favorite applesauce brand.' />
				<Image src={Slide2} alt='Its brand name originates from the ancient word APFELMUS in a foreign language...' />
				<Image src={Slide3} alt='It is pronounced like UP-FELL-MOOSE. So, MUS is spoken MOOSE.' />
				<Image src={Slide4} alt='Now you know.' />
			</div>
		</div>
	);
}
