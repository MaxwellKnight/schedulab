import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeRange {
	start_time: string;
	end_time: string;
}

interface DailyPreference {
	column: Date;
	ranges: TimeRange[];
}

interface WeekViewEditorProps {
	timeRanges: DailyPreference[];
	onAddTimeRange: (date: Date) => void;
	onRemoveTimeRange: (date: Date, index: number) => void;
	onUpdateTimeRange: (
		date: Date,
		index: number,
		field: 'start_time' | 'end_time',
		value: string
	) => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
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

const TimeRangeSelector: React.FC<{
	range: TimeRange;
	onUpdate: (field: 'start_time' | 'end_time', value: string) => void;
	isInvalid: boolean;
}> = ({ range, onUpdate, isInvalid }) => {
	const startOptions = useMemo(() =>
		TIME_OPTIONS.filter(time => time < range.end_time || !range.end_time),
		[range.end_time]
	);

	const endOptions = useMemo(() =>
		TIME_OPTIONS.filter(time => time > range.start_time || !range.start_time),
		[range.start_time]
	);

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<label className="text-xs font-medium text-blue-700">Start</label>
					<Select
						value={range.start_time}
						onValueChange={(value) => onUpdate('start_time', value)}
					>
						<SelectTrigger className="h-8 text-sm border-blue-200 hover:border-blue-300 bg-white">
							<SelectValue placeholder="Start time" />
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
						onValueChange={(value) => onUpdate('end_time', value)}
					>
						<SelectTrigger className="h-8 text-sm border-blue-200 hover:border-blue-300 bg-white">
							<SelectValue placeholder="End time" />
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
};

export const WeekViewEditor: React.FC<WeekViewEditorProps> = ({
	timeRanges,
	onAddTimeRange,
	onRemoveTimeRange,
	onUpdateTimeRange,
}) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
			{timeRanges.map((day, dayIndex) => (
				<Card
					key={dayIndex}
					className="group border-blue-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-b from-blue-50/0 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="relative z-10"
						>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onAddTimeRange(day.column)}
								className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm hover:shadow-md transition-all duration-200"
							>
								<Plus className="h-3 w-3 mr-1" />
								Add Time
							</Button>
						</motion.div>

						<AnimatePresence mode="popLayout">
							{day.ranges.length === 0 ? (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="flex flex-col items-center justify-center py-4 px-2 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30"
								>
									<Clock className="h-4 w-4 text-blue-400 mb-1" />
									<p className="text-xs text-blue-600/90 text-center">No slots</p>
								</motion.div>
							) : (
								<motion.div layout className="space-y-2">
									{day.ranges.map((range, rangeIndex) => (
										<motion.div
											key={rangeIndex}
											layout
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="relative group/slot"
										>
											<div className="p-2 border border-blue-100 rounded-lg bg-white hover:bg-blue-50/50 hover:border-blue-200 group-hover/slot:shadow-md transition-all duration-200">
												<div className="flex justify-end mb-1">
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
													>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => onRemoveTimeRange(day.column, rangeIndex)}
															className="h-5 w-5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200"
														>
															<X className="h-3 w-3" />
														</Button>
													</motion.div>
												</div>

												<TimeRangeSelector
													range={range}
													onUpdate={(field, value) => onUpdateTimeRange(day.column, rangeIndex, field, value)}
													isInvalid={range.start_time >= range.end_time}
												/>
											</div>
										</motion.div>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default WeekViewEditor;
