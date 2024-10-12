import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarRange, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navigation = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { logout } = useAuth();
	const navigate = useNavigate();

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Team', path: '/team' },
		{ name: 'Projects', path: '/projects' },
	];

	return (
		<nav className="w-full bg-white dark:bg-gray-500">
			<div className="flex w-full flex-wrap items-center justify-between px-3 py-3">
				<Button
					variant="ghost"
					size="icon"
					className="lg:hidden"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				>
					<Menu className="h-6 w-6" />
				</Button>

				<div className={`${isMenuOpen ? 'block' : 'hidden'} w-full lg:flex lg:w-auto lg:items-center`}>
					<Link to="/" className="mb-4 flex items-center lg:mb-0 lg:mr-6">
						<img
							src="https://tecdn.b-cdn.net/img/logo/te-transparent-noshadows.webp"
							alt="TE Logo"
							className="h-4"
						/>
					</Link>
					<ul className="flex flex-col lg:flex-row lg:space-x-4">
						{navItems.map((item) => (
							<Link
								to={item.path}
								className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							>
								<li key={item.name}>
									{item.name}
								</li>
							</Link>
						))}
					</ul>
				</div>

				<div className="flex items-center">
					<Button variant="ghost" size="icon" className="mr-4">
						<CalendarRange className="h-5 w-5" />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="mr-4 relative">
								<Bell className="h-5 w-5" />
								<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
									1
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
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
						<DropdownMenuContent>
							<DropdownMenuItem>
								<Link to="/profile" className="w-full">Profile</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link to="/settings" className="w-full">Settings</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => {
								logout();
								navigate("/login");
							}}>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</nav>
	);
};
