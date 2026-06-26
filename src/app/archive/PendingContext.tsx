'use client';

import {
	createContext,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

type PendingContextValue = {
	pending: boolean;
	setPending: (pending: boolean) => void;
};

const PendingContext = createContext<PendingContextValue | null>(null);

export function PendingProvider({ children }: { children: ReactNode }) {
	const [pending, setPending] = useState(false);
	const value = useMemo(() => ({ pending, setPending }), [pending]);
	return (
		<PendingContext.Provider value={value}>{children}</PendingContext.Provider>
	);
}

export function usePending(): PendingContextValue {
	const ctx = useContext(PendingContext);
	if (!ctx) {
		// Safe fallback if used outside the provider.
		return { pending: false, setPending: () => {} };
	}
	return ctx;
}

export function FadeWhilePending({ children }: { children: ReactNode }) {
	const { pending } = usePending();
	return (
		<div
			className={`transition-opacity duration-150 ${pending ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
		>
			{children}
		</div>
	);
}
