import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { GoogleIcon } from './GoogleIcon';

axios.defaults.baseURL = 'http://localhost:5713';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';


const Login: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>('login');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState<string>('');
	const { login } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken');
		const storedUser = localStorage.getItem('user');
		if (storedToken && storedUser) {
			navigate("/");
		}
	});

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const response = await axios.post('/auth/login', { email, password }, {
				headers: {
					'Content-Type': 'application/json',
				},
				withCredentials: true
			});
			const { token, user } = response.data;

			axios.interceptors.request.use(config => {
				const token = localStorage.getItem('authToken');
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			});

			login(token, user);
			navigate('/');
		} catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.message || 'An error occurred during login');
			} else {
				setError('An unexpected error occurred');
			}
		}
	};

	return (
		<div className='layout-container'>
			<Card className="w-[400px] shadow-xl">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Welcome</CardTitle>
					<CardDescription>Login or create an account</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="login">Login</TabsTrigger>
							<TabsTrigger value="register">Register</TabsTrigger>
						</TabsList>
						<TabsContent value="login">
							<form className="space-y-4" onSubmit={handleLogin}>
								<Input
									type="email"
									placeholder="Email"
									className="w-full"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								<Input
									type="password"
									placeholder="Password"
									className="w-full"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<Button className="w-full" type="submit">Login</Button>
								{error && <p className="text-red-500 text-sm">{error}</p>}
							</form>
						</TabsContent>
						<TabsContent value="register">
							<form className="space-y-4">
								<Input type="text" placeholder="Username" className="w-full" />
								<Input type="email" placeholder="Email" className="w-full" />
								<Input type="password" placeholder="Password" className="w-full" />
								<Button className="w-full">Register</Button>
							</form>
						</TabsContent>
					</Tabs>

					<div className="mt-6">
						<Separator className="my-4" />
						<Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={() => console.log("Google sign-in")}>
							<span>Continue with</span><GoogleIcon />
						</Button>
					</div>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-sm text-gray-500">
						{activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
						<Button
							variant="link"
							className="pl-1 text-sm"
							onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
						>
							{activeTab === 'login' ? 'Register' : 'Login'}
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Login;
