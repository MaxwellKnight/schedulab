import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface UseAuthenticatedFetchResult<T> extends FetchState<T> {
	fetchData: () => Promise<void>;
}

// Configure axios defaults if not already configured
axios.defaults.baseURL = 'http://localhost:5713';
axios.defaults.withCredentials = true;

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

	// Update options ref when options change
	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const fetchData = useCallback(async () => {
		if (!mounted.current) return;

		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const token = localStorage.getItem('authToken');
			if (!token) {
				throw new Error('Authentication token not found');
			}

			const response = await axios.request<T>({
				url,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
					...optionsRef.current.headers
				},
				...optionsRef.current
			});

			if (mounted.current) {
				setState({
					data: response.data,
					loading: false,
					error: null
				});
			}
		} catch (err) {
			console.error('Fetch error:', err);
			if (mounted.current) {
				setState(prev => ({
					...prev,
					error: err instanceof Error ? err.message : 'An error occurred',
					loading: false
				}));
			}
		}
	}, [url]); // Remove options from dependencies, use ref instead

	// Initial fetch
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		...state,
		fetchData
	};
};
