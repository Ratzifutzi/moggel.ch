import MaintenanceImage from '@public/assets/images/maintenance.png';
import Image from 'next/image';

export default function PageUnavailable() {
	return (
		<div className='flex w-full flex-col content-center items-center'>
			<Image
				className='aspect-auto h-70 w-fit'
				src={MaintenanceImage}
				alt='Moggel kicking a Server'
			/>
			<h1 className='mt-5 text-center text-2xl'>Page Unavailable</h1>
			<p className='mt-2 text-center'>
				The page is currently disabled by an Administrator. Please check back
				later.
			</p>
		</div>
	);
}
