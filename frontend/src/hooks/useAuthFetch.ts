import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface UseAuthenticatedFetchResult<T> extends FetchState<T> {
	fetchData: () => Promise<void>;
	clearError: () => void;
}

interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5713';
axios.defaults.withCredentials = true;

// Token refresh promise to prevent multiple refresh requests
let refreshingTokenPromise: Promise<string> | null = null;

// Queue of failed requests to retry after token refresh
// eslint-disable-next-line @typescript-eslint/ban-types
const failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach(promise => {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve(token);
		}
	});
	failedQueue.length = 0;
};

const refreshToken = async (): Promise<string> => {
	try {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) throw new Error('No refresh token available');

		const response = await axios.post<RefreshTokenResponse>('/auth/refresh', {
			refreshToken
		});

		const { accessToken, refreshToken: newRefreshToken } = response.data;
		localStorage.setItem('authToken', accessToken);
		localStorage.setItem('refreshToken', newRefreshToken);

		return accessToken;
	} catch (error) {
		localStorage.removeItem('authToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
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
	const MAX_RETRIES = 3;

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

	const executeRequest = useCallback(async (token: string): Promise<T> => {
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
	}, [url]);

	const handleTokenRefresh = useCallback(async () => {
		try {
			if (!refreshingTokenPromise) {
				refreshingTokenPromise = refreshToken();
			}
			const newToken = await refreshingTokenPromise;
			refreshingTokenPromise = null;
			processQueue(null, newToken);
			return newToken;
		} catch (error) {
			processQueue(error as Error);
			navigate('/login');
			throw error;
		}
	}, [navigate]);

	const fetchData = useCallback(async () => {
		if (!mounted.current) return;

		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const token = localStorage.getItem('authToken');
			if (!token) {
				throw new Error('Authentication token not found');
			}

			try {
				const data = await executeRequest(token);
				if (mounted.current) {
					setState({
						data,
						loading: false,
						error: null
					});
				}
				retryCount.current = 0;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const axiosError = error as AxiosError;

					if (axiosError.response?.status === 403) {
						if (retryCount.current < MAX_RETRIES) {
							retryCount.current++;

							if (refreshingTokenPromise) {
								await new Promise((resolve, reject) => {
									failedQueue.push({ resolve, reject });
								});
							}

							const newToken = await handleTokenRefresh();
							const data = await executeRequest(newToken);

							if (mounted.current) {
								setState({
									data,
									loading: false,
									error: null
								});
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
					(err.response?.status === 401 || err.response?.status === 403)) {
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
		clearError
	};
};
