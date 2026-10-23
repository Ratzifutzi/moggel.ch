'use client';

import { useRef, type ReactNode } from 'react';

const INTERACTIVE_SELECTOR =
	'a, button, input, textarea, select, label, [contenteditable], [tabindex]';

// Whether `el` itself can scroll further in the direction of the wheel delta.
function canScroll(el: Element, dx: number, dy: number): boolean {
	const style = getComputedStyle(el);
	if (dy !== 0 && /(auto|scroll)/.test(style.overflowY)) {
		if (
			dy < 0
				? el.scrollTop > 0
				: el.scrollTop + el.clientHeight < el.scrollHeight
		)
			return true;
	}
	if (dx !== 0 && /(auto|scroll)/.test(style.overflowX)) {
		if (
			dx < 0
				? el.scrollLeft > 0
				: el.scrollLeft + el.clientWidth < el.scrollWidth
		)
			return true;
	}
	return false;
}

/**
 * The page layout is fixed to the viewport and only #content scrolls, so the
 * document itself never does. Without this, wheel input outside the content box
 * goes nowhere, and clicking outside it moves the keyboard scroll target to the
 * (unscrollable) viewport. This forwards both to #content.
 */
export default function Frame({
	navbar,
	children,
}: {
	navbar: ReactNode;
	children: ReactNode;
}) {
	const contentRef = useRef<HTMLDivElement>(null);

	const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		const content = contentRef.current;
		const target = e.target as Element;
		if (!content || e.ctrlKey || e.defaultPrevented) return;
		if (content.contains(target)) return;

		for (
			let el: Element | null = target;
			el && el !== e.currentTarget;
			el = el.parentElement
		) {
			if (canScroll(el, e.deltaX, e.deltaY)) return;
		}

		const unit =
			e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? content.clientHeight : 1;
		content.scrollBy({ top: e.deltaY * unit, left: e.deltaX * unit });
	};

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		const content = contentRef.current;
		const target = e.target as Element;
		if (!content || content.contains(target)) return;
		if (target.closest(INTERACTIVE_SELECTOR)) return;

		// Focus the content without stealing the click, so keyboard scrolling
		// (arrows, page up/down, space) keeps working.
		content.focus({ preventScroll: true });
	};

	return (
		<div
			className='fixed inset-0 flex items-start justify-center lg:items-center'
			onWheel={onWheel}
			onPointerDown={onPointerDown}
		>
			<div className='flex h-full min-h-0 w-full flex-col gap-5 md:max-h-[80svh] md:w-[85%] lg:aspect-3/4 lg:h-auto lg:w-[55%] lg:max-w-225 lg:flex-row'>
				<div
					className='mt-5 h-auto flex-none lg:mt-0 lg:flex lg:h-full lg:w-44'
					id='navbar'
				>
					{navbar}
				</div>
				<div
					ref={contentRef}
					tabIndex={-1}
					className='min-h-0 w-full flex-1 overflow-y-auto px-2 outline-none lg:w-[calc(100%-12rem)]'
					id='content'
				>
					{children}
				</div>
			</div>
		</div>
	);
}
