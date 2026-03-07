'use client';

import { createContext, useContext } from 'react';

export interface User {
	loggedIn: boolean;
	publicKey: string;
	displayName: string;
	profilePictureURL: string;
}

export const UserContext = createContext<User | undefined>(undefined);

export function useUser() {
	const user = useContext(UserContext);

	if (user === undefined) {
		throw new Error('useUser must be used within a UserContext.Provider');
	}

	return user;
}

export function UserProvider({ children }: React.PropsWithChildren) {
	const user: User = {
		loggedIn: true,
		publicKey: 'BC1YLgYj5Zs8n9h7vV2z5X9m8n6f4e3d2c1b0a9',
		displayName: 'Ratzifutzi',
		profilePictureURL: '/assets/images/profile-picture.webp',
	};

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
