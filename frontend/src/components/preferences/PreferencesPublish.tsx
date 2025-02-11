import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Users, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
import { format } from 'date-fns';
import { useTeam } from '@/context';

interface PreferenceTemplate {
	id: number;
	team_id: number;
	name: string;
	start_date: string;
	end_date: string;
	status: string;
	time_slots: Array<{
		id: number;
		date: string;
		time_range: {
			start_time: string;
			end_time: string;
		};
	}>;
}

const PreferencesPublish = () => {
	const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);
	const { selectedTeam } = useTeam();

	const {
		data: templates,
		loading,
		error,
		fetchData: refetch
	} = useAuthenticatedFetch<PreferenceTemplate[]>('/preferences', { params: { teamId: selectedTeam?.id } });

	const filtered_templates = templates?.filter(template => template.team_id == selectedTeam?.id);

	const handlePublish = async (templateId: number) => {
		setIsPublishing(true);
		setSelectedTemplate(templateId);

		try {
			await fetch(`/api/preferences/${templateId}/publish`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			await refetch();
		} catch (err) {
			console.error('Error publishing template:', err);
		} finally {
			setIsPublishing(false);
			setSelectedTemplate(null);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				>
					<Clock className="w-8 h-8 text-blue-600" />
				</motion.div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-4 bg-red-50">
				<AlertCircle className="w-4 h-4" />
				<AlertDescription>Failed to load templates. Please try again.</AlertDescription>
			</Alert>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-6 p-4"
		>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-semibold text-blue-900">Publish Templates</h2>
					<p className="text-gray-600 mt-1">Manage and publish your preference templates</p>
				</div>
				<Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
					{templates?.filter(template => template.team_id === selectedTeam?.id).length} Templates
				</Badge>
			</div>

			{filtered_templates?.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200"
				>
					<Calendar className="w-16 h-16 text-gray-400 mb-4" />
					<h3 className="text-xl font-medium text-gray-700 mb-2">No Future Templates</h3>
					<p className="text-sm text-gray-500 text-center max-w-md">
						There are no templates scheduled for future dates. Create a new template to get started.
					</p>
				</motion.div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered_templates?.map((template, i) => (
						<motion.div
							key={template.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							whileHover={{ y: -1 }}
							transition={{ duration: 0.2 * i }}
						>
							<Card className="group relative overflow-hidden border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-300">
								<div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

								<div className="absolute top-4 right-4">
									{template.status === 'published' && (
										<Badge className="bg-green-100 text-green-800 border-green-200">
											<Check className="w-3 h-3 mr-1" />
											Published
										</Badge>
									)}
								</div>

								<CardHeader className="bg-gradient-to-b from-blue-50/50 to-transparent pb-4">
									<CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
										{template.name}
									</CardTitle>
									<div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
										<Users className="w-4 h-4" />
										<span className="text-blue-600/80">Team {template.team_id}</span>
									</div>
								</CardHeader>

								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-lg">
											<Calendar className="w-4 h-4 text-blue-600" />
											<span className="text-blue-800">
												{format(new Date(template.start_date), 'MMM d, yyyy')} -
												{format(new Date(template.end_date), 'MMM d, yyyy')}
											</span>
										</div>

										<div className="flex items-center gap-2 text-sm text-gray-600">
											<Clock className="w-4 h-4" />
											<span>{template.time_slots.length} time slots</span>
										</div>
									</div>

									<Button
										onClick={() => handlePublish(template.id)}
										disabled={template.status === 'published' || isPublishing}
										className={`w-full group relative overflow-hidden ${template.status === 'published'
											? 'bg-green-600 hover:bg-green-700'
											: 'bg-blue-600 hover:bg-blue-700'
											} text-white shadow-sm hover:shadow-md transition-all duration-300`}
									>
										<motion.div
											className="absolute inset-0 bg-white/10"
											initial={false}
											animate={{ scale: isPublishing ? 1.5 : 1, opacity: isPublishing ? 0 : 1 }}
											transition={{ duration: 0.5, repeat: isPublishing ? Infinity : 0 }}
										/>
										{isPublishing && selectedTemplate === template.id ? (
											<span className="flex items-center justify-center gap-2">
												<Clock className="w-4 h-4 animate-spin" />
												Publishing...
											</span>
										) : template.status === 'published' ? (
											<span className="flex items-center justify-center gap-2">
												<Check className="w-4 h-4" />
												Published
											</span>
										) : (
											'Publish Template'
										)}
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			)}
		</motion.div>
	);
};

export default PreferencesPublish;
