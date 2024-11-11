import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wand2, Settings2, AlertCircle, Loader2, Trash2, Info } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { UserData } from '@/types';

export interface AutoAssignPreferences {
	respectExisting: boolean;
	balanceLoad: boolean;
	considerStudentStatus: boolean;
	maxShiftsPerMember?: number;
	minRestHours?: number;
	maxConsecutiveDays?: number;
}

interface ScheduleSettingsProps {
	members: UserData[];
	onAutoAssign: (members: UserData[]) => void;
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
	members
}) => {
	const [error, setError] = useState<string | null>(null);

	const handleAutoAssign = async () => {
		try {
			setError(null);
			onAutoAssign(members);
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

	const solverOptions = [
		{
			id: 'maxShiftsPerMember',
			label: 'Max Assignments',
			description: 'Limit how many shifts each member can be assigned in the schedule period',
			type: 'number',
			value: preferences.maxShiftsPerMember || 5,
			min: 1,
			max: 20,
			onChange: (value: number) =>
				onPreferencesChange({ ...preferences, maxShiftsPerMember: value })
		},
		{
			id: 'minRestHours',
			label: 'Rest Between Shifts',
			description: 'Minimum hours of rest required between any two shifts for a member',
			type: 'number',
			value: preferences.minRestHours || 12,
			min: 8,
			max: 48,
			onChange: (value: number) =>
				onPreferencesChange({ ...preferences, minRestHours: value })
		},
		{
			id: 'maxConsecutiveDays',
			label: 'Consecutive Days',
			description: 'Maximum number of days in a row that a member can be scheduled',
			type: 'number',
			value: preferences.maxConsecutiveDays || 5,
			min: 1,
			max: 7,
			onChange: (value: number) =>
				onPreferencesChange({ ...preferences, maxConsecutiveDays: value })
		}
	];


	return (
		<Card className="w-full">
			<CardHeader className="pb-3 px-3">
				<CardTitle className="text-sm font-medium flex items-center gap-2">
					<Settings2 className="h-4 w-4 text-blue-600" />
					Schedule Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 px-3">
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
					<div className="text-xs font-medium text-gray-700 mb-2">Basic Preferences</div>
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

				<Separator className="my-4" />

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="text-xs font-medium text-gray-700">Advanced Settings</div>
						<div className="text-xs text-gray-500">Constraints</div>
					</div>

					<div className="space-y-5">
						{solverOptions.map(({ id, label, description, value, min, max, onChange }) => (
							<div key={id} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<span className="text-xs font-medium text-gray-900">{label}</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													<Info className="h-3 w-3 text-gray-400" />
												</TooltipTrigger>
												<TooltipContent className="text-xs">
													{description}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="bg-blue-50 px-2 py-0.5 rounded text-xs font-medium text-blue-600">
										{value} {id === 'minRestHours' ? 'hrs' : ''}
									</div>
								</div>

								<div className="flex items-center gap-3">
									<span className="text-xs text-gray-500 w-4 text-right">{min}</span>
									<div className="relative flex-1 h-4">
										<div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded" />
										<div
											className="absolute top-1/2 -translate-y-1/2 h-1 bg-blue-100 rounded"
											style={{
												width: `${(value - min) / (max - min) * 100}%`,
												maxWidth: '100%'
											}}
										/>
										<input
											type="range"
											value={value}
											min={min}
											max={max}
											onChange={(e) => onChange(parseInt(e.target.value, 10))}
											className="absolute w-full top-1/2 -translate-y-1/2 h-4 appearance-none bg-transparent cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-blue-600
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:cursor-pointer
                hover:[&::-webkit-slider-thumb]:bg-blue-700
                hover:[&::-webkit-slider-thumb]:scale-110
                active:[&::-webkit-slider-thumb]:scale-95
                focus:[&::-webkit-slider-thumb]:ring-2
                focus:[&::-webkit-slider-thumb]:ring-blue-200
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-blue-600
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-sm
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:cursor-pointer
                hover:[&::-moz-range-thumb]:bg-blue-700
                hover:[&::-moz-range-thumb]:scale-110
                active:[&::-moz-range-thumb]:scale-95
                focus:[&::-moz-range-thumb]:ring-2
                focus:[&::-moz-range-thumb]:ring-blue-200"
										/>
									</div>
									<span className="text-xs text-gray-500 w-4">{max}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ScheduleSettings;
