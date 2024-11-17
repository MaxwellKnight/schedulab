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
import { Settings, Loader2, Check, AlertCircle } from "lucide-react"
import { DateRangePicker } from "@/components/DateRangePicker"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { addDays, eachDayOfInterval, format } from "date-fns"
import PreferencesApply from "./PreferencesApply"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { useTeam } from "@/context"

export interface DailyPreference {
	column: Date;
	ranges: { start_time: string; end_time: string }[];
}

interface PreferencesDrawerProps {
	onSuccess?: () => void;
}

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ onSuccess }) => {
	const [timeRanges, setTimeRanges] = useState<DailyPreference[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [range, setRange] = useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 7) });
	const { selectedTeam } = useTeam();

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
		if (!range?.from || !range?.to) return;
		setIsSubmitting(true);
		setError(null);

		try {
			// 1. Create template
			const templateResponse = await axios.post('/preferences', {
				name: `Preferences ${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`,
				team_id: selectedTeam?.id,
				status: 'draft',
				start_date: format(range.from, 'yyyy-MM-dd'),
				end_date: format(range.to, 'yyyy-MM-dd')
			});

			const templateId = templateResponse.data.id;

			// 2. Create time ranges first
			const timeRangePromises = timeRanges.flatMap(day =>
				day.ranges.map(range => ({
					start_time: range.start_time,
					end_time: range.end_time,
					preference_id: templateId
				}))
			).filter((range, index, self) =>
				// Remove duplicates based on start and end time
				index === self.findIndex(r =>
					r.start_time === range.start_time &&
					r.end_time === range.end_time
				)
			).map(range =>
				axios.post(`/preferences/${templateId}/time-ranges`, range)
			);

			const createdRanges = await Promise.all(timeRangePromises);

			// 3. Create a lookup map using start_time and end_time as key
			const rangeIdMap = new Map<string, number>();
			createdRanges.forEach(response => {
				const { range, id } = response.data;
				const key = `${range.start_time}-${range.end_time}`;
				rangeIdMap.set(key, id);
			});
			console.table(rangeIdMap);

			// 4. Create time slots using the lookup map
			const slots = timeRanges.flatMap(day =>
				day.ranges.map(range => {
					const key = `${range.start_time}-${range.end_time}`;
					const timeRangeId = rangeIdMap.get(key);

					if (!timeRangeId) {
						throw new Error(`Could not find time range ID for ${key}`);
					}

					return {
						date: format(day.column, 'yyyy-MM-dd'),
						time_range_id: timeRangeId
					};
				})
			);

			if (slots.length > 0) {
				await axios.post(
					`/preferences/${templateId}/time-slots/bulk`,
					{ slots }
				);
			}

			setIsSuccess(true);
			onSuccess?.();
			setTimeout(() => setIsSuccess(false), 2000);

		} catch (err) {
			if (axios.isAxiosError(err)) {
				const errorMessage = err.response?.data?.errors?.[0]?.message ||
					err.response?.data?.message ||
					err.message;
				setError(errorMessage);
				console.error('API Error:', {
					status: err.response?.status,
					data: err.response?.data,
					message: errorMessage
				});
			} else {
				setError(err instanceof Error ? err.message : 'An error occurred');
			}
		} finally {
			setIsSubmitting(false);
		}
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
						{error && (
							<Alert variant="destructive" className="mb-4">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

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
