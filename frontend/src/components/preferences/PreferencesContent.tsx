import { motion } from "framer-motion";
import { DateRangePicker } from "../DateRangePicker";
import PreferencesApply from "./PreferencesApply";
import { DateRange } from "react-day-picker";
import { DailyPreference, PreferenceRange } from "./types";
import { Dispatch, SetStateAction } from "react";

export interface PreferencesContentProps {
	range: DateRange | undefined
	setRange: Dispatch<SetStateAction<DateRange | undefined>>
	timeRanges: DailyPreference[]
	onAddTimeRange: (date: Date) => void
	onRemoveTimeRange: (date: Date, index: number) => void
	onUpdateTimeRange: (
		date: Date,
		index: number,
		field: 'start_time' | 'end_time',
		value: string
	) => void
	onApplyToAll: (ranges: PreferenceRange[]) => void
}

export const PreferencesContent: React.FC<PreferencesContentProps> = ({
	range,
	setRange,
	timeRanges,
	onAddTimeRange,
	onRemoveTimeRange,
	onUpdateTimeRange,
	onApplyToAll
}) => (
	<motion.div
		className="grid place-items-center p-4 w-full min-h-[500px]"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ delay: 0.3 }}
	>
		<DateRangePicker
			className="mb-4"
			range={range}
			setRange={setRange}
		/>
		<PreferencesApply
			timeRanges={timeRanges}
			onAddTimeRange={onAddTimeRange}
			onRemoveTimeRange={onRemoveTimeRange}
			onUpdateTimeRange={onUpdateTimeRange}
			onApplyToAll={onApplyToAll}
		/>
	</motion.div>
);
