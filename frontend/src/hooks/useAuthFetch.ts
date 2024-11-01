import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useNavigate } from 'react-router-dom';

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface UseAuthenticatedFetchResult<T> extends FetchState<T> {
	fetchData: () => Promise<void>;
	clearError: () => void;
	clearData: () => void;
}

interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

const CONFIG = {
	BASE_URL: 'http://localhost:5713',
	MAX_RETRIES: 3,
	STORAGE_KEYS: {
		ACCESS_TOKEN: 'authToken',
		REFRESH_TOKEN: 'refreshToken',
		USER: 'user'
	}
} as const;

// Configure axios defaults
axios.defaults.baseURL = CONFIG.BASE_URL;
axios.defaults.withCredentials = true;

// Token refresh promise singleton
let refreshingTokenPromise: Promise<AuthTokens> | null = null;

// Queue for failed requests
interface QueueItem {
	resolve: (token: string) => void;
	reject: (error: Error) => void;
}

const failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, tokens: AuthTokens | null = null) => {
	failedQueue.forEach(promise => {
		if (error) {
			promise.reject(error);
		} else if (tokens) {
			promise.resolve(tokens.accessToken);
		}
	});
	failedQueue.length = 0;
};

const clearAuthStorage = () => {
	Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
		localStorage.removeItem(key);
	});
};

const refreshToken = async (): Promise<AuthTokens> => {
	try {
		const refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await axios.post<RefreshTokenResponse>('/auth/refresh', {
			refreshToken
		});

		const tokens: AuthTokens = {
			accessToken: response.data.accessToken,
			refreshToken: response.data.refreshToken
		};

		localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
		localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

		return tokens;
	} catch (error) {
		clearAuthStorage();
		throw error;
	}
};

export const useAuthenticatedFetch = <T,>(
	url: string,
	options: Omit<AxiosRequestConfig, 'url'> = {}
): UseAuthenticatedFetchResult<T> => {
	const [state, setState] = useState<FetchState<T>>({
		data: null,
		loading: true,
		error: null
	});

	const mounted = useRef(true);
	const optionsRef = useRef(options);
	const navigate = useNavigate();
	const retryCount = useRef(0);

	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const clearError = useCallback(() => {
		if (mounted.current) {
			setState(prev => ({ ...prev, error: null }));
		}
	}, []);

	const clearData = useCallback(() => {
		if (mounted.current) {
			setState(prev => ({ ...prev, data: null }));
		}
	}, []);

	const executeRequest = useCallback(async (token: string): Promise<T | null> => {
		try {
			const response = await axios.request<T>({
				url,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
					...optionsRef.current.headers
				},
				...optionsRef.current
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const errorMessage = error.response?.data?.message || error.message;
				console.log(errorMessage);
			}
		}
		return null;
	}, [url]);

	const handleTokenRefresh = useCallback(async (): Promise<string> => {
		try {
			if (!refreshingTokenPromise) {
				refreshingTokenPromise = refreshToken();
			}
			const tokens = await refreshingTokenPromise;
			refreshingTokenPromise = null;
			processQueue(null, tokens);
			return tokens.accessToken;
		} catch (error) {
			processQueue(error instanceof Error ? error : new Error('Token refresh failed'));
			navigate('/login');
			throw error;
		}
	}, [navigate]);

	const fetchData = useCallback(async () => {
		if (!mounted.current) return;

		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
			if (!token) {
				throw new Error('Authentication token not found');
			}

			try {
				const data = await executeRequest(token);
				if (mounted.current) {
					setState({ data, loading: false, error: null });
				}
				retryCount.current = 0;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 403) {
						if (retryCount.current < CONFIG.MAX_RETRIES) {
							retryCount.current++;

							if (refreshingTokenPromise) {
								await new Promise<string>((resolve, reject) => {
									failedQueue.push({ resolve, reject });
								});
							}

							const newToken = await handleTokenRefresh();
							const data = await executeRequest(newToken);

							if (mounted.current) {
								setState({ data, loading: false, error: null });
							}
						} else {
							throw new Error('Maximum retry attempts reached');
						}
					} else {
						throw error;
					}
				} else {
					throw error;
				}
			}
		} catch (err) {
			console.error('Fetch error:', err);
			if (mounted.current) {
				setState(prev => ({
					...prev,
					error: err instanceof Error ? err.message : 'An error occurred',
					loading: false
				}));

				if (axios.isAxiosError(err) &&
					[401, 403].includes(err.response?.status || 0)) {
					navigate('/login');
				}
			}
		}
	}, [executeRequest, handleTokenRefresh, navigate]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		...state,
		fetchData,
		clearError,
		clearData
	};
};
