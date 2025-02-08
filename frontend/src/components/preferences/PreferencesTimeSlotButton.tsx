import { TimeSlot } from "@/types";
import React, { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, MessageSquare } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

type PrefConfig = {
	styles: Record<number, string>;
	labels: string[];
}
const preferenceConfig: PrefConfig = {
	styles: {
		1: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100/80',
		2: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100/80',
		3: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100/80',
		4: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100/80',
		5: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
	},
	labels: ['Very Low', 'Low', 'Neutral', 'High', 'Very High']
} as const;

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
	isDisabled?: boolean;
	preferenceLevel?: number;
}

export const TimeSlotButton = React.memo(({
	slot,
	isSelected,
	note,
	onSelect,
	onNoteChange,
	isDisabled = false,
	preferenceLevel
}: TimeSlotButtonProps) => {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [localNote, setLocalNote] = useState(note || '');

	const handleClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isDisabled) {
			onSelect(slot.id);
		}
	}, [slot.id, onSelect, isDisabled]);

	const handleNoteSave = useCallback(() => {
		if (!isDisabled) {
			onNoteChange(slot.id, localNote);
			setIsPopoverOpen(false);
		}
	}, [slot.id, localNote, onNoteChange, isDisabled]);

	const buttonClassName = `
    w-full p-2 sm:p-3 rounded-lg transition-colors duration-150 ease-in-out
    ${isDisabled
			? 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60'
			: isSelected
				? 'bg-blue-50/90 border-2 border-blue-500 shadow-sm'
				: 'bg-white/95 border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50'
		}
    ${!isDisabled && 'group-hover:shadow-md group-hover:shadow-blue-100/50'}
  `;

	const badgeClassName = `
    w-full py-1 sm:py-1.5 text-xs sm:text-sm transition-colors duration-150 flex items-center justify-center gap-1 sm:gap-2 font-medium
    ${isDisabled
			? 'bg-gray-200 text-gray-600'
			: preferenceLevel
				? preferenceConfig.styles[preferenceLevel]
				: isSelected
					? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
					: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
		}
  `;

	return (
		<div className="relative group">
			<button
				onClick={handleClick}
				className={buttonClassName}
				disabled={isDisabled}
			>
				<div className="flex flex-col space-y-1 sm:space-y-2">
					<div className="flex items-center justify-between px-1 text-xs sm:text-sm font-medium text-blue-800">
						<span>{formatTime(slot.time_range.start_time)}</span>
						<span className="text-blue-300 mx-1">-</span>
						<span>{formatTime(slot.time_range.end_time)}</span>
					</div>

					<Badge
						variant={isSelected ? "default" : "secondary"}
						className={badgeClassName}
					>
						{isSelected && !preferenceLevel && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
						{preferenceLevel
							? preferenceConfig.labels[preferenceLevel - 1]
							: isSelected
								? 'Selected'
								: isDisabled
									? 'Unavailable'
									: 'Available'
						}
					</Badge>
				</div>
			</button>

			{isSelected && !isDisabled && (
				<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
					<PopoverTrigger asChild>
						<button
							className={`
                absolute -top-2 -right-2 p-1 sm:p-1.5 rounded-full transition-colors shadow-sm
                ${note ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}
                hover:bg-blue-600 hover:text-white
              `}
						>
							<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-72 sm:w-80 p-3 sm:p-4 shadow-xl border-blue-100 bg-white">
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
									className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleNoteSave}
									disabled={!localNote.trim()}
									className={`
                    px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white rounded-md transition-colors
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
