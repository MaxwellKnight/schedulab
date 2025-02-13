import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useMemo, useCallback, memo } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DailyPreference, PreferenceTemplate, TimeRange } from './types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeRangeField = 'start_time' | 'end_time';
type UpdateRangeFunc = (date: Date, index: number, field: TimeRangeField, value: string) => void;

interface WeekViewEditorProps {
	timeRanges: DailyPreference[];
	template: PreferenceTemplate | null;
	onAddTimeRange: (date: Date) => void;
	onRemoveTimeRange: (date: Date, index: number) => void;
	onUpdateTimeRange: UpdateRangeFunc;
	isLoading?: boolean;
}

interface TimeRangeSelectorProps {
	range: TimeRange;
	onUpdate: (field: TimeRangeField, value: string) => void;
	isInvalid: boolean;
}

interface DayCardProps {
	day: DailyPreference;
	dayIndex: number;
	template: PreferenceTemplate | null;
	onAddTimeRange: (date: Date) => void;
	onRemoveTimeRange: (date: Date, index: number) => void;
	onUpdateTimeRange: UpdateRangeFunc;
}

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
	const hour = Math.floor(i / 2);
	const minute = i % 2 === 0 ? '00' : '30';
	return `${String(hour).padStart(2, '0')}:${minute}`;
});

const formatTime = (timeStr: string): string => {
	return new Date(`2024-01-01T${timeStr}`).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
};

const getTimeRangesForDate = (date: Date, template: PreferenceTemplate | null): TimeRange[] => {
	if (!template?.time_slots) return [];

	const formattedDate = date.toISOString().split('T')[0];

	return template.time_slots
		.filter(slot => slot.date.startsWith(formattedDate))
		.map(slot => ({
			start_time: slot.time_range.start_time.substring(0, 5),
			end_time: slot.time_range.end_time.substring(0, 5)
		}));
};

const LoadingState: React.FC = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
		{[...Array(7)].map((_, index) => (
			<Card
				key={index}
				className="border-blue-100 relative overflow-hidden"
			>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 animate-shimmer"
					style={{ backgroundSize: '200% 100%' }} />
				<CardHeader className="py-2 px-3 border-b border-blue-100">
					<div className="h-12 bg-blue-100/50 rounded animate-pulse" />
				</CardHeader>
				<CardContent className="p-3 space-y-3">
					<div className="h-8 bg-blue-100/50 rounded animate-pulse" />
					<div className="h-24 bg-blue-100/50 rounded animate-pulse" />
				</CardContent>
			</Card>
		))}
	</div>
);

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = memo(({ range, onUpdate, isInvalid }) => {
	const startOptions = useMemo(() =>
		TIME_OPTIONS.filter(time => time < range.end_time || !range.end_time),
		[range.end_time]
	);

	const endOptions = useMemo(() =>
		TIME_OPTIONS.filter(time => time > range.start_time || !range.start_time),
		[range.start_time]
	);

	const handleStartChange = useCallback((value: string) => {
		onUpdate('start_time', value);
	}, [onUpdate]);

	const handleEndChange = useCallback((value: string) => {
		onUpdate('end_time', value);
	}, [onUpdate]);

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<label className="text-xs font-medium text-blue-700">Start</label>
					<Select
						value={range.start_time}
						onValueChange={handleStartChange}
					>
						<SelectTrigger className="h-8 text-sm border-blue-200 hover:border-blue-300 bg-white">
							<SelectValue>
								{range.start_time ? formatTime(range.start_time) : "Start time"}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{startOptions.map((time) => (
								<SelectItem key={time} value={time} className="text-sm">
									{formatTime(time)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1">
					<label className="text-xs font-medium text-blue-700">End</label>
					<Select
						value={range.end_time}
						onValueChange={handleEndChange}
					>
						<SelectTrigger className="h-8 text-sm border-blue-200 hover:border-blue-300 bg-white">
							<SelectValue>
								{range.end_time ? formatTime(range.end_time) : "End time"}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{endOptions.map((time) => (
								<SelectItem key={time} value={time} className="text-sm">
									{formatTime(time)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{isInvalid && (
				<Alert variant="destructive" className="py-2 text-xs bg-red-50 border-red-200">
					<AlertCircle className="h-3 w-3" />
					<AlertDescription className="text-xs">
						End time must be after start time
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
});

TimeRangeSelector.displayName = 'TimeRangeSelector';

const DayCard: React.FC<DayCardProps> = memo(({
	day,
	template,
	onAddTimeRange,
	onRemoveTimeRange,
	onUpdateTimeRange
}) => {
	const dayRanges = useMemo(() => {
		return day.ranges.length > 0 ? day.ranges : getTimeRangesForDate(day.column, template);
	}, [day.ranges, day.column, template]);

	const handleAdd = useCallback(() => {
		onAddTimeRange(day.column);
	}, [day.column, onAddTimeRange]);

	return (
		<Card className="group border-blue-100 hover:shadow-lg transition-all duration-300">
			<CardHeader className="bg-gradient-to-b from-blue-50/50 to-transparent py-2 px-3 border-b border-blue-100">
				<CardTitle className="flex flex-col items-center">
					<span className="text-base font-semibold text-blue-900">
						{format(day.column, 'EEE')}
					</span>
					<span className="text-xs text-blue-600/90">
						{format(day.column, 'MMM d')}
					</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-3 space-y-3">
				<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
					<Button
						variant="outline"
						size="sm"
						onClick={handleAdd}
						className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
					>
						<Plus className="h-3 w-3 mr-1" />
						Add Time
					</Button>
				</motion.div>

				<AnimatePresence mode="popLayout">
					{dayRanges.map((range, rangeIndex) => (
						<motion.div
							key={`${rangeIndex}-${range.start_time}-${range.end_time}`}
							layout
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="relative"
						>
							<div className="p-2 border border-blue-100 rounded-lg bg-white">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onRemoveTimeRange(day.column, rangeIndex)}
									className="absolute right-2 top-2 h-5 w-5 text-blue-400 hover:text-blue-600"
								>
									<X className="h-3 w-3" />
								</Button>
								<TimeRangeSelector
									range={range}
									onUpdate={(field, value) =>
										onUpdateTimeRange(day.column, rangeIndex, field, value)
									}
									isInvalid={false}
								/>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
});
DayCard.displayName = 'DayCard';

export const WeekViewEditor: React.FC<WeekViewEditorProps> = memo(({
	template,
	timeRanges,
	onAddTimeRange,
	onRemoveTimeRange,
	onUpdateTimeRange,
	isLoading = false,
}) => {
	if (isLoading) {
		return <LoadingState />;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
			{timeRanges.map((day, dayIndex) => (
				<DayCard
					key={`${dayIndex}-${day.column.toISOString()}`}
					day={day}
					dayIndex={dayIndex}
					template={template}
					onAddTimeRange={onAddTimeRange}
					onRemoveTimeRange={onRemoveTimeRange}
					onUpdateTimeRange={onUpdateTimeRange}
				/>
			))}
		</div>
	);
});

WeekViewEditor.displayName = 'WeekViewEditor';
export default WeekViewEditor;
