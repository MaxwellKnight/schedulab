import { AuthContextType } from "@/types/AuthContext.types";
import { TokenPayload } from "@/types/users.dto";
import React, { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import axios from 'axios';
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeJwtToken } from '@/utils/jwt';

// Enhanced types
interface AuthState {
	token: string | null;
	refreshToken: string | null;
	user: TokenPayload | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	token: null,
	refreshToken: null,
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [authState, setAuthState] = useState<AuthState>(initialState);

	// Enhanced logout handler
	const handleLogout = useCallback(async () => {
		try {
			// Attempt to notify backend about logout
			if (authState.token) {
				await axios.post('/auth/logout').catch(() => {
					// Ignore error, proceed with local logout
					console.warn('Backend logout failed, proceeding with local logout');
				});
			}
		} finally {
			// Clear axios header
			delete axios.defaults.headers.common['Authorization'];

			// Clear local storage
			localStorage.removeItem('authToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');

			// Reset auth state
			setAuthState({
				...initialState,
				isLoading: false
			});
		}
	}, [authState.token]);

	const handleLogin = useCallback(async (userToken: string, user: TokenPayload, refreshToken: string) => {
		try {
			// Validate token before storing
			const tokenPayload = decodeJwtToken(userToken);
			if (!tokenPayload) {
				throw new Error('Invalid token format');
			}

			// Setup axios default header
			axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

			// Update auth state
			setAuthState({
				token: userToken,
				refreshToken,
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});

			// Store auth data
			localStorage.setItem('authToken', userToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(user));
		} catch (error) {
			console.error('Login failed:', error);
			handleLogout();
			throw error;
		}
	}, [handleLogout]);

	// Token refresh logic
	const refreshAccessToken = useCallback(async (refreshToken: string) => {
		try {
			const response = await axios.post('/auth/refresh', { refreshToken });
			const { accessToken: newToken } = response.data;

			if (!newToken) throw new Error('No token received');

			localStorage.setItem('authToken', newToken);
			setAuthState(prev => ({ ...prev, token: newToken }));

			return newToken;
		} catch (error) {
			console.error('Token refresh failed:', error);
			handleLogout();
			throw error;
		}
	}, [handleLogout]);

	// Setup axios interceptors for token refresh
	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			response => response,
			async error => {
				const originalRequest = error.config;

				if (error.response?.status === 401 && !originalRequest._retry && authState.refreshToken) {
					originalRequest._retry = true;

					try {
						const newToken = await refreshAccessToken(authState.refreshToken);
						originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
						return axios(originalRequest);
					} catch (refreshError) {
						return Promise.reject(refreshError);
					}
				}

				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.response.eject(interceptor);
		};
	}, [refreshAccessToken, authState.refreshToken]);

	// Initialize auth state
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const storedToken = localStorage.getItem('authToken');
				const storedRefreshToken = localStorage.getItem('refreshToken');
				const storedUser = localStorage.getItem('user');

				if (!storedToken || !storedRefreshToken || !storedUser) {
					throw new Error('Missing auth data');
				}

				// Validate token
				const tokenPayload = decodeJwtToken(storedToken);
				if (!tokenPayload) {
					throw new Error('Invalid token');
				}

				// Check token expiration
				const tokenExp = tokenPayload.exp * 1000; // Convert to milliseconds
				if (Date.now() >= tokenExp) {
					// Token expired, try to refresh
					await refreshAccessToken(storedRefreshToken);
				} else {
					// Token valid, setup auth state
					setAuthState({
						token: storedToken,
						refreshToken: storedRefreshToken,
						user: JSON.parse(storedUser),
						isAuthenticated: true,
						isLoading: false,
						error: null
					});

					// Setup axios default header
					axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
				}
			} catch (error) {
				console.error('Auth initialization failed:', error);
				handleLogout();
			} finally {
				setAuthState(prev => ({ ...prev, isLoading: false }));
			}
		};

		initializeAuth();
	}, [refreshAccessToken, handleLogout]);

	// Loading screen
	if (authState.isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<AnimatePresence mode="wait">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="text-center"
					>
						<Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
						<p className="text-gray-600">Initializing...</p>
					</motion.div>
				</AnimatePresence>
			</div>
		);
	}

	const contextValue: AuthContextType = {
		token: authState.token,
		isAuthenticated: authState.isAuthenticated,
		user: authState.user,
		login: handleLogin,
		logout: handleLogout,
		refreshToken: refreshAccessToken,
		error: authState.error
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};
