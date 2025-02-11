import { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { addDays, eachDayOfInterval } from "date-fns";
import { DailyPreference, PreferenceRange } from '@/components/preferences/types';

export const usePreferencesState = () => {
	const [timeRanges, setTimeRanges] = useState<DailyPreference[]>([]);
	const [range, setRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: addDays(new Date(), 7)
	});

	useEffect(() => {
		if (!(range && range.from && range.to)) return;
		const dates = eachDayOfInterval({ start: range.from, end: range.to });
		const ranges: DailyPreference[] = dates.map(date => ({
			column: date,
			ranges: []
		}));
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

	const handleApplyAll = (ranges: PreferenceRange[]) => {
		setTimeRanges(prev => prev.map(day => ({
			column: day.column,
			ranges: [...ranges]
		})));
	};

	return {
		timeRanges,
		range,
		setRange,
		handleAddTimeRange,
		handleRemoveTimeRange,
		handleUpdateTimeRange,
		handleApplyAll,
		isEmpty: timeRanges.some(day => day.ranges.length > 0)
	};
};
