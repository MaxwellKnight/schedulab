import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Calendar, } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card";
import { TemplateScheduleData, TemplateShiftData } from '@/types/template.dto';
import { ShiftType } from '@/types/shifts.dto';

interface ScheduleEditableProps {
	template: TemplateScheduleData | null;
	shiftTypes: ShiftType[] | null;
}

const ScheduleEditable: React.FC<ScheduleEditableProps> = ({ template, shiftTypes }) => {
	const [zoomLevel, setZoomLevel] = useState(1);
	const [visibleHoursStart, setVisibleHoursStart] = useState(0);
	const [visibleHoursEnd, setVisibleHoursEnd] = useState(24);
	const [isFullScreen, setIsFullScreen] = useState(false);

	const timeSlots = useMemo(() => {
		if (!template) return [];
		const uniqueHours = new Set<string>();
		template.shifts.forEach(shift => {
			shift.ranges.forEach(range => {
				const startHour = range.start_time.split(':')[0];
				uniqueHours.add(startHour.padStart(2, '0') + ':00');
			});
		});
		return Array.from(uniqueHours).sort();
	}, [template]);

	const shiftColors = useMemo(() => {
		const colors = {
			morning: 'bg-blue-100 border-blue-300 text-blue-800',
			afternoon: 'bg-green-100 border-green-300 text-green-800',
			night: 'bg-purple-100 border-purple-300 text-purple-800',
			oncall: 'bg-yellow-100 border-yellow-300 text-yellow-800',
			backup: 'bg-pink-100 border-pink-300 text-pink-800',
			default: 'bg-gray-100 border-gray-300 text-gray-800'
		};

		return shiftTypes?.reduce((acc, type, index) => {
			acc[type.id] = Object.values(colors)[index % Object.values(colors).length];
			return acc;
		}, {} as Record<number, string>) ?? {};
	}, [shiftTypes]);

	const dates = useMemo(() => {
		if (!template) return [];
		const dateArray: Date[] = [];
		const currentDate = new Date(template.start_date);
		const endDate = new Date(template.end_date);
		while (currentDate <= endDate) {
			dateArray.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dateArray;
	}, [template]);

	const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2));
	const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

	const handleTimeRangeChange = (direction: 'left' | 'right') => {
		const step = 4;
		if (direction === 'left') {
			setVisibleHoursStart(prev => Math.max(prev - step, 0));
			setVisibleHoursEnd(prev => Math.max(prev - step, step));
		} else {
			setVisibleHoursStart(prev => Math.min(prev + step, 20));
			setVisibleHoursEnd(prev => Math.min(prev + step, 24));
		}
	};

	const toggleFullScreen = () => {
		setIsFullScreen(prev => !prev);
	};

	const renderShiftGroup = (shifts: TemplateShiftData[]) => {
		return shifts.map(shift => {
			const shiftType = shiftTypes?.find(type => type.id === shift.shift_type_id);
			if (!shiftType) return null;

			const baseHeight = 24;
			const spacing = 6;

			const scaledBaseHeight = baseHeight * zoomLevel;
			const scaledSpacing = spacing * zoomLevel;

			const totalHeight = (scaledBaseHeight * shift.required_count) +
				(scaledSpacing * (shift.required_count - 1));

			return (
				<div
					key={shift.id}
					className="p-1 first:pt-2 last:pb-2 relative"
					style={{
						height: `${totalHeight + 32}px`,
						minHeight: `${totalHeight + 32}px`
					}}
				>
					<div className="text-xs font-medium text-gray-500 mb-1 px-1">
						{shift.required_count > 1 ? `${shift.required_count}x ${shiftType.name}` : shiftType.name}
					</div>
					<div className="relative">
						{Array.from({ length: shift.required_count }).map((_, i) => (
							<div
								key={`${shiftType.id}-${i}`}
								className={`absolute rounded border ${shiftColors[shiftType.id]} 
									bg-opacity-50 transition-all hover:bg-opacity-75
									flex items-center justify-center text-xs shadow-sm hover:shadow-md
									cursor-pointer`}
								style={{
									height: `${scaledBaseHeight}px`,
									top: `${i * (scaledBaseHeight + scaledSpacing)}px`,
									left: 0,
									right: 0
								}}
							>
								{shiftType.name}
							</div>
						))}
					</div>
					<div className="absolute bottom-0 left-2 right-2 border-b border-gray-200 last:border-0" />
				</div>
			);
		});
	};

	if (!template || !shiftTypes) {
		return (
			<Card className="h-96">
				<CardContent className="h-full flex items-center justify-center text-gray-500">
					<Calendar className="w-8 h-8 mr-2" />
					<span>No template or shift types available</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
			<CardHeader className="border-b bg-white sticky top-0 z-20">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg font-medium">
						Schedule Playground
					</CardTitle>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={toggleFullScreen}
							className="hover:bg-gray-100"
						>
							{isFullScreen ? (
								<Minimize2 className="h-4 w-4" />
							) : (
								<Maximize2 className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
				<div className="flex justify-between items-center pt-2">
					<div className="flex flex-wrap gap-2">
						{shiftTypes.map(type => (
							<div
								key={type.id}
								className={`px-3 py-1.5 rounded-full text-xs font-medium ${shiftColors[type.id]} 
									shadow-sm transition-all hover:shadow-md cursor-pointer`}
							>
								{type.name}
							</div>
						))}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleTimeRangeChange('left')}
							disabled={visibleHoursStart === 0}
							className="hover:bg-gray-100"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={handleZoomOut}
							disabled={zoomLevel <= 0.5}
							className="hover:bg-gray-100"
						>
							<ZoomOut className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={handleZoomIn}
							disabled={zoomLevel >= 2}
							className="hover:bg-gray-100"
						>
							<ZoomIn className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleTimeRangeChange('right')}
							disabled={visibleHoursEnd === 24}
							className="hover:bg-gray-100"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className={`p-0 ${isFullScreen ? 'h-[calc(100vh-9rem)]' : ''}`}>
				<ScrollArea className={`${isFullScreen ? 'h-full' : 'max-h-[calc(100vh-16rem)] overflow-y-scroll'}`}>
					<div className="p-2 max-h-[500px]">
						<Table>
							<TableHeader className="sticky top-0 bg-white z-10">
								<TableRow>
									<TableHead className="w-16 px-2 bg-gray-50">Time</TableHead>
									{dates.map(date => (
										<TableHead
											key={date.toISOString()}
											className="text-center p-1 bg-gray-50"
											style={{ minWidth: `${80 * zoomLevel}px` }}
										>
											<div className="flex flex-col">
												<span className="text-xs text-gray-500">
													{date.toLocaleDateString('en-US', { weekday: 'short' })}
												</span>
												<span className="font-medium">{date.getDate()}</span>
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{timeSlots
									.filter(slot => {
										const hour = parseInt(slot.split(':')[0]);
										return hour >= visibleHoursStart && hour < visibleHoursEnd;
									})
									.map(timeSlot => (
										<TableRow key={timeSlot} className="hover:bg-gray-50">
											<TableCell className="font-mono text-xs px-2 whitespace-nowrap bg-gray-50">
												{timeSlot}
											</TableCell>
											{dates.map(date => (
												<TableCell
													key={`${date.toISOString()}-${timeSlot}`}
													className="p-0 border-gray-200"
													style={{
														minHeight: `${48 * zoomLevel}px`,
														verticalAlign: 'top'
													}}
												>
													{renderShiftGroup(
														template.shifts.filter(shift => {
															const shiftRanges = shift.ranges.some(range => {
																const startHour = range.start_time.split(':')[0];
																return startHour === timeSlot.split(':')[0];
															});
															return shift.day_of_week === date.getDay() && shiftRanges;
														})
													)}
												</TableCell>
											))}
										</TableRow>
									))}
							</TableBody>
						</Table>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default ScheduleEditable;
