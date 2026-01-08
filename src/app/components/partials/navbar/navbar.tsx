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
		<div className="flex h-full w-full flex-col justify-between gap-2 overflow-scroll">
			<div className="flex flex-col gap-2">
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
		<a href={tab.TargetPath} className="flex w-full items-center gap-2 p-2">
			<img src={tab.IconPath} alt="icon" className="h-10 w-10 object-contain" />
			<img src={tab.TextPath} alt="label" className="h-6 object-contain" />
		</a>
	);
};

Navbar.Item = Item;

export default Navbar;
