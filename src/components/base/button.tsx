export default function Button({
	children,
	onClick,
	disabled,
	type,
}: React.PropsWithChildren<{
	onClick?: () => void;
	disabled?: boolean;
	type?: 'submit' | 'reset' | 'button' | undefined;
}>) {
	return (
		<button
			type={type}
			disabled={disabled}
			className={`flex cursor-pointer flex-row items-center gap-2 rounded-lg border-2 border-dotted bg-white px-4 py-2 pt-1.5 pb-1.5 text-black transition-all disabled:cursor-not-allowed disabled:opacity-50 md:hover:bg-gray-100`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
