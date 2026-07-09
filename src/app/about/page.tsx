import PageUnavailable from '@/components/pages/page-unavailable';
import { GetServerFlags } from '@/models/Flags';
import Image from 'next/image';

import Slide1 from '@public/assets/pages/about/s01.png';
import Slide2 from '@public/assets/pages/about/s02.png';
import Slide3 from '@public/assets/pages/about/s03.png';
import Slide4 from '@public/assets/pages/about/s04.png';
import Slide5 from '@public/assets/pages/about/s05.png';
import Slide6 from '@public/assets/pages/about/s06.png';
import Slide7 from '@public/assets/pages/about/s07.png';
import Slide8 from '@public/assets/pages/about/s08.png';

export default async function About() {
	const enabled = (await GetServerFlags()).includes('page_about');

	if (!enabled) return <PageUnavailable />;

	return (
		<div>
			<div className='text-center'>
				<h1 className='mb-5 text-5xl'>About Moggel</h1>

				<div className='mt-2 mb-2 w-full border-t-2 border-dotted' />
			</div>
			<div className='flex flex-col gap-25'>
				<Image src={Slide1} alt='S1' />
				<Image src={Slide2} alt='S2' />
				<Image src={Slide3} alt='S3' />
				<Image src={Slide4} alt='S4' />
				<Image src={Slide5} alt='S5' />
				<Image src={Slide6} alt='S6' />
				<Image src={Slide7} alt='S7' />
				<Image src={Slide8} alt='S8' />
			</div>

			<div className='mt-5 flex w-full flex-row justify-center'>
				<a
					href='https://www.abuseipdb.com/user/193290'
					title='AbuseIPDB is an IP address blacklist for webmasters and sysadmins to report IP addresses engaging in abusive behavior on their networks'
				>
					{/* eslint-disable-next-line @next/next/no-img-element*/}
					<img
						src='https://www.abuseipdb.com/contributor/193290.svg'
						alt='AbuseIPDB Contributor Badge'
						width={'401'}
					/>
				</a>
			</div>
		</div>
	);
}
