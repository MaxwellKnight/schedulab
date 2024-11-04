import axios from "axios";

const api = axios.create({
	baseURL: process.env.VITE_API_URL || 'http://localhost:5713',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for API calls
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for API calls
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Handle 401 Unauthorized errors
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// const refreshToken = localStorage.getItem('refresh_token');
			// try {
			//   const newToken = await refreshAccessToken(refreshToken);
			//   localStorage.setItem('auth_token', newToken);
			//   originalRequest.headers.Authorization = `Bearer ${newToken}`;
			//   return apiClient(originalRequest);
			// } catch (refreshError) {
			//   // Handle refresh token failure (e.g., redirect to login)
			// }
		}

		return Promise.reject(error);
	}
);

export default api;
