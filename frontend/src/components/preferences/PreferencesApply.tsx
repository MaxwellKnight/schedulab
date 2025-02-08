import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Plus, X, ChevronLeft, ChevronRight, Copy, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePref } from '@/context/PreferencesContext';

interface PreferencesApplyProps { }

const TIME_OPTIONS = [
	"00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
	"06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
	"12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
	"18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

const MotionCard = motion(Card);
const MotionCardTitle = motion(CardTitle);

export const PreferencesApply: React.FC<PreferencesApplyProps> = () => {
	const [currentDayIndex, setCurrentDayIndex] = React.useState(0);
	const [direction, setDirection] = React.useState(0);
	const {
		timeRanges,
		handleAddTimeRange,
		handleRemoveTimeRange,
		handleUpdateTimeRange,
		handleApplyAll
	} = usePref();
	const currentDay = timeRanges[currentDayIndex];

	const goToPreviousDay = () => {
		setDirection(-1);
		setCurrentDayIndex(prev => Math.max(0, prev - 1));
	};

	const goToNextDay = () => {
		setDirection(1);
		setCurrentDayIndex(prev => Math.min(timeRanges.length - 1, prev + 1));
	};

	const isValidTimeRange = (start: string, end: string) => {
		return start < end;
	};

	const handleApplyToAll = () => {
		handleApplyAll(currentDay?.ranges);
	};

	return (
		<MotionCard
			className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 border-blue-100 shadow-lg"
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<CardHeader className="pb-4 bg-blue-50/50">
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={goToPreviousDay}
						disabled={currentDayIndex === 0}
						className="hover:bg-blue-100 text-blue-700"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<AnimatePresence mode="wait">
						<MotionCardTitle
							key={currentDayIndex}
							className="flex flex-col items-center gap-1"
							initial={{ opacity: 0, x: direction * 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -direction * 50 }}
							transition={{ duration: 0.2 }}
						>
							<span className="text-2xl font-bold text-blue-900">
								{currentDay && format(currentDay?.column, 'EEEE')}
							</span>
							<span className="text-sm text-blue-600">
								{currentDay && format(currentDay?.column, 'MMMM d, yyyy')}
							</span>
						</MotionCardTitle>
					</AnimatePresence>

					<Button
						variant="ghost"
						size="sm"
						onClick={goToNextDay}
						disabled={currentDayIndex === timeRanges.length - 1}
						className="hover:bg-blue-100 text-blue-700"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>

			<CardContent className="mt-4 space-y-6">
				<div className="flex items-center justify-between pt-2">
					<div className="flex justify-between w-full gap-2">
						<motion.div
							whileTap={{ scale: 0.98 }}
						>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleAddTimeRange(currentDay?.column)}
								className="bg-blue-600 hover:text-white text-white hover:bg-blue-900 border-blue-600 "
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Time
							</Button>
						</motion.div>

						{currentDay?.ranges.length > 0 && (
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
										>
											<Copy className="h-4 w-4 mr-1" />
											Apply to All
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className="bg-white/95 backdrop-blur-sm">
										<AlertDialogHeader>
											<AlertDialogTitle>Apply time slots to all days?</AlertDialogTitle>
											<AlertDialogDescription>
												This will replace all existing time slots on other days with the current day&apos;s schedule. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="hover:bg-blue-50">Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleApplyToAll}
												className="bg-blue-600 hover:bg-blue-700"
											>
												Apply
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</motion.div>
						)}
					</div>
				</div>

				<motion.div
					className="space-y-3"
					layout
				>
					<AnimatePresence mode="popLayout">
						{currentDay?.ranges.length === 0 ? (
							<motion.div
								key="empty"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50"
							>
								<Clock className="h-8 w-8 text-blue-400 mb-2" />
								<p className="text-sm text-blue-600">No time slots available</p>
								<Button
									variant="link"
									size="sm"
									onClick={() => handleAddTimeRange(currentDay?.column)}
									className="mt-2 text-blue-600 hover:text-blue-700"
								>
									Add your first time slot
								</Button>
							</motion.div>
						) : (
							currentDay?.ranges.map((range, index) => (
								<motion.div
									key={index}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.2 }}
									className="group relative flex items-center gap-2 p-4 border border-blue-100 rounded-lg bg-white hover:bg-blue-50/50 hover:border-blue-200"
								>
									<div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Select
											value={range.start_time.toString()}
											onValueChange={(value) =>
												handleUpdateTimeRange(currentDay?.column, index, 'start_time', value)
											}
										>
											<SelectTrigger className="border-blue-200 hover:border-blue-300">
												<SelectValue placeholder="Start time" />
											</SelectTrigger>
											<SelectContent>
												{TIME_OPTIONS.map((time) => (
													<SelectItem key={time} value={time}>
														{time}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<Select
											value={range.end_time.toString()}
											onValueChange={(value) =>
												handleUpdateTimeRange(currentDay?.column, index, 'end_time', value)
											}
										>
											<SelectTrigger className="border-blue-200 hover:border-blue-300">
												<SelectValue placeholder="End time" />
											</SelectTrigger>
											<SelectContent>
												{TIME_OPTIONS.map((time) => (
													<SelectItem key={time} value={time}>
														{time}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
									>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveTimeRange(currentDay?.column, index)}
											className="group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-100"
										>
											<X className="h-4 w-4" />
										</Button>
									</motion.div>

									{!isValidTimeRange(range.start_time.toString(), range.end_time.toString()) && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<Badge variant="destructive" className="absolute -top-2 right-2">
												Invalid time range
											</Badge>
										</motion.div>
									)}
								</motion.div>
							))
						)}
					</AnimatePresence>
				</motion.div>

				<div className="flex justify-center gap-2 pt-4">
					{timeRanges.map((_, index) => (
						<motion.button
							key={index}
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.9 }}
							className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentDayIndex
								? 'bg-blue-600'
								: 'bg-blue-200 hover:bg-blue-300'
								}`}
							onClick={() => setCurrentDayIndex(index)}
						/>
					))}
				</div>
			</CardContent>
		</MotionCard>
	);
};

export default PreferencesApply;
