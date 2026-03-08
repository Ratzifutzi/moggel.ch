'use client';

import { create } from 'zustand';

const IDENTITY_URL = 'https://identity.deso.org';
const IDENTITY_USERS_KEY = 'identityUsersV2';
const IDENTITY_ACTIVE_KEY = 'identityActivePublicKey';

export interface DesoUserCredentials {
	encryptedSeedHex: string;
	accessLevel: number;
	accessLevelHmac: string;
	network: string;
	btcDepositAddress: string;
	ethDepositAddress: string;
	hasExtraText: boolean;
}

interface PendingRequest {
	resolve: (payload: Record<string, unknown>) => void;
	reject: (error: Error) => void;
}

interface PendingApproval {
	resolve: (signedTransactionHex: string) => void;
	reject: (error: Error) => void;
}

interface IdentityState {
	currentPublicKey: string | null;
	users: Record<string, DesoUserCredentials>;
	initialized: boolean;

	init: () => void;
	login: () => void;
	logout: () => void;
	handleMessage: (event: MessageEvent) => void;
	setIframe: (iframe: HTMLIFrameElement | null) => void;
	sign: (transactionHex: string) => Promise<string>;
	requestJwt: () => Promise<string>;
}

// Mutable refs kept outside Zustand — these don't need reactivity.
let identityWindow: Window | null = null;
let iframeElement: HTMLIFrameElement | null = null;
const pendingRequests = new Map<string, PendingRequest>();
let pendingApproval: PendingApproval | null = null;

function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function loadUsers(): Record<string, DesoUserCredentials> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(IDENTITY_USERS_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function saveUsers(users: Record<string, DesoUserCredentials>) {
	localStorage.setItem(IDENTITY_USERS_KEY, JSON.stringify(users));
}

function loadActivePublicKey(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(IDENTITY_ACTIVE_KEY);
}

function saveActivePublicKey(key: string | null) {
	if (key) {
		localStorage.setItem(IDENTITY_ACTIVE_KEY, key);
	} else {
		localStorage.removeItem(IDENTITY_ACTIVE_KEY);
	}
}

function openIdentityWindow(url: string) {
	const h = 1000;
	const w = 800;
	const y = window.outerHeight / 2 + window.screenY - h / 2;
	const x = window.outerWidth / 2 + window.screenX - w / 2;

	identityWindow = window.open(
		url,
		undefined,
		`toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`,
	);
}

function sendIframeRequest(
	payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const contentWindow = iframeElement?.contentWindow;
	if (!contentWindow) {
		return Promise.reject(new Error('Identity iframe not available'));
	}

	const id = generateUUID();

	return new Promise((resolve, reject) => {
		pendingRequests.set(id, { resolve, reject });
		contentWindow.postMessage(
			{ id, service: 'identity', ...payload },
			IDENTITY_URL,
		);
	});
}

function openApprovalWindow(transactionHex: string): Promise<string> {
	return new Promise((resolve, reject) => {
		let settled = false;

		const checkClosed = setInterval(() => {
			if (!identityWindow || identityWindow.closed) {
				clearInterval(checkClosed);
				if (!settled) {
					settled = true;
					pendingApproval = null;
					identityWindow = null;
					reject(new Error('Approval cancelled'));
				}
			}
		}, 500);

		pendingApproval = {
			resolve: (hex: string) => {
				if (settled) return;
				settled = true;
				clearInterval(checkClosed);
				resolve(hex);
			},
			reject: (error: Error) => {
				if (settled) return;
				settled = true;
				clearInterval(checkClosed);
				reject(error);
			},
		};

		openIdentityWindow(`${IDENTITY_URL}/approve?tx=${transactionHex}`);
	});
}

const useIdentityStore = create<IdentityState>((set, get) => ({
	currentPublicKey: null,
	users: {},
	initialized: false,

	init: () => {
		const users = loadUsers();
		const activeKey = loadActivePublicKey();
		set({
			users,
			currentPublicKey: activeKey && users[activeKey] ? activeKey : null,
			initialized: true,
		});
	},

	login: () => {
		if (identityWindow && !identityWindow.closed) return;
		openIdentityWindow(`${IDENTITY_URL}/log-in?accessLevelRequest=4`);
	},

	logout: () => {
		const { currentPublicKey } = get();
		if (!currentPublicKey) return;
		if (identityWindow && !identityWindow.closed) return;
		openIdentityWindow(`${IDENTITY_URL}/logout?publicKey=${currentPublicKey}`);
	},

	handleMessage: (event: MessageEvent) => {
		if (event.origin !== IDENTITY_URL) return;
		const data = event.data;
		if (data?.service !== 'identity') return;

		// Respond to initialize from both window and iframe contexts.
		if (data.method === 'initialize') {
			if (!event.source) return;
			(event.source as Window).postMessage(
				{ id: data.id, service: 'identity', payload: {} },
				IDENTITY_URL,
			);
			return;
		}

		// Handle login / logout / approve responses from window context.
		if (data.method === 'login') {
			const payload = data.payload ?? {};
			const updatedUsers = (payload.users ?? {}) as Record<
				string,
				DesoUserCredentials
			>;
			const publicKeyAdded = payload.publicKeyAdded as string | undefined;
			const signedTransactionHex = payload.signedTransactionHex as
				| string
				| undefined;

			saveUsers(updatedUsers);

			if (publicKeyAdded) {
				saveActivePublicKey(publicKeyAdded);
				set({ users: updatedUsers, currentPublicKey: publicKeyAdded });
			} else {
				const { currentPublicKey } = get();
				if (currentPublicKey && !updatedUsers[currentPublicKey]) {
					saveActivePublicKey(null);
					set({ users: updatedUsers, currentPublicKey: null });
				} else {
					set({ users: updatedUsers });
				}
			}

			if (signedTransactionHex && pendingApproval) {
				pendingApproval.resolve(signedTransactionHex);
				pendingApproval = null;
			}

			if (identityWindow && !identityWindow.closed) {
				identityWindow.close();
			}
			identityWindow = null;
			return;
		}

		// Safari / iOS storage-grant acknowledgement — no action required.
		if (data.method === 'storageGranted') {
			return;
		}

		// iframe responses carry an id but no method.
		if (data.id && !data.method) {
			const pending = pendingRequests.get(data.id);
			if (pending) {
				pendingRequests.delete(data.id);
				pending.resolve(data.payload);
			}
		}
	},

	setIframe: (iframe: HTMLIFrameElement | null) => {
		iframeElement = iframe;
	},

	sign: async (transactionHex: string) => {
		const { currentPublicKey, users } = get();
		if (!currentPublicKey) throw new Error('No active user');

		const creds = users[currentPublicKey];
		if (!creds) throw new Error('No credentials for active user');

		const response = await sendIframeRequest({
			method: 'sign',
			payload: {
				accessLevel: creds.accessLevel,
				accessLevelHmac: creds.accessLevelHmac,
				encryptedSeedHex: creds.encryptedSeedHex,
				transactionHex,
			},
		});

		if (response.approvalRequired) {
			return openApprovalWindow(transactionHex);
		}

		if (!response.signedTransactionHex) {
			throw new Error('Signing failed: no signed transaction returned');
		}

		return response.signedTransactionHex as string;
	},

	requestJwt: async () => {
		const { currentPublicKey, users } = get();
		if (!currentPublicKey) throw new Error('No active user');

		const creds = users[currentPublicKey];
		if (!creds) throw new Error('No credentials for active user');

		const response = await sendIframeRequest({
			method: 'jwt',
			payload: {
				accessLevel: creds.accessLevel,
				accessLevelHmac: creds.accessLevelHmac,
				encryptedSeedHex: creds.encryptedSeedHex,
			},
		});

		if (!response.jwt) {
			throw new Error('JWT generation failed');
		}

		return response.jwt as string;
	},
}));

export default useIdentityStore;
