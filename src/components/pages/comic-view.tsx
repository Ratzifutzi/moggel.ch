import Button from '@/components/base/button';
import Link from 'next/link';
import Image from 'next/image';
import DesoImage from '@public/assets/images/deso-logo.svg';
import ViewTracker from '@/app/comic/[permalink]/ViewTracker';
import type { ISlide } from '@/models/Comic';

export interface ComicViewData {
	title: string;
	description: string;
	permalink: string;
	slide1: ISlide;
	slide2: ISlide;
}

export default function ComicView({ comic }: { comic: ComicViewData }) {
	return (
		<div className='flex flex-col gap-4'>
			<ViewTracker permalink={comic.permalink} />

			<h1 className='text-center text-3xl'>{comic.title}</h1>
			<p className='text-center whitespace-pre-line'>{comic.description}</p>

			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={comic.slide1.url}
				alt={comic.slide1.alt}
				className='w-full rounded'
			/>

			<div
				className='relative w-full overflow-hidden rounded'
				style={{
					maskImage:
						'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
					WebkitMaskImage:
						'linear-gradient(to bottom, black 0%, black 50%, transparent 75%)',
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={comic.slide2.url}
					alt={comic.slide2.alt}
					className='w-full'
				/>
			</div>

			<div className='flex flex-col items-center pb-6'>
				<Link
					href={`/redirect?permalink=${encodeURIComponent(comic.permalink)}`}
				>
					<Button>
						<Image src={DesoImage} alt='Deso Logo' />
						Continue reading on DeSo
					</Button>
				</Link>
				<span>No ads, no account required</span>
			</div>
		</div>
	);
}
