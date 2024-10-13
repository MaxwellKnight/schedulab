import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarRange, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navigation = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { logout, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => console.log(user), [user]);

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Schedule', path: '/schedule' },
		{ name: 'Members', path: '/members' },
	];

	return (
		<nav className="w-full bg-white dark:bg-gray-800 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link to="/" className="flex-shrink-0">
							<img
								src="https://tecdn.b-cdn.net/img/logo/te-transparent-noshadows.webp"
								alt="TE Logo"
								className="h-8 w-auto"
							/>
						</Link>
						<div className="hidden md:block ml-10">
							<div className="flex items-baseline space-x-4">
								{navItems.map((item) => (
									<Link
										key={item.name}
										to={item.path}
										className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === item.path
											? 'bg-gray-900 text-white'
											: 'text-gray-700 hover:bg-gray-700 hover:text-white'
											}`}
									>
										{item.name}
									</Link>
								))}
							</div>
						</div>
					</div>
					<div className="hidden md:block">
						<div className="ml-4 flex items-center md:ml-6">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="mr-2">
										<CalendarRange className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{user && user.user_role === 'admin' && (
										<DropdownMenuItem onClick={() => navigate("/build")}>
											Build
										</DropdownMenuItem>
									)}
									<DropdownMenuItem>History</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="mr-2 relative">
										<Bell className="h-5 w-5" />
										<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
											1
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>Notification</DropdownMenuItem>
									<DropdownMenuItem>Messages</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<Avatar>
											<AvatarImage src="https://plus.unsplash.com/premium_vector-1721131162788-375a9ff8f1b9?q=80&w=3600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="User" />
											<AvatarFallback>CN</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>
										<Link to="/profile" className="w-full">Profile</Link>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Link to="/settings" className="w-full">Settings</Link>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => {
										logout();
										navigate("/login");
									}}>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="md:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Main menu"
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" aria-hidden="true" />
							) : (
								<Menu className="h-6 w-6" aria-hidden="true" />
							)}
						</Button>
					</div>
				</div>
			</div>
			{isMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{navItems.map((item) => (
							<Link
								key={item.name}
								to={item.path}
								className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path
									? 'bg-gray-900 text-white'
									: 'text-gray-700 hover:bg-gray-700 hover:text-white'
									}`}
								onClick={() => setIsMenuOpen(false)}
							>
								{item.name}
							</Link>
						))}
					</div>
					<div className="pt-4 pb-3 border-t border-gray-700">
						<div className="flex items-center px-5">
							<div className="flex-shrink-0">
								<Avatar>
									<AvatarImage src="https://plus.unsplash.com/premium_vector-1721131162788-375a9ff8f1b9?q=80&w=3600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="User" />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
							</div>
							<div className="ml-3">
								<div className="text-base font-medium leading-none text-white">{user?.first_name}</div>
								<div className="text-sm font-medium leading-none text-gray-400">{user?.email}</div>
							</div>
						</div>
						<div className="mt-3 px-2 space-y-1">
							<Link
								to="/profile"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
								onClick={() => setIsMenuOpen(false)}
							>
								Profile
							</Link>
							<Link
								to="/settings"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
								onClick={() => setIsMenuOpen(false)}
							>
								Settings
							</Link>
							<button
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
								onClick={() => {
									logout();
									navigate("/login");
									setIsMenuOpen(false);
								}}
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
