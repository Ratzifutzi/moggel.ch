import Link from 'next/link';
import Button from './button';

type CommonProps = {
	currentPage: number;
	totalPages: number;
	summary?: string;
	className?: string;
	hideOnSinglePage?: boolean;
};

type LinkModeProps = CommonProps & {
	/**
	 * Returns the href for a given page. When provided, the component renders
	 * `<Link>` elements (suitable for server components / URL-driven paging).
	 */
	getHref: (page: number) => string;
	onPageChange?: never;
};

type CallbackModeProps = CommonProps & {
	/**
	 * Called when the user clicks Previous/Next. Use this for client-side
	 * paging (e.g. React Query driven tables).
	 */
	onPageChange: (page: number) => void;
	getHref?: never;
};

export type PaginationProps = LinkModeProps | CallbackModeProps;

export default function Pagination(props: PaginationProps) {
	const {
		currentPage,
		totalPages,
		summary,
		className,
		hideOnSinglePage = true,
	} = props;

	if (hideOnSinglePage && totalPages <= 1) return null;

	const hasPrev = currentPage > 1;
	const hasNext = currentPage < totalPages;
	const prevPage = currentPage - 1;
	const nextPage = currentPage + 1;

	const wrapperClass =
		className ??
		'flex flex-row items-center justify-between gap-3 pb-4 sm:justify-center';

	const label = (
		<span className='text-center text-sm sm:text-base'>
			Page {currentPage} of {totalPages}
			{summary ? ` ${summary}` : ''}
		</span>
	);

	if ('getHref' in props && props.getHref) {
		const { getHref } = props;
		return (
			<div className={wrapperClass}>
				{hasPrev ? (
					<Link href={getHref(prevPage)}>
						<Button>Previous</Button>
					</Link>
				) : (
					<Button disabled>Previous</Button>
				)}
				{label}
				{hasNext ? (
					<Link href={getHref(nextPage)}>
						<Button>Next</Button>
					</Link>
				) : (
					<Button disabled>Next</Button>
				)}
			</div>
		);
	}

	const { onPageChange } = props;
	return (
		<div className={wrapperClass}>
			<Button onClick={() => onPageChange!(prevPage)} disabled={!hasPrev}>
				Previous
			</Button>
			{label}
			<Button onClick={() => onPageChange!(nextPage)} disabled={!hasNext}>
				Next
			</Button>
		</div>
	);
}
