import { AuthContextType } from "@/types/AuthContext.types";
import { TokenPayload } from "@/types/users.dto";
import React, { createContext, useState, ReactNode, useEffect } from "react";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<TokenPayload | null>(null);
	const [isAuthenticated, setIsAuth] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const initializeAuth = async () => {
			const storedToken = localStorage.getItem('authToken');
			const storedUser = localStorage.getItem('user');
			if (storedToken && storedUser) {
				setToken(storedToken);
				setIsAuth(true);
				setUser(JSON.parse(storedUser));
			}
			setIsLoading(false);
		};

		initializeAuth();
	}, []);

	const login = (userToken: string, user: TokenPayload) => {
		setToken(userToken);
		setIsAuth(true);
		setUser(user);
		localStorage.setItem('authToken', userToken);
		localStorage.setItem('user', JSON.stringify(user));
	};

	const logout = () => {
		setToken(null);
		setIsAuth(false);
		setUser(null);
		localStorage.removeItem('authToken');
		localStorage.removeItem('user');
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<AuthContext.Provider value={{ token, isAuthenticated, login, user, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
