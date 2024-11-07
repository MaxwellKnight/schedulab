import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TokenPayload } from '@/types/users.dto';
import { decodeJwtToken } from '@/utils/jwt';

interface AuthState {
	status: 'loading' | 'success' | 'error';
	message: string;
}

const loadingMessages = [
	"Securing your session...",
	"Verifying credentials...",
	"Almost there...",
	"Setting up your workspace..."
];

const AuthCallback: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { login } = useAuth();
	const [authState, setAuthState] = useState<AuthState>({
		status: 'loading',
		message: loadingMessages[0]
	});
	const [messageIndex, setMessageIndex] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	// Separate loading messages effect
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (authState.status === 'loading') {
			interval = setInterval(() => {
				setMessageIndex(prev => (prev + 1) % loadingMessages.length);
			}, 2000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [authState.status]);

	// Separate authentication logic into a callback
	const processAuthentication = useCallback(async () => {
		if (isProcessing) return;

		try {
			setIsProcessing(true);
			const accessToken = searchParams.get('accessToken');
			const refreshToken = searchParams.get('refreshToken');

			if (!accessToken || !refreshToken) {
				throw new Error('Missing authentication tokens');
			}

			// Decode token first to validate it
			const tokenPayload = decodeJwtToken(accessToken);
			if (!tokenPayload) {
				throw new Error('Invalid token format');
			}

			const userPayload: TokenPayload = {
				id: tokenPayload.id,
				email: tokenPayload.email,
				display_name: tokenPayload.display_name,
				google_id: tokenPayload.google_id,
				picture: tokenPayload.picture
			};

			// Store tokens and user data only after validation
			localStorage.setItem('authToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(userPayload));

			// Update axios defaults after successful validation
			axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

			// Call login only once after all validations pass
			login(accessToken, userPayload);

			setAuthState({
				status: 'success',
				message: 'Authentication successful!'
			});

			// Use a promise with setTimeout for better cleanup
			await new Promise(resolve => setTimeout(resolve, 1500));
			navigate('/', { replace: true });

		} catch (error) {
			let errorMessage = 'Authentication failed';

			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.message || error.message;

				if (error.response?.status === 401) {
					errorMessage = 'Invalid authentication tokens';
				} else if (error.response?.status === 429) {
					errorMessage = 'Too many authentication attempts. Please try again later.';
				}
			}

			setAuthState({
				status: 'error',
				message: errorMessage
			});

			// Clean up any stored data on error
			localStorage.removeItem('authToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');

			await new Promise(resolve => setTimeout(resolve, 2000));
			navigate('/login', { replace: true });
		} finally {
			setIsProcessing(false);
		}
	}, [isProcessing, searchParams, navigate, login]);

	// Single effect for authentication
	useEffect(() => {
		processAuthentication();
	}, [processAuthentication]);

	return (
		<div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-indigo-700 via-purple-700 to-purple-800 items-center justify-center">
			{/* Left section with animation */}
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full lg:w-1/2 flex justify-center items-center p-8"
			>
				<div className="text-center space-y-8">
					<motion.div
						animate={{
							scale: [1, 1.1, 1],
							rotate: [0, 5, -5, 0]
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							repeatType: "reverse"
						}}
					>
						<Calendar className="h-20 w-20 text-white/90 mx-auto" />
					</motion.div>

					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-4xl font-bold text-white"
					>
						Welcome to<br />
						<span className="text-indigo-200">Schedula</span>
					</motion.h2>
				</div>
			</motion.div>

			{/* Right section with status card */}
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full lg:w-1/2 flex items-center justify-center p-8"
			>
				<Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="text-2xl text-center">
							{authState.status === 'loading' ? 'Authenticating' :
								authState.status === 'success' ? 'Welcome!' :
									'Authentication Error'}
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-6">
						<motion.div
							className="flex flex-col items-center justify-center space-y-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
						>
							<AnimatePresence mode="wait">
								{authState.status === 'loading' && (
									<motion.div
										key="loading"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
										className="text-center"
									>
										<Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
										<motion.p
											key={messageIndex}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											className="text-lg text-gray-600"
										>
											{loadingMessages[messageIndex]}
										</motion.p>
									</motion.div>
								)}

								{authState.status === 'success' && (
									<motion.div
										key="success"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
										className="text-center"
									>
										<CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
										<p className="text-lg text-gray-600">{authState.message}</p>
									</motion.div>
								)}

								{authState.status === 'error' && (
									<motion.div
										key="error"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
										className="w-full"
									>
										<Alert variant="destructive">
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>{authState.message}</AlertDescription>
										</Alert>
										<p className="text-sm text-gray-500 text-center mt-4">
											Redirecting to login...
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
};

export default AuthCallback;
