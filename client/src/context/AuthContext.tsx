import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	login: (userToken: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [isAuthenticated, setIsAuth] = useState<boolean>(false);

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken');
		if (storedToken) {
			setToken(storedToken);
			setIsAuth(true);
		}
	}, []);

	const login = (userToken: string) => {
		setToken(userToken);
		setIsAuth(true);
		localStorage.setItem('authToken', userToken);
	};

	const logout = () => {
		setToken(null);
		setIsAuth(false);
		localStorage.removeItem('authToken');
	};

	return (
		<AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
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
