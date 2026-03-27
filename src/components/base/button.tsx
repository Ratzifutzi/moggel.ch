export default function Button({
	children,
	onClick,
}: React.PropsWithChildren<{ onClick?: () => void }>) {
	return (
		<button
			className="flex cursor-pointer flex-row items-center gap-2 rounded-lg border-2 border-dotted bg-white px-4 py-2 pt-1.5 pb-1.5 text-black transition-all md:hover:bg-gray-100"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
