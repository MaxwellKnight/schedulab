import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerFooter,
} from "@/components/ui/drawer"
import AnimatedGradientButton from "@/components/AnimatedButton"
import { Settings, Loader2, Check } from "lucide-react"
import { DateRangePicker } from "@/components/DateRangePicker"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { addDays, eachDayOfInterval } from "date-fns"
import PreferencesApply from "./PreferencesApply"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DailyPreference {
	column: Date;
	ranges: { start_time: string; end_time: string }[];
}

export const PreferencesDrawer: React.FC = () => {
	const [timeRanges, setTimeRanges] = useState<DailyPreference[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [range, setRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: addDays(new Date(), 7),
	});

	useEffect(() => {
		if (!(range && range.from && range.to)) return;
		const dates = eachDayOfInterval({ start: range.from, end: range.to });
		const ranges: DailyPreference[] = [];
		dates.forEach(date => {
			ranges.push({ column: date, ranges: [] });
		});
		setTimeRanges(ranges);
	}, [range]);

	const handleAddTimeRange = (date: Date) => {
		setTimeRanges(prev => prev.map(day => {
			if (day.column.getTime() === date.getTime()) {
				return {
					...day,
					ranges: [...day.ranges, { start_time: "09:00", end_time: "17:00" }]
				};
			}
			return day;
		}));
	};

	const handleRemoveTimeRange = (date: Date, index: number) => {
		setTimeRanges(prev => prev.map(day => {
			if (day.column.getTime() === date.getTime()) {
				return {
					...day,
					ranges: day.ranges.filter((_, i) => i !== index)
				};
			}
			return day;
		}));
	};

	const handleUpdateTimeRange = (
		date: Date,
		index: number,
		field: 'start_time' | 'end_time',
		value: string
	) => {
		setTimeRanges(prev => prev.map(day => {
			if (day.column.getTime() === date.getTime()) {
				return {
					...day,
					ranges: day.ranges.map((range, i) => {
						if (i === index) {
							return { ...range, [field]: value };
						}
						return range;
					})
				};
			}
			return day;
		}));
	};

	const handleApplyAll = (ranges: Array<{ start_time: string; end_time: string }>) => {
		setTimeRanges(prev => prev.map(day => ({
			column: day.column,
			ranges: [...ranges]
		})));
	}

	const handleSubmit = async () => {
		setIsSubmitting(true);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsSubmitting(false);
		setIsSuccess(true);
		setTimeout(() => setIsSuccess(false), 2000);
	};

	const hasTimeRanges = timeRanges.some(day => day.ranges.length > 0);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<AnimatedGradientButton
					onClick={() => console.log("preferences...")}
					disabled={false}
					icon={Settings}
					text="Preferences"
				/>
			</DrawerTrigger>
			<DrawerContent>
				<motion.div
					className="grid place-items-center w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<DrawerHeader className="w-full grid place-items-center">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
						>
							<DrawerTitle className="text-2xl font-bold text-blue-900">Preferences</DrawerTitle>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<DrawerDescription className="text-blue-600">
								Manage your preferences simpler than ever.
							</DrawerDescription>
						</motion.div>
					</DrawerHeader>

					<motion.div
						className="grid place-items-center p-4 w-full min-h-[500px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						<DateRangePicker className="mb-4" range={range} setRange={setRange} />
						<PreferencesApply
							timeRanges={timeRanges}
							onAddTimeRange={handleAddTimeRange}
							onRemoveTimeRange={handleRemoveTimeRange}
							onUpdateTimeRange={handleUpdateTimeRange}
							onApplyToAll={handleApplyAll}
						/>
					</motion.div>

					<DrawerFooter className="w-full max-w-md mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									className={cn(
										"w-full mb-10 relative overflow-hidden",
										isSuccess
											? "bg-green-600 hover:bg-green-700"
											: "bg-blue-600 hover:bg-blue-700"
									)}
									onClick={handleSubmit}
									disabled={isSubmitting || !hasTimeRanges}
								>
									<AnimatePresence mode="wait">
										{isSubmitting ? (
											<motion.div
												key="loading"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="flex items-center"
											>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Saving preferences...
											</motion.div>
										) : isSuccess ? (
											<motion.div
												key="success"
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												className="flex items-center"
											>
												<Check className="mr-2 h-4 w-4" />
												Preferences saved!
											</motion.div>
										) : (
											<motion.div
												key="default"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
											>
												Save preferences
											</motion.div>
										)}
									</AnimatePresence>

									<motion.div
										className="absolute inset-0 bg-white opacity-0"
										initial={false}
										animate={isSubmitting ? {
											opacity: [0, 0.1, 0],
											x: ["0%", "100%"]
										} : { opacity: 0 }}
										transition={{
											duration: 1,
											repeat: isSubmitting ? Infinity : 0,
											ease: "linear"
										}}
									/>
								</Button>
							</motion.div>
						</motion.div>
					</DrawerFooter>
				</motion.div>
			</DrawerContent>
		</Drawer>
	);
};
