import React, { useMemo, useState } from 'react';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Edit, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import PreferenceDetail from './PreferenceDetails';
import { useTeam } from '@/context';
import { useAuthenticatedFetch } from '@/hooks';

export interface Slot {
	id: number;
	submission_id?: number;
	member_preference_id?: number;
	template_time_slot_id: number;
	preference_level: number;
	created_at: string;
	date: string;
	start_time: string;
	end_time: string;
}

export interface SubmissionData {
	id: number;
	template_id: number;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface Submission extends SubmissionData {
	slots?: Slot[];
	template?: {
		id: number;
		name: string;
	};
}

// API Response Type
export interface PreferenceSubmissionResponse {
	submission: SubmissionData;
	slots: Slot[];
}

// Type for sort columns
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

	// Use the authenticated fetch hook
	const {
		data: apiResponse,
		loading,
		error,
		fetchData: refreshSubmissions
	} = useAuthenticatedFetch<PreferenceSubmissionResponse[]>(
		`/preferences-submissions/team/${selectedTeam?.id}`,
		{}, // additional options if needed
		{
			enabled: !!selectedTeam?.id, // only fetch if team is selected
			ttl: 5 * 60 * 1000 // 5 minute cache
		}
	);

	const transformApiResponse = (apiResponse: PreferenceSubmissionResponse[]): PreferenceSubmissionResponse[] => {
		return apiResponse.map(submission => ({
			submission: {
				id: submission.submission.id,
				template_id: submission.submission.template_id,
				user_id: submission.submission.user_id,
				status: submission.submission.status,
				submitted_at: submission.submission.submitted_at,
				notes: submission.submission.notes,
				created_at: submission.submission.created_at,
				updated_at: submission.submission.updated_at
			},
			slots: submission.slots.map(slot => ({
				id: slot.id,
				submission_id: slot.submission_id,
				template_time_slot_id: slot.template_time_slot_id,
				preference_level: slot.preference_level,
				created_at: slot.created_at,
				date: slot.date,
				start_time: slot.start_time,
				end_time: slot.end_time
			}))
		}));
	};

	// Transform submissions, ensuring consistent structure
	const submissions = useMemo(() => {
		if (!apiResponse) return [];

		// Use the transformation function
		const transformedData = transformApiResponse(apiResponse);

		return transformedData.map(({ submission, slots }) => ({
			...submission,
			slots,
			template: {
				id: submission.template_id,
				name: `Template ${submission.template_id}`
			}
		}));
	}, [apiResponse]);
	console.log(submissions.slice(0, 50));

	// Templates mapping
	const templates = useMemo(() => {
		const templateMap: Record<number, string> = {};
		submissions.forEach(sub => {
			templateMap[sub.template_id] = `Template ${sub.template_id}`;
		});
		return templateMap;
	}, [submissions]);

	// DateTime formatting utility
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

	// Status badge rendering
	const renderStatusBadge = (status: 'draft' | 'submitted') => {
		const config = STATUS_CONFIG[status];
		const StatusIcon = config.icon;
		return (
			<Badge variant="secondary" className={`${config.color} inline-flex items-center gap-2 py-1`}>
				<StatusIcon className="h-4 w-4" />
				{config.label}
			</Badge>
		);
	};

	// Sorting handler
	const handleSort = (column: SortColumn): void => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	// Sort icon rendering
	const renderSortIcon = (column: SortColumn) => {
		if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
		return sortDirection === 'asc'
			? <ArrowUp className="h-4 w-4" />
			: <ArrowDown className="h-4 w-4" />;
	};

	// Filtered and sorted submissions
	const filteredAndSortedSubmissions = useMemo(() => {
		const filtered = submissions.filter(submission =>
			templates[submission.template_id]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			submission.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
			submission.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			false
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

	// Render loading state
	if (loading) {
		return <div className="p-4 text-center">Loading submissions...</div>;
	}

	// Render error state
	if (error) {
		return (
			<div className="p-4 text-red-600">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<h3 className="text-lg font-semibold mb-2">Error Loading Submissions</h3>
					<p className="mb-2">{error}</p>
					<details className="text-sm text-gray-600">
						<summary>Troubleshooting Tips</summary>
						<ul className="list-disc list-inside mt-2">
							<li>Check your network connection</li>
							<li>Verify the API endpoint is correct</li>
							<li>Ensure you're authenticated</li>
							<li>Check with your system administrator</li>
						</ul>
					</details>
				</div>
			</div>
		);
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
							{filteredAndSortedSubmissions.map((submission, index) => (
								<TableRow
									key={index}
									className="hover:bg-indigo-50/50 transition-colors"
								>
									<TableCell className="font-medium">
										{templates[submission.template_id]}
									</TableCell>
									<TableCell>
										{renderStatusBadge(submission.status)}
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
												<Button
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 group"
												>
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800 transition-colors" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="border-indigo-100 bg-white shadow-md rounded-lg"
											>
												<PreferenceDetail
													templateId={submission.template_id}
													submission={submission}
													render={(dialogTrigger) => (
														<DropdownMenuItem
															onSelect={(e) => {
																e.preventDefault();
																dialogTrigger.click();
															}}
															className="cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 transition-colors"
														>
															<Info className="mr-2 h-4 w-4 text-indigo-600" />
															View Details
														</DropdownMenuItem>
													)}
												/>
												{submission.status === 'draft' && (
													<>
														<DropdownMenuSeparator className="bg-indigo-100" />
														<DropdownMenuItem
															className="cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 transition-colors"
														>
															<Edit className="mr-2 h-4 w-4 text-indigo-600" />
															Edit
														</DropdownMenuItem>
													</>
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
