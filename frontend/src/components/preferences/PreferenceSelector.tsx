import React, { useMemo, useState, useCallback } from 'react';
import { SchedulePreferences, TimeSlot } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, MessageSquare, X } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTeam } from '@/context';
import { useAuthenticatedFetch } from '@/hooks';

interface APISchedulePreferences {
	id: number;
	team_id: number;
	name: string;
	start_date: string;
	end_date: string;
	status: string;
	creator: number;
	created_at: string;
	updated_at: string;
	time_slots: TimeSlot[];
}
interface TimeSlotButtonProps {
	slot: TimeSlot;
	isSelected: boolean;
	note?: string;
	onSelect: (id: number) => void;
	onNoteChange: (id: number, note: string) => void;
}

interface NotesSummaryProps {
	notes: Record<number, string>;
	slots: TimeSlot[];
	onNoteDelete: (slotId: number) => void;
}

// Helper functions
const formatTime = (timeStr: string): string => {
	return new Date(`2024-01-01T${timeStr}`).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
};

const formatDate = (dateStr: string): string => {
	return new Date(dateStr).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});
};

// TimeSlotButton Component
const TimeSlotButton = React.memo(({ slot, isSelected, note, onSelect, onNoteChange }: TimeSlotButtonProps) => {
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

// NotesSummary Component
const NotesSummary = React.memo(({ notes, slots, onNoteDelete }: NotesSummaryProps) => {
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

// Main PreferenceSelector Component
const PreferenceSelector: React.FC = () => {
	const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
	const [notes, setNotes] = useState<Record<number, string>>({});
	const {
		data: apiPreferences,
		loading
	} = useAuthenticatedFetch<APISchedulePreferences>(`preferences/published`);

	const preferences = useMemo(() => {
		if (!apiPreferences) return null;

		const groupedSlots = apiPreferences.time_slots.reduce((acc, slot) => {
			const date = slot.date.split('T')[0];
			if (!acc[date]) acc[date] = [];
			acc[date].push(slot);
			return acc;
		}, {} as Record<string, TimeSlot[]>);

		const daySchedules = Object.entries(groupedSlots)
		.map(([date, slots]) => ({
			date,
			slots: slots.sort((a, b) =>
				a.time_range.start_time.localeCompare(b.time_range.start_time))
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

		return {
			id: apiPreferences.id,
			name: apiPreferences.name,
			time_slots: daySchedules
		} as SchedulePreferences;
	}, [apiPreferences]);

	const timeRanges = useMemo(() => {
		if (!preferences?.time_slots) return [];

		const uniqueRanges = new Set(
			preferences.time_slots.flatMap(day =>
				day.slots.map(slot =>
					`${slot.time_range.start_time}-${slot.time_range.end_time}`)
			)
		);

		return Array.from(uniqueRanges).map(timeRange => {
			const [start_time, end_time] = timeRange.split('-');
			return { start_time, end_time };
		});
	}, [preferences]);

	const allSlots = useMemo(() => {
		if (!preferences?.time_slots) return [];
		return preferences.time_slots.flatMap(day => day.slots);
	}, [preferences]);

	const toggleSlot = useCallback((slotId: number): void => {
		setSelectedSlots(prev => {
			const newSelected = new Set(prev);
			if (newSelected.has(slotId)) {
				newSelected.delete(slotId);
				// Clean up notes when unselecting
				setNotes(prevNotes => {
					const newNotes = { ...prevNotes };
					delete newNotes[slotId];
					return newNotes;
				});
			} else {
				newSelected.add(slotId);
			}
			return newSelected;
		});
	}, []);

	const handleNoteChange = useCallback((slotId: number, note: string) => {
		setNotes(prev => ({
			...prev,
			[slotId]: note
		}));
	}, []);

	const handleNoteDelete = useCallback((slotId: number) => {
		setNotes(prev => {
			const newNotes = { ...prev };
			delete newNotes[slotId];
			return newNotes;
		});
	}, []);

	if (loading) {
		return <div className="p-4">Loading...</div>;
	}

	if (!preferences) {
		return <div className="p-4">No preferences found.</div>;
	}

	const notesCount = Object.values(notes).filter(note => note.trim()).length;

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between p-4 border-b border-blue-100 bg-white sticky top-0 z-20">
				<div className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-blue-600" />
					<h1 className="text-lg font-semibold text-blue-900">
						{preferences.name}
					</h1>
				</div>
				<div className="flex items-center gap-3">
					<Badge variant="secondary" className="bg-blue-100 text-blue-700">
						{selectedSlots.size} selected
					</Badge>
					{notesCount > 0 && (
						<Badge variant="secondary" className="gap-1 bg-blue-600 text-white">
							<MessageSquare className="h-3 w-3" />
							{notesCount}
						</Badge>
					)}
				</div>
			</div>

			<div className="p-4 space-y-6">
				<Card className="border-blue-100">
					<Table>
						<TableHeader className="bg-blue-50/50 sticky top-0 z-10">
							<TableRow>
								<TableHead className="w-40 text-blue-900">Time</TableHead>
								{preferences.time_slots.map(day => (
									<TableHead key={day.date} className="text-center text-blue-900">
										{formatDate(day.date)}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{timeRanges.map((timeRange, index) => (
								<TableRow key={index}>
									<TableCell className="font-medium text-blue-700">
										{formatTime(timeRange.start_time)} - {formatTime(timeRange.end_time)}
									</TableCell>
									{preferences.time_slots.map(day => {
										const slot = day.slots.find(
											s => s.time_range.start_time === timeRange.start_time &&
												s.time_range.end_time === timeRange.end_time
										);

										return (
											<TableCell key={day.date} className="p-2">
												{slot && (
													<TimeSlotButton
														slot={slot}
														isSelected={selectedSlots.has(slot.id)}
														note={notes[slot.id]}
														onSelect={toggleSlot}
														onNoteChange={handleNoteChange}
													/>
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>

				<NotesSummary
					notes={notes}
					slots={allSlots}
					onNoteDelete={handleNoteDelete}
				/>
			</div>
		</div>
	);
};

PreferenceSelector.displayName = 'PreferenceSelector';

export default PreferenceSelector;
