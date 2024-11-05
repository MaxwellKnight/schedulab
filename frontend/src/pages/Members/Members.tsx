import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { useTeam } from '@/context/TeamContext';
import {
	Search,
	MoreHorizontal,
	ChevronDown,
	Mail,
	Shield,
	UserCog,
	Calendar,
	Clock,
	XCircle,
	CalendarDays,
	Activity,
	Upload,
	Users,
	Bell,
	ChevronLeft,
	ChevronRight,
	Filter,
	RefreshCw
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Types
interface Member {
	id: number;
	name: string;
	email: string;
	role: string;
	status: string;
	attendance: number;
	nextShift: string;
	department: string;
	joinDate: string;
	lastActive: string;
}

interface SortConfig {
	key: keyof Member | null;
	direction: 'asc' | 'desc';
}

interface QuickStat {
	title: string;
	value: string;
	change: string;
	icon: JSX.Element;
	bgColor: string;
}

// Sample Data
const MEMBERS_DATA: Member[] = [
	{
		id: 1,
		name: "Sarah Chen",
		email: "sarah.c@example.com",
		role: "Team Lead",
		status: "Active",
		attendance: 95,
		nextShift: "Morning (6:00 AM)",
		department: "Engineering",
		joinDate: "2023-05-15",
		lastActive: "2 minutes ago"
	},
	{
		id: 2,
		name: "Michael Kim",
		email: "m.kim@example.com",
		role: "Member",
		status: "On Vacation",
		attendance: 88,
		nextShift: "Evening (2:00 PM)",
		department: "Design",
		joinDate: "2023-08-22",
		lastActive: "2 days ago"
	},
	{
		id: 3,
		name: "Jessica Taylor",
		email: "j.taylor@example.com",
		role: "Member",
		status: "Active",
		attendance: 92,
		nextShift: "Morning (6:00 AM)",
		department: "Engineering",
		joinDate: "2023-06-10",
		lastActive: "5 minutes ago"
	},
	{
		id: 4,
		name: "David Martinez",
		email: "d.martinez@example.com",
		role: "Team Lead",
		status: "In Meeting",
		attendance: 97,
		nextShift: "Afternoon (10:00 AM)",
		department: "Product",
		joinDate: "2023-03-15",
		lastActive: "1 hour ago"
	},
	{
		id: 5,
		name: "Emma Wilson",
		email: "e.wilson@example.com",
		role: "Admin",
		status: "Active",
		attendance: 94,
		nextShift: "Morning (6:00 AM)",
		department: "Operations",
		joinDate: "2023-01-20",
		lastActive: "Just now"
	},
	{
		id: 6,
		name: "Alex Thompson",
		email: "a.thompson@example.com",
		role: "Member",
		status: "Active",
		attendance: 91,
		nextShift: "Evening (2:00 PM)",
		department: "Engineering",
		joinDate: "2023-09-05",
		lastActive: "30 minutes ago"
	},
	{
		id: 7,
		name: "Nina Patel",
		email: "n.patel@example.com",
		role: "Team Lead",
		status: "In Meeting",
		attendance: 96,
		nextShift: "Morning (6:00 AM)",
		department: "Product",
		joinDate: "2023-04-12",
		lastActive: "15 minutes ago"
	}
];

const QUICK_STATS: QuickStat[] = [
	{
		title: "Total Members",
		value: "24",
		change: "+2 this month",
		icon: <Users className="h-5 w-5 text-blue-500" />,
		bgColor: "bg-blue-50",
	},
	{
		title: "On Vacation",
		value: "3",
		change: "2 returning next week",
		icon: <CalendarDays className="h-5 w-5 text-yellow-500" />,
		bgColor: "bg-yellow-50",
	},
	{
		title: "Avg Attendance",
		value: "95%",
		change: "+2.5% from last month",
		icon: <Activity className="h-5 w-5 text-green-500" />,
		bgColor: "bg-green-50",
	},
	{
		title: "Pending Invites",
		value: "5",
		change: "3 awaiting response",
		icon: <Mail className="h-5 w-5 text-purple-500" />,
		bgColor: "bg-purple-50",
	}
];

const Members = () => {
	// State declarations
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState("All Roles");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

	// Auth and team context
	const { user } = useAuth();
	const { selectedTeam } = useTeam();

	// Check if user is admin
	const isAdmin = selectedTeam?.creator_id === user?.id;

	// Utility functions remain the same
	const getAttendanceColor = (rate: number) => {
		if (rate >= 90) return 'text-green-600 bg-green-50';
		if (rate >= 75) return 'text-yellow-600 bg-yellow-50';
		return 'text-red-600 bg-red-50';
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(part => part[0])
			.join('')
			.toUpperCase();
	};

	const getStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			'Active': 'bg-green-100 text-green-700 hover:bg-green-200',
			'On Vacation': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
			'In Meeting': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
			'Offline': 'bg-gray-100 text-gray-700 hover:bg-gray-200'
		};
		return statusColors[status] || 'bg-gray-100 text-gray-700';
	};

	// Non-admin view - simple member list with basic info
	const NonAdminView = () => (
		<div className="p-2 space-y-4 bg-gray-50">
			<Card className="shadow-sm">
				<CardContent className="p-4">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold">Team Members</h1>
					</div>

					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
						<Input
							className="pl-10 w-full border-gray-200"
							placeholder="Search members..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[300px]">Member</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Next Shift</TableHead>
								<TableHead>Last Active</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{MEMBERS_DATA
								.filter(member =>
									member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
									member.email.toLowerCase().includes(searchTerm.toLowerCase())
								)
								.map((member) => (
									<TableRow key={member.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-700">
													{getInitials(member.name)}
												</div>
												<div>
													<div className="font-medium">{member.name}</div>
													<div className="text-sm text-gray-500">{member.email}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className={getStatusColor(member.status)}>
												{member.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className={getStatusColor(member.status)}>
												{member.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4 text-gray-500" />
												<span className="text-sm">{member.nextShift}</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-gray-500">{member.lastActive}</span>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);

	// Filter and Sort Logic
	const filteredMembers = MEMBERS_DATA.filter(member => {
		const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.department.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = selectedRole === "All Roles" || member.role === selectedRole;
		const matchesStatus = selectedStatus === "All" || member.status === selectedStatus;
		const matchesDepartment = selectedDepartments.length === 0 ||
			selectedDepartments.includes(member.department);

		return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
	});

	const sortedMembers = [...filteredMembers].sort((a, b) => {
		if (!sortConfig.key) return 0;
		const aValue = a[sortConfig.key];
		const bValue = b[sortConfig.key];
		return sortConfig.direction === 'asc'
			? String(aValue).localeCompare(String(bValue))
			: String(bValue).localeCompare(String(aValue));
	});

	const paginatedMembers = sortedMembers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);

	const handleSort = (key: keyof Member) => {
		setSortConfig(current => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
		}));
	};

	const handleRefresh = () => {
		setIsRefreshing(true);
		setTimeout(() => setIsRefreshing(false), 1000);
	};

	// Return appropriate view based on admin status
	if (!isAdmin) {
		return <NonAdminView />;
	}

	// Admin view - full management interface
	return (
		<div className="p-2 space-y-4 bg-gray-50">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 bg-white p-6 rounded-xl border border-gray-100">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-800">
							Team Members
						</h1>
						<Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">
							{MEMBERS_DATA.length} Total
						</Badge>
					</div>
					<p className="text-base text-gray-500 font-normal">
						Manage your team members and their roles
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
					<Button
						variant="outline"
						className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors px-4 h-10"
					>
						<Bell className="h-4 w-4 mr-2.5 text-gray-500" />
						Notifications
						<Badge
							variant="secondary"
							className="ml-2.5 bg-gray-100 text-gray-600 font-medium"
						>
							3
						</Badge>
					</Button>

					<Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors px-4 h-10">
						<Mail className="h-4 w-4 mr-2.5" />
						Invite Member
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{QUICK_STATS.map((stat, index) => (
					<Card key={index} className="hover:shadow-md transition-shadow duration-200">
						<CardContent className="p-4">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium text-gray-600">{stat.title}</p>
									<p className="text-3xl font-bold mt-2">{stat.value}</p>
									<p className="text-sm text-gray-500 mt-1">{stat.change}</p>
								</div>
								<div className={`${stat.bgColor} p-3 rounded-lg`}>
									{stat.icon}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Search and Filter Bar */}
			<Card className="p-4 shadow-sm">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
							<Input
								className="pl-10 w-full border-gray-200 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Search by name, email, or department..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex gap-3">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="min-w-[120px] border-gray-200">
										{selectedRole}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[200px]">
									{["All Roles", "Admin", "Member"].map((role) => (
										<DropdownMenuCheckboxItem
											key={role}
											checked={selectedRole === role}
											onCheckedChange={() => setSelectedRole(role)}
										>
											{role}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="border-gray-200">
										<Filter className="h-4 w-4 mr-2" />
										Status
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[200px]">
									{["All", "Active", "On Vacation", "In Meeting", "Offline"].map((status) => (
										<DropdownMenuCheckboxItem
											key={status}
											checked={selectedStatus === status}
											onCheckedChange={() => setSelectedStatus(status)}
										>
											{status}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<Button
								variant="outline"
								className="border-gray-200"
								onClick={handleRefresh}
								disabled={isRefreshing}
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
								Refresh
							</Button>

							<Button variant="outline" className="border-gray-200">
								<Upload className="h-4 w-4 mr-2" />
								Export
							</Button>
						</div>
					</div>

					{/* Active Filters Display */}
					{(selectedRole !== "All Roles" ||
						selectedStatus !== "All" ||
						selectedDepartments.length > 0 ||
						searchTerm) && (
							<div className="flex flex-wrap gap-2">
								{selectedRole !== "All Roles" && (
									<Badge
										variant="secondary"
										className="px-3 py-1 cursor-pointer"
										onClick={() => setSelectedRole("All Roles")}
									>
										Role: {selectedRole} ×
									</Badge>
								)}
								{selectedStatus !== "All" && (
									<Badge
										variant="secondary"
										className="px-3 py-1 cursor-pointer"
										onClick={() => setSelectedStatus("All")}
									>
										Status: {selectedStatus} ×
									</Badge>
								)}
								{selectedDepartments.map(dept => (
									<Badge
										key={dept}
										variant="secondary"
										className="px-3 py-1 cursor-pointer"
										onClick={() => setSelectedDepartments(current =>
											current.filter(d => d !== dept)
										)}
									>
										Department: {dept} ×
									</Badge>
								))}
								{searchTerm && (
									<Badge
										variant="secondary"
										className="px-3 py-1 cursor-pointer"
										onClick={() => setSearchTerm("")}
									>
										Search: {searchTerm} ×
									</Badge>
								)}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setSelectedRole("All Roles");
										setSelectedStatus("All");
										setSelectedDepartments([]);
										setSearchTerm("");
									}}
								>
									Clear all filters
								</Button>
							</div>
						)}
				</div>
			</Card>

			{/* Members Table */}
			<Card className="shadow-sm">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50">
								<TableHead
									className="w-[300px] py-4 cursor-pointer"
									onClick={() => handleSort('name')}
								>
									Member
									{sortConfig.key === 'name' && (
										<span className="ml-2">
											{sortConfig.direction === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead
									className="text-center cursor-pointer"
									onClick={() => handleSort('attendance')}
								>
									Attendance
									{sortConfig.key === 'attendance' && (
										<span className="ml-2">
											{sortConfig.direction === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</TableHead>
								<TableHead className='w-48 mx-auto flex items-center gap-2'>Next Shift</TableHead>
								<TableHead>Last Active</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedMembers.map((member) => (
								<TableRow key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
									<TableCell className="py-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-700">
												{getInitials(member.name)}
											</div>
											<div>
												<div className="font-medium text-gray-900">{member.name}</div>
												<div className="text-sm text-gray-500">{member.email}</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="bg-blue-100 text-blue-700 hover:bg-blue-200"
										>
											{member.role}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className={getStatusColor(member.status)}>
											{member.status}
										</Badge>
									</TableCell>
									<TableCell>
										<div className={`font-medium text-center px-2 py-1 rounded-full text-sm ${getAttendanceColor(member.attendance)}`}>
											{member.attendance}%
										</div>
									</TableCell>
									<TableCell>
										<div className="w-48 mx-auto flex items-center gap-2">
											<Clock className="h-4 w-4 text-gray-500 shrink-0" />
											<span className="text-sm">{member.nextShift}</span>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm text-gray-500">{member.lastActive}</span>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-[200px]">
												<DropdownMenuItem>
													<UserCog className="h-4 w-4 mr-2" />
													View Profile
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Calendar className="h-4 w-4 mr-2" />
													View Schedule
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Activity className="h-4 w-4 mr-2" />
													Attendance Log
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>
													<Shield className="h-4 w-4 mr-2" />
													Change Role
												</DropdownMenuItem>
												<DropdownMenuItem className="text-red-600 hover:text-red-700 hover:bg-red-50">
													<XCircle className="h-4 w-4 mr-2" />
													Remove Member
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{/* Pagination */}
					<div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-500">Show</span>
							<select
								className="border rounded-md text-sm px-2 py-1"
								value={itemsPerPage}
								onChange={(e) => {
									setItemsPerPage(Number(e.target.value));
									setCurrentPage(1);
								}}
							>
								{[5, 10, 25, 50].map(size => (
									<option key={size} value={size}>{size}</option>
								))}
							</select>
							<span className="text-sm text-gray-500">entries</span>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(1)}
								disabled={currentPage === 1}
							>
								First
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm text-gray-600">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(totalPages)}
								disabled={currentPage === totalPages}
							>
								Last
							</Button>
						</div>
					</div>

					{/* No Results Message */}
					{filteredMembers.length === 0 && (
						<div className="p-8 text-center">
							<Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								No members found
							</h3>
							<p className="text-gray-500">
								Try adjusting your search or filter criteria
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Members;
