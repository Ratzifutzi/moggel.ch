'use client';

import { create } from 'zustand';

interface IdentityState {
	inAuthFlow: boolean;
	login: () => void;
	handleMessage: (event: MessageEvent) => void;
	onPageFocus: () => void;
}

const useIdentityStore = create<IdentityState>((set, get) => ({
	inAuthFlow: false,
	login: () => {
		if (get().inAuthFlow) return;
		set({ inAuthFlow: true });

		const accessLevelRequest = 2; // For basic authentication
		const callback = encodeURIComponent(
			`${window.location.origin}/auth/callback`,
		);
		const appName = encodeURIComponent('Moggel Comics');

		const url = `https://identity.deso.org/log-in?accessLevelRequest=${accessLevelRequest}&callback=${callback}&appName=${appName}`;
		const h = 650;
		const w = 500;
		const y = window.outerHeight / 2 + window.screenY - h / 2;
		const x = window.outerWidth / 2 + window.screenX - w / 2;
		window.open(
			url,
			undefined,
			`toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`,
		);
	},
	handleMessage: (event: MessageEvent) => {
		const data = event.data;

		// Handle callback redirect from /auth/callback
		if (
			event.origin === window.location.origin &&
			data?.source === 'deso-identity'
		) {
			set({ inAuthFlow: false });
			// data.payload contains the auth params (publicKeyBase58Check, etc.)
			console.log('DeSo auth payload:', data.payload);
			return;
		}

		if (event.origin !== 'https://identity.deso.org') {
			return;
		}

		if (data.category === 'interaction-event') {
			if (data.payload.event === 'close') {
				set({ inAuthFlow: false });
			}
		}
	},
	onPageFocus: () => {
		if (get().inAuthFlow) {
			window.location.reload();
		}
	},
}));

export default useIdentityStore;
