import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Calendar, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TemplateScheduleData, TemplateShiftData } from '@/types/template.dto';
import { ShiftType } from '@/types/shifts.dto';
import { UserData } from '@/types';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { MemberAssignment } from './Schedule';

const getShiftAbbreviation = (name: string): string => {
	const words = name.split(' ');
	if (words.length === 1) {
		return name.slice(0, 3);
	}
	return words.map(word => word[0]).join('');
};

const DraggableMember: React.FC<{
	memberId: string;
	shiftTypeId: number;
	date: string;
	timeSlot: string;
	position: number;
	member: UserData;
	className?: string;
}> = ({ memberId, shiftTypeId, date, timeSlot, position, member, className }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `member-${memberId}-${shiftTypeId}-${date}-${timeSlot}-${position}`,
		data: {
			type: 'member',
			memberId,
			shiftTypeId,
			date,
			timeSlot,
			position,
			member
		}
	});

	const style = transform ? {
		transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		zIndex: 50
	} : undefined;

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={`${className} cursor-move`}
			style={style}
		>
			<span className="truncate">
				{member.first_name} {member.last_name}
			</span>
		</div>
	);
};

const DroppableShiftSlot: React.FC<{
	shiftTypeId: number;
	date: Date;
	timeSlot: string;
	position: number;
	shiftName: string;
	assignedMember: UserData | null;
	className?: string;
	style?: React.CSSProperties;
}> = ({
	shiftTypeId,
	date,
	timeSlot,
	position,
	assignedMember,
	className,
	style,
}) => {
		const { setNodeRef, isOver, active } = useDroppable({
			id: `slot-${shiftTypeId}-${date.toISOString()}-${timeSlot}-${position}`,
			data: {
				type: 'slot',
				shiftTypeId,
				date,
				timeSlot,
				position
			}
		});

		const isValidDrop = active?.data?.current?.type === 'new-member' || active?.data?.current?.type === 'member';

		return (
			<div
				ref={setNodeRef}
				className={`
        ${className}
        ${isOver && isValidDrop ? 'ring-2 ring-blue-400 opacity-100 !bg-opacity-75' : ''}
        ${!assignedMember ? 'min-h-[24px]' : ''}
      `}
				style={style}
			>
				{assignedMember ? (
					<DraggableMember
						memberId={assignedMember.id.toString()}
						shiftTypeId={shiftTypeId}
						date={date.toISOString()}
						timeSlot={timeSlot}
						position={position}
						member={assignedMember}
						className="flex items-center px-2"
					/>
				) : (
					isOver && isValidDrop && <span className="text-gray-500">Drop here</span>
				)}
			</div>
		);
	};

const ShiftOccupancyBadge: React.FC<{
	filled: number;
	total: number;
}> = ({ filled, total }) => (
	<div className="flex items-center text-xs bg-gray-100 rounded-full px-2 py-0.5 ml-2">
		<Users className="w-3 h-3 mr-1" />
		<span className={filled === total ? 'text-green-600' : 'text-amber-600'}>
			{filled}/{total}
		</span>
	</div>
);

interface ScheduleEditableProps {
	template: TemplateScheduleData | null;
	shiftTypes: ShiftType[] | null;
	members: UserData[] | null;
	assignments: MemberAssignment[];
}

const ScheduleEditable: React.FC<ScheduleEditableProps> = ({
	template,
	shiftTypes,
	members,
	assignments,
}) => {
	const [zoomLevel, setZoomLevel] = useState(1.75);
	const [visibleHoursStart, setVisibleHoursStart] = useState(0);
	const [visibleHoursEnd, setVisibleHoursEnd] = useState(24);
	const [isFullScreen, setIsFullScreen] = useState(false);

	const getAssignedSlots = useCallback((shift: TemplateShiftData, date: Date, timeSlot: string) => {
		return assignments
			.filter(a => {
				const normalizedAssignmentTimeSlot = a.timeSlot.split(':').slice(0, 2).join(':');
				const normalizedTimeSlot = timeSlot.split(':').slice(0, 2).join(':');

				return (
					a.shiftTypeId === shift.shift_type_id &&
					a.date === date.toISOString() &&
					normalizedAssignmentTimeSlot === normalizedTimeSlot
				);
			})
			.map(a => ({
				position: a.position,
				member: members?.find(m => m.id.toString() === a.memberId),
				assignment: a
			}))
			.filter((slot): slot is { position: number; member: UserData; assignment: MemberAssignment } =>
				slot.member != null
			)
			.sort((a, b) => a.position - b.position);
	}, [assignments, members]);

	const shiftColors = useMemo(() => {
		const colors = {
			morning: 'bg-blue-100 border-blue-300 text-blue-800',
			afternoon: 'bg-green-100 border-green-300 text-green-800',
			night: 'bg-purple-100 border-purple-300 text-purple-800',
			oncall: 'bg-yellow-100 border-yellow-300 text-yellow-800',
			backup: 'bg-pink-100 border-pink-300 text-pink-800',
			default: 'bg-red-100 border-red-300 text-red-800'
		};

		return shiftTypes?.reduce((acc, type, index) => {
			acc[type.id] = Object.values(colors)[index % Object.values(colors).length];
			return acc;
		}, {} as Record<number, string>) ?? {};
	}, [shiftTypes]);

	const renderShiftGroup = useCallback((shifts: TemplateShiftData[], date: Date, timeSlot: string) => {
		return shifts.map(shift => {
			const shiftType = shiftTypes?.find(type => type.id === shift.shift_type_id);
			if (!shiftType) return null;

			const baseHeight = 24;
			const spacing = 6;
			const scaledBaseHeight = baseHeight * zoomLevel;
			const scaledSpacing = spacing * zoomLevel;

			const assignedSlots = getAssignedSlots(shift, date, timeSlot);
			const positions = Array.from({ length: shift.required_count });

			const totalHeight = (scaledBaseHeight * shift.required_count) +
				(scaledSpacing * (shift.required_count - 1));

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
						<ShiftOccupancyBadge
							filled={assignedSlots.length}
							total={shift.required_count}
						/>
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
									className={`
                  absolute rounded border ${shiftColors[shiftType.id]} 
                  bg-opacity-50 transition-all duration-200
                  ${assignment ? 'opacity-100' : 'opacity-50'}
                  flex items-center justify-center text-xs shadow-sm hover:shadow-md
                `}
									style={{
										height: `${scaledBaseHeight}px`,
										top: `${i * (scaledBaseHeight + scaledSpacing)}px`,
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
	}, [shiftTypes, zoomLevel, getAssignedSlots, shiftColors, assignments.length]);

	const timeSlots = useMemo(() => {
		if (!template) return [];
		const uniqueHours = new Set<string>();
		template.shifts.forEach(shift => {
			shift.ranges.forEach(range => {
				const startHour = range.start_time.split(':')[0];
				uniqueHours.add(startHour.padStart(2, '0') + ':00');
			});
		});
		return Array.from(uniqueHours).sort();
	}, [template]);

	const dates = useMemo(() => {
		if (!template) return [];
		const dateArray: Date[] = [];
		const currentDate = new Date(template.start_date);
		const endDate = new Date(template.end_date);
		while (currentDate <= endDate) {
			dateArray.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dateArray;
	}, [template]);

	const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2));
	const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

	const handleTimeRangeChange = (direction: 'left' | 'right') => {
		const step = 4;
		if (direction === 'left') {
			setVisibleHoursStart(prev => Math.max(prev - step, 0));
			setVisibleHoursEnd(prev => Math.max(prev - step, step));
		} else {
			setVisibleHoursStart(prev => Math.min(prev + step, 20));
			setVisibleHoursEnd(prev => Math.min(prev + step, 24));
		}
	};

	const toggleFullScreen = () => {
		setIsFullScreen(prev => !prev);
	};

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
		<Card className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
			<CardHeader className="bg-white border-b sticky top-0 z-20">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg font-medium">
						Playground
					</CardTitle>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={toggleFullScreen}
							className="hover:bg-gray-100"
						>
							{isFullScreen ? (
								<Minimize2 className="h-4 w-4" />
							) : (
								<Maximize2 className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
				<div className="flex justify-between items-center pt-2">
					<div className="flex flex-wrap gap-2">
						{shiftTypes.map(type => (
							<div
								key={type.id}
								className={`px-3 py-1.5 rounded-full text-xs font-medium ${shiftColors[type.id]} 
                  shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center space-x-1`}
							>
								<span className="font-mono">{getShiftAbbreviation(type.name)}</span>
								<span className="text-xs text-gray-500">|</span>
								<span className="text-xs">{type.name}</span>
							</div>
						))}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleTimeRangeChange('left')}
							disabled={visibleHoursStart === 0}
							className="hover:bg-gray-100"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={handleZoomOut}
							disabled={zoomLevel <= 0.5}
							className="hover:bg-gray-100"
						>
							<ZoomOut className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={handleZoomIn}
							disabled={zoomLevel >= 2}
							className="hover:bg-gray-100"
						>
							<ZoomIn className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleTimeRangeChange('right')}
							disabled={visibleHoursEnd === 24}
							className="hover:bg-gray-100"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className={`p-0 ${isFullScreen ? 'h-[calc(100vh-9rem)]' : ''}`}>
				<ScrollArea className={`${isFullScreen ? 'h-full' : 'max-h-[calc(100vh-16rem)] overflow-y-scroll'}`}>
					<div className="p-2 max-h-[600px]">
						<Table className='rounded'>
							<TableHeader className="sticky top-0 bg-white z-10">
								<TableRow>
									<TableHead className="w-16 px-2">Time</TableHead>
									{dates.map(date => (
										<TableHead
											key={date.toISOString()}
											className="text-center p-1"
											style={{ minWidth: `${80 * zoomLevel}px` }}
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
								{timeSlots
									.filter(slot => {
										const hour = parseInt(slot.split(':')[0]);
										return hour >= visibleHoursStart && hour < visibleHoursEnd;
									})
									.map(timeSlot => (
										<TableRow key={timeSlot} className="hover:bg-gray-50">
											<TableCell className="font-mono text-xs px-2 whitespace-nowrap">
												{timeSlot}
											</TableCell>
											{dates.map(date => (
												<TableCell
													key={`${date.toISOString()}-${timeSlot}`}
													className="p-2 border-gray-200"
													style={{
														minHeight: `${48 * zoomLevel}px`,
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
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default ScheduleEditable;
