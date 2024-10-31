import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarRange, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth/useAuth';

const Logo = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 90" className="h-12 w-auto">
		<defs>
			<linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: "#6366F1" }} />
				<stop offset="100%" style={{ stopColor: "#4338CA" }} />
			</linearGradient>

			<linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" style={{ stopColor: "rgba(255,255,255,0)" }} />
				<stop offset="50%" style={{ stopColor: "rgba(255,255,255,0.2)" }} />
				<stop offset="100%" style={{ stopColor: "rgba(255,255,255,0)" }} />
				<animate attributeName="x1" from="-100%" to="100%" dur="3s" repeatCount="indefinite" />
				<animate attributeName="x2" from="0%" to="200%" dur="3s" repeatCount="indefinite" />
			</linearGradient>

			<filter id="premium-shadow" x="-50%" y="-50%" width="200%" height="200%">
				<feOffset dx="2" dy="2" in="SourceAlpha" result="offsetblur" />
				<feGaussianBlur in="offsetblur" stdDeviation="2" result="blur" />
				<feComponentTransfer>
					<feFuncA type="linear" slope="0.3" />
				</feComponentTransfer>
				<feMerge>
					<feMergeNode />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<g transform="translate(30,20)" filter="url(#premium-shadow)">
			<circle cx="25" cy="25" r="25" fill="url(#calendarGradient)" />
			<circle cx="25" cy="25" r="25" fill="url(#shineGradient)" />

			<g transform="translate(25,25)">
				<g stroke="white" strokeWidth="1.5" strokeOpacity="0.6">
					<line x1="0" y1="-20" x2="0" y2="-17" />
					<line x1="20" y1="0" x2="17" y2="0" />
					<line x1="0" y1="20" x2="0" y2="17" />
					<line x1="-20" y1="0" x2="-17" y2="0" />
				</g>

				<g>
					<line x1="0" y1="0" x2="0" y2="-12" stroke="white" strokeWidth="3" strokeLinecap="round">
						<animateTransform attributeName="transform"
							type="rotate"
							from="0 0 0"
							to="360 0 0"
							dur="12s"
							repeatCount="indefinite" />
					</line>
					<line x1="0" y1="0" x2="14" y2="0" stroke="white" strokeWidth="3" strokeLinecap="round">
						<animateTransform attributeName="transform"
							type="rotate"
							from="0 0 0"
							to="360 0 0"
							dur="6s"
							repeatCount="indefinite" />
					</line>
					<circle r="2.5" fill="white" />
				</g>
			</g>
		</g>

		<g transform="translate(90,53)">
			<text fontFamily="Arial, sans-serif" fontSize="38" fontWeight="600" fill="#1F2937" letterSpacing="0">
				schedula
			</text>
		</g>
	</svg>
);

export const Navigation = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { logout, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

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
							<Logo />
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
								<div className="text-base font-medium leading-none text-white">
									{user?.first_name}
								</div>
								<div className="text-sm font-medium leading-none text-gray-400">
									{user?.email}
								</div>
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
