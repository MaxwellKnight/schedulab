import React, { useMemo, useState } from 'react';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Edit, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks';
import { useTeam } from '@/context';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface APIResponse {
	submission: {
		id: number;
		template_id: number;
		template?: Template;
		user_id: number;
		status: 'draft' | 'submitted';
		submitted_at: string | null;
		notes: string | null;
		created_at: string;
		updated_at: string;
	};
	slots: Slot[];
}

interface Template {
	id: number;
	name: string;
}

interface Slot {
	id: number;
	member_preference_id: number;
	template_time_slot_id: number;
	preference_level: number;
	created_at: string;
	date?: string;
	start_time?: string;
	end_time?: string;
}

interface Submission {
	id: number;
	template_id: number;
	template?: Template;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	slots?: Slot[];
}

type SortColumn = 'template_id' | 'status' | 'slots' | 'submitted_at' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const STATUS_CONFIG = {
	draft: {
		icon: Clock,
		color: 'bg-yellow-100 text-yellow-800',
		label: 'Draft'
	},
	submitted: {
		icon: CheckCircle,
		color: 'bg-green-100 text-green-800',
		label: 'Submitted'
	}
} as const;

const PreferencesHistory: React.FC = () => {
	const { selectedTeam } = useTeam();
	const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [searchTerm, setSearchTerm] = useState<string>('');

	const {
		data: apiResponse,
		loading: submissionsLoading,
		error: submissionsError,
		fetchData: refreshSubmissions
	} = useAuthenticatedFetch<APIResponse[]>(
		`preferences-submissions/team/${selectedTeam?.id}`
	);

	const submissions: Submission[] = useMemo(() => {
		if (!apiResponse) return [];
		return apiResponse.map(({ submission, slots }) => ({
			...submission,
			slots
		}));
	}, [apiResponse]);

	const templates: Record<number, string> = useMemo(() => {
		if (!submissions) return {};
		return submissions.reduce<Record<number, string>>((acc, sub) => ({
			...acc,
			[sub.template_id]: sub.template?.name || `Template ${sub.template_id}`
		}), {});
	}, [submissions]);

	const formatDateTime = (dateString: string | null): string => {
		if (!dateString) return 'Not submitted';
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const renderStatusBadge = (status: 'draft' | 'submitted'): JSX.Element => {
		const config = STATUS_CONFIG[status];
		const StatusIcon = config.icon;
		return (
			<Badge variant="secondary" className={`${config.color} inline-flex items-center gap-2 py-1`}>
				<StatusIcon className="h-4 w-4" />
				{config.label}
			</Badge>
		);
	};

	const handleSort = (column: SortColumn): void => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	const renderSortIcon = (column: SortColumn): JSX.Element => {
		if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
		return sortDirection === 'asc'
			? <ArrowUp className="h-4 w-4" />
			: <ArrowDown className="h-4 w-4" />;
	};

	const filteredAndSortedSubmissions = useMemo(() => {
		if (!submissions) return [];

		const filtered = submissions.filter(submission =>
			templates[submission.template_id]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			submission.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
			submission.notes?.toLowerCase().includes(searchTerm.toLowerCase())
		);

		return filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortColumn) {
				case 'template_id':
					comparison = (templates[a.template_id] || '').localeCompare(templates[b.template_id] || '');
					break;
				case 'status':
					comparison = a.status.localeCompare(b.status);
					break;
				case 'slots':
					comparison = (a.slots?.length || 0) - (b.slots?.length || 0);
					break;
				case 'submitted_at':
					comparison = (a.submitted_at ? new Date(a.submitted_at).getTime() : 0) -
						(b.submitted_at ? new Date(b.submitted_at).getTime() : 0);
					break;
				case 'created_at':
					comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
					break;
				case 'updated_at':
					comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
					break;
			}
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}, [submissions, templates, sortColumn, sortDirection, searchTerm]);

	if (submissionsLoading) {
		return <div className="p-4 text-center">Loading submissions...</div>;
	}

	if (submissionsError) {
		return <div className="p-4 text-red-600">Error loading submissions: {submissionsError}</div>;
	}

	return (
		<div className="p-4 space-y-6 bg-white rounded-lg shadow-sm">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
					<Calendar className="h-6 w-6 text-indigo-600" />
					History
				</h2>
				<div className="flex items-center gap-4">
					<Input
						placeholder="Search submissions..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-64 border-indigo-200 hover:border-indigo-300"
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={refreshSubmissions}
						className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700"
					>
						Refresh
					</Button>
				</div>
			</div>

			{filteredAndSortedSubmissions.length === 0 ? (
				<div className="text-center text-gray-500 py-4">
					{searchTerm ? "No submissions match your search" : "No submissions found"}
				</div>
			) : (
				<div className="border border-indigo-100 rounded-lg overflow-hidden">
					<Table>
						<TableHeader className="bg-indigo-50">
							<TableRow>
								{[
									{ key: 'template_id', label: 'Template' },
									{ key: 'status', label: 'Status' },
									{ key: 'slots', label: 'Selected Slots' },
									{ key: 'submitted_at', label: 'Submitted At' },
									{ key: 'created_at', label: 'Created At' },
									{ key: 'updated_at', label: 'Last Updated' }
								].map(({ key, label }) => (
									<TableHead
										key={key}
										className="cursor-pointer hover:bg-indigo-100/50 transition-colors"
										onClick={() => handleSort(key as SortColumn)}
									>
										<div className="flex items-center justify-between gap-2">
											<span>{label}</span>
											{renderSortIcon(key as SortColumn)}
										</div>
									</TableHead>
								))}
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredAndSortedSubmissions.map((submission) => (
								<TableRow
									key={submission.id}
									className="hover:bg-indigo-50/50 transition-colors"
								>
									<TableCell className="font-medium">
										{templates[submission.template_id]}
									</TableCell>
									<TableCell>
										{renderStatusBadge(submission.status)}
									</TableCell>
									<TableCell>
										<Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
											{submission.slots?.length || 0} slots
										</Badge>
									</TableCell>
									<TableCell className="text-sm text-gray-600">
										{formatDateTime(submission.submitted_at)}
									</TableCell>
									<TableCell className="text-sm text-gray-600">
										{formatDateTime(submission.created_at)}
									</TableCell>
									<TableCell className="text-sm text-gray-600">
										{formatDateTime(submission.updated_at)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-100">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{submission.status === 'draft' && (
													<DropdownMenuItem className="cursor-pointer hover:bg-indigo-50">
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
};

export default PreferencesHistory;
