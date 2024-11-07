import { Outlet, useNavigate } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Loader2,
	AlertCircle,
	Users2,
	KeyRound,
	LogOut,
	Info,
	Shield,
	UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axios from 'axios';
import { useTeam } from "@/context/TeamContext";
import { useAuth } from "@/hooks/useAuth/useAuth";

const Layout = () => {
	const [activeTab, setActiveTab] = useState('create');
	const [teamName, setTeamName] = useState('');
	const [teamCode, setTeamCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [teamDescription, setTeamDescription] = useState('');
	const [teamSize, setTeamSize] = useState('small');
	const [role, setRole] = useState('member');

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
			await createTeam({
				name: teamName,
				notes: teamDescription
			});
			setSuccess('Team created successfully!');
			setTeamName('');
			setTeamDescription('');
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
			setSuccess('Successfully joined team!');
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
		<div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 bg-grid-small-slate-100/60 relative bg-fixed backdrop-blur-[0.2px]">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-lg p-4"
			>
				<Card className="p-4 border-none shadow-xl backdrop-blur-sm bg-white/90">
					<CardHeader className="space-y-4 pb-8">
						<motion.div
							initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
							animate={{
								scale: 1,
								opacity: 1,
								rotateY: 0,
								boxShadow: "0 0 0 0.5rem rgba(241, 245, 249, 0.5)"
							}}
							transition={{
								duration: 0.7,
								ease: "easeOut",
								rotateY: { type: "spring", stiffness: 100 }
							}}
							whileHover={{
								scale: 1.05,
								boxShadow: "0 0 0 0.75rem rgba(241, 245, 249, 0.7)",
								transition: { duration: 0.2 }
							}}
							className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200"
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3, duration: 0.5 }}
							>
								<Users2 className="h-8 w-8 text-slate-600 drop-shadow-sm" />
							</motion.div>
						</motion.div>
						<CardTitle className="text-2xl font-bold tracking-tight text-center text-indigo-900">
							{activeTab === 'create' ? 'Create Your Team' : 'Join Existing Team'}
						</CardTitle>
						<CardDescription className="text-center text-base text-gray-500">
							{activeTab === 'create'
								? 'Build your dream team and start collaborating together'
								: 'Enter an invite code to join your teammates'}
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

							<AnimatePresence mode="wait">
								<motion.div
									key={activeTab}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
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
														className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
													/>
												</div>
											</div>

											<div className="space-y-2">
												<Label htmlFor="teamDescription" className="text-sm font-medium text-gray-700">
													Team Description
												</Label>
												<div className="relative">
													<Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
													<Input
														id="teamDescription"
														value={teamDescription}
														onChange={(e) => setTeamDescription(e.target.value)}
														placeholder="Brief description of your team"
														disabled={loading}
														className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
													/>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="teamSize" className="text-sm font-medium text-gray-700">
														Team Size
													</Label>
													<Select value={teamSize} onValueChange={setTeamSize} disabled={loading}>
														<SelectTrigger className="h-10">
															<SelectValue placeholder="Select size" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="small">Small (2-5)</SelectItem>
															<SelectItem value="medium">Medium (6-10)</SelectItem>
															<SelectItem value="large">Large (11-20)</SelectItem>
															<SelectItem value="enterprise">Enterprise (20+)</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-2">
													<Label htmlFor="role" className="text-sm font-medium text-gray-700">
														Your Role
													</Label>
													<Select value={role} onValueChange={setRole} disabled={loading}>
														<SelectTrigger className="h-10">
															<SelectValue placeholder="Select role" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="admin">Admin</SelectItem>
															<SelectItem value="member">Team Member</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>

											<Button
												type="submit"
												className="w-full h-10 bg-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
												disabled={loading}
											>
												{loading ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Creating Team...
													</>
												) : (
													<>
														<UserPlus className="mr-2 h-4 w-4" />
														Create Team
													</>
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
														onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
														placeholder="Enter team invite code"
														required
														disabled={loading}
														className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 uppercase"
													/>
												</div>
											</div>

											<Button
												type="submit"
												className="w-full h-10 bg-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
												disabled={loading}
											>
												{loading ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Joining Team...
													</>
												) : (
													<>
														<Shield className="mr-2 h-4 w-4" />
														Join Team
													</>
												)}
											</Button>
										</form>
									</TabsContent>
								</motion.div>
							</AnimatePresence>
						</Tabs>

						<AnimatePresence>
							{error && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="mt-4"
								>
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								</motion.div>
							)}

							{success && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="mt-4"
								>
									<Alert className="bg-green-50 border-green-200">
										<Shield className="h-4 w-4 text-green-600" />
										<AlertDescription className="text-green-800">{success}</AlertDescription>
									</Alert>
								</motion.div>
							)}
						</AnimatePresence>

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
				<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 xl:py-12 bg-slate-50 bg-grid-small-slate-100/60 bg-fixed backdrop-blur-[0.2px]">
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
				<Loader2 className="h-8 w-8 animate-spin text-slate-600" />
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
