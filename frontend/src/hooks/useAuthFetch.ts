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
	clearCache: () => void;
}

interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

interface CacheConfig {
	enabled: boolean;
	ttl: number; // Time to live in milliseconds
	key?: string; // Custom cache key
}

const CONFIG = {
	BASE_URL: 'http://localhost:5713',
	MAX_RETRIES: 3,
	STORAGE_KEYS: {
		ACCESS_TOKEN: 'authToken',
		REFRESH_TOKEN: 'refreshToken',
		USER: 'user'
	},
	DEFAULT_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Cache storage
const cacheStore = new Map<string, CacheEntry<unknown>>();

// Helper to generate cache key
const generateCacheKey = (url: string, options: AxiosRequestConfig): string => {
	const params = options.params ? JSON.stringify(options.params) : '';
	const body = options.data ? JSON.stringify(options.data) : '';
	return `${options.method || 'GET'}-${url}-${params}-${body}`;
};
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

		const response = await axios.post<AuthTokens>('/auth/refresh', {
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
	options: Omit<AxiosRequestConfig, 'url'> = {},
	cacheConfig: CacheConfig = { enabled: false, ttl: CONFIG.DEFAULT_CACHE_TTL }
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
	const cacheKey = useRef(
		cacheConfig.key || generateCacheKey(url, options)
	);

	useEffect(() => {
		optionsRef.current = options;
		if (!cacheConfig.key) {
			cacheKey.current = generateCacheKey(url, options);
		}
	}, [options, url, cacheConfig.key]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const clearCache = useCallback(() => {
		cacheStore.delete(cacheKey.current);
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
		clearCache();
	}, [clearCache]);

	const checkCache = useCallback((): T | null => {
		if (!cacheConfig.enabled) return null;

		const cached = cacheStore.get(cacheKey.current);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > cacheConfig.ttl) {
			cacheStore.delete(cacheKey.current);
			return null;
		}

		return cached.data as T;
	}, [cacheConfig.enabled, cacheConfig.ttl]);

	const updateCache = useCallback((data: T) => {
		if (cacheConfig.enabled) {
			cacheStore.set(cacheKey.current, {
				data,
				timestamp: Date.now()
			});
		}
	}, [cacheConfig.enabled]);

	const executeRequest = useCallback(async (token: string): Promise<T | null> => {
		try {
			const response = await axios.request<T>({
				url,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
					...optionsRef.current.headers
				},
				params: { ...optionsRef.current.params }
			});

			if (response.data) {
				updateCache(response.data);
			}

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const errorMessage = error.response?.data?.message || error.message;
				console.log(errorMessage);
			}
			throw error;
		}
	}, [url, updateCache]);

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
		setState(prev => ({ ...prev, loading: true, error: null }));

		if (!mounted.current) return;

		try {
			// Check cache first
			const cachedData = checkCache();
			if (cachedData) {
				setState({ data: cachedData, loading: false, error: null });
				return;
			}

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
							return;
						}

						throw new Error('Maximum retry attempts reached');
					}
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
	}, [executeRequest, handleTokenRefresh, navigate, checkCache]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		...state,
		fetchData,
		clearError,
		clearData,
		clearCache
	};
};
