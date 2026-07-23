import MaintenanceImage from '@public/assets/images/maintenance.png';
import Image from 'next/image';

export default function Critical() {
	return (
		<div className='flex w-full flex-col content-center items-center'>
			<Image
				className='aspect-auto h-70 w-fit'
				src={MaintenanceImage}
				alt='Moggel kicking a Server'
			/>
			<h1 className='mt-5 text-center text-2xl'>Server Error</h1>
			<p className='mt-2 text-center'>
				The site is currently undergoing a crticial problem on the server. This
				is not your fault, just that someone did a bad job at coding. Please
				check back later.
			</p>
		</div>
	);
}
