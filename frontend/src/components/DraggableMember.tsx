import { cn } from "@/lib/utils";
import { UserData } from "@/types";
import { useDraggable } from "@dnd-kit/core";

interface DraggableMemberProps {
	memberId: string;
	shiftTypeId: number;
	date: string;
	timeSlot: string;
	position: number;
	member: UserData;
	className?: string;

}

export const DraggableMember: React.FC<DraggableMemberProps> = ({
	memberId,
	shiftTypeId,
	date,
	timeSlot,
	position,
	member,
	className
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging
	} = useDraggable({
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
			style={style}
			className={cn(
				// Base styles
				"cursor-move truncate transition-all duration-200",
				// Animation and transform styles
				"hover:scale-[1.02] active:scale-[0.98]",
				// Dragging state styles
				isDragging && [
					"scale-105 shadow-lg backdrop-blur-sm",
					"bg-white/95 dark:bg-gray-800/95",
					"ring-2 ring-primary/30",
					"rounded-md border-none",
					// Glow effect
					"before:absolute before:inset-0 before:-z-10",
					"before:bg-primary/5 before:rounded-md",
					"before:transform before:scale-110 before:blur-sm",
					"after:absolute after:inset-0 after:-z-20",
					"after:bg-primary/10 after:rounded-lg",
					"after:transform after:scale-125 after:blur-md"
				],
				className
			)}
		>
			<span
				className={cn(
					"truncate block",
					isDragging && "font-medium text-primary"
				)}
			>
				{member.first_name} {member.last_name}
			</span>
		</div>
	);
};

