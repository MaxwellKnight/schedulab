import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { motion } from "framer-motion"

export interface DateRangePickerProps {
	range: DateRange | undefined;
	setRange: (range: DateRange | undefined) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps & React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	range,
	setRange
}) => {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<motion.div
						whileTap={{ scale: 0.99 }}
					>
						<Button
							id="range"
							variant="outline"
							className={cn(
								"w-[300px] justify-start text-left font-normal border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 text-blue-900",
								!range && "text-blue-500"
							)}
						>
							<motion.div
								animate={{
									rotate: isOpen ? 180 : 0,
									scale: isOpen ? 1.1 : 1
								}}
								transition={{ duration: 0.2 }}
								className="mr-2 text-blue-600"
							>
								<CalendarIcon className="h-4 w-4" />
							</motion.div>
							<motion.span
								initial={false}
								animate={{
									opacity: 1,
									y: 0
								}}
								transition={{ duration: 0.2 }}
							>
								{range?.from ? (
									range.to ? (
										<>
											{format(range.from, "LLL dd, y")} -{" "}
											{format(range.to, "LLL dd, y")}
										</>
									) : (
										format(range.from, "LLL dd, y")
									)
								) : (
									<span>Pick a range</span>
								)}
							</motion.span>
						</Button>
					</motion.div>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0 border-blue-200 bg-white/95 backdrop-blur-sm shadow-lg"
					align="start"
				>
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Calendar
							initialFocus
							mode="range"
							defaultMonth={range?.from}
							selected={range}
							onSelect={setRange}
							numberOfMonths={2}
							className="rounded-lg p-3"
							classNames={{
								months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
								month: "space-y-4",
								caption: "flex justify-center pt-1 relative items-center text-blue-900 font-semibold",
								caption_label: "text-sm font-medium text-blue-800",
								nav: "space-x-1 flex items-center",
								nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-50 text-blue-600 rounded-md transition-colors",
								nav_button_previous: "absolute left-1",
								nav_button_next: "absolute right-1",
								table: "w-full border-collapse space-y-1",
								head_row: "flex",
								head_cell: "text-blue-500 rounded-md w-9 font-normal text-[0.8rem]",
								row: "flex w-full mt-2",
								cell: cn(
									"relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50/50",
									"first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
								),
								day: cn(
									"h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md transition-colors",
									"text-blue-900 hover:bg-blue-100",
									"aria-selected:bg-blue-600 aria-selected:text-white hover:aria-selected:bg-blue-700"
								),
								day_range_start: "rounded-l-md",
								day_range_end: "rounded-r-md",
								day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
								day_today: "bg-blue-100 text-blue-900",
								day_outside: "text-blue-400 opacity-50",
								day_disabled: "text-gray-400 opacity-50",
								day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
								day_hidden: "invisible",
							}}
						/>
					</motion.div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
