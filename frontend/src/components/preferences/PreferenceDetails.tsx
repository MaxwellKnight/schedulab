import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, ClipboardList, Info, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Slot, Submission } from './types';
import { useAuth, useAuthenticatedFetch, useTeam } from '@/hooks';

interface PreferenceDetailProps {
	templateId: number;
	submission?: Submission;
	className?: string;
}

const PreferenceDetail: React.FC<PreferenceDetailProps> = ({
	templateId,
	submission: initialSubmission,
	className = ''
}) => {
	const { user } = useAuth();
	const { selectedTeam } = useTeam();
	const isTeamAdmin = selectedTeam?.creator_id === user?.id;
	const [isSubmissionListOpen, setIsSubmissionListOpen] = useState(false);

	const {
		data: teamSubmissions,
		loading,
		error,
	} = useAuthenticatedFetch<Submission[]>(
		`/preferences-submissions`,
		{
			method: 'GET',
			params: { templateId }
		},
		{
			enabled: isTeamAdmin,
			ttl: 5 * 60 * 1000
		}
	);

	const formatDateTime = (dateString: string): string => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatTime = (timeString: string): string => {
		return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getPreferenceBadge = (level: number) => {
		const config = {
			1: { color: 'bg-red-100 border border-red-300 text-red-800', label: 'Very Low' },
			2: { color: 'bg-orange-100 border border-orange-300 text-orange-800', label: 'Low' },
			3: { color: 'bg-yellow-100 border border-yellow-300 text-yellow-800', label: 'Neutral' },
			4: { color: 'bg-green-100 border border-green-300 text-green-800', label: 'High' },
			5: { color: 'bg-emerald-100 border border-emerald-300 text-emerald-800', label: 'Very High' },
		};

		const preference = config[level as keyof typeof config];
		return (
			<Badge
				variant="outline"
				className={`${preference.color} py-0.5 px-2 rounded-full font-medium transition-all duration-300 hover:opacity-80 text-xs`}
			>
				{preference.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: 'draft' | 'submitted') => {
		const config = {
			draft: 'bg-gray-100 text-gray-800 border-gray-300',
			submitted: 'bg-blue-100 text-blue-800 border-blue-300'
		};

		return (
			<Badge
				variant="outline"
				className={`${config[status]} py-0.5 px-2 rounded-full font-medium transition-all duration-300 hover:opacity-80 text-xs`}
			>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const groupSlotsByDate = (slots?: Slot[]) => {
		const grouped: Record<string, Slot[]> = {};
		slots?.forEach(slot => {
			if (slot.date) {
				if (!grouped[slot.date]) {
					grouped[slot.date] = [];
				}
				grouped[slot.date]?.push(slot);
			}
		});
		return grouped;
	};

	const SubmissionDetailsDialog = ({ submission }: { submission: Submission }) => (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="hover:bg-indigo-100 transition-all duration-300 h-8"
				>
					Details
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl h-[80vh] flex flex-col">
				<DialogHeader>
					<div className="flex items-center gap-4">
						<Info className="w-6 h-6 text-indigo-600" />
						<DialogTitle>
							{submission.template?.name || `Template ${submission.template_id}`}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full pr-4">
						<div className="space-y-4 pr-2">
							<div className="space-y-4">
								<div className="flex flex-wrap items-center gap-4 bg-gray-50 rounded-xl p-4 shadow-xs">
									{isTeamAdmin && (
										<div className="flex items-center gap-3 bg-indigo-50 px-3 py-1.5 rounded-lg">
											<span className="text-sm font-medium text-indigo-900">User ID:</span>
											<span className="text-sm text-indigo-700">#{submission.user_id}</span>
										</div>
									)}
									<div className="flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-lg">
										<ClipboardList className="h-5 w-5 text-blue-600" />
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-blue-900">Status:</span>
											{getStatusBadge(submission.status)}
										</div>
									</div>
									{submission.submitted_at && (
										<div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-lg">
											<Calendar className="h-5 w-5 text-green-600" />
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-green-900">Submitted:</span>
												<span className="text-sm text-green-700">{formatDateTime(submission.submitted_at)}</span>
											</div>
										</div>
									)}
								</div>

								<Table>
									<TableHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 sticky top-0">
										<TableRow>
											<TableHead className="w-1/3 text-indigo-900 text-sm font-semibold py-2">Date</TableHead>
											<TableHead className="w-1/3 text-indigo-900 text-sm font-semibold py-2">Time Slot</TableHead>
											<TableHead className="w-1/3 text-indigo-900 text-sm font-semibold py-2">Preference Level</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(groupSlotsByDate(submission.slots))
											.sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
											.map(([date, slots]) => (
												<React.Fragment key={date}>
													{slots?.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
														.map((slot: Slot, idx: number) => (
															<TableRow
																key={slot.id}
																className="hover:bg-gray-50 transition-colors duration-200"
															>
																{idx === 0 && (
																	<TableCell
																		rowSpan={slots.length}
																		className="font-medium align-top border-r border-gray-100 py-2"
																	>
																		<div className="flex flex-col">
																			<span className="text-sm font-bold text-gray-900">
																				{new Date(date).toLocaleDateString('en-US', {
																					weekday: 'long',
																				})}
																			</span>
																			<span className="text-xs text-gray-600">
																				{new Date(date).toLocaleDateString('en-US', {
																					month: 'short',
																					day: 'numeric'
																				})}
																			</span>
																		</div>
																	</TableCell>
																)}
																<TableCell className="py-2">
																	<div className="flex items-center gap-2">
																		<Clock className="h-4 w-4 text-gray-500" />
																		<span className="text-xs text-gray-700 font-medium">
																			{slot.start_time && slot.end_time && (
																				<>
																					{formatTime(slot.start_time)} - {formatTime(slot.end_time)}
																				</>
																			)}
																		</span>
																	</div>
																</TableCell>
																<TableCell className="py-2">
																	{getPreferenceBadge(slot.preference_level)}
																</TableCell>
															</TableRow>
														))}
												</React.Fragment>
											))}
									</TableBody>
								</Table>
							</div>
						</div>
					</ScrollArea>
				</div>
			</DialogContent>
		</Dialog>
	);

	const SubmissionListDialog = () => (
		<Dialog open={isSubmissionListOpen} onOpenChange={setIsSubmissionListOpen}>
			<DialogContent className="max-w-4xl h-[80vh] flex flex-col">
				<DialogHeader>
					<div className="flex items-center gap-4">
						<Users className="w-6 h-6 text-indigo-600" />
						<DialogTitle>All Submissions</DialogTitle>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full pr-4">
						<Table>
							<TableHeader className="bg-indigo-50 sticky top-0">
								<TableRow>
									<TableHead className="text-indigo-900 text-sm font-semibold w-1/4 py-2">User ID</TableHead>
									<TableHead className="text-indigo-900 text-sm font-semibold w-1/4 py-2">Status</TableHead>
									<TableHead className="text-indigo-900 text-sm font-semibold w-1/4 py-2">Submitted At</TableHead>
									<TableHead className="text-right text-indigo-900 text-sm font-semibold w-1/4 py-2">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-4 text-gray-500 text-sm">
											Loading submissions...
										</TableCell>
									</TableRow>
								) : error ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-red-600 py-4 bg-red-50 text-sm">
											{error}
										</TableCell>
									</TableRow>
								) : (
									teamSubmissions?.map((submission) => (
										<TableRow
											key={submission.id}
											className="hover:bg-indigo-50/50 transition-colors duration-200"
										>
											<TableCell className="font-medium text-sm py-2">#{submission.user_id}</TableCell>
											<TableCell className="py-2">{getStatusBadge(submission.status)}</TableCell>
											<TableCell className="text-sm py-2">{submission.submitted_at ? formatDateTime(submission.submitted_at) : '-'}</TableCell>
											<TableCell className="text-right py-2">
												<SubmissionDetailsDialog submission={submission} />
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>
			</DialogContent>
		</Dialog>
	);

	return (
		<div className={`flex w-full ${className}`}>
			{initialSubmission && (
				<div className="p-2 grid space-y-4">
					{isTeamAdmin && (
						<Button
							variant="outline"
							onClick={() => setIsSubmissionListOpen(true)}
							className="hover:bg-indigo-50"
						>
							<Users className="h-5 w-5 mr-2" />
							View All Submissions
						</Button>
					)}
					<SubmissionDetailsDialog submission={initialSubmission} />
				</div>
			)}

			{isTeamAdmin && <SubmissionListDialog />}
		</div>
	);
};

export default PreferenceDetail;
