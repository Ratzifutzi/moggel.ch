import { BeatLoader, GridLoader } from 'react-spinners';

export default function Loading() {
	return (
		<div className='flex h-full w-full flex-col items-center justify-center'>
			<GridLoader size={30} />
		</div>
	);
}
