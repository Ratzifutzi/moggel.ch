const Navbar = ({ children }: React.PropsWithChildren<{}>) => {
	return (
		<div className="flex h-full w-full flex-col justify-between gap-2 overflow-scroll">
			<div className="flex flex-col gap-2">
				<Item />
				<Item />
				<Item />
				<Item />
			</div>
			<div>
				<Item />
			</div>
		</div>
	);
};

const Item = () => {
	return (
		<div className="h-15 w-full bg-green-600">
			<div className="h-15 w-15 bg-blue-500"></div>
		</div>
	);
};

Navbar.Item = Item;

export default Navbar;
