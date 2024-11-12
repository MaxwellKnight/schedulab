import { UserData } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { DraggableMember } from "./DraggableMember";

interface DroppableShiftSlot {
	shiftTypeId: number;
	date: Date;
	timeSlot: string;
	position: number;
	shiftName: string;
	assignedMember: UserData | null;
	className?: string;
	style?: React.CSSProperties;

}
export const DroppableShiftSlot: React.FC<DroppableShiftSlot> = ({
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
${isValidDrop && active?.data?.current?.memberId == assignedMember?.id.toString()
					? 'shadow-md border-4 border-blue-400 scale-[1.02]' : ''}Edit
        ${isOver && isValidDrop ? 'ring-2 ring-blue-400 opacity-100 bg-opacity-75' : ''}
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

