import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShiftData } from '@/types';
import { format } from "date-fns";
import { Trash2, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface ShiftListProps {
	shifts: ShiftData[];
	onRemove: (index: number) => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts, onRemove }) => {
	const [expandedShifts, setExpandedShifts] = useState<number[]>([]);

	if (shifts.length === 0) return null;

	const toggleShiftExpansion = (index: number) => {
		setExpandedShifts(prev =>
			prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
		);
	};

	return (
		<div className="mt-6">
			<h4 className="font-semibold text-lg mb-4">Added Shifts:</h4>
			<ul className="space-y-4">
				{shifts.map((shift, index) => (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center space-x-2">
								<CardTitle className="text-lg font-medium">{shift.shift_name}</CardTitle>
								<span className="text-sm text-gray-500">{format(shift.date, "MMM dd, yyyy")}</span>
							</div>
							<div className="flex items-center space-x-2">
								<Button variant="ghost" size="sm" onClick={() => toggleShiftExpansion(index)}>
									{expandedShifts.includes(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
								</Button>
								<Button variant="ghost" size="sm" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						{expandedShifts.includes(index) && (
							<CardContent>
								<div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2" />
										<span>{format(shift.start_time, "HH:mm")} - {format(shift.end_time, "HH:mm")}</span>
									</div>
									<div className="flex items-center">
										<Users className="h-4 w-4 mr-2" />
										<span>Required: {shift.required_count}</span>
									</div>
									<div className="flex items-center">
										<Badge variant="secondary">
											{shift.shift_type === 1 ? "Morning" : shift.shift_type === 2 ? "Afternoon" : "Night"}
										</Badge>
									</div>
								</div>
							</CardContent>
						)}
					</Card>
				))}
			</ul>
		</div>
	);
};

export default ShiftList;
