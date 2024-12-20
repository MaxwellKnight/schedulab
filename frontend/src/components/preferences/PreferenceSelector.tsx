import React, { useEffect } from 'react';
import { useState } from 'react';
import { TimeSlot } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar, ChevronDown, X, Info, Check, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";

interface TimeSlotButtonProps {
	slot: TimeSlot;
	showTime?: boolean;
	date: string;
	onSelect: () => void;
}

interface NotesSummaryProps {
	notes: Record<number, string>;
	selectedSlots: Set<number>;
	formatDate: (date: string) => string;
	onNoteDelete: (slotId: number) => void;
	findSlotById: (slotId: number) => TimeSlot | null;
}

const NotesSummary: React.FC<NotesSummaryProps> = ({
	notes,
	formatDate,
	onNoteDelete,
	findSlotById
}) => {
	const hasNotes = Object.keys(notes).length > 0;

	if (!hasNotes) {
		return null;
	}

	return (
		<Card className="mt-6 border-indigo-100">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-indigo-600" />
						<CardTitle className="text-lg text-indigo-900">Notes Summary</CardTitle>
					</div>
					<Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
						{Object.keys(notes).length} note{Object.keys(notes).length !== 1 ? 's' : ''}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{Object.entries(notes).map(([slotId, note]) => {
						if (!note) return null;
						const slot = findSlotById(parseInt(slotId));
						if (!slot) return null;

						return (
							<div key={slotId} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-indigo-50">
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-indigo-900">
											{formatDate(slot.date)}
										</span>
										<span className="text-xs text-indigo-600">
											{formatDate(slot.time_range.start_time)} - {formatDate(slot.time_range.end_time)}
										</span>
									</div>
									<p className="text-sm text-indigo-700">{note}</p>
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										onNoteDelete(parseInt(slotId));
									}}
									className="text-indigo-400 hover:text-indigo-600 p-1 hover:bg-indigo-100 rounded-full transition-colors"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};

const PreferenceSelector = () => {
	const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
	const [notes, setNotes] = useState<Record<number, string>>({});
	const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

	const findSlotById = (slotId: number): TimeSlot | null => {
		for (const daySlots of scheduleData.time_slots) {
			const slot = daySlots.slots.find(s => s.id === slotId);
			if (slot) return slot;
		}
		return null;
	};

	const deleteNote = (slotId: number): void => {
		setNotes(prev => {
			const newNotes = { ...prev };
			delete newNotes[slotId];
			return newNotes;
		});
	};

	const scheduleData = {
		"id": 1,
		"name": "Preferences Nov 20 - Nov 27, 2024",
		"time_slots": [
			...Array.from({ length: 8 }, (_, i) => {
				const date = new Date('2024-11-20');
				date.setDate(date.getDate() + i);
				return {
					date: date.toISOString().split('T')[0],
					slots: [
						{
							id: i * 3 + 1,
							template_id: 1,
							date: date.toISOString(),
							time_range_id: 1,
							created_at: new Date().toISOString(),
							time_range: {
								id: 1,
								preference_id: 1,
								start_time: "06:00:00",
								end_time: "15:00:00",
								created_at: new Date().toISOString()
							}
						},
						{
							id: i * 3 + 2,
							template_id: 1,
							date: date.toISOString(),
							time_range_id: 2,
							created_at: new Date().toISOString(),
							time_range: {
								id: 2,
								preference_id: 1,
								start_time: "15:00:00",
								end_time: "22:00:00",
								created_at: new Date().toISOString()
							}
						},
						{
							id: i * 3 + 3,
							template_id: 1,
							date: date.toISOString(),
							time_range_id: 3,
							created_at: new Date().toISOString(),
							time_range: {
								id: 3,
								preference_id: 1,
								start_time: "20:00:00",
								end_time: "23:00:00",
								created_at: new Date().toISOString()
							}
						}
					]
				};
			})
		]
	};

	const formatTime = (timeStr: string): string => {
		return new Date(`2024-01-01T${timeStr}`).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const formatDate = (dateStr: string): string => {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	};

	const toggleSlot = (slotId: number): void => {
		const newSelected = new Set(selectedSlots);
		if (newSelected.has(slotId)) {
			newSelected.delete(slotId);
			const newNotes = { ...notes };
			delete newNotes[slotId];
			setNotes(newNotes);
		} else {
			newSelected.add(slotId);
		}
		setSelectedSlots(newSelected);
	};

	const toggleExpanded = (date: string): void => {
		const newExpanded = new Set(expandedDays);
		if (newExpanded.has(date)) {
			newExpanded.delete(date);
		} else {
			newExpanded.add(date);
		}
		setExpandedDays(newExpanded);
	};

	const updateNote = (slotId: number, note: string): void => {
		setNotes(prev => ({
			...prev,
			[slotId]: note
		}));
	};

	const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
		slot,
		date,
		onSelect,
	}) => {
		const isSelected = selectedSlots.has(slot.id);
		const isHovered = hoveredSlot === slot.id;
		const hasNote = notes[slot.id]?.length > 0;
		const [isPopoverOpen, setIsPopoverOpen] = useState(false);
		const [localNote, setLocalNote] = useState(notes[slot.id] || '');

		useEffect(() => {
			setLocalNote(notes[slot.id] || '');
		}, [slot.id]);

		const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			e.stopPropagation();
			setLocalNote(e.target.value);
		};

		const handleSaveNote = (e: React.MouseEvent) => {
			e.stopPropagation();
			if (localNote.trim()) {
				updateNote(slot.id, localNote);
				setIsPopoverOpen(false);
			}
		};

		const handleClearNote = (e: React.MouseEvent) => {
			e.stopPropagation();
			setLocalNote('');
			updateNote(slot.id, '');
			setIsPopoverOpen(false);
		};

		return (
			<div className="relative">
				<button
					onClick={(e) => {
						e.stopPropagation();
						toggleSlot(slot.id);
						onSelect();
					}}
					onMouseEnter={() => setHoveredSlot(slot.id)}
					onMouseLeave={() => setHoveredSlot(null)}
					className={`
          relative w-full p-3 rounded-lg transition-all duration-300 transform
          ${isSelected
							? 'bg-indigo-50 border-2 border-indigo-500 shadow-md scale-105'
							: 'bg-white border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:scale-105'
						}
          ${isHovered ? 'shadow-lg' : ''}
        `}
				>
					<div className="flex flex-col space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-indigo-700 font-medium">
								{formatTime(slot.time_range.start_time)}
							</span>
							<span className="text-sm text-indigo-400">-</span>
							<span className="text-sm text-indigo-700 font-medium">
								{formatTime(slot.time_range.end_time)}
							</span>
						</div>

						<Badge
							variant={isSelected ? "default" : "secondary"}
							className={`
              w-full py-1.5 transition-colors duration-300 flex items-center justify-center gap-2
              ${isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-700'}
            `}
						>
							{isSelected && <Check className="w-4 h-4" />}
							{isSelected ? 'Selected' : 'Available'}
						</Badge>
					</div>
				</button>

				{isSelected && (
					<Popover
						open={isPopoverOpen}
						onOpenChange={setIsPopoverOpen}
						modal={true}  // This prevents the popover from closing on hover out
					>
						<PopoverTrigger asChild>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsPopoverOpen(true);
								}}
								className="absolute -top-2 -right-2 p-1.5 bg-indigo-100 hover:bg-indigo-200 rounded-full transition-colors"
							>
								<MessageSquare className="h-4 w-4 text-indigo-600" />
							</button>
						</PopoverTrigger>
						<PopoverContent
							className="w-80 shadow-xl border-indigo-100"
							sideOffset={5}
						>
							<div className="space-y-3" onClick={(e) => e.stopPropagation()}>
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<h4 className="font-semibold text-sm text-indigo-900">Add Notes</h4>
										<p className="text-xs text-indigo-600">{formatDate(date)}</p>
									</div>
									{localNote && (
										<button
											onClick={handleClearNote}
											className="text-indigo-500 hover:text-indigo-700 transition-colors p-1 hover:bg-indigo-50 rounded-full"
										>
											<X className="h-4 w-4" />
										</button>
									)}
								</div>
								<Textarea
									placeholder="Add any notes about your availability..."
									value={localNote}
									onChange={handleNoteChange}
									className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 border-indigo-200"
								/>
								<div className="flex justify-end gap-2">
									<button
										onClick={() => setIsPopoverOpen(false)}
										className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleSaveNote}
										disabled={!localNote.trim()}
										className={`
                    px-3 py-1.5 text-sm text-white rounded-md transition-colors
                    ${localNote.trim()
												? 'bg-indigo-600 hover:bg-indigo-700'
												: 'bg-indigo-300 cursor-not-allowed'}
                  `}
									>
										Save Note
									</button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				)}

				{hasNote && !isPopoverOpen && (
					<div className="absolute -top-2 -right-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<div className="bg-indigo-100 p-1 rounded-full">
										<Info className="w-4 text-indigo-600" />
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs text-sm">{notes[slot.id]}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)}
			</div>
		);
	};

	const DesktopView = () => (
		<div className="hidden lg:block">
			<Table>
				<TableHeader className="bg-indigo-50/50 sticky top-0 z-10">
					<TableRow>
						<TableHead className="w-40 text-indigo-900">Shift Times</TableHead>
						{scheduleData.time_slots.map(({ date }) => (
							<TableHead key={date} className="text-center text-indigo-900">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<span className="cursor-help border-dotted border-indigo-400">
												{formatDate(date)}
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p>Click time slot to select</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{['Morning (6 AM - 3 PM)', 'Afternoon (3 PM - 10 PM)', 'Evening (8 PM - 11 PM)'].map((shift, shiftIndex) => (
						<TableRow key={shift}>
							<TableCell className="font-medium whitespace-nowrap text-indigo-700">
								{shift}
							</TableCell>
							{scheduleData.time_slots.map(({ date, slots }) => (
								<TableCell key={date} className="p-2">
									<TimeSlotButton
										slot={slots[shiftIndex]}
										date={date}
										onSelect={() => { }}
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);

	const MobileView = () => (
		<div className="lg:hidden space-y-2">
			{scheduleData.time_slots.map(({ date, slots }) => (
				<Card key={date} className="overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-300">
					<button
						onClick={() => toggleExpanded(date)}
						className="w-full hover:bg-indigo-50/50 transition-colors duration-300"
					>
						<CardHeader className="py-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base font-semibold text-indigo-900">
									{formatDate(date)}
								</CardTitle>
								<ChevronDown
									className={`h-5 w-5 text-indigo-500 transition-transform duration-300 ${expandedDays.has(date) ? 'transform rotate-180' : ''}`}
								/>
							</div>
						</CardHeader>
					</button>
					<div className={`transition-all duration-300 ease-in-out ${expandedDays.has(date) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
						<CardContent className="pt-0">
							<div className="space-y-2">
								{slots.map((slot) => (
									<TimeSlotButton
										key={slot.id}
										slot={slot}
										date={date}
										onSelect={() => { }}
									/>
								))}
							</div>
						</CardContent>
					</div>
					<Separator className="bg-indigo-100" />
				</Card>
			))}
		</div>
	);

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between py-4 px-4 border-b border-indigo-100 bg-white shadow-sm sticky top-0 z-20">
				<div className="flex items-center space-x-2">
					<Calendar className="h-5 w-5 text-indigo-600" />
					<h1 className="text-lg font-semibold text-indigo-900">{scheduleData.name}</h1>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm text-indigo-600">Selected slots:</span>
						<Badge variant="default" className="bg-indigo-600">
							{selectedSlots.size}
						</Badge>
					</div>
				</div>
			</div>

			<div className="py-6 px-4 space-y-6">
				<DesktopView />
				<MobileView />
				<NotesSummary
					notes={notes}
					selectedSlots={selectedSlots}
					formatDate={formatDate}
					onNoteDelete={deleteNote}
					findSlotById={findSlotById}
				/>
			</div>
		</div>
	);
};

export default PreferenceSelector;
