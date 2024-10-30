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
import { Mail, Lock, Loader2, User, AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Setup axios defaults
axios.defaults.baseURL = 'http://localhost:5713';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Setup axios interceptors for token handling
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 403 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refreshToken');
				const response = await axios.post('/auth/refresh', { refreshToken });
				const { accessToken, refreshToken: newRefreshToken } = response.data;

				localStorage.setItem('authToken', accessToken);
				localStorage.setItem('refreshToken', newRefreshToken);

				axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
				originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

				return axios(originalRequest);
			} catch (refreshError) {
				localStorage.removeItem('authToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

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

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const response = await axios.post('/auth/login', { email, password });
			const { accessToken, refreshToken, user } = response.data;

			localStorage.setItem('authToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);

			axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

			login(accessToken, user);
			navigate('/');
		} catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.message || 'An error occurred during login');
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
			await axios.post('/auth/register', registerData);
			setActiveTab('login');
			setEmail('');
			setPassword('');
			setUsername('');
		} catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.message || 'An error occurred during registration');
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

	return (
		<div className="min-h-screen w-full flex bg-gray-50">
			{/* Illustration Section */}
			<motion.div
				initial={{ opacity: 0, x: -50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center p-12"
			>
				<div className="max-w-lg text-center space-y-8">
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
						className="flex justify-center mb-8"
					>
						<Zap className="h-20 w-20 text-white" />
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<h2 className="text-5xl font-bold text-white mb-6">
							Streamline Your
							<br />
							<span className="text-blue-200">Workflow</span>
						</h2>
						<p className="text-2xl text-blue-100 mb-12">
							Intelligent scheduling that works for you
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="grid grid-cols-3 gap-8 text-blue-50"
					>
						{[
							{ title: "24/7", subtitle: "Support" },
							{ title: "100%", subtitle: "Automated" },
							{ title: "1-Click", subtitle: "Deploy" }
						].map((item, index) => (
							<motion.div
								key={index}
								whileHover={{ scale: 1.05 }}
								className="bg-blue-600/30 rounded-lg p-4 backdrop-blur-sm"
							>
								<div className="text-3xl font-bold">{item.title}</div>
								<div className="text-sm">{item.subtitle}</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.div>

			{/* Form Section */}
			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100"
			>
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-2">
						<CardTitle className="text-3xl font-bold tracking-tight text-center">
							{activeTab === 'login' ? 'Welcome back!' : 'Join us today'}
						</CardTitle>
						<CardDescription className="text-center text-lg">
							{activeTab === 'login'
								? "We're glad to see you again"
								: "Start your journey with us"}
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
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="login">Login</TabsTrigger>
								<TabsTrigger value="register">Register</TabsTrigger>
							</TabsList>

							<AnimatePresence mode="wait">
								<motion.div
									key={activeTab}
								>
									{/* Login Form */}
									<TabsContent value="login" className="space-y-4">
										<form className="space-y-4" onSubmit={handleLogin}>
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
												{/* Email Field */}
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
														<motion.div
															initial={{ scale: 0.5, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															transition={{ delay: 0.2 }}
														>
															<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														</motion.div>
														<Input
															id="email"
															type="email"
															placeholder="name@example.com"
															className="pl-10 transition-shadow duration-200 focus:shadow-lg"
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												{/* Password Field */}
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
														<motion.div
															initial={{ scale: 0.5, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															transition={{ delay: 0.3 }}
														>
															<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														</motion.div>
														<Input
															id="password"
															type="password"
															placeholder="Enter your password"
															className="pl-10 transition-shadow duration-200 focus:shadow-lg"
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												{/* Login Button */}
												<motion.div
													initial={{ y: 20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.3
													}}
												>
													<motion.div
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
														transition={{
															type: "spring",
															stiffness: 400,
															damping: 25
														}}
													>
														<Button
															className="w-full bg-blue-600 hover:bg-blue-700 relative overflow-hidden group"
															type="submit"
															disabled={loading}
														>
															<motion.div
																className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20"
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

									{/* Register Form */}
									<TabsContent value="register" className="space-y-4">
										<form className="space-y-4" onSubmit={handleRegister}>
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
												{/* Username Field */}
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
														transition={{ type: "spring", stiffness: 400, damping: 25 }}
													>
														<motion.div
															initial={{ scale: 0.5, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															transition={{ delay: 0.2 }}
														>
															<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														</motion.div>
														<Input
															id="username"
															type="text"
															placeholder="Choose a username"
															className="pl-10 transition-shadow duration-200 focus:shadow-lg"
															value={username}
															onChange={(e) => setUsername(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												{/* Register Email Field */}
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
														transition={{ type: "spring", stiffness: 400, damping: 25 }}
													>
														<motion.div
															initial={{ scale: 0.5, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															transition={{ delay: 0.3 }}
														>
															<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														</motion.div>
														<Input
															id="register-email"
															type="email"
															placeholder="name@example.com"
															className="pl-10 transition-shadow duration-200 focus:shadow-lg"
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												{/* Register Password Field */}
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
														transition={{ type: "spring", stiffness: 400, damping: 25 }}
													>
														<motion.div
															initial={{ scale: 0.5, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															transition={{ delay: 0.4 }}
														>
															<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														</motion.div>
														<Input
															id="register-password"
															type="password"
															placeholder="Create a password"
															className="pl-10 transition-shadow duration-200 focus:shadow-lg"
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															required
															disabled={loading}
														/>
													</motion.div>
												</motion.div>

												{/* Register Button */}
												<motion.div
													initial={{ y: 20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{
														type: "spring",
														stiffness: 300,
														damping: 20,
														delay: 0.4
													}}
												>
													<motion.div
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
														transition={{
															type: "spring",
															stiffness: 400,
															damping: 25
														}}
													>
														<Button
															className="w-full bg-blue-600 hover:bg-blue-700 relative overflow-hidden group"
															type="submit"
															disabled={loading}
														>
															<motion.div
																className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20"
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

						{/* Error Alert */}
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

						{/* Separator */}
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
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</motion.div>

						{/* Social Login */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								type: "spring",
								stiffness: 200,
								damping: 20,
								delay: 0.5
							}}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 25
								}}
							>
								<Button
									variant="outline"
									className="w-full relative overflow-hidden group"
									onClick={() => console.log("Google sign-in")}
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

					{/* Footer */}
					<CardFooter className="flex flex-col items-center justify-center space-y-2">
						<motion.div
							className="text-sm text-muted-foreground"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
						>
							{activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
							<Button
								variant="link"
								className="pl-1"
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
