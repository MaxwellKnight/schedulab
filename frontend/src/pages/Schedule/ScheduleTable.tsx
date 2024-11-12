import React, { useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DroppableShiftSlot } from '@/components/DroppableShiftSlot';
import { getShiftAbbreviation } from '@/utils/shitUtils';
import { TemplateScheduleData, TemplateShiftData } from '@/types/template.dto';
import { ShiftType } from '@/types/shifts.dto';
import { MemberAssignment } from './Schedule';
import { ScheduleState } from './ScheduleGridHeader';
import { calculateShiftGroupHeight, getRenderConfig } from '@/utils/scheduleUtils';

export interface ScheduleTableProps {
	template: TemplateScheduleData;
	shiftTypes: ShiftType[];
	dates: Date[];
	timeSlots: string[];
	state: ScheduleState;
	assignments: MemberAssignment[];
	getAssignedSlots: (shift: TemplateShiftData, date: Date, timeSlot: string) => any[];
	shiftColors: Record<string, string>;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
	template,
	shiftTypes,
	dates,
	timeSlots,
	state,
	assignments,
	getAssignedSlots,
	shiftColors
}) => {
	const renderShiftGroup = useCallback((shifts: TemplateShiftData[], date: Date, timeSlot: string) => {
		if (!shiftTypes) return null;

		const config = getRenderConfig(state.zoomLevel);

		return shifts.map(shift => {
			const shiftType = shiftTypes.find(type => type.id === shift.shift_type_id);
			if (!shiftType) return null;

			const assignedSlots = getAssignedSlots(shift, date, timeSlot);
			const positions = Array.from({ length: shift.required_count });
			const totalHeight = calculateShiftGroupHeight(shift.required_count, config);
			const groupKey = `${shift.id}-${date.toISOString()}-${timeSlot}-${assignments.length}`;

			return (
				<div
					key={groupKey}
					className="p-1 first:pt-2 last:pb-2 relative group"
					style={{
						height: `${totalHeight + 32}px`,
						minHeight: `${totalHeight + 32}px`
					}}
				>
					<div className="flex items-center text-xs font-medium text-gray-500 mb-1 px-1">
						<span className="font-mono">{getShiftAbbreviation(shiftType.name)}</span>
						<div className="flex items-center text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2">
							<Users className="w-3 h-3 mr-1" />
							<span className={assignedSlots.length === shift.required_count ? 'text-green-600' : 'text-amber-600'}>
								{assignedSlots.length}/{shift.required_count}
							</span>
						</div>
					</div>
					<div className="relative">
						{positions.map((_, i) => {
							const assignment = assignedSlots.find(s => s.position === i);
							const uniqueKey = `${shiftType.id}-${date.toISOString()}-${timeSlot}-${i}-${assignment?.member?.id || 'empty'}-${assignments.length}`;

							return (
								<DroppableShiftSlot
									key={uniqueKey}
									shiftTypeId={shift.shift_type_id}
									date={date}
									timeSlot={timeSlot}
									position={i}
									shiftName={shiftType.name}
									assignedMember={assignment?.member || null}
									className={cn(
										'absolute rounded border',
										shiftColors[shiftType.id],
										'bg-opacity-50 transition-all duration-200',
										assignment ? 'opacity-100' : 'opacity-50',
										'flex items-center justify-center text-xs shadow-sm hover:shadow-md'
									)}
									style={{
										height: `${config.baseHeight}px`,
										top: `${i * (config.baseHeight + config.spacing)}px`,
										left: 0,
										right: 0
									}}
								/>
							);
						})}
					</div>
				</div>
			);
		});
	}, [shiftTypes, state.zoomLevel, getAssignedSlots, shiftColors, assignments.length]);

	const filteredTimeSlots = timeSlots.filter(slot => {
		const hour = parseInt(slot.split(':')[0]);
		return hour >= state.visibleHoursStart && hour < state.visibleHoursEnd;
	});

	return (
		<Table className={cn('rounded', state.isFullScreen && ["bg-white", "shadow-sm"])}>
			<TableHeader className="sticky top-0 bg-white z-10">
				<TableRow>
					<TableHead className="w-16 px-2">Time</TableHead>
					{dates.map(date => (
						<TableHead
							key={date.toISOString()}
							className="text-center p-1"
							style={{ minWidth: `${80 * state.zoomLevel}px` }}
						>
							<div className="flex flex-col">
								<span className="text-xs text-gray-500">
									{date.toLocaleDateString('en-US', { weekday: 'short' })}
								</span>
								<span className="font-medium">{date.getDate()}</span>
							</div>
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredTimeSlots.map(timeSlot => (
					<TableRow key={timeSlot} className="hover:bg-gray-50">
						<TableCell className="font-mono text-xs px-2 whitespace-nowrap">
							{timeSlot}
						</TableCell>
						{dates.map(date => (
							<TableCell
								key={`${date.toISOString()}-${timeSlot}`}
								className="p-2 border-gray-200"
								style={{
									minHeight: `${48 * state.zoomLevel}px`,
									verticalAlign: 'top'
								}}
							>
								{renderShiftGroup(
									template.shifts.filter(shift => {
										const shiftRanges = shift.ranges.some(range => {
											const startHour = range.start_time.split(':')[0];
											return startHour === timeSlot.split(':')[0];
										});
										return shift.day_of_week === date.getDay() && shiftRanges;
									}),
									date,
									timeSlot
								)}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
