import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wand2, Settings2, AlertCircle, Loader2, Trash2 } from 'lucide-react';

export interface AutoAssignPreferences {
	respectExisting: boolean;
	balanceLoad: boolean;
	considerStudentStatus: boolean;
}

interface ScheduleSettingsProps {
	onAutoAssign: () => Promise<void>;
	isProcessing: boolean;
	hasAssignments: boolean;
	onClearAssignments: () => void;
	preferences: AutoAssignPreferences;
	onPreferencesChange: (preferences: AutoAssignPreferences) => void;
}

const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
	onAutoAssign,
	isProcessing,
	hasAssignments,
	onClearAssignments,
	preferences,
	onPreferencesChange,
}) => {
	const [error, setError] = useState<string | null>(null);

	const handleAutoAssign = async () => {
		try {
			setError(null);
			await onAutoAssign();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create schedule');
		}
	};

	const preferenceOptions = [
		{
			id: 'respectExisting',
			label: 'Respect Existing',
			description: 'Keep current assignments',
			checked: preferences.respectExisting,
			onChange: (checked: boolean) =>
				onPreferencesChange({ ...preferences, respectExisting: checked })
		},
		{
			id: 'balanceLoad',
			label: 'Balance Load',
			description: 'Distribute shifts evenly',
			checked: preferences.balanceLoad,
			onChange: (checked: boolean) =>
				onPreferencesChange({ ...preferences, balanceLoad: checked })
		},
		{
			id: 'considerStudentStatus',
			label: 'Student Status',
			description: 'Prioritize non-students',
			checked: preferences.considerStudentStatus,
			onChange: (checked: boolean) =>
				onPreferencesChange({ ...preferences, considerStudentStatus: checked })
		}
	];

	return (
		<Card className="w-full">
			<CardHeader className="pb-3 px-3">
				<CardTitle className="text-sm font-medium flex items-center gap-2">
					<Settings2 className="h-4 w-4 text-blue-600" />
					Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 px-3">
				<div className="flex flex-col gap-2 w-full">
					<Button
						onClick={handleAutoAssign}
						disabled={isProcessing}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all text-xs"
						size="sm"
					>
						{isProcessing ? (
							<>
								<Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<Wand2 className="h-3 w-3 mr-1.5" />
								Auto-Assign
							</>
						)}
					</Button>

					{hasAssignments && (
						<Button
							variant="outline"
							onClick={onClearAssignments}
							className="w-full text-gray-700 hover:bg-gray-100 border-gray-200 text-xs"
							size="sm"
						>
							<Trash2 className="h-3 w-3 mr-1.5 text-gray-500" />
							Clear All
						</Button>
					)}
				</div>

				{error && (
					<Alert variant="destructive" className="py-2 px-3 bg-red-50 text-red-600 border-red-100 text-xs">
						<AlertCircle className="h-3 w-3" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-2">
					{preferenceOptions.map(({ id, label, description, checked, onChange }) => (
						<div
							key={id}
							className="group px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
						>
							<label className="flex items-start gap-2 cursor-pointer">
								<div className="relative flex items-center pt-0.5">
									<div className="relative">
										<input
											type="checkbox"
											id={id}
											checked={checked}
											onChange={(e) => onChange(e.target.checked)}
											className="peer sr-only"
										/>
										<div className="h-4 w-7 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1 peer-checked:bg-blue-600 transition-colors" />
										<div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-3" />
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<span className="block text-xs font-medium text-gray-900 truncate">
										{label}
									</span>
									<span className="block text-xs text-gray-500 truncate">
										{description}
									</span>
								</div>
							</label>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default ScheduleSettings;
