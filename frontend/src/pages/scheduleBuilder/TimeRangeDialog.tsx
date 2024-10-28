import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TimePicker } from '@/components/date-picker/DatePicker';
import { TimeRange } from '@/types';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TimeRangeDialogProps {
	onAddRanges: (ranges: TimeRange[]) => void;
}

const TimeRangeDialog: React.FC<TimeRangeDialogProps> = ({ onAddRanges }) => {
	const [ranges, setRanges] = useState<TimeRange[]>([{ start_time: new Date(), end_time: new Date() }]);

	const updateRange = (index: number, field: 'start_time' | 'end_time', value: Date | null) => {
		if (value) {
			const newRanges = [...ranges];
			newRanges[index][field] = value;
			setRanges(newRanges);
		}
	};

	const handleSubmit = () => {
		onAddRanges(ranges);
		setRanges([{ start_time: new Date(), end_time: new Date() }]);
	};

	return (
		<div className="w-full space-y-4">
			<h3 className="text-xl font-semibold">Time Ranges</h3>
			{ranges.map((range, index) => (
				<div key={index} className="grid grid-cols-2 space-x-4">
					<TimePicker
						label="Start Time"
						selected={range.start_time}
						onChange={(time) => updateRange(index, 'start_time', time)}
					/>
					<TimePicker
						label="End Time"
						selected={range.end_time}
						onChange={(time) => updateRange(index, 'end_time', time)}
					/>
				</div>
			))}
			<Button onClick={handleSubmit} type="button" variant="outline" className="w-full">
				<Clock className="mr-2 h-4 w-4" /> Add Time Range
			</Button>
			{ranges.length > 1 && (
				<div>
					<ul className="list-disc pl-5">
						{ranges.map((range, index) => (
							<li key={index}>
								{format(range.start_time, 'HH:mm')} - {format(range.end_time, 'HH:mm')}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default TimeRangeDialog;
