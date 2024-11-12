import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShiftColors } from '@/utils/shitUtils';
import { useScheduleGrid } from '@/hooks';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleGridHeader } from './ScheduleGridHeader';
import { TemplateScheduleData } from '@/types/template.dto';
import { ShiftType } from '@/types/shifts.dto';
import { UserData } from '@/types';
import { MemberAssignment } from './Schedule';

export interface ScheduleGridState {
	zoomLevel: number;
	visibleHoursStart: number;
	visibleHoursEnd: number;
	isFullScreen: boolean;
}

export interface ScheduleGridProps {
	template: TemplateScheduleData | null;
	shiftTypes: ShiftType[] | null;
	members: UserData[] | null;
	assignments: MemberAssignment[];
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({

	template,
	shiftTypes,
	members,
	assignments,
}) => {
	const [state, setState] = useState<ScheduleState>({
		zoomLevel: 1.25,
		visibleHoursStart: 0,
		visibleHoursEnd: 24,
		isFullScreen: false
	});

	const handleStateUpdate = (updates: Partial<ScheduleState>) => {
		setState((prev: ScheduleState) => ({ ...prev, ...updates }));
	};

	const { getAssignedSlots, timeSlots, dates } = useScheduleGrid(template, assignments, members);
	const shiftColors = getShiftColors(shiftTypes);

	if (!template || !shiftTypes) {
		return (
			<Card className="h-96">
				<CardContent className="h-full flex items-center justify-center text-gray-500">
					<Calendar className="w-8 h-8 mr-2" />
					<span>No template or shift types available</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn(
			"transition-all duration-300",
			state.isFullScreen && [
				"fixed inset-0 w-full h-full",
				"z-[9999]",
				"m-0 rounded-none",
				"bg-white",
				"backdrop-blur-lg",
				"animate-in fade-in zoom-in-95",
				"duration-200"
			])}>
			<ScheduleGridHeader
				state={state}
				onStateUpdate={handleStateUpdate}
				shiftTypes={shiftTypes}
				shiftColors={shiftColors}
			/>
			<CardContent className={cn(
				"p-0",
				state.isFullScreen && ["h-[calc(100vh-4rem)]", "p-0", "relative"]
			)}>
				<ScrollArea className={cn(
					state.isFullScreen
						? ["h-full", "absolute inset-0", "shadow-inner"]
						: "h-full overflow-y-scroll"
				)}>
					<div className={cn("p-2", state.isFullScreen && "p-4")}>
						<ScheduleTable
							template={template}
							shiftTypes={shiftTypes}
							dates={dates}
							timeSlots={timeSlots}
							state={state}
							assignments={assignments}
							getAssignedSlots={getAssignedSlots}
							shiftColors={shiftColors}
						/>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default ScheduleGrid;
