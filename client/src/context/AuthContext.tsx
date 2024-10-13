import { UserData } from "@/types";
import { AuthContextType } from "@/types/AuthContext.types";
import React, { createContext, useState, ReactNode, useEffect } from "react";


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<UserData | null>(null);
	const [isAuthenticated, setIsAuth] = useState<boolean>(false);

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken');
		const storedUser = localStorage.getItem('user');
		if (storedToken && storedUser) {
			setToken(storedToken);
			setIsAuth(true);
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const login = (userToken: string, user: UserData) => {
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

	return (
		<AuthContext.Provider value={{ token, isAuthenticated, login, user, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

