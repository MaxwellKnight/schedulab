import { useEffect, useReducer, useRef, useCallback } from "react";
import axios, { AxiosRequestConfig, CancelTokenSource } from "axios";
import fetchReducer, { initial_fetch } from "./reducer";

type Cache<T> = { [url: string]: T };

const DEFAULT_OPTIONS: AxiosRequestConfig = {
	method: 'GET',
	headers: {
		"Content-Type": "application/json"
	}
};

const useAxios = <T,>(url: string, options: AxiosRequestConfig = {}) => {
	const [{ data, loading, error }, dispatch] = useReducer(fetchReducer<T>, initial_fetch);
	const cache = useRef<Cache<T>>({});
	const cancelTokenSource = useRef<CancelTokenSource>();

	const getUrl = useCallback(async (url: string) => {
		dispatch({ type: 'FETCH_START' });

		// Return cached data if available
		if (cache.current[url]) {
			dispatch({ type: 'FETCH_SUCCESS', data: cache.current[url] });
			return;
		}

		// Cancel any existing request
		if (cancelTokenSource.current) {
			cancelTokenSource.current.cancel('New request initiated');
		}

		// Create a new cancel token for this request
		cancelTokenSource.current = axios.CancelToken.source();

		try {
			const response = await axios({
				url,
				...DEFAULT_OPTIONS,
				...options,
				cancelToken: cancelTokenSource.current.token
			});

			cache.current[url] = response.data;
			dispatch({ type: 'FETCH_SUCCESS', data: response.data });
		} catch (error) {
			if (axios.isCancel(error)) {
				// Request was cancelled, do nothing
				return;
			}
			dispatch({ type: 'FETCH_FAILURE', error: error as Error });
		}
	}, [options]);

	useEffect(() => {
		getUrl(url);

		return () => {
			// Cancel any ongoing request when component unmounts
			if (cancelTokenSource.current) {
				cancelTokenSource.current.cancel('Request cancelled due to component unmount');
			}
		};
	}, [url, getUrl]);

	const reFetch = async () => {
		if (typeof url !== 'string') return;

		// Clear cache for this URL to force a new request
		delete cache.current[url];

		// Cancel any existing request
		if (cancelTokenSource.current) {
			cancelTokenSource.current.cancel('Refetch initiated');
		}

		// Create a new cancel token for the refetch
		cancelTokenSource.current = axios.CancelToken.source();

		try {
			const response = await axios({
				url,
				...DEFAULT_OPTIONS,
				...options,
				cancelToken: cancelTokenSource.current.token
			});

			cache.current[url] = response.data;
			dispatch({ type: 'FETCH_SUCCESS', data: response.data });
		} catch (error) {
			if (axios.isCancel(error)) {
				return;
			}
			dispatch({ type: 'FETCH_FAILURE', error: error as Error });
		}
	};

	return { data, loading, error, reFetch };
};

export default useAxios;
