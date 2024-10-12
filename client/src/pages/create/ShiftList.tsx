import React from 'react';
import { Button } from "@/components/ui/button";
import { ShiftData } from '@/types';
import { format } from "date-fns";
import { Trash2 } from 'lucide-react';

interface ShiftListProps {
	shifts: ShiftData[];
	onRemove: (index: number) => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts, onRemove }) => {
	if (shifts.length === 0) return null;

	return (
		<div className="mt-6">
			<h4 className="font-medium mb-2">Added Shifts:</h4>
			<ul className="space-y-2">
				{shifts.map((shift, index) => (
					<li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
						<span>
							{shift.shift_name}: {format(shift.start_time, "HH:mm")} - {format(shift.end_time, "HH:mm") + "\t\t"}
							(Required: {shift.required_count})
						</span>
						<Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
							<Trash2 className="h-4 w-4" />
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ShiftList;
