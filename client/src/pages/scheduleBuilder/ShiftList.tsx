import React, { useState, useMemo } from 'react';
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

	const toggleShiftExpansion = (index: number) => {
		setExpandedShifts(prev =>
			prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
		);
	};

	const groupedShifts = useMemo(() => {
		const grouped: Record<string, ShiftData[]> = {};
		shifts.forEach(shift => {
			const dateKey = format(new Date(shift.date), 'yyyy-MM-dd');
			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(shift);
		});
		return grouped;
	}, [shifts]);

	if (shifts.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No shifts added yet.</div>;

	return (
		<div className="h-[500px] overflow-y-auto ">
			{Object.entries(groupedShifts).map(([date, dateShifts]) => (
				<div key={date} className="mb-6">
					<h5 className="font-semibold text-md mb-2">{format(new Date(date), 'MMMM dd, yyyy')}</h5>
					<ul className="space-y-4">
						{dateShifts.map((shift) => {
							const shiftIndex = shifts.findIndex(s => s === shift);
							return (
								<Card key={shiftIndex}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<div className="flex items-center space-x-2">
											<CardTitle className="text-lg font-medium">{shift.shift_name}</CardTitle>
										</div>
										<div className="flex items-center space-x-2">
											<Button variant="ghost" size="sm" onClick={() => toggleShiftExpansion(shiftIndex)}>
												{!expandedShifts.includes(shiftIndex) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
											</Button>
											<Button variant="ghost" size="sm" onClick={() => onRemove(shiftIndex)} className="text-red-500 hover:text-red-700">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardHeader>
									{!expandedShifts.includes(shiftIndex) && (
										<CardContent>
											<div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
												<div className="flex items-center">
													<Clock className="h-4 w-4 mr-2" />
													<span>{format(new Date(shift.start_time), "HH:mm")} - {format(new Date(shift.end_time), "HH:mm")}</span>
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
							);
						})}
					</ul>
				</div>
			))}
		</div>
	);
};
export default ShiftList;
