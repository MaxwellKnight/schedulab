import React, { useState, useMemo } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Users, User, ClipboardList, Calendar, Clock, Info, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAuth, useTeam } from '@/hooks';
import { Submission } from './types';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

interface PreferenceDetailProps {
	templateId?: number;
	submission?: Submission;
	teamSubmissions?: Submission[];
}

interface PrefConfig {
	styles: Record<number, string>;
	labels: string[];
}

const preferenceConfig: PrefConfig = {
	styles: {
		1: 'bg-red-100 text-red-700 border-red-200',
		2: 'bg-orange-100 text-orange-700 border-orange-200',
		3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
		4: 'bg-green-100 text-green-700 border-green-200',
		5: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	},
	labels: ['Very Low', 'Low', 'Neutral', 'High', 'Very High']
} as const;

const formatDateTime = (dateString: string): string => {
	return new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const PreferenceDetail: React.FC<PreferenceDetailProps> = ({
	submission: initialSubmission,
	teamSubmissions = []
}) => {
	const { user } = useAuth();
	const { selectedTeam, members } = useTeam();
	const isTeamAdmin = selectedTeam?.creator_id === user?.id;
	const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(initialSubmission || null);
	const [isListView, setIsListView] = useState(isTeamAdmin);

	// Create a map of user IDs to member info for efficient lookup
	const memberMap = useMemo(() => {
		return members.reduce((acc, member) => {
			acc[member.id] = member;
			return acc;
		}, {} as Record<number, typeof members[0]>);
	}, [members]);

	// Helper function to get member display name
	const getMemberDisplayName = (userId: number) => {
		const member = memberMap[userId];
		if (!member) return 'Unknown User';
		return member.display_name || `${member.first_name} ${member.last_name}`;
	};

	// Helper function to get member initials for avatar fallback
	const getMemberInitials = (userId: number) => {
		const member = memberMap[userId];
		if (!member) return 'U';
		return `${member.first_name[0]}${member.last_name[0]}`;
	};

	const handleViewSubmission = (submission: Submission) => {
		setSelectedSubmission(submission);
		setIsListView(false);
	};

	const handleBackToList = () => {
		setIsListView(true);
		setSelectedSubmission(null);
	};

	const SubmissionsList = () => (
		<div className="bg-white -m-6 p-6 rounded-lg">
			<Card className="border-slate-200 shadow-sm">
				<CardHeader className="border-b border-slate-100 bg-slate-50/50">
					<div className="flex items-center gap-3">
						<Users className="w-5 h-5 text-slate-600" />
						<div>
							<CardTitle className="text-xl text-slate-800">Team Submissions</CardTitle>
							<CardDescription>View and manage team preferences</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<ScrollArea className="h-96">
						<Table>
							<TableHeader className="bg-slate-50/50 sticky top-0">
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Submitted</TableHead>
									<TableHead className="text-right">View</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{teamSubmissions.map((submission) => (
									<TableRow key={submission.id} className="hover:bg-slate-50">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													{memberMap[submission.user_id]?.picture && (
														<AvatarImage
															src={memberMap[submission.user_id].picture}
															alt={getMemberDisplayName(submission.user_id)}
														/>
													)}
													<AvatarFallback className="bg-slate-100 text-slate-600">
														{getMemberInitials(submission.user_id)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium text-slate-700">
													{getMemberDisplayName(submission.user_id)}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className={
												submission.status === 'submitted'
													? 'bg-green-50 text-green-700 hover:bg-green-100'
													: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
											}>
												{submission.status}
											</Badge>
										</TableCell>
										<TableCell className="text-slate-600">
											{submission.submitted_at ? formatDateTime(submission.submitted_at) : '-'}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewSubmission(submission)}
												className="text-slate-700 hover:bg-slate-100"
											>
												<Eye className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);

	const SubmissionDetails = ({ submission }: { submission: Submission }) => (
		<div className="space-y-6 bg-white -m-6 p-6 rounded-lg">
			<Card className="border-slate-200 shadow-sm">
				<CardHeader className="border-b border-slate-100 bg-slate-50/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Info className="w-5 h-5 text-slate-600" />
							<CardTitle className="text-slate-800">
								{submission.template?.name || `Template ${submission.template_id}`}
							</CardTitle>
						</div>
					</div>
					<div className="flex flex-wrap gap-3 mt-4">
						{isTeamAdmin && (
							<div className="flex items-center gap-2">
								<Avatar className="h-6 w-6">
									{memberMap[submission.user_id]?.picture && (
										<AvatarImage
											src={memberMap[submission.user_id].picture}
											alt={getMemberDisplayName(submission.user_id)}
										/>
									)}
									<AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
										{getMemberInitials(submission.user_id)}
									</AvatarFallback>
								</Avatar>
								<Badge variant="secondary" className="gap-1">
									{getMemberDisplayName(submission.user_id)}
								</Badge>
							</div>
						)}
						<Badge variant="secondary" className="gap-1">
							<ClipboardList className="w-3 h-3" />
							{submission.status}
						</Badge>
						{submission.submitted_at && (
							<Badge variant="secondary" className="gap-1">
								<Calendar className="w-3 h-3" />
								{formatDateTime(submission.submitted_at)}
							</Badge>
						)}
					</div>
				</CardHeader>
			</Card>

			{submission.notes && (
				<Card className="border-slate-200 shadow-sm">
					<CardContent className="pt-6">
						<h3 className="font-semibold mb-2 text-slate-800">Notes</h3>
						<p className="text-slate-600">{submission.notes}</p>
					</CardContent>
				</Card>
			)}

			<Card className="border-slate-200 shadow-sm">
				<CardHeader className="border-b border-slate-100 bg-slate-50/50">
					<CardTitle className="text-slate-800">Time Preferences</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<ScrollArea className="h-96">
						<Table>
							<TableHeader className="bg-slate-50/50">
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Time</TableHead>
									<TableHead>Preference</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{submission.slots?.map((slot) => (
									<TableRow key={slot.id}>
										<TableCell className="font-medium text-slate-700">
											{new Date(slot.date!).toLocaleDateString('en-US', {
												weekday: 'long',
												month: 'long',
												day: 'numeric'
											})}
										</TableCell>
										<TableCell className="text-slate-600">
											<div className="flex items-center gap-2">
												<Clock className="w-4 h-4" />
												{`${new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString('en-US', {
													hour: '2-digit',
													minute: '2-digit'
												})} - 
                        ${new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString('en-US', {
													hour: '2-digit',
													minute: '2-digit'
												})}`}
											</div>
										</TableCell>
										<TableCell>
											<Badge className={preferenceConfig.styles[slot.preference_level]}>
												{preferenceConfig.labels[slot.preference_level - 1]}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="hover:bg-slate-50"
				>
					<Eye className="w-4 h-4 mr-2" />
					{isTeamAdmin ? 'View All Submissions' : 'View Details'}
				</Button>
			</DialogTrigger>
			<DialogHeader>
				<DialogTitle></DialogTitle>
			</DialogHeader>
			<DialogContent className="max-w-4xl p-6 bg-white border shadow-xl">
				<div className="flex justify-between items-center mb-6">
					{isTeamAdmin && !isListView ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBackToList}
							className="text-slate-600 hover:bg-slate-100"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to List
						</Button>
					) : null}
				</div>

				{isTeamAdmin && isListView ? (
					<SubmissionsList />
				) : selectedSubmission ? (
					<SubmissionDetails submission={selectedSubmission} />
				) : null}
			</DialogContent>
		</Dialog>
	);
};

export default PreferenceDetail;
