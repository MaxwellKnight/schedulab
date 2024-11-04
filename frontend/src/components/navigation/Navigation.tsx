import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, CalendarRange, Bell, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { useTeam } from "@/context/TeamContext";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const Logo = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 90" className="h-12 w-auto">
		<defs>
			<linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: "#4F46E5" }} />
				<stop offset="100%" style={{ stopColor: "#7E22CE" }} />
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
	const [open, setOpen] = useState(false);
	const { logout, user } = useAuth();
	const { teams, selectedTeam, setSelectedTeam } = useTeam();
	const navigate = useNavigate();
	const location = useLocation();

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Schedule', path: '/schedule' },
		{ name: 'Members', path: '/members' },
	];

	const isTeamAdmin = selectedTeam?.creator_id === user?.id;

	return (
		<nav className="w-full bg-white dark:bg-gray-900 shadow-md border-b border-indigo-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link to="/" className="flex-shrink-0">
							<Logo />
						</Link>

						{/* Team Selector - Desktop */}
						<div className="hidden md:block ml-6">
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-[200px] justify-between text-gray-700 border-gray-200"
									>
										{selectedTeam ? selectedTeam.name : "Select team..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Search team..." />
										<CommandEmpty>No team found.</CommandEmpty>
										<CommandGroup>
											{teams?.map((team) => (
												<CommandItem
													key={team.id}
													value={team.name}
													onSelect={() => {
														setSelectedTeam(team);
														setOpen(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															selectedTeam?.id === team.id ? "opacity-100" : "opacity-0"
														)}
													/>
													{team.name}
													{team.creator_id === user?.id && (
														<span className="ml-2 text-xs text-indigo-600">(Admin)</span>
													)}
												</CommandItem>
											))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="hidden md:block ml-6">
							<div className="flex items-baseline space-x-4">
								{navItems.map((item) => (
									<Link
										key={item.name}
										to={item.path}
										className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path
											? 'bg-indigo-600 text-white shadow-sm'
											: 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
											}`}
									>
										{item.name}
									</Link>
								))}
							</div>
						</div>
					</div>

					{/* Desktop Navigation Items */}
					<div className="hidden md:block">
						<div className="ml-4 flex items-center md:ml-6 space-x-2">
							{isTeamAdmin && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
											<CalendarRange className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-48">
										<DropdownMenuItem onClick={() => navigate("/build")} className="cursor-pointer">
											Build Schedule
										</DropdownMenuItem>
										<DropdownMenuItem className="cursor-pointer">Schedule History</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 relative">
										<Bell className="h-5 w-5" />
										<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-xs text-white flex items-center justify-center">
											1
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-48">
									<DropdownMenuItem className="cursor-pointer">Notification</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer">Messages</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="hover:bg-indigo-50">
										<Avatar>
											<AvatarImage src={user?.picture} alt={user?.display_name} />
											<AvatarFallback className="bg-indigo-600 text-white">
												{user?.display_name?.charAt(0)}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									<DropdownMenuItem className="cursor-pointer">
										<Link to="/profile" className="w-full">Profile</Link>
									</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer">
										<Link to="/settings" className="w-full">Settings</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
										onClick={() => {
											logout();
											navigate("/login");
										}}
									>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Mobile Menu Button and Team Selector */}
					<div className="md:hidden flex items-center space-x-4">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									className="w-[150px] justify-between text-gray-700 border-gray-200"
								>
									{selectedTeam ? (
										<span className="truncate">{selectedTeam.name}</span>
									) : (
										"Select team..."
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[150px] p-0">
								<Command>
									<CommandInput placeholder="Search team..." />
									<CommandEmpty>No team found.</CommandEmpty>
									<CommandGroup>
										{teams?.map((team) => (
											<CommandItem
												key={team.id}
												value={team.name}
												onSelect={() => {
													setSelectedTeam(team);
													setOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedTeam?.id === team.id ? "opacity-100" : "opacity-0"
													)}
												/>
												<span className="truncate">{team.name}</span>
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Main menu"
							aria-expanded={isMenuOpen}
							className="text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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

			{/* Mobile Menu Panel */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						className="md:hidden"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
					>
						<div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
							{navItems.map((item) => (
								<Link
									key={item.name}
									to={item.path}
									className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path
										? 'bg-indigo-600 text-white'
										: 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
										}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
						</div>

						<div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
							<div className="flex items-center px-4 space-x-3">
								<Avatar>
									<AvatarImage src={user?.picture} alt={user?.display_name} />
									<AvatarFallback className="bg-indigo-600 text-white">
										{user?.display_name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="text-base font-medium text-gray-800">
										{user?.display_name}
									</div>
									<div className="text-sm font-medium text-gray-500">
										{user?.email}
									</div>
								</div>
							</div>

							<div className="mt-3 space-y-1 px-2">
								{isTeamAdmin && (
									<Button
										variant="ghost"
										className="w-full justify-start text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
										onClick={() => {
											navigate("/build");
											setIsMenuOpen(false);
										}}
									>
										<CalendarRange className="h-5 w-5 mr-2" />
										Build Schedule
									</Button>
								)}

								<Button
									variant="ghost"
									className="w-full justify-start text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
									onClick={() => {
										navigate("/profile");
										setIsMenuOpen(false);
									}}
								>
									Profile
								</Button>

								<Button
									variant="ghost"
									className="w-full justify-start text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
									onClick={() => {
										navigate("/settings");
										setIsMenuOpen(false);
									}}
								>
									Settings
								</Button>

								<Button
									variant="ghost"
									className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
									onClick={() => {
										logout();
										navigate("/login");
										setIsMenuOpen(false);
									}}
								>
									<LogOut className="h-5 w-5 mr-2" />
									Logout
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};

export default Navigation;
