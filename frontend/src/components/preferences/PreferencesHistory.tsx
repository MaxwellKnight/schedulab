import React, { useMemo, useState } from 'react';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MoreHorizontal, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import PreferenceDetail from './PreferenceDetails';
import { useTeam } from '@/context';
import { useAuthenticatedFetch } from '@/hooks';
import { useAuth } from '@/hooks';

export interface PreferenceSubmissionResponse {
	submission: SubmissionData;
	slots: Slot[];
}

const PreferencesHistory: React.FC = () => {
	const { selectedTeam } = useTeam();
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState<string>('');

	const {
		data: apiResponse,
		loading,
		error,
		fetchData: refreshSubmissions
	} = useAuthenticatedFetch<PreferenceSubmissionResponse[]>(
		`/preferences-submissions/team/${selectedTeam?.id}`,
		{},
		{
			enabled: !!selectedTeam?.id,
			ttl: 5 * 60 * 1000
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

	const submissions = useMemo(() => {
		if (!apiResponse) return [];
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

	// Aggregation of template data
	const templateAggregation = useMemo(() => {
		const aggregatedTemplates: Record<number, {
			total_submissions: number;
			submitted_submissions: number;
			draft_submissions: number;
			total_slots: number;
			preference_level_distribution: Record<number, number>;
			latest_submission_date: string | null;
		}> = {};

		submissions.forEach(submission => {
			if (!aggregatedTemplates[submission.template_id]) {
				aggregatedTemplates[submission.template_id] = {
					total_submissions: 0,
					submitted_submissions: 0,
					draft_submissions: 0,
					total_slots: 0,
					preference_level_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
					latest_submission_date: null
				};
			}

			const templateEntry = aggregatedTemplates[submission.template_id];

			// Increment submission counts
			templateEntry.total_submissions++;
			if (submission.status === 'submitted') {
				templateEntry.submitted_submissions++;
			} else {
				templateEntry.draft_submissions++;
			}

			// Count total slots and preference levels
			if (submission.slots) {
				templateEntry.total_slots += submission.slots.length;

				submission.slots.forEach(slot => {
					templateEntry.preference_level_distribution[slot.preference_level]++;
				});
			}

			// Track latest submission date
			if (submission.submitted_at &&
				(!templateEntry.latest_submission_date ||
					new Date(submission.submitted_at) > new Date(templateEntry.latest_submission_date))) {
				templateEntry.latest_submission_date = submission.submitted_at;
			}
		});

		return aggregatedTemplates;
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

	if (loading) {
		return <div className="p-4 text-center">Loading submissions...</div>;
	}

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
							<li>Ensure you`&apos`re authenticated</li>
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
						placeholder="Search templates..."
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

			{Object.keys(templateAggregation).length === 0 ? (
				<div className="text-center text-gray-500 py-4">
					{searchTerm ? "No templates match your search" : "No templates found"}
				</div>
			) : (
				<div className="border border-indigo-100 rounded-lg overflow-hidden">
					<Table>
						<TableHeader className="bg-indigo-50">
							<TableRow>
								<TableHead>Template</TableHead>
								<TableHead>Submissions</TableHead>
								<TableHead>Total Slots</TableHead>
								<TableHead>Preference Distribution</TableHead>
								<TableHead>Latest Submission</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(templateAggregation)
								.filter(([templateId]) => {
									const templateName = `Template ${templateId}`;
									return templateName.toLowerCase().includes(searchTerm.toLowerCase());
								})
								.map(([templateId, templateData]) => {
									// Find all submissions for this template
									const templateSubmissions: Submission[] = submissions.filter(
										submission => submission.template_id === Number(templateId)
									);

									return (
										<TableRow key={templateId}>
											<TableCell className="font-medium">
												Template {templateId}
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Badge variant="secondary" className="bg-green-100 text-green-800">
														Submitted: {templateData.submitted_submissions}
													</Badge>
													<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
														Draft: {templateData.draft_submissions}
													</Badge>
												</div>
											</TableCell>
											<TableCell>
												{templateData.total_slots}
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													{Object.entries(templateData.preference_level_distribution)
														.map(([level, count]) => (
															<Badge
																key={level}
																variant="secondary"
																className="bg-indigo-100 text-indigo-800"
															>
																L{level}: {count}
															</Badge>
														))}
												</div>
											</TableCell>
											<TableCell className="text-sm text-gray-600">
												{formatDateTime(templateData.latest_submission_date)}
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
														{user && (
															<PreferenceDetail
																templateId={Number(templateId)}
																submission={templateSubmissions.find(
																	submission => submission.user_id === user.id
																)}
																teamSubmissions={templateSubmissions}
															/>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
};

export default PreferencesHistory;
