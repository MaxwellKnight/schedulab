import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Constraints, ShiftData, TimeRange } from '@/types';
import { ArrowRight, ChevronLeft, ChevronRight, GripVertical, Info, Plus, Clock } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragStartEvent, DragEndEvent, DragOverEvent, Active, Over } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Schedule, ShiftType } from './ScheduleBuilder';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { getColorForShiftType } from '@/utils/colors';

interface ShiftConstraintsManagerProps {
	schedule: Schedule;
	onUpdateSchedule: (updatedSchedule: Partial<Schedule>) => void;
	onBack: () => void;
	onNext: () => void;
}

interface DraggableShiftTypeProps {
	type: ShiftType;
	schedule: Schedule;
}

const DraggableShiftType: React.FC<DraggableShiftTypeProps> = ({ type, schedule }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `shift-type-${type.id}`,
		data: { type, isNew: true },
	});

	const style: React.CSSProperties | undefined = transform ? {
		transform: CSS.Translate.toString(transform),
	} : undefined;

	const color = getColorForShiftType(type.id.toString(), schedule);

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-white border rounded-md shadow-sm flex items-center p-3 cursor-move"
		>
			<div className={`${color} w-3 h-3 rounded-full mr-2`}></div>
			<span className="font-medium flex-grow">{type.name}</span>
			<GripVertical className="text-gray-500" size={20} />
		</div>
	);
};

interface ConstraintItemProps {
	constraint: Constraints;
	schedule: Schedule;
	timeRanges: TimeRange[];
	onUpdateTimeRanges: (constraintId: string, selectedRanges: TimeRange[]) => void;
}

const ConstraintItem: React.FC<ConstraintItemProps> = ({ constraint, schedule, timeRanges, onUpdateTimeRanges }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `constraint-${constraint.id}`,
		data: { constraint, isNew: false },
	});

	const style: React.CSSProperties | undefined = transform ? {
		transform: CSS.Translate.toString(transform),
	} : undefined;

	const color = getColorForShiftType(constraint.id.split('-')[0], schedule);
	const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>(constraint.ranges || []);

	const handleTimeRangeChange = (range: TimeRange) => {
		const newSelectedRanges = selectedRanges.includes(range)
			? selectedRanges.filter(r => r !== range)
			: [...selectedRanges, range];
		setSelectedRanges(newSelectedRanges);
		onUpdateTimeRanges(constraint.id, newSelectedRanges);
	};

	const handleSelectAll = () => {
		const newSelectedRanges = selectedRanges.length === timeRanges.length ? [] : timeRanges;
		setSelectedRanges(newSelectedRanges);
		onUpdateTimeRanges(constraint.id, newSelectedRanges);
	};

	return (
		<div className="flex items-center gap-2 bg-white border rounded-md shadow-sm p-2">
			<div
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				className="cursor-move"
			>
				<GripVertical className="text-gray-500" size={20} />
			</div>
			<div className={`${color} w-3 h-3 rounded-full`}></div>
			<span className="font-medium flex-grow">{constraint.shift_type}</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm">
						<Clock className="h-4 w-4 mr-2" />
						{selectedRanges.length} / {timeRanges.length}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-50">
					<div className="space-y-2">
						<div className="flex items-center">
							<Checkbox
								id={`selectAll-${constraint.id}`}
								checked={selectedRanges.length === timeRanges.length}
								onCheckedChange={handleSelectAll}
							/>
							<label htmlFor={`selectAll-${constraint.id}`} className="ml-2 text-sm font-medium">
								Select All
							</label>
						</div>
						{timeRanges.map((range, index) => (
							<div key={index} className="flex items-center">
								<Checkbox
									id={`range-${constraint.id}-${index}`}
									checked={selectedRanges.includes(range)}
									onCheckedChange={() => handleTimeRangeChange(range)}
								/>
								<label htmlFor={`range-${constraint.id}-${index}`} className="ml-2 text-sm">
									{format(new Date(range.start_time), "HH:mm")} - {format(new Date(range.end_time), "HH:mm")}
								</label>
							</div>
						))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

interface ConstraintRowProps {
	constraints: Constraints[];
	rowIndex: number;
	schedule: Schedule;
	isOver: boolean;
	timeRanges: GroupedTimeRanges;
	onUpdateTimeRanges: (constraintId: string, selectedRanges: TimeRange[]) => void;
}

const ConstraintRow: React.FC<ConstraintRowProps> = ({ constraints, rowIndex, schedule, isOver, timeRanges, onUpdateTimeRanges }) => {
	const { setNodeRef } = useDroppable({
		id: `row-${rowIndex}`,
	});

	return (
		<div
			ref={setNodeRef}
			className={`flex p-2 items-center space-x-2 mb-2 min-h-[40px] rounded-sm ${isOver ? 'bg-sky-100' : ''}`}
		>
			<Badge variant="secondary">{rowIndex + 1}</Badge>
			{constraints.map((constraint, index) => (
				<React.Fragment key={constraint.id}>
					<ConstraintItem
						constraint={constraint}
						schedule={schedule}
						timeRanges={timeRanges[Number(constraint.id.split('-')[0])] || []}
						onUpdateTimeRanges={onUpdateTimeRanges}
					/>
					{index < constraints.length - 1 && (
						<ArrowRight className="text-gray-400" size={20} />
					)}
				</React.Fragment>
			))}
		</div>
	);
};

const NewRowButton: React.FC<{ rowIndex: number; isOver: boolean }> = ({ rowIndex, isOver }) => {
	const { setNodeRef } = useDroppable({
		id: `new-row-${rowIndex}`,
	});

	return (
		<div
			ref={setNodeRef}
			className={`flex justify-center items-center h-10 mb-2 border-2 border-dashed border-gray-300 rounded-md ${isOver ? 'bg-sky-100' : ''}`}
		>
			<Plus className="text-gray-400" size={20} />
		</div>
	);
};

type GroupedTimeRanges = Record<number, TimeRange[]>;

const ConstraintBuilder: React.FC<ShiftConstraintsManagerProps> = ({
	schedule,
	onUpdateSchedule,
	onBack,
	onNext
}) => {
	const [, setActiveId] = useState<string | null>(null);
	const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
	const [timeRanges, setTimeRanges] = useState<GroupedTimeRanges>({});

	const groupTimeRangesByShiftType = (schedule: Schedule): GroupedTimeRanges => {
		const groupedRanges: GroupedTimeRanges = {};

		schedule.shifts.forEach((shift: ShiftData) => {
			if (!groupedRanges[shift.shift_type]) {
				groupedRanges[shift.shift_type] = [];
			}
			groupedRanges[shift.shift_type].push(...shift.ranges);
		});

		return groupedRanges;
	};

	useEffect(() => setTimeRanges(groupTimeRangesByShiftType(schedule)), [schedule]);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		if (event.over) {
			setHoveredRowId(event.over.id as string);
		} else {
			setHoveredRowId(null);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over) {
			if (active.data.current?.isNew) {
				addNewConstraint(active, over);
			} else {
				moveExistingConstraint(active, over);
			}
		} else {
			removeConstraint(active);
		}

		setActiveId(null);
		setHoveredRowId(null);
	};

	const addNewConstraint = (active: Active, over: Over) => {
		const newConstraint: Constraints = {
			id: `${(active.data.current?.type as ShiftType).id}-${Date.now()}`,
			shift_type: (active.data.current?.type as ShiftType).name,
			ranges: [],
		};

		const newConstraints = [...schedule.constraints];

		if (over.id === 'droppable-area') {
			newConstraints.push([newConstraint]);
		} else if (typeof over.id === 'string' && over.id.startsWith('new-row-')) {
			const newRowIndex = parseInt(over.id.split('-')[2]);
			newConstraints.splice(newRowIndex, 0, [newConstraint]);
		} else {
			const [rowIndex] = (over.id as string).split('-').slice(1);
			newConstraints[Number(rowIndex)].push(newConstraint);
		}

		onUpdateSchedule({ constraints: newConstraints });
	};

	const moveExistingConstraint = (active: Active, over: Over) => {
		const activeRowIndex = schedule.constraints.findIndex(row =>
			row.some(constraint => `constraint-${constraint.id}` === active.id)
		);
		const activeConstraintIndex = schedule.constraints[activeRowIndex].findIndex(
			constraint => `constraint-${constraint.id}` === active.id
		);
		const activeConstraint = schedule.constraints[activeRowIndex][activeConstraintIndex];

		// Remove from the original position
		const newConstraints = schedule.constraints.map(row => [...row]);
		newConstraints[activeRowIndex].splice(activeConstraintIndex, 1);

		// Add to the new position
		if (over.id === 'droppable-area') {
			newConstraints.push([activeConstraint]);
		} else if (typeof over.id === 'string' && over.id.startsWith('new-row-')) {
			const newRowIndex = parseInt(over.id.split('-')[2]);
			newConstraints.splice(newRowIndex, 0, [activeConstraint]);
		} else {
			const [rowIndex] = (over.id as string).split('-').slice(1);
			newConstraints[Number(rowIndex)].push(activeConstraint);
		}

		// Remove empty rows
		onUpdateSchedule({ constraints: newConstraints.filter(row => row.length > 0) });
	};

	const removeConstraint = (active: Active) => {
		const newConstraints = schedule.constraints.map(row =>
			row.filter(constraint => `constraint-${constraint.id}` !== active.id)
		).filter(row => row.length > 0);
		onUpdateSchedule({ constraints: newConstraints });
	};

	const handleUpdateTimeRanges = (constraintId: string, selectedRanges: TimeRange[]) => {
		const newConstraints = schedule.constraints.map(row =>
			row.map(constraint =>
				constraint.id === constraintId
					? { ...constraint, ranges: selectedRanges }
					: constraint
			)
		);
		onUpdateSchedule({ constraints: newConstraints });
	};

	const { setNodeRef } = useDroppable({
		id: 'droppable-area',
	});

	return (
		<DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
			<div className="space-y-6">
				<div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
					<div className="flex items-start">
						<Info className="flex-shrink-0 h-5 w-5 mr-2 mt-0.5" />
						<p>
							Each row represents a forbidden sequence of shift types that cannot occur in the schedule.
							Drag shift types to create these sequences and define your scheduling constraints.
							Click on the clock icon to select specific time ranges for each constraint.
						</p>
					</div>
				</div>
				<div className="flex space-x-4">
					<div ref={setNodeRef} className="flex flex-col flex-grow border-2 rounded-sm p-4 space-y-2">
						{schedule.constraints.length === 0 && (
							<p className="text-gray-400">Drag shift types here to create forbidden sequences</p>
						)}
						<div className="flex flex-col flex-grow space-y-4 ">
							{schedule.constraints.map((row, index) => (
								<React.Fragment key={index}>
									<ConstraintRow
										constraints={row}
										rowIndex={index}
										schedule={schedule}
										isOver={hoveredRowId === `row-${index}`}
										timeRanges={timeRanges}
										onUpdateTimeRanges={handleUpdateTimeRanges}
									/>
								</React.Fragment>
							))}
						</div>
						<NewRowButton
							rowIndex={schedule.constraints.length + 1}
							isOver={hoveredRowId === `new-row-${schedule.constraints.length + 1}`}
						/>
					</div>
					<div className="p-1">
						<h3 className="text-lg font-semibold mb-2">Shift Types</h3>
						<div className="space-y-2">
							{schedule.types.map((type) => (
								<DraggableShiftType key={type.id} type={type} schedule={schedule} />
							))}
						</div>
					</div>
				</div>
				<div className="flex justify-between mt-6">
					<Button onClick={onBack} type="button" variant="outline">
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button onClick={onNext} type="button" className="bg-sky-700 hover:bg-sky-600">
						Next <ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</DndContext>
	);
};

export default ConstraintBuilder;
