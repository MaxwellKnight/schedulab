import React from 'react';
import { useState } from 'react';
import { TimeSlot } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, ChevronDown, X, Info } from 'lucide-react';
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

const PreferenceSelector = () => {
	const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
	const [notes, setNotes] = useState<Record<number, string>>({});
	const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

	// Sample data structure remains the same...
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

	const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({ slot, date, onSelect }) => {
		const isSelected = selectedSlots.has(slot.id);
		const isHovered = hoveredSlot === slot.id;

		return (
			<div className="relative">
				<Popover>
					<PopoverTrigger asChild>
						<button
							onClick={() => {
								toggleSlot(slot.id);
								onSelect();
							}}
							onMouseEnter={() => setHoveredSlot(slot.id)}
							onMouseLeave={() => setHoveredSlot(null)}
							className={`w-full p-2 rounded-lg transition-all duration-300 transform ${isSelected
								? 'bg-indigo-50 border-2 border-indigo-500 shadow-md scale-105'
								: 'bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:scale-105'
								} ${isHovered ? 'shadow-lg' : ''
								}`}
						>
							<div className="flex flex-col space-y-1">
								<span className="text-xs text-gray-600 font-medium">
									{formatTime(slot.time_range.start_time)} - {formatTime(slot.time_range.end_time)}
								</span>
								<Badge
									variant={isSelected ? "default" : "secondary"}
									className={`w-full py-1 transition-colors duration-300 ${isSelected ? 'bg-indigo-500 hover:bg-indigo-600' : ''
										}`}
								>
									{isSelected ? 'Selected' : 'Available'}
								</Badge>
								{notes[slot.id] && (
									<div className="text-xs text-gray-500 truncate mt-1 flex items-center">
										<Info className="w-3 h-3 mr-1 inline" />
										{notes[slot.id]}
									</div>
								)}
							</div>
						</button>
					</PopoverTrigger>
					{isSelected && (
						<PopoverContent className="w-80 shadow-xl" sideOffset={5}>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<h4 className="font-semibold text-sm">Add Notes</h4>
										<p className="text-xs text-gray-500">{formatDate(date)}</p>
									</div>
									<button
										onClick={() => updateNote(slot.id, '')}
										className="text-gray-500 hover:text-gray-700 transition-colors"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
								<Textarea
									placeholder="Add any notes about your availability..."
									value={notes[slot.id] || ''}
									onChange={(e) => updateNote(slot.id, e.target.value)}
									className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500"
								/>
							</div>
						</PopoverContent>
					)}
				</Popover>
			</div>
		);
	};

	const DesktopView = () => (
		<div className="hidden lg:block">
			<Table>
				<TableHeader className="bg-white sticky top-0 z-10">
					<TableRow>
						<TableHead className="w-40">Shift Times</TableHead>
						{scheduleData.time_slots.map(({ date }) => (
							<TableHead key={date} className="text-center">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<span className="cursor-help border-dotted border-gray-400">
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
							<TableCell className="font-medium whitespace-nowrap">
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
				<Card key={date} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300">
					<button
						onClick={() => toggleExpanded(date)}
						className="w-full hover:bg-indigo-50/50 transition-colors duration-300"
					>
						<CardHeader className="py-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base font-semibold">
									{formatDate(date)}
								</CardTitle>
								<ChevronDown
									className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${expandedDays.has(date) ? 'transform rotate-180' : ''
										}`}
								/>
							</div>
						</CardHeader>
					</button>
					<div className={`transition-all duration-300 ease-in-out ${expandedDays.has(date) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
						}`}>
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
					<Separator />
				</Card>
			))}
		</div>
	);

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center space-x-2 px-6 py-4 border-b bg-white shadow-sm">
				<Calendar className="h-5 w-5 text-indigo-500" />
				<h1 className="text-lg font-semibold text-gray-900">{scheduleData.name}</h1>
			</div>

			<ScrollArea className="flex-1 px-6">
				<div className="py-6 space-y-6">
					<DesktopView />
					<MobileView />
				</div>
			</ScrollArea>
		</div>
	);
};

export default PreferenceSelector;
