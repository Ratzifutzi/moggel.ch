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
				<Image src={Slide1} alt='About Moggel, and moggel.ch' />
				<Image src={Slide2} alt='You have found Moggels world. A realm of hand-drawn cartoons, absurd stories, and heaps of applesauce!' />
				<Image src={Slide3} alt='About me…: I have been drawing Moggel cartoons (on paper) for decades already.. especially during boring school lessons..' />
				<Image src={Slide4} alt='In 2022, I decided to tell Moggels stories to the public.' />
				<Image src={Slide5} alt='Searching for an independent, decentralized platform that gives me control over my content, I found DeSo, and thought that it would be a good place.' />
				<Image src={Slide6} alt='By now, I do not draw on paper anymore, and am using a tablet with a digital pencil.' />
				<Image src={Slide7} alt='But even with the tablet, I draw like on paper: minimalistic, without any helping apps, tools or effects.' />
				<Image src={Slide8} alt='... and without AI!' />
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
