import Image from 'next/image';
import Link from 'next/link';

type SidebarTab = {
	IconPath: string;
	TextPath: string;
	TargetPath: string;
};

const Navbar = ({ children }: React.PropsWithChildren<{}>) => {
	const tabs: SidebarTab[] = [
		{
			IconPath: '/assets/images/navbar/Menu_Home_Icon.jpeg',
			TextPath: '/assets/images/navbar/Menu_Home_Text.jpeg',
			TargetPath: '/',
		},
		{
			IconPath: '/assets/images/navbar/Menu_Applesauce_Icon.png',
			TextPath: '/assets/images/navbar/Menu_Applesauce_Text.png',
			TargetPath: '/applesauce',
		},
		{
			IconPath: '/assets/images/navbar/Menu_Archive_Icon.png',
			TextPath: '/assets/images/navbar/Menu_Archive_Text.png',
			TargetPath: '/archive',
		},
		{
			IconPath: '/assets/images/navbar/Menu_About_Icon.png',
			TextPath: '/assets/images/navbar/Menu_About_Text.png',
			TargetPath: '/about',
		},
		{
			IconPath: '/assets/images/navbar/Menu_DeSo_Icon.png',
			TextPath: '/assets/images/navbar/Menu_DeSo_Text.png',
			TargetPath: '/deso',
		},
		{
			IconPath: '/assets/images/navbar/Menu_Account_Icon.png',
			TextPath: '/assets/images/navbar/Menu_Account_Text.png',
			TargetPath: '/account',
		},
	];

	return (
		<div className="flex h-full w-full flex-row justify-center gap-2 overflow-scroll lg:flex-col lg:justify-between">
			<div className="flex flex-row gap-2 lg:flex-col">
				{tabs.map((tab) => (
					<Item key={tab.TargetPath} tab={tab} />
				))}
			</div>
			<div>
				<Item tab={tabs[0]} />
			</div>
		</div>
	);
};

const Item = ({ tab }: { tab: SidebarTab }) => {
	return (
		<Link
			href={tab.TargetPath}
			className={'flex w-10 items-center gap-2 p-0 lg:w-full lg:p-2'}
		>
			<Image
				src={tab.IconPath}
				alt="icon"
				width={40}
				height={40}
				className="h-10 w-10 object-contain"
			/>
			<Image
				src={tab.TextPath}
				alt="label"
				width={96}
				height={24}
				className="hidden h-6 object-contain lg:block"
			/>
		</Link>
	);
};

Navbar.Item = Item;

export default Navbar;
