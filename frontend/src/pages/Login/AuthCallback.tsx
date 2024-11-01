import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

	useEffect(() => {
		// Cycle through loading messages
		if (authState.status === 'loading') {
			const interval = setInterval(() => {
				setMessageIndex(prev => (prev + 1) % loadingMessages.length);
			}, 2000);
			return () => clearInterval(interval);
		}
	}, [authState.status]);

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const accessToken = searchParams.get('accessToken');
				const refreshToken = searchParams.get('refreshToken');

				if (!accessToken || !refreshToken) {
					throw new Error('Missing authentication tokens');
				}

				// Store tokens
				localStorage.setItem('authToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
				axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

				try {
					const response = await axios.get('/auth/google/user', {
						headers: { Authorization: `Bearer ${accessToken}` }
					});

					setAuthState({
						status: 'success',
						message: 'Authentication successful!'
					});

					login(accessToken, response.data.user);

					// Delay navigation for animation
					setTimeout(() => {
						navigate('/', { replace: true });
					}, 1500);

				} catch (error) {
					throw new Error('Failed to fetch user data');
				}

			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
				setAuthState({
					status: 'error',
					message: errorMessage
				});

				setTimeout(() => {
					navigate('/login');
				}, 2000);
			}
		};

		handleCallback();
	}, [searchParams, navigate, login]);

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
