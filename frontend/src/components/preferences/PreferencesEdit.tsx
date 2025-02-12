import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Pencil, Trash2 } from "lucide-react";
import { usePref } from '@/context/PreferencesContext';
import { WeekViewEditor } from './WeekViewEdit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreferenceTemplate } from './types';
import { useTeam } from '@/context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PreferencesEditProps {
	templates: PreferenceTemplate[] | null;
	loading: boolean;
	error: string | null;
	onDelete?: (id: number) => Promise<void>;
	onUpdateName?: (id: number, name: string) => Promise<void>;
}

export const PreferencesEdit: React.FC<PreferencesEditProps> = ({
	templates,
	loading,
	error,
	onDelete,
	onUpdateName
}) => {
	const [selectedTemplate, setSelectedTemplate] = useState<PreferenceTemplate | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [updateError, setUpdateError] = useState<string | null>(null);
	const { selectedTeam } = useTeam();
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
			setEditedName(selectedTemplate.name);
		}
	}, [selectedTemplate, setRange]);

	const handleEditSubmit = async () => {
		if (!selectedTemplate || !onUpdateName) return;

		try {
			await onUpdateName(selectedTemplate.id, editedName);
			setIsEditing(false);
			setUpdateError(null);
		} catch (err) {
			setUpdateError('Failed to update template name');
		}
	};

	const handleDeleteConfirm = async () => {
		if (!selectedTemplate || !onDelete) return;

		try {
			await onDelete(selectedTemplate.id);
			setSelectedTemplate(null);
			setShowDeleteDialog(false);
		} catch (err) {
			setUpdateError('Failed to delete template');
		}
	};

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
				<div className="p-6 bg-white">
					<div className="space-y-4">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-blue-500" />
								<h2 className="text-lg font-semibold text-blue-900">Select Template</h2>
							</div>
							{selectedTemplate && (
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setIsEditing(true)}
										className="h-8 text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
									>
										<Pencil className="h-3 w-3 mr-1" />
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowDeleteDialog(true)}
										className="h-8 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
									>
										<Trash2 className="h-3 w-3 mr-1" />
										Delete
									</Button>
								</div>
							)}
						</div>

						{isEditing && selectedTemplate ? (
							<div className="space-y-3">
								<div className="flex gap-2">
									<Input
										value={editedName}
										onChange={(e) => setEditedName(e.target.value)}
										className="h-12 bg-white border-blue-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-100"
										placeholder="Enter template name"
									/>
									<Button
										onClick={handleEditSubmit}
										disabled={!editedName.trim() || editedName === selectedTemplate.name}
										className="bg-blue-600 hover:bg-blue-700 text-white"
									>
										Save
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setIsEditing(false);
											setEditedName(selectedTemplate.name);
										}}
										className="border-blue-200 hover:border-blue-300 hover:bg-blue-50"
									>
										Cancel
									</Button>
								</div>
								{updateError && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription>{updateError}</AlertDescription>
									</Alert>
								)}
							</div>
						) : (
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
									{templates
										.filter(template => template.team_id === selectedTeam?.id)
										.map((template) => (
											<SelectItem
												key={template.id}
												value={template.id.toString()}
												className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
											>
												{template.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>

				{selectedTemplate && timeRanges.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-blue-50/30 rounded-lg p-6 border border-blue-100"
					>
						<WeekViewEditor
							timeRanges={timeRanges}
							template={selectedTemplate}
							onAddTimeRange={handleAddTimeRange}
							onRemoveTimeRange={handleRemoveTimeRange}
							onUpdateTimeRange={handleUpdateTimeRange}
							isLoading={loading}
						/>
					</motion.div>
				)}

				{/* Delete Confirmation Dialog */}
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Template</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete `&quot;`{selectedTemplate?.name}`&quot;`? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="border-blue-200 hover:border-blue-300 hover:bg-blue-50">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteConfirm}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</motion.div>
		</AnimatePresence>
	);
};
