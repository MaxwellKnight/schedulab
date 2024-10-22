import React, { useState } from 'react';
import { Save, Users, Settings, Sheet } from 'lucide-react';
import Combobox from "@/components/combobox/Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateScheduleData } from '@/types/template.dto';

const Schedule: React.FC = () => {
	const [template, setTemplate] = useState<TemplateScheduleData | null>(null);
	const [isDirty, setIsDirty] = useState(false);

	const handleTemplateSelect = (selected: TemplateScheduleData | null) => {
		setTemplate(selected);
		setIsDirty(false);
	};

	const handlePublish = () => {
		//TODO:  Implement publish logic
		console.log('Publishing schedule:', template);
	};

	const handleSaveDraft = () => {
		//TODO: Implement save draft logic
		console.log('Saving draft:', template);
		setIsDirty(false);
	};

	return (
		<div className=" mx-auto p-4 space-y-4">
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
				<div className="flex-1 max-w-md">
					<h1 className="text-sm text-gray-500 mb-2">Template</h1>
					<Combobox
						onTemplateSelect={handleTemplateSelect}
						className="w-full"
					/>
				</div>
				<div className="flex gap-2 w-full sm:w-auto">
					<Button
						variant="outline"
						onClick={handleSaveDraft}
						disabled={!template || !isDirty}
						className="flex-1 sm:flex-none"
					>
						<Save className="h-4 w-4 mr-2" />
						Save Draft
					</Button>
					<Button
						onClick={handlePublish}
						disabled={!template}
						className="flex-1 sm:flex-none"
					>
						Publish Schedule
					</Button>
				</div>
			</div>

			{template && (
				<div className="grid grid-cols-12 gap-4">
					{/* Sidebar - Employee List */}
					<Card className="col-span-12 sm:col-span-2">
						<div className="p-3 border-b">
							<div className="flex items-center text-md text-gray-600 font-normal">
								<Users className="h-4 w-4 mr-2" />
								Members
							</div>
						</div>
						<CardContent className="p-2">
							<div className="space-y-2">
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
							</div>
						</CardContent>
					</Card>

					<Card className="col-span-12 sm:col-span-8">
						<div className="p-3 border-b">
							<div className="flex items-center text-md text-gray-600 font-normal">
								<Sheet className="h-4 w-4 mr-2" />
								Schedule Grid
							</div>
						</div>
						<CardContent className="p-2">
							{template ? (
								<div className="h-96 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
									Schedule Grid Area
								</div>
							) : (
								<div className="h-96 flex items-center justify-center text-gray-500">
									Select a template to start creating your schedule
								</div>
							)}
						</CardContent>
					</Card>

					{/* Settings Panel */}
					<Card className="col-span-12 sm:col-span-2">
						<div className="p-3 border-b">
							<div className="flex items-center text-md text-gray-600 font-normal">
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</div>
						</div>
						<CardContent className="p-2">
							<div className="space-y-2">
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
								<div className="h-8 bg-gray-100 rounded animate-pulse"></div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{!template && (
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-12 h-96 flex items-center justify-center text-gray-500">
						Select a template to start creating your schedule
					</div>
				</div>
			)}
		</div>
	);
};

export default Schedule;
