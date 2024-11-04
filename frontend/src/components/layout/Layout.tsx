import { Outlet, useNavigate } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Users2, KeyRound, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTeam } from "@/context/TeamContext";
import { useAuth } from "@/hooks/useAuth/useAuth";

const Layout = () => {
	const [activeTab, setActiveTab] = useState('create');
	const [teamName, setTeamName] = useState('');
	const [teamCode, setTeamCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { logout } = useAuth();
	const navigate = useNavigate();

	const { teams, loading: teamsLoading, error: teamsError, createTeam, joinTeam } = useTeam();

	const handleQuit = () => {
		logout();
		navigate('/login');
	};

	const handleCreateTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			await createTeam(teamName);
			setTeamName('');
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Failed to create team');
			} else {
				setError('An unexpected error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleJoinTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			await joinTeam(teamCode);
			setTeamCode('');
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Failed to join team');
			} else {
				setError('An unexpected error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	const renderTeamSetup = () => (
		<div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md p-4"
			>
				<Card className="border-none shadow-xl">
					<CardHeader className="space-y-4 pb-8">
						<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
							<Users2 className="h-6 w-6 text-indigo-600" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-center text-gray-900">
							Join Your Team
						</CardTitle>
						<CardDescription className="text-center text-base text-gray-500">
							Create a new team or join an existing one to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger
									value="create"
									className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
								>
									Create Team
								</TabsTrigger>
								<TabsTrigger
									value="join"
									className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
								>
									Join Team
								</TabsTrigger>
							</TabsList>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<TabsContent value="create">
									<form onSubmit={handleCreateTeam} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="teamName" className="text-sm font-medium text-gray-700">
												Team Name
											</Label>
											<div className="relative">
												<Users2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
												<Input
													id="teamName"
													value={teamName}
													onChange={(e) => setTeamName(e.target.value)}
													placeholder="Enter your team name"
													required
													disabled={loading}
													className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
												/>
											</div>
										</div>
										<Button
											type="submit"
											className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
											disabled={loading}
										>
											{loading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Creating...
												</>
											) : (
												'Create Team'
											)}
										</Button>
									</form>
								</TabsContent>

								<TabsContent value="join">
									<form onSubmit={handleJoinTeam} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="teamCode" className="text-sm font-medium text-gray-700">
												Team Code
											</Label>
											<div className="relative">
												<KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
												<Input
													id="teamCode"
													value={teamCode}
													onChange={(e) => setTeamCode(e.target.value)}
													placeholder="Enter team invite code"
													required
													disabled={loading}
													className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
												/>
											</div>
										</div>
										<Button
											type="submit"
											className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
											disabled={loading}
										>
											{loading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Joining...
												</>
											) : (
												'Join Team'
											)}
										</Button>
									</form>
								</TabsContent>
							</motion.div>
						</Tabs>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-4"
							>
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							</motion.div>
						)}

						<div className="mt-6 pt-6 border-t border-gray-200">
							<Button
								onClick={handleQuit}
								variant="ghost"
								className="w-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50"
							>
								<LogOut className="h-4 w-4 mr-2" />
								Sign Out
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);

	const renderMainContent = () => (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-[2000px] w-full mx-auto">
					<Navigation />
				</div>
			</header>
			<main className="flex-grow w-full">
				<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 xl:py-12">
					<Outlet />
				</div>
			</main>
			<footer className="bg-white shadow-sm mt-auto">
				<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
					<div className="text-center text-sm text-gray-500">
						<p>&copy; 2024 Schedula. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);

	const renderLoading = () => (
		<div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
			<div className="flex flex-col items-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
				<p className="text-sm text-gray-500">Loading your workspace...</p>
			</div>
		</div>
	);

	const renderError = () => (
		<div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md border-red-100">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
							<AlertCircle className="h-6 w-6 text-red-600" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Teams</h3>
							<p className="text-sm text-gray-500">{teamsError}</p>
						</div>
						<Button
							onClick={() => window.location.reload()}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);

	if (teamsLoading) return renderLoading();
	if (teamsError) return renderError();
	if (!teams || teams.length === 0) return renderTeamSetup();
	return renderMainContent();
};

export default Layout;
