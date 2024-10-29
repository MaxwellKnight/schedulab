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
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center p-12">
				<div className="max-w-lg text-center space-y-6">
					<div className="flex justify-center mb-6">
						<Zap className="h-16 w-16 text-white" />
					</div>
					<h2 className="text-4xl font-bold text-white mb-4">
						Smart Scheduling,
						<br />
						Made Simple
					</h2>
					<p className="text-xl text-blue-100 mb-8">
						Automate your workforce planning in minutes, not hours
					</p>
					<div className="grid grid-cols-3 gap-4 text-blue-50">
						<div>
							<div className="text-2xl font-bold">24/7</div>
							<div className="text-sm">Availability</div>
						</div>
						<div>
							<div className="text-2xl font-bold">100%</div>
							<div className="text-sm">Automated</div>
						</div>
						<div>
							<div className="text-2xl font-bold">1-Click</div>
							<div className="text-sm">Scheduling</div>
						</div>
					</div>
				</div>
			</div>

			{/* Form Section */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight text-center">
							{activeTab === 'login' ? 'Welcome back' : 'Create account'}
						</CardTitle>
						<CardDescription className="text-center">
							{activeTab === 'login'
								? "Enter your credentials to access your account"
								: "Create an account to get started"}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
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

							<TabsContent value="login" className="space-y-4">
								<form className="space-y-4" onSubmit={handleLogin}>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<div className="relative">
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
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<div className="relative">
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
										</div>
									</div>

									<Button
										className="w-full"
										type="submit"
										disabled={loading}
									>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Logging in...
											</>
										) : (
											'Login'
										)}
									</Button>
								</form>
							</TabsContent>

							<TabsContent value="register" className="space-y-4">
								<form className="space-y-4" onSubmit={handleRegister}>
									<div className="space-y-2">
										<Label htmlFor="username">Username</Label>
										<div className="relative">
											<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="username"
												type="text"
												placeholder="Enter your username"
												className="pl-10"
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												required
												disabled={loading}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="register-email">Email</Label>
										<div className="relative">
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
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="register-password">Password</Label>
										<div className="relative">
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
										</div>
									</div>

									<Button
										className="w-full"
										type="submit"
										disabled={loading}
									>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating account...
											</>
										) : (
											'Create account'
										)}
									</Button>
								</form>
							</TabsContent>
						</Tabs>

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							className="w-full"
							onClick={() => console.log("Google sign-in")}
							disabled={loading}
						>
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
					</CardContent>

					<CardFooter className="flex flex-col items-center justify-center space-y-2">
						<div className="text-sm text-muted-foreground">
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
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default Login;
