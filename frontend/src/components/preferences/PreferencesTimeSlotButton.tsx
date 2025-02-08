import { TimeSlot } from "@/types";
import React, { useCallback, useState } from "react";
import { Badge } from "../ui/badge";
import { Check, MessageSquare } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Textarea } from "../ui/textarea";

function formatTime(timeStr: string): string {
	return new Date(`2024-01-01T${timeStr}`).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});
}

interface TimeSlotButtonProps {
	slot: TimeSlot;
	isSelected: boolean;
	note?: string;
	onSelect: (id: number) => void;
	onNoteChange: (id: number, note: string) => void;
}

export const TimeSlotButton = React.memo(({ slot, isSelected, note, onSelect, onNoteChange }: TimeSlotButtonProps) => {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [localNote, setLocalNote] = useState(note || '');

	const handleClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		onSelect(slot.id);
	}, [slot.id, onSelect]);

	const handleNoteSave = useCallback(() => {
		onNoteChange(slot.id, localNote);
		setIsPopoverOpen(false);
	}, [slot.id, localNote, onNoteChange]);

	return (
		<div className="relative group">
			<button
				onClick={handleClick}
				className={`
w-full p-3 rounded-lg transition-colors duration-150 ease-in-out
${isSelected
						? 'bg-blue-50/90 border-2 border-blue-500 shadow-sm'
						: 'bg-white/95 border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50'
					}
group-hover:shadow-md group-hover:shadow-blue-100/50
`}
			>
				<div className="flex flex-col space-y-2">
					<div className="flex items-center justify-between px-1 text-sm font-medium text-blue-800">
						<span>{formatTime(slot.time_range.start_time)}</span>
						<span className="text-blue-300">-</span>
						<span>{formatTime(slot.time_range.end_time)}</span>
					</div>

					<Badge
						variant={isSelected ? "default" : "secondary"}
						className={`
w-full py-1.5 transition-colors duration-150 flex items-center justify-center gap-2 font-medium
${isSelected
								? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
								: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
							}
`}
					>
						{isSelected && <Check className="w-4 h-4" />}
						{isSelected ? 'Selected' : 'Available'}
					</Badge>
				</div>
			</button>

			{isSelected && (
				<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
					<PopoverTrigger asChild>
						<button
							className={`
absolute -top-2 -right-2 p-1.5 rounded-full transition-colors shadow-sm
${note ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}
hover:bg-blue-600 hover:text-white
`}
						>
							<MessageSquare className="h-4 w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-4 shadow-xl border-blue-100 bg-white">
						<div className="space-y-3">
							<div className="space-y-1">
								<h4 className="font-semibold text-sm text-blue-900">Add Notes</h4>
								<p className="text-xs text-blue-600">
									{formatDate(slot.date)}
								</p>
							</div>
							<Textarea
								placeholder="Add any notes about your availability..."
								value={localNote}
								onChange={(e) => setLocalNote(e.target.value)}
								className="min-h-[100px] resize-none border-blue-200"
							/>
							<div className="flex justify-end gap-2">
								<button
									onClick={() => setIsPopoverOpen(false)}
									className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleNoteSave}
									disabled={!localNote.trim()}
									className={`
px-3 py-1.5 text-sm text-white rounded-md transition-colors
${localNote.trim()
											? 'bg-blue-600 hover:bg-blue-700'
											: 'bg-blue-300 cursor-not-allowed'}
`}
								>
									Save Note
								</button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
});

TimeSlotButton.displayName = 'TimeSlotButton';
