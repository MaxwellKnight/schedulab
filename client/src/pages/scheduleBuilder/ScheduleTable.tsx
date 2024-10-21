import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Clock, Info, Users } from "lucide-react";
import { createDateArray } from "./ShiftForm";
import { Schedule, } from "./ScheduleBuilder";
import { ShiftData } from "@/types";
import { getColorForShiftType } from '@/utils/colors';

interface ScheduleTableProps {
	schedule: Schedule;
	onBack: () => void;
	onSubmit: (data: Schedule) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule, onBack, onSubmit }) => {
	const [headers, setHeaders] = useState<string[]>([]);

	useEffect(() => {
		setHeaders(createDateArray(schedule.start_date, schedule.end_date));
	}, [schedule]);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const getShiftsForDateAndType = (date: string, typeId: number): ShiftData[] => {
		return schedule.shifts.filter(shift =>
			shift.date.toDateString() === new Date(date).toDateString() &&
			shift.shift_type === typeId
		);
	};

	const renderShiftCell = (shifts: ShiftData[], date: string, typeId: number) => {
		const cellId = `${typeId}-${date}`;
		const colorClass = getColorForShiftType(typeId.toString(), schedule);
		const borderClass = colorClass.replace("bg", "border");

		if (shifts.length === 0) return <TableCell key={cellId}>-</TableCell>;

		return (
			<TableCell key={cellId} className="p-2">
				<div className="flex flex-col space-y-2">
					{shifts.map((shift, index) => (
						<div
							key={`${cellId}-${index}`}
							className={`bg-gray-100 rounded-md p-2 shadow-sm border-l-8 ${borderClass}`}
						>
							<div className="flex items-center justify-between mb-1">
								<span className={`font-medium text-sm `}>{shift.shift_name}</span>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
											<Info size={14} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80">
										<div className="grid gap-4">
											<div className="space-y-2">
												<p className="text-sm text-muted-foreground">
													Additional information about the shift.
												</p>
											</div>
											<div className="grid gap-2">
												<div className="grid grid-cols-3 items-center gap-4">
													<span className="text-sm">Likes:</span>
													<span className="text-sm font-medium col-span-2">{shift.likes}</span>
												</div>
												<div className="grid grid-cols-3 items-center gap-4">
													<span className="text-sm">Users:</span>
													<span className="text-sm font-medium col-span-2">
														{shift.users.length > 0 ? shift.users.length : 'N/A'}
													</span>
												</div>
												{shift.ranges.length > 1 && (
													<div className="grid grid-cols-3 items-center gap-4">
														<span className="text-sm">All Times:</span>
														<div className="text-sm font-medium col-span-2">
															{shift.ranges.map((range, i) => (
																<div key={i}>
																	{formatTime(range.start_time)}-{formatTime(range.end_time)}
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									</PopoverContent>
								</Popover>
							</div>
							<div className="flex flex-col text-xs text-black">
								<span className="flex items-center">
									<Clock className="h-3 w-3 mr-1" /> {formatTime(shift.ranges[0].start_time)}-{formatTime(shift.ranges[0].end_time)}
								</span>
								<span className="flex items-center mt-1">
									<Users className="h-3 w-3 mr-1" /> Required: {shift.required_count}
								</span>
							</div>
						</div>
					))}
				</div>
			</TableCell>
		);
	};

	return (
		<React.Fragment>
			<Table>
				<TableCaption>Final schedule before submission.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Types</TableHead>
						{headers.map(header =>
							<TableHead key={header} className="text-center">{header}</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{schedule.types.map(type => {
						return (
							<TableRow key={type.id}>
								<TableCell className={`font-medium text-lg`}>
									{type.name}
								</TableCell>
								{headers.map(date => renderShiftCell(getShiftsForDateAndType(date, type.id), date, type.id))}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<div className="flex justify-between items-center mt-6">
				<Button onClick={onBack} type="button" variant="outline" className="px-4 py-2">
					<ChevronLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button
					onClick={() => onSubmit(schedule)}
					type="submit"
					className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
				>
					Create Layout <ChevronRight className="ml-2 h-5 w-5" />
				</Button>
			</div>
		</React.Fragment>
	);
};

export default ScheduleTable;
