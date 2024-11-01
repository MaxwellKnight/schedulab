import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Setup axios defaults
axios.defaults.baseURL = 'http://localhost:5713';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Token refresh promise to prevent multiple refresh requests
let refreshingTokenPromise: Promise<AuthTokens> | null = null;

// Queue of failed requests to retry after token refresh
const failedQueue: {
	resolve: (token: string) => void;
	reject: (error: Error) => void;
}[] = [];

interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

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

const refreshAuthTokens = async (): Promise<AuthTokens> => {
	try {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await axios.post<AuthTokens>('/auth/refresh', {
			refreshToken
		});

		const { accessToken, refreshToken: newRefreshToken } = response.data;

		localStorage.setItem('authToken', accessToken);
		localStorage.setItem('refreshToken', newRefreshToken);

		axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

		return {
			accessToken,
			refreshToken: newRefreshToken
		};
	} catch (error) {
		localStorage.removeItem('authToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		throw error;
	}
};

// Request interceptor to add token
axios.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem('authToken');
		if (token && config.headers) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config;

		// If there's no config, or we've already retried, reject
		if (!originalRequest || (originalRequest as any)._retry) {
			return Promise.reject(error);
		}

		// Handle 403 (Forbidden) - typically expired token
		if (error.response?.status === 403) {
			(originalRequest as any)._retry = true;

			try {
				// If a refresh is already in progress, wait for it
				if (!refreshingTokenPromise) {
					refreshingTokenPromise = refreshAuthTokens();
				}

				const tokens = await refreshingTokenPromise;
				refreshingTokenPromise = null;

				// Update the authorization header
				if (originalRequest.headers) {
					originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
				}

				processQueue(null, tokens);
				return axios(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error);

				// Redirect to login on refresh failure
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}

				return Promise.reject(refreshError);
			}
		}

		// If error is 401 (Unauthorized), clear storage and redirect to login
		if (error.response?.status === 401) {
			localStorage.removeItem('authToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');

			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		}

		return Promise.reject(error);
	}
);

export const setupAxiosAuth = () => {
	const token = localStorage.getItem('authToken');
	if (token) {
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}
};

export default axios;
