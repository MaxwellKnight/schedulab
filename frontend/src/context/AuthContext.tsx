import { AuthContextType } from "@/types/AuthContext.types";
import { TokenPayload } from "@/types/users.dto";
import React, { createContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import axios from 'axios';
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeJwtToken } from '@/utils/jwt';

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
	const tokenExpiryTimeout = useRef<NodeJS.Timeout>();
	const initializationTimeout = useRef<NodeJS.Timeout>();

	const handleLogout = useCallback(async () => {
		try {
			if (tokenExpiryTimeout.current) {
				clearTimeout(tokenExpiryTimeout.current);
			}
			if (initializationTimeout.current) {
				clearTimeout(initializationTimeout.current);
			}

			if (authState.token) {
				await axios.post('/auth/logout').catch(() => {
					console.warn('Backend logout failed, proceeding with local logout');
				});
			}
		} finally {
			delete axios.defaults.headers.common['Authorization'];
			localStorage.removeItem('authToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');
			setAuthState({
				...initialState,
				isLoading: false
			});
		}
	}, [authState.token]);

	const refreshAccessToken = useCallback(async (refreshToken: string) => {
		try {
			const response = await axios.post('/auth/refresh', { refreshToken });
			const { accessToken: newToken } = response.data;

			if (!newToken) throw new Error('No token received');

			localStorage.setItem('authToken', newToken);
			setAuthState(prev => ({ ...prev, token: newToken }));
			axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

			return newToken;
		} catch (error) {
			console.error('Token refresh failed:', error);
			handleLogout();
			throw error;
		}
	}, [handleLogout]);

	const scheduleTokenCheck = useCallback((token: string) => {
		if (tokenExpiryTimeout.current) {
			clearTimeout(tokenExpiryTimeout.current);
		}

		const tokenPayload = decodeJwtToken(token);
		if (!tokenPayload) {
			handleLogout();
			return;
		}

		const tokenExp = tokenPayload.exp * 1000;
		const currentTime = Date.now();
		const timeUntilExpiry = tokenExp - currentTime;

		const refreshBuffer = 60000; // 1 minute
		const timeUntilRefresh = Math.max(0, timeUntilExpiry - refreshBuffer);

		tokenExpiryTimeout.current = setTimeout(async () => {
			const refreshToken = localStorage.getItem('refreshToken');
			if (refreshToken) {
				try {
					const newToken = await refreshAccessToken(refreshToken);
					scheduleTokenCheck(newToken);
				} catch {
					handleLogout();
				}
			} else {
				handleLogout();
			}
		}, timeUntilRefresh);
	}, [handleLogout, refreshAccessToken]);

	const handleLogin = useCallback(async (userToken: string, user: TokenPayload, refreshToken: string) => {
		try {
			const tokenPayload = decodeJwtToken(userToken);
			if (!tokenPayload) {
				throw new Error('Invalid token format');
			}

			axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
			setAuthState({
				token: userToken,
				refreshToken,
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});

			localStorage.setItem('authToken', userToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(user));

			// Schedule token refresh
			scheduleTokenCheck(userToken);
		} catch (error) {
			console.error('Login failed:', error);
			handleLogout();
			throw error;
		}
	}, [handleLogout, scheduleTokenCheck]);

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

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (tokenExpiryTimeout.current) {
				clearTimeout(tokenExpiryTimeout.current);
			}
			if (initializationTimeout.current) {
				clearTimeout(initializationTimeout.current);
			}
		};
	}, []);

	useEffect(() => {
		const initializeAuth = async () => {
			// Set a timeout for initialization
			const initTimeout = setTimeout(() => {
				console.warn('Auth initialization timed out');
				handleLogout();
			}, 10000);

			initializationTimeout.current = initTimeout;

			try {
				const storedToken = localStorage.getItem('authToken');
				const storedRefreshToken = localStorage.getItem('refreshToken');
				const storedUser = localStorage.getItem('user');

				// If no stored auth data, just set loading to false and return
				if (!storedToken || !storedRefreshToken || !storedUser) {
					setAuthState({
						...initialState,
						isLoading: false
					});
					return;
				}

				const tokenPayload = decodeJwtToken(storedToken);
				if (!tokenPayload) {
					// Invalid token, clear everything and return
					console.warn('Invalid token found in storage');
					handleLogout();
					return;
				}

				const tokenExp = tokenPayload.exp * 1000;
				if (Date.now() >= tokenExp - 60000) {
					// Token expired or about to expire, try to refresh
					await refreshAccessToken(storedRefreshToken);
				} else {
					// Valid token, set up auth state
					setAuthState({
						token: storedToken,
						refreshToken: storedRefreshToken,
						user: JSON.parse(storedUser),
						isAuthenticated: true,
						isLoading: false,
						error: null
					});

					axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
					scheduleTokenCheck(storedToken);
				}
			} catch (error) {
				console.error('Auth initialization failed:', error);
				handleLogout();
			} finally {
				clearTimeout(initializationTimeout.current);
				setAuthState(prev => ({ ...prev, isLoading: false }));
			}
		};

		initializeAuth();
	}, [refreshAccessToken, handleLogout, scheduleTokenCheck]);

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
						<p className="text-gray-600">Loading...</p>
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
