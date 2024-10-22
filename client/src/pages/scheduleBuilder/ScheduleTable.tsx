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
import { ChevronLeft, ChevronRight, Clock, Info, Users, ChevronDown } from "lucide-react";
import { Schedule, } from "./ScheduleBuilder";
import { ShiftData } from "@/types";
import { getColorForShiftType } from '@/utils/colors';
import { createDateArray } from "@/lib/utils";

interface ScheduleTableProps {
	schedule: Schedule;
	onBack: () => void;
	onSubmit: (data: Schedule) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule, onBack, onSubmit }) => {
	const [headers, setHeaders] = useState<string[]>([]);
	const [expandedType, setExpandedType] = useState<number | null>(null);
	const [isMobileView, setIsMobileView] = useState(false);

	useEffect(() => {
		setHeaders(createDateArray(schedule.start_date, schedule.end_date));

		const checkScreenSize = () => {
			setIsMobileView(window.innerWidth < 768);
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, [schedule]);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const day = date.getDate();
		const weekday = date.toLocaleDateString('en-US', { weekday: isMobileView ? 'narrow' : 'short' });
		return (
			<div className="flex flex-col items-center">
				<span className="text-xs text-gray-600">{weekday}</span>
				<span className="text-sm font-medium">{day}</span>
			</div>
		);
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
		const stripeColor = colorClass.replace('bg-', 'text-');

		if (shifts.length === 0) {
			return (
				<TableCell
					key={cellId}
					className="text-gray-400 text-center w-28 sm:w-32 md:w-40 p-1"
				>
					-
				</TableCell>
			);
		}

		return (
			<TableCell
				key={cellId}
				className="p-1 w-28 sm:w-32 md:w-40"
			>
				<div className="flex flex-col space-y-2">
					{shifts.map((shift, index) => (
						<div
							key={`${cellId}-${index}`}
							className="bg-slate-100 rounded-lg p-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
						>
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center gap-1">
									<span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${colorClass} bg-opacity-10 ${stripeColor}`}>
										{shift.shift_name}
									</span>
								</div>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full">
											<Info size={12} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-64">
										<div className="space-y-3">
											<div className="space-y-1">
												<h4 className="font-medium leading-none text-sm">Shift Details</h4>
												<p className="text-xs text-muted-foreground">
													Additional information about the shift.
												</p>
											</div>
											<div className="space-y-2">
												<div className="grid grid-cols-3 items-center gap-2">
													<span className="text-xs text-muted-foreground">Likes:</span>
													<span className="text-xs font-medium col-span-2">{shift.likes}</span>
												</div>
												<div className="grid grid-cols-3 items-center gap-2">
													<span className="text-xs text-muted-foreground">Users:</span>
													<span className="text-xs font-medium col-span-2">
														{shift.users.length > 0 ? shift.users.length : 'N/A'}
													</span>
												</div>
												{shift.ranges.length > 1 && (
													<div className="grid grid-cols-3 items-center gap-2">
														<span className="text-xs text-muted-foreground">All Times:</span>
														<div className="col-span-2">
															<div className="space-y-1">
																{shift.ranges.map((range, i) => (
																	<div key={i} className="text-xs">
																		{formatTime(range.start_time)} - {formatTime(range.end_time)}
																	</div>
																))}
															</div>
														</div>
													</div>
												)}
											</div>
										</div>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-1 text-xs text-gray-600">
								<div className="flex items-center">
									<Clock className="h-3 w-3 mr-1 text-gray-400" />
									<span>{formatTime(shift.ranges[0].start_time)}-{formatTime(shift.ranges[0].end_time)}</span>
								</div>
								<div className="flex items-center">
									<Users className="h-3 w-3 mr-1 text-gray-400" />
									<span>Required: {shift.required_count}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</TableCell>
		);
	};

	const renderMobileView = () => (
		<div className="space-y-4">
			{schedule.types.map(type => (
				<div key={type.id} className="border rounded-lg overflow-hidden">
					<Button
						variant="ghost"
						className="w-full flex items-center justify-between p-4 bg-gray-50"
						onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
					>
						<div className="flex items-center space-x-2">
							<span className={`w-2 h-2 rounded-full ${getColorForShiftType(type.id.toString(), schedule)}`}></span>
							<span className="font-medium text-sm">{type.name}</span>
						</div>
						<ChevronDown
							className={`h-4 w-4 transition-transform duration-200 ${expandedType === type.id ? 'transform rotate-180' : ''
								}`}
						/>
					</Button>
					{expandedType === type.id && (
						<div className="overflow-x-auto">
							<Table className="w-full">
								<TableHeader>
									<TableRow className="border-b border-gray-200">
										{headers.map(header => (
											<TableHead
												key={header}
												className="text-center border-r last:border-r-0 w-28 min-w-28 p-2"
											>
												{formatDate(header)}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										{headers.map(date => renderShiftCell(getShiftsForDateAndType(date, type.id), date, type.id))}
									</TableRow>
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			))}
		</div>
	);

	const renderDesktopView = () => (
		<div className="overflow-x-auto">
			<Table className="border border-gray-200 rounded-lg w-full table-fixed">
				<TableCaption className="text-xs">Final schedule before submission.</TableCaption>
				<TableHeader>
					<TableRow className="border-b border-gray-200 bg-gray-50">
						<TableHead className="text-center border-r border-gray-200 bg-gray-50 w-12 sm:w-28 md:w-32 p-2">Types</TableHead>
						{headers.map(header => (
							<TableHead
								key={header}
								className="text-center border-r last:border-r-0 border-gray-200 w-28 sm:w-32 md:w-40 p-2"
							>
								{formatDate(header)}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{schedule.types.map(type => (
						<TableRow key={type.id} className="border-b last:border-b-0 border-gray-200">
							<TableCell className="p-2 bg-gray-50 border-r w-24 sm:w-28 md:w-32">
								<div className="flex items-center pl-8 space-x-2">
									<span className={`w-3 h-3 rounded-full ${getColorForShiftType(type.id.toString(), schedule)}`}></span>
									<span className="font-medium text-md">{type.name}</span>
								</div>
							</TableCell>
							{headers.map(date => renderShiftCell(getShiftsForDateAndType(date, type.id), date, type.id))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);

	return (
		<React.Fragment>
			<div className="px-6">
				<div className="mb-4">
					<h2 className="text-lg font-medium text-gray-900">Schedule Overview</h2>
					<p className="text-xs text-gray-500 mt-1">
						{new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
					</p>
				</div>

				{isMobileView ? renderMobileView() : renderDesktopView()}

				<div className="flex justify-between items-center mt-4">
					<Button onClick={onBack} type="button" variant="outline" className="px-3 py-1.5 text-sm">
						<ChevronLeft className="mr-1.5 h-3.5 w-3.5" /> Back
					</Button>
					<Button
						onClick={() => onSubmit(schedule)}
						type="submit"
						className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
					>
						Create Layout <ChevronRight className="ml-1.5 h-4 w-4" />
					</Button>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ScheduleTable;
