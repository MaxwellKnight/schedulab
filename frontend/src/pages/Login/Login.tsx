import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Zap, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { TokenPayload } from '@/types/users.dto';
import { decodeJwtToken } from '@/utils/jwt';
import { LoginForm, RegisterForm } from '@/components';
import { GoogleIcon } from './GoogleIcon';

interface RegisterData {
	username: string;
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>('login');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken');
		const storedUser = localStorage.getItem('user');
		if (storedToken && storedUser) {
			navigate("/");
		}
	}, [navigate]);

	const handleGoogleLogin = () => {
		window.location.href = `${axios.defaults.baseURL}/auth/google`;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const response = await axios.post<{
				accessToken: string;
				refreshToken: string;
				user: UserData;
			}>('/auth/login', {
				email,
				password
			});

			const { accessToken, refreshToken } = response.data;
			const tokenPayload = decodeJwtToken(accessToken);

			const userPayload: TokenPayload = {
				id: tokenPayload.id,
				email: tokenPayload.email,
				display_name: tokenPayload.display_name,
				google_id: tokenPayload.google_id,
				picture: tokenPayload.picture,
				exp: tokenPayload.exp,
				iat: tokenPayload.iat,
			};

			localStorage.setItem('authToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(userPayload));

			axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

			login(accessToken, userPayload, refreshToken);
			navigate('/');
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const errorMessage = err.response?.data?.message || err.message;
				setError(errorMessage);

				if (err.response?.status === 401) {
					setError('Invalid email or password');
				} else if (err.response?.status === 429) {
					setError('Too many login attempts. Please try again later.');
				} else {
					setError(errorMessage || 'An error occurred during login');
				}
			} else {
				setError('An unexpected error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const registerData: RegisterData = {
			username,
			email,
			password
		};

		try {
			const response = await axios.post('/auth/register', registerData);

			if (response.status === 201 || response.status === 200) {
				setActiveTab('login');
				setEmail('');
				setPassword('');
				setUsername('');
				toast({
					title: "Account created successfully!",
					description: "Please log in with your new account.",
					variant: "default"
				});
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const errorMessage = err.response?.data?.message || err.message;

				// Handle specific registration errors
				if (err.response?.status === 409) {
					setError('Email or username already exists');
				} else if (err.response?.status === 400) {
					setError(errorMessage || 'Invalid registration data');
				} else {
					setError(errorMessage || 'An error occurred during registration');
				}
			} else {
				setError('An unexpected error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setEmail('');
		setPassword('');
		setUsername('');
		setError('');
	};

	const features = [
		{
			icon: <Clock className="text-gray-200 h-6 w-6 mb-2" />,
			title: "Priority",
			subtitle: "Smart Handling"
		},
		{
			icon: <Zap className="text-gray-200 h-6 w-6 mb-2" />,
			title: "Instant",
			subtitle: "Coordination"
		},
		{
			icon: <Calendar className="text-gray-200 h-6 w-6 mb-2" />,
			title: "Effortless",
			subtitle: "Planning"
		}
	];

	return (
		<div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-indigo-700 via-purple-700 to-purple-800 items-center justify-center">
			{/* Illustration Section */}
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative"
			>
				<div className="relative max-w-lg text-center space-y-8">
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
						className="flex justify-center"
					>
						<Calendar className="h-20 w-20 text-white/90" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<h2 className="text-5xl font-bold text-white mb-6">
							Welcome to<br />
							<span className="text-indigo-200">Schedulab</span>
						</h2>
						<p className="text-xl text-indigo-100">
							Streamlined scheduling that puts your priorities first
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-4"
					>
						{features.map((item, index) => (
							<motion.div
								key={index}
								whileHover={{ scale: 1.05, backgroundColor: 'rgba(79, 70, 229, 0.4)' }}
								className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col items-center"
							>
								{item.icon}
								<div className="text-lg font-bold text-white">{item.title}</div>
								<div className="text-sm text-indigo-200">{item.subtitle}</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.div>

			{/* Form Section */}
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 shadow-[0_8px_30px_rgba(79,70,229,0.15)] backdrop-blur-sm"
			>
				<Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-indigo-100">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight text-center text-indigo-900">
							{activeTab === 'login' ? 'Welcome back!' : 'Join Schedulab'}
						</CardTitle>
						<CardDescription className="text-center text-base lg:text-lg text-indigo-600">
							{activeTab === 'login' ? "Ready to plan smarter" : "Start organizing efficiently"}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<Tabs
							value={activeTab}
							onValueChange={(value) => {
								setActiveTab(value);
								resetForm();
							}}
							className="space-y-6"
						>
							<TabsList className="grid w-full grid-cols-2 bg-indigo-50">
								<TabsTrigger
									value="login"
									className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
								>
									Login
								</TabsTrigger>
								<TabsTrigger
									value="register"
									className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
								>
									Register
								</TabsTrigger>
							</TabsList>

							<AnimatePresence mode="wait">
								<motion.div key={activeTab}>
									<TabsContent value="login" className="space-y-4">
										<LoginForm
											handleLogin={handleLogin}
											setEmail={setEmail}
											setPassword={setPassword}
											email={email}
											password={password}
											loading={loading}
										/>
									</TabsContent>

									<TabsContent value="register" className="space-y-4">
										<RegisterForm
											handleRegister={handleRegister}
											setEmail={setUsername}
											setPassword={setPassword}
											email={username}
											password={password}
											loading={loading}
										/>
									</TabsContent>
								</motion.div>
							</AnimatePresence>
						</Tabs>

						<AnimatePresence>
							{error && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ type: "spring", stiffness: 200, damping: 20 }}
								>
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								</motion.div>
							)}
						</AnimatePresence>

						<motion.div
							className="relative"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500">
									Or continue with
								</span>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									variant="outline"
									className="w-full relative overflow-hidden group"
									onClick={handleGoogleLogin}
									disabled={loading}
								>
									<motion.div
										className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-50"
										initial={false}
										transition={{ duration: 0.3 }}
									/>
									<GoogleIcon />
									Continue with Google
								</Button>
							</motion.div>
						</motion.div>
					</CardContent>

					<CardFooter className="flex flex-col items-center justify-center space-y-2">
						<motion.div
							className="text-sm text-gray-500"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
						>
							{activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
							<Button
								variant="link"
								className="pl-1 text-indigo-600"
								onClick={() => {
									setActiveTab(activeTab === 'login' ? 'register' : 'login');
									resetForm();
								}}
								disabled={loading}
							>
								{activeTab === 'login' ? 'Sign up' : 'Login'}
							</Button>
						</motion.div>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
};

export default Login;
