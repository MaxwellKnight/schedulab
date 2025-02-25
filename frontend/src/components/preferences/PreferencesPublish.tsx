import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Check, X, CalendarDays, } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
import { format } from 'date-fns';
import { useTeam } from '@/context';
import { PreferenceTemplate } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import axios from 'axios';
import ConfirmationDialog from '../ConfirmationDialog';

interface ActionState {
	templateId: number | null;
	action: 'published' | 'closed' | 'draft' | null;
}

const StatusBadge = ({ status }: { status: string }) => {
	if (status === 'published') {
		return (
			<Badge className="hover:bg-green-100 bg-green-100 text-green-800 border-green-200">
				<Check className="w-3 h-3 mr-1" />
				Published
			</Badge>
		);
	}
	return (
		<Badge className="hover:bg-blue-100 bg-blue-100 text-blue-800 border-blue-200">
			<Clock className="w-3 h-3 mr-1" />
			Draft
		</Badge>
	);
};

const EmptyState = () => (
	<motion.div
		initial={{ opacity: 0, scale: 0.95 }}
		animate={{ opacity: 1, scale: 1 }}
		className="flex flex-col items-center justify-center min-h-[400px] p-8"
	>
		<div className="bg-blue-50 p-4 rounded-full mb-4">
			<CalendarDays className="w-12 h-12 text-blue-500" />
		</div>
		<h3 className="text-xl font-semibold text-blue-900 mb-2">No Templates Found</h3>
		<p className="text-blue-600 text-center max-w-md mb-6">
			Get started by creating your first preference template
		</p>
		<Button className="bg-blue-600 hover:bg-blue-700 text-white">
			Create Template
		</Button>
	</motion.div>
);

interface ViewDetailsProps {
	template: PreferenceTemplate;
	onClose: () => void;
	isPublished: boolean;
}

const ViewDetails: React.FC<ViewDetailsProps> = ({
	template,
	onClose,
	isPublished
}) => {
	const timeSlotsByDate = template.time_slots.reduce((acc: Record<string, PreferenceTemplate["time_slots"]>, slot) => {
		const date = format(new Date(slot.date), 'MMM d, yyyy');
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(slot);
		return acc;
	}, {});

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-[650px] p-0">
				{/* Compact Header */}
				<div className="px-4 py-3 border-b border-blue-100">
					<DialogHeader className="space-y-0">
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								<DialogTitle className="text-lg font-semibold text-blue-900">
									{template.name}
								</DialogTitle>
								<Badge
									variant="outline"
									className={isPublished
										? "bg-green-50 text-green-700 border-green-200"
										: "bg-blue-50 text-blue-700 border-blue-200"
									}
								>
									{isPublished ? "Published" : "Draft"}
								</Badge>
							</div>
						</div>
					</DialogHeader>
				</div>

				{/* Content */}
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0 border-b border-blue-100">
						<TabsTrigger
							value="overview"
							className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
						>
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="schedule"
							className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
						>
							Schedule
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="p-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-blue-600" />
									<span className="text-sm text-blue-700">Team {template.team_id}</span>
								</div>
								<div className="text-sm text-blue-600">
									{template.time_slots.length} slots
								</div>
							</div>

							<div className="flex items-center gap-2 text-sm bg-white p-2.5 rounded-lg border border-blue-100">
								<Calendar className="h-4 w-4 text-blue-600" />
								<div className="text-blue-600">
									{format(new Date(template.start_date), 'MMM d, yyyy')} -
									{format(new Date(template.end_date), 'MMM d, yyyy')}
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="schedule" className="p-4">
						<div className="space-y-3 max-h-[400px] overflow-y-auto">
							{Object.entries(timeSlotsByDate).map(([date, slots]) => (
								<div key={date}>
									<div className="text-sm font-medium text-blue-900 mb-2">{date}</div>
									<div className="flex flex-wrap gap-2">
										{slots.map((slot, idx) => (
											<div
												key={idx}
												className="flex items-center gap-1.5 text-sm bg-white px-2 py-1.5 rounded-md border border-blue-100"
											>
												<Clock className="h-3.5 w-3.5 text-blue-500" />
												<span className="text-blue-600">
													{slot.time_range.start_time.substring(0, 5)} -
													{slot.time_range.end_time.substring(0, 5)}
												</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

const PreferencesPublish = () => {
	const [actionState, setActionState] = useState<ActionState>({
		templateId: null,
		action: null
	});
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showPublishConfirm, setShowPublishConfirm] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<PreferenceTemplate | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const { selectedTeam } = useTeam();

	const {
		data: templates,
		fetchData: refetch,
		clearCache
	} = useAuthenticatedFetch<PreferenceTemplate[]>('/preferences', {
		params: { teamId: selectedTeam?.id }
	});

	const filtered_templates = templates?.filter(
		template => template.team_id === selectedTeam?.id
	);

	const handleAction = async (templateId: number, action: 'publish' | 'close') => {
		setActionState({ templateId, action: action === 'publish' ? 'published' : 'closed' });

		try {
			await axios.patch<{ success?: string; error?: string }>(
				`/preferences/status/${templateId}`,
				{},
				{
					params: {
						teamId: selectedTeam?.id,
						status: action === 'publish' ? 'published' : 'closed'
					},
				}
			);

			clearCache();
			await refetch();

			setShowConfirmation(false);
			setShowPublishConfirm(false);
			setShowDetails(false);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(`Error ${action}ing template:`, {
					status: err.response?.status,
					data: err.response?.data,
					message: err.message
				});
			} else {
				console.error(`Error ${action}ing template:`, err);
			}
		} finally {
			setActionState({ templateId: null, action: null });
		}
	};

	const handleCloseClick = (template: PreferenceTemplate) => {
		setSelectedTemplate(template);
		setShowConfirmation(true);
	};

	const handlePublishClick = (template: PreferenceTemplate) => {
		setSelectedTemplate(template);
		setShowPublishConfirm(true);
	}

	const handleViewDetails = (template: PreferenceTemplate) => {
		setSelectedTemplate(template);
		setShowDetails(true);
	};

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<header className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
						{filtered_templates?.length} Templates
					</Badge>
				</div>
			</header>

			{!filtered_templates?.length ? (
				<EmptyState />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence mode="popLayout">
						{filtered_templates?.map((template, i) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.2, delay: i * 0.1 }}
							>
								<Card className="group overflow-hidden bg-white border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-300">
									<CardHeader className="p-6 pb-4">
										<div className="flex items-center justify-between ">
											<StatusBadge status={template.status} />
										</div>
										<CardTitle className="text-xl font-semibold text-blue-900">
											{template.name}
										</CardTitle>
									</CardHeader>

									<CardContent className="px-6 pb-6">
										<div className="space-y-4">
											<div className="bg-blue-50 rounded-lg p-4">
												<div className="flex items-center text-blue-700 mb-2">
													<Calendar className="w-4 h-4 mr-2" />
													<span className="font-medium">Date Range</span>
												</div>
												<div className="text-sm text-blue-600">
													{format(new Date(template.start_date), 'MMM d, yyyy')} -
													{format(new Date(template.end_date), 'MMM d, yyyy')}
												</div>
											</div>

											<div className="flex items-center justify-between text-sm px-1">
												<span className="text-blue-600">
													<Clock className="w-4 h-4 inline mr-2" />
													{template.time_slots.length} time slots
												</span>
												<span className="text-blue-600">
													<Users className="w-4 h-4 inline mr-2" />
													Team {template.team_id}
												</span>
											</div>

											<div className="grid grid-cols-2 gap-3 pt-2">
												{template.status === 'published' ? (
													<Button
														onClick={() => handleCloseClick(template)}
														disabled={actionState.templateId === template.id}
														variant="destructive"
														className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm"
													>
														<X className="w-4 h-4 mr-2" />
														Close
													</Button>
												) : (
													<Button
														onClick={() => handlePublishClick(template)}
														disabled={actionState.templateId === template.id}
														className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
													>
														<Check className="w-4 h-4 mr-2" />
														Publish
													</Button>
												)}
												<Button
													variant="outline"
													onClick={() => handleViewDetails(template)}
													className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
												>
													View Details
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</AnimatePresence>

					{/* Confirmation Dialog */}
					{selectedTemplate && showConfirmation && (
						<ConfirmationDialog
							isOpen={showConfirmation}
							title=''
							onClose={() => setShowConfirmation(false)}
							onConfirm={() => handleAction(selectedTemplate.id, 'close')}
							description={`Are you sure you want to close "${selectedTemplate.name}"? You can publish it again later.`}
							confirmText="Close"
						/>
					)}

					{selectedTemplate && showPublishConfirm && (
						<ConfirmationDialog
							isOpen={showPublishConfirm}
							title=''
							onClose={() => setShowPublishConfirm(false)}
							onConfirm={() => handleAction(selectedTemplate.id, 'publish')}
							description={`Are you sure you want to publish "${selectedTemplate.name}"?`}
							confirmText="Publish"
							confirmVariant='secondary'
							confirmClassName='w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700'
						/>
					)}

					{/* View Details Dialog */}
					{selectedTemplate && showDetails && (
						<ViewDetails
							template={selectedTemplate}
							onClose={() => setShowDetails(false)}
							isPublished={selectedTemplate.status === 'published'}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default PreferencesPublish;
