import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Constraints } from '@/types';
import { ArrowRight, ChevronLeft, ChevronRight, GripVertical, Info, Plus } from 'lucide-react';
import { Schedule, ShiftType } from './ScheduleBuilder';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent, DragOverEvent, Active, Over } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ShiftConstraintsManagerProps {
	constraints: Constraints[];
	schedule: Schedule;
	onAddConstraint: (constraint: Constraints) => void;
	onRemoveConstraint: (id: string) => void;
	onBack: () => void;
	onNext: () => void;
}

const colorPalette: string[] = [
	'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
	'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const getColorForShiftType = (shiftTypeId: string, schedule: Schedule): string => {
	const index = schedule.types.findIndex(type => type.id === Number(shiftTypeId));
	return colorPalette[index % colorPalette.length];
};

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
}

const ConstraintItem: React.FC<ConstraintItemProps> = ({ constraint, schedule }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `constraint-${constraint.id}`,
		data: { constraint, isNew: false },
	});

	const style: React.CSSProperties | undefined = transform ? {
		transform: CSS.Translate.toString(transform),
	} : undefined;

	const color = getColorForShiftType(constraint.id.split('-')[0], schedule);

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-white border rounded-md shadow-sm flex gap-2 items-center p-2 cursor-move"
		>
			<div className={`${color} w-3 h-3 rounded-full mr-2`}></div>
			<span className="font-medium flex-grow">{constraint.name}</span>
			<GripVertical className="text-gray-500" size={20} />
		</div>
	);
};

interface ConstraintRowProps {
	constraints: Constraints[];
	rowIndex: number;
	schedule: Schedule;
}

const ConstraintRow: React.FC<ConstraintRowProps & { isOver: boolean }> = ({ constraints, rowIndex, schedule, isOver }) => {
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
					<ConstraintItem constraint={constraint} schedule={schedule} />
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

const ConstraintBuilder: React.FC<ShiftConstraintsManagerProps> = ({
	schedule,
	onBack,
	onNext
}) => {
	const [constraintRows, setConstraintRows] = useState<Constraints[][]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

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
			name: (active.data.current?.type as ShiftType).name,
		};

		if (over.id === 'droppable-area') {
			setConstraintRows([...constraintRows, [newConstraint]]);
		} else if (typeof over.id === 'string' && over.id.startsWith('new-row-')) {
			const newRowIndex = parseInt(over.id.split('-')[2]);
			const newRows = [...constraintRows];
			newRows.splice(newRowIndex, 0, [newConstraint]);
			setConstraintRows(newRows);
		} else {
			const [rowIndex] = (over.id as string).split('-').slice(1);
			const newRows = [...constraintRows];
			newRows[Number(rowIndex)].push(newConstraint);
			setConstraintRows(newRows);
		}
	};

	const moveExistingConstraint = (active: Active, over: Over) => {
		const activeRowIndex = constraintRows.findIndex(row =>
			row.some(constraint => `constraint-${constraint.id}` === active.id)
		);
		const activeConstraintIndex = constraintRows[activeRowIndex].findIndex(
			constraint => `constraint-${constraint.id}` === active.id
		);
		const activeConstraint = constraintRows[activeRowIndex][activeConstraintIndex];

		// Remove from the original position
		const newRows = constraintRows.map(row => [...row]);
		newRows[activeRowIndex].splice(activeConstraintIndex, 1);

		// Add to the new position
		if (over.id === 'droppable-area') {
			newRows.push([activeConstraint]);
		} else if (typeof over.id === 'string' && over.id.startsWith('new-row-')) {
			const newRowIndex = parseInt(over.id.split('-')[2]);
			newRows.splice(newRowIndex, 0, [activeConstraint]);
		} else {
			const [rowIndex] = (over.id as string).split('-').slice(1);
			newRows[Number(rowIndex)].push(activeConstraint);
		}

		// Remove empty rows
		setConstraintRows(newRows.filter(row => row.length > 0));
	};

	const removeConstraint = (active: Active) => {
		const newRows = constraintRows.map(row =>
			row.filter(constraint => `constraint-${constraint.id}` !== active.id)
		).filter(row => row.length > 0);
		setConstraintRows(newRows);
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
						</p>
					</div>
				</div>
				<div className="flex space-x-4">
					<div ref={setNodeRef} className="flex flex-col flex-grow border-2 rounded-sm p-4 space-y-2">
						{constraintRows.length === 0 && (
							<p className="text-gray-400">Drag shift types here to create forbidden sequences</p>
						)}
						<div className="flex flex-col flex-grow space-y-4 ">
							{constraintRows.map((row, index) => (
								<React.Fragment key={index}>
									<ConstraintRow
										constraints={row}
										rowIndex={index}
										schedule={schedule}
										isOver={hoveredRowId === `row-${index}`}
									/>
								</React.Fragment>
							))}
						</div>
						<NewRowButton
							rowIndex={constraintRows.length + 1}
							isOver={hoveredRowId === `new-row-${constraintRows.length + 1}`}
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
			<DragOverlay>
				{activeId ? (
					<div className="bg-white border rounded-md shadow-sm flex items-center p-2">
						<div className="bg-gray-400 w-3 h-3 rounded-full mr-2"></div>
						<span className="font-medium flex-grow">Dragging...</span>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
};

export default ConstraintBuilder;
