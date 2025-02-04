import React from 'react';
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Calendar, Clock, ClipboardList } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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

interface PreferenceDetailProps {
	submission: Submission;
}

const PreferenceDetail: React.FC<PreferenceDetailProps> = ({ submission }) => {
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
			1: { color: 'bg-red-100 hover:bg-red-200 text-red-800', label: 'Very Low' },
			2: { color: 'bg-orange-100 hover:bg-orange-200 text-orange-800', label: 'Low' },
			3: { color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800', label: 'Neutral' },
			4: { color: 'bg-green-100 hover:bg-green-200 text-green-800', label: 'High' },
			5: { color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800', label: 'Very High' },
		};

		const preference = config[level as keyof typeof config];
		return (
			<Badge variant="secondary" className={`${preference.color} py-1 px-3 transition-colors duration-200`}>
				{preference.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: 'draft' | 'submitted') => {
		const config = {
			draft: 'bg-gray-100 text-gray-800 border-gray-200',
			submitted: 'bg-blue-100 text-blue-800 border-blue-200'
		};

		return (
			<Badge variant="secondary" className={`${config[status]} py-1 px-3`}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const groupSlotsByDate = () => {
		const grouped: Record<string, typeof submission.slots> = {};
		submission.slots?.forEach(slot => {
			if (slot.date) {
				if (!grouped[slot.date]) {
					grouped[slot.date] = [];
				}
				grouped[slot.date]?.push(slot);
			}
		});
		return grouped;
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-indigo-100 transition-colors duration-200"
				>
					<Eye className="h-4 w-4 mr-2" />
					View Details
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl">
				<DialogHeader className="pb-6">
					<DialogTitle className="text-2xl font-semibold text-gray-800">
						{submission.template?.name || `Template ${submission.template_id}`}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<Card className="border-none shadow-none bg-gray-50">
						<CardContent className="p-6 space-y-4">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<ClipboardList className="h-5 w-5 text-gray-500" />
									<span className="text-sm font-medium text-gray-600">Status:</span>
									{getStatusBadge(submission.status)}
								</div>
								{submission.submitted_at && (
									<div className="flex items-center gap-2">
										<Calendar className="h-5 w-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Submitted:</span>
										<span className="text-sm text-gray-600">{formatDateTime(submission.submitted_at)}</span>
									</div>
								)}
							</div>
							{submission.notes && (
								<div className="pt-2">
									<p className="text-sm font-medium text-gray-600">Notes:</p>
									<p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded-lg">{submission.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Separator className="my-6" />

					<ScrollArea className="h-[500px] rounded-md border">
						<Table>
							<TableHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 sticky top-0">
								<TableRow>
									<TableHead className="w-1/3">Date</TableHead>
									<TableHead className="w-1/3">Time Slot</TableHead>
									<TableHead className="w-1/3">Preference Level</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(groupSlotsByDate())
									.sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
									.map(([date, slots]) => (
										<React.Fragment key={date}>
											{slots?.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
												.map((slot, idx) => (
													<TableRow
														key={slot.id}
														className="hover:bg-gray-50/80 transition-colors duration-200"
													>
														{idx === 0 && (
															<TableCell
																rowSpan={slots.length}
																className="font-medium align-top border-r border-gray-100"
															>
																<div className="flex flex-col">
																	<span className="text-lg text-gray-800">
																		{new Date(date).toLocaleDateString('en-US', {
																			weekday: 'long',
																		})}
																	</span>
																	<span className="text-sm text-gray-600">
																		{new Date(date).toLocaleDateString('en-US', {
																			month: 'long',
																			day: 'numeric'
																		})}
																	</span>
																</div>
															</TableCell>
														)}
														<TableCell>
															<div className="flex items-center gap-2">
																<Clock className="h-4 w-4 text-gray-400" />
																<span className="text-gray-600">
																	{slot.start_time && slot.end_time && (
																		<>
																			{formatTime(slot.start_time)} - {formatTime(slot.end_time)}
																		</>
																	)}
																</span>
															</div>
														</TableCell>
														<TableCell>
															{getPreferenceBadge(slot.preference_level)}
														</TableCell>
													</TableRow>
												))}
										</React.Fragment>
									))}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PreferenceDetail;
