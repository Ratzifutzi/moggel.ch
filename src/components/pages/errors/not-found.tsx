import CrashImage from '@public/assets/images/maintenance.png';
import Image from 'next/image';

export default function NotFound() {
	return (
		<div className='flex w-full flex-col content-center items-center'>
			<Image
				className='aspect-auto h-70 w-fit'
				src={CrashImage}
				alt='Moggel kicking a Server'
			/>
			<h1 className='mt-5 text-center text-2xl'>Page Not Found</h1>
		</div>
	);
}
