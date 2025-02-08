import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar } from "lucide-react";
import { usePref } from '@/context/PreferencesContext';
import { WeekViewEditor } from './WeekViewEdit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreferenceTemplate } from './types';

interface PreferencesEditProps {
	templates: PreferenceTemplate[] | null;
	loading: boolean;
	error: string | null;
}
export const PreferencesEdit: React.FC<PreferencesEditProps> = ({ templates, loading, error }) => {
	const [selectedTemplate, setSelectedTemplate] = useState<PreferenceTemplate | null>(null);
	const {
		setRange,
		timeRanges,
		handleAddTimeRange,
		handleRemoveTimeRange,
		handleUpdateTimeRange
	} = usePref();

	useEffect(() => {
		if (selectedTemplate) {
			setRange({
				from: new Date(selectedTemplate.start_date),
				to: new Date(selectedTemplate.end_date)
			});
		}
	}, [selectedTemplate, setRange]);

	if (loading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-full rounded-lg" />
				<Skeleton className="h-[450px] w-full rounded-lg" />
			</div>
		);
	}

	if (error) {
		return (
			<Card className="p-8 bg-blue-50 border-blue-200">
				<div className="text-center text-blue-700 space-y-2">
					<div className="font-semibold">Error loading preferences</div>
					<div className="text-sm opacity-90">{error}</div>
				</div>
			</Card>
		);
	}

	if (!templates?.length) {
		return (
			<Card className="p-12 bg-blue-50/50 border-blue-100">
				<div className="text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
						<Clock className="h-8 w-8 text-blue-600" />
					</div>
					<h3 className="text-xl font-semibold text-blue-900 mb-3">No Preferences Found</h3>
					<p className="text-blue-600 max-w-sm mx-auto">
						Create new preferences to start managing your schedule.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className="space-y-8"
			>
				{/* Template Selection */}
				<Card className="p-6 bg-white shadow-sm border-blue-100">
					<div className="space-y-4">
						<div className="flex items-center gap-3 mb-2">
							<Calendar className="h-5 w-5 text-blue-500" />
							<h2 className="text-lg font-semibold text-blue-900">Select Template</h2>
						</div>
						<Select
							value={selectedTemplate?.id?.toString() || ""}
							onValueChange={(value) => {
								const template = templates.find(t => t.id === Number(value));
								setSelectedTemplate(template || null);
							}}
						>
							<SelectTrigger className="w-full h-12 bg-white border-blue-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-100 text-blue-900">
								<SelectValue placeholder="Choose a template to edit" />
							</SelectTrigger>
							<SelectContent>
								{templates.map((template) => (
									<SelectItem
										key={template.id}
										value={template.id.toString()}
										className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
									>
										{template.name} ({new Date(template.start_date).toLocaleDateString()} - {new Date(template.end_date).toLocaleDateString()})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</Card>

				{selectedTemplate && timeRanges.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-blue-50/30 rounded-lg p-6 border border-blue-100"
					>
						<WeekViewEditor
							timeRanges={timeRanges}
							onAddTimeRange={handleAddTimeRange}
							onRemoveTimeRange={handleRemoveTimeRange}
							onUpdateTimeRange={handleUpdateTimeRange}
						/>
					</motion.div>
				)}
			</motion.div>
		</AnimatePresence>
	);
};
