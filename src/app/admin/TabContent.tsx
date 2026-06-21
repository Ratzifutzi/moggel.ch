'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type Tab = {
	hash: string;
	title: string;
	component: ReactNode;
};

export default function TabContent({ tabs }: { tabs: Tab[] }) {
	const [activeHash, setActiveHash] = useState<string>(tabs[0]?.hash ?? '');

	useEffect(() => {
		const updateHash = () => {
			const hash = window.location.hash.replace('#', '');
			if (tabs.some((tab) => tab.hash === hash)) {
				setActiveHash(hash);
			} else {
				setActiveHash(tabs[0]?.hash ?? '');
			}
		};

		updateHash();
		window.addEventListener('hashchange', updateHash);
		window.addEventListener('popstate', updateHash);
		return () => {
			window.removeEventListener('hashchange', updateHash);
			window.removeEventListener('popstate', updateHash);
		};
	}, [tabs]);

	const activeTab = tabs.find((tab) => tab.hash === activeHash);

	return <>{activeTab?.component}</>;
}
