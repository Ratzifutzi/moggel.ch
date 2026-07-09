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
			<div className='text-center'>
				<h1 className='mb-5 text-5xl'>About Applesauce</h1>

				<div className='mt-2 mb-2 w-full border-t-2 border-dotted' />
			</div>

			<div className='flex flex-col gap-25'>
				<Image src={Slide1} alt='S1' />
				<Image src={Slide2} alt='S2' />
				<Image src={Slide3} alt='S3' />
				<Image src={Slide4} alt='S4' />
			</div>
		</div>
	);
}
