import { UserData } from "@/types";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
	token: string | null;
	user: UserData | null;
	isAuthenticated: boolean;
	login: (userToken: string, user: UserData) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
			setUser(user);
		}
	}, [isAuthenticated, user]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToken = () => {
	const { token } = useAuth();
	return token;
};
