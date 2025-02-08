import { TimeSlot } from "@/types";
import React from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { MessageSquare, X } from "lucide-react";
import { Badge } from "../ui/badge";

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

interface NotesSummaryProps {
	notes: Record<number, string>;
	slots: TimeSlot[];
	onNoteDelete: (slotId: number) => void;
}

export const NotesSummary = React.memo(({ notes, slots, onNoteDelete }: NotesSummaryProps) => {
	const filteredNotes = Object.entries(notes).filter(([_, note]) => note.trim());

	if (filteredNotes.length === 0) return null;

	return (
		<Card className="mt-6 border-blue-100">
			<CardHeader className="pb-3 bg-blue-50/50 border-b border-blue-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-blue-600" />
						<CardTitle className="text-lg text-blue-900">Notes Summary</CardTitle>
					</div>
					<Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
						{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
					</Badge>
				</div>
			</CardHeader>
			<div className="p-4 space-y-3">
				{filteredNotes.map(([slotId, note]) => {
					const slot = slots.find(s => s.id === parseInt(slotId));
					if (!slot) return null;

					return (
						<div
							key={slotId}
							className="flex items-start justify-between gap-4 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 group"
						>
							<div className="space-y-1 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-blue-900">
										{formatDate(slot.date)}
									</span>
									<span className="text-xs text-blue-600">
										{formatTime(slot.time_range.start_time)} - {formatTime(slot.time_range.end_time)}
									</span>
								</div>
								<p className="text-sm text-blue-700">{note}</p>
							</div>
							<button
								onClick={() => onNoteDelete(parseInt(slotId))}
								className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-100 rounded-full transition-all duration-150"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					);
				})}
			</div>
		</Card>
	);
});

NotesSummary.displayName = 'NotesSummary';
