import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Label } from '@radix-ui/react-label';
import { Mail, Lock, Loader2, User, AlertCircle, Zap, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { TokenPayload } from '@/types/users.dto';
import { decodeJwtToken } from '@/utils/jwt';

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
				picture: tokenPayload.picture
			};

			localStorage.setItem('authToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(userPayload));

			axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

			login(accessToken, userPayload);
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
			icon: <Clock className="h-6 w-6 mb-2" />,
			title: "Priority",
			subtitle: "Smart Handling"
		},
		{
			icon: <Zap className="h-6 w-6 mb-2" />,
			title: "Instant",
			subtitle: "Coordination"
		},
		{
			icon: <Calendar className="h-6 w-6 mb-2" />,
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
							<span className="text-indigo-200">Magshimim Boyz</span>
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
							{activeTab === 'login' ? 'Welcome back!' : 'Join Schedula'}
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
										<form onSubmit={handleLogin} className="space-y-4">
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												transition={{
													type: "spring",
													stiffness: 200,
													damping: 20,
													mass: 0.8
												}}
												className="space-y-4"
											>
												<motion.div
													className="space-y-2"
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.1
													}}
												>
													<Label htmlFor="email">Email</Label>
													<motion.div
														className="relative"
														whileFocus={{ scale: 1.02 }}
														transition={{ type: "spring", stiffness: 400, damping: 25 }}
													>
														<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="email"
															type="email"
															placeholder="name@example.com"
															className="pl-10"
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												<motion.div
													className="space-y-2"
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.2
													}}
												>
													<Label htmlFor="password">Password</Label>
													<motion.div
														className="relative"
														whileFocus={{ scale: 1.02 }}
														transition={{ type: "spring", stiffness: 400, damping: 25 }}
													>
														<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="password"
															type="password"
															placeholder="Enter your password"
															className="pl-10"
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												<motion.div
													initial={{ y: 20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{ delay: 0.3 }}
												>
													<motion.div
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
													>
														<Button
															className="w-full bg-indigo-600 hover:bg-indigo-700 relative overflow-hidden group"
															type="submit"
															disabled={loading}
														>
															<motion.div
																className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20"
																initial={false}
																animate={loading ? { x: ["0%", "100%"] } : { x: "0%" }}
																transition={{
																	duration: 1,
																	repeat: loading ? Infinity : 0,
																	ease: "linear"
																}}
															/>
															{loading ? (
																<motion.div
																	initial={{ opacity: 0, scale: 0.8 }}
																	animate={{ opacity: 1, scale: 1 }}
																	className="flex items-center justify-center"
																>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	<span>Logging in...</span>
																</motion.div>
															) : (
																<motion.span
																	initial={{ opacity: 0 }}
																	animate={{ opacity: 1 }}
																	transition={{ delay: 0.4 }}
																>
																	Login
																</motion.span>
															)}
														</Button>
													</motion.div>
												</motion.div>
											</motion.div>
										</form>
									</TabsContent>

									<TabsContent value="register" className="space-y-4">
										<form onSubmit={handleRegister} className="space-y-4">
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												transition={{
													type: "spring",
													stiffness: 200,
													damping: 20,
													mass: 0.8
												}}
												className="space-y-4"
											>
												<motion.div
													className="space-y-2"
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.1
													}}
												>
													<Label htmlFor="username">Username</Label>
													<motion.div
														className="relative"
														whileFocus={{ scale: 1.02 }}
													>
														<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="username"
															type="text"
															placeholder="Choose a username"
															className="pl-10"
															value={username}
															onChange={(e) => setUsername(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												<motion.div
													className="space-y-2"
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.2
													}}
												>
													<Label htmlFor="register-email">Email</Label>
													<motion.div
														className="relative"
														whileFocus={{ scale: 1.02 }}
													>
														<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="register-email"
															type="email"
															placeholder="name@example.com"
															className="pl-10"
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												<motion.div
													className="space-y-2"
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.3
													}}
												>
													<Label htmlFor="register-password">Password</Label>
													<motion.div
														className="relative"
														whileFocus={{ scale: 1.02 }}
													>
														<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="register-password"
															type="password"
															placeholder="Create a password"
															className="pl-10"
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												<motion.div
													initial={{ y: 20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{ delay: 0.4 }}
												>
													<motion.div
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
													>
														<Button
															className="w-full bg-indigo-600 hover:bg-indigo-700 relative overflow-hidden group"
															type="submit"
															disabled={loading}
														>
															<motion.div
																className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20"
																initial={false}
																animate={loading ? { x: ["0%", "100%"] } : { x: "0%" }}
																transition={{
																	duration: 1,
																	repeat: loading ? Infinity : 0,
																	ease: "linear"
																}}
															/>
															{loading ? (
																<motion.div
																	initial={{ opacity: 0, scale: 0.8 }}
																	animate={{ opacity: 1, scale: 1 }}
																	className="flex items-center justify-center"
																>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	<span>Creating account...</span>
																</motion.div>
															) : (
																<motion.span
																	initial={{ opacity: 0 }}
																	animate={{ opacity: 1 }}
																	transition={{ delay: 0.5 }}
																>
																	Create account
																</motion.span>
															)}
														</Button>
													</motion.div>
												</motion.div>
											</motion.div>
										</form>
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
									<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
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
