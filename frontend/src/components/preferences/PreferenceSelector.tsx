import React, { useMemo, useState, useCallback } from 'react';
import { SchedulePreferences, TimeSlot } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Card, } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeam } from '@/context';
import { useAuthenticatedFetch } from '@/hooks';
import { TimeSlotButton } from './PreferencesTimeSlotButton';
import { NotesSummary } from './PreferencesNotes';

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

const PreferenceSelector: React.FC = () => {
	const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
	const [notes, setNotes] = useState<Record<number, string>>({});
	const [activeDayIndex, setActiveDayIndex] = useState(0);
	const { selectedTeam } = useTeam();
	const {
		data: apiPreferences,
		loading
	} = useAuthenticatedFetch<APISchedulePreferences>('preferences/published');

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

	const handlePrevDay = () => {
		setActiveDayIndex(prev => Math.max(0, prev - 1));
	};

	const handleNextDay = () => {
		setActiveDayIndex(prev => Math.min((preferences?.time_slots.length || 1) - 1, prev + 1));
	};

	if (loading) {
		return <div className="p-4">Loading...</div>;
	}

	if (!preferences || apiPreferences?.team_id !== selectedTeam?.id) {
		return <div className="p-4">No preferences found.</div>;
	}

	const notesCount = Object.values(notes).filter(note => note.trim()).length;

	const DesktopView = (
		<Card className="border-blue-100 overflow-x-auto hidden lg:block">
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
	);

	const MobileView = (
		<Card className="border-blue-100 lg:hidden">
			<div className="p-4 bg-blue-50/50 border-b border-blue-100">
				<div className="flex items-center justify-between mb-2">
					<button
						onClick={handlePrevDay}
						disabled={activeDayIndex === 0}
						className="p-1 rounded-lg hover:bg-blue-100 disabled:opacity-50"
					>
						<ChevronLeft className="h-5 w-5 text-blue-600" />
					</button>
					<h2 className="text-base font-medium text-blue-900">
						{formatDate(preferences.time_slots[activeDayIndex].date)}
					</h2>
					<button
						onClick={handleNextDay}
						disabled={activeDayIndex === preferences.time_slots.length - 1}
						className="p-1 rounded-lg hover:bg-blue-100 disabled:opacity-50"
					>
						<ChevronRight className="h-5 w-5 text-blue-600" />
					</button>
				</div>
				<div className="flex justify-center gap-1">
					{preferences.time_slots.map((_, index) => (
						<button
							key={index}
							onClick={() => setActiveDayIndex(index)}
							className={`w-2 h-2 rounded-full transition-colors ${index === activeDayIndex ? 'bg-blue-600' : 'bg-blue-200'
								}`}
						/>
					))}
				</div>
			</div>
			<div className="p-4 space-y-2">
				{timeRanges.map((timeRange, index) => {
					const slot = preferences.time_slots[activeDayIndex].slots.find(
						s => s.time_range.start_time === timeRange.start_time &&
							s.time_range.end_time === timeRange.end_time
					);

					return slot ? (
						<TimeSlotButton
							key={index}
							slot={slot}
							isSelected={selectedSlots.has(slot.id)}
							note={notes[slot.id]}
							onSelect={toggleSlot}
							onNoteChange={handleNoteChange}
						/>
					) : null;
				})}
			</div>
		</Card>
	);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-blue-100 bg-white sticky top-0 z-20">
				<div className="flex items-center gap-2 mb-2 sm:mb-0">
					<Calendar className="h-5 w-5 text-blue-600" />
					<h1 className="text-lg font-semibold text-blue-900 break-words">
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
				{MobileView}
				{DesktopView}

				<NotesSummary
					notes={notes}
					slots={allSlots}
					onNoteDelete={handleNoteDelete}
				/>
			</div>
		</div>
	);
};

export default PreferenceSelector;
