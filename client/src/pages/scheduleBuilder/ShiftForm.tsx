import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ScheduleData, ShiftData } from '@/types';
import { TimePicker } from '@/components/date-picker/DatePicker';
import { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { eachDayOfInterval, format, parse, isValid, startOfDay } from 'date-fns';

interface ShiftFormProps {
	form: UseFormReturn<ScheduleData>;
	schedule: ScheduleData;
	setSchedule: React.Dispatch<React.SetStateAction<ScheduleData>>;
	onBack: () => void;
	onSubmit: (data: ScheduleData) => void;
}

const createDateArray = (startDate: Date, endDate: Date): string[] => {
	if (startDate > endDate) {
		[startDate, endDate] = [endDate, startDate];
	}

	const dateArray = eachDayOfInterval({ start: startDate, end: endDate });
	return dateArray.map(date => format(date, 'yyyy-MM-dd'));
}

const ShiftForm: React.FC<ShiftFormProps> = ({ form, schedule, setSchedule, onBack, onSubmit }) => {
	const [currentShift, setCurrentShift] = useState<ShiftData>({
		shift_type: 1,
		required_count: 1,
		users: [],
		likes: 0,
		shift_name: '',
		start_time: new Date(),
		end_time: new Date(),
		date: new Date(),
	});
	const [dateOptions, setDateOptions] = useState<string[]>([]);

	useEffect(() => {
		const startDate = new Date(schedule.start_date);
		const endDate = new Date(schedule.end_date);

		if (isValid(startDate) && isValid(endDate)) {
			const dates = createDateArray(startDate, endDate);
			setDateOptions(dates);
		} else {
			console.error('Invalid start or end date in schedule', { startDate, endDate });
		}
	}, [schedule]);

	const handleShiftChange = (name: string, value: Date | number | string | null) => {
		if (value !== null) {
			if (name === 'date') {
				try {
					const parsedDate = parse(value as string, 'yyyy-MM-dd', new Date());
					if (isValid(parsedDate)) {
						setCurrentShift({ ...currentShift, [name]: parsedDate });
					} else {
						console.error('Invalid date parsed', { value });
					}
				} catch (error) {
					console.error('Error parsing date', { value, error });
				}
			} else {
				setCurrentShift({ ...currentShift, [name]: value });
			}
		}
	};

	const addShift = () => {
		if (isValid(currentShift.date)) {
			setSchedule(prev => ({
				...prev,
				shifts: [...prev.shifts, { ...currentShift, date: new Date(currentShift.date) }]
			}));

			const firstAvailableDate = dateOptions.length > 0
				? parse(dateOptions[0], 'yyyy-MM-dd', new Date())
				: startOfDay(new Date(schedule.start_date));
			setCurrentShift({
				shift_type: 1,
				required_count: 1,
				users: [],
				likes: 0,
				shift_name: '',
				start_time: new Date(),
				end_time: new Date(),
				date: firstAvailableDate,
			});
		} else {
			console.error('Attempted to add shift with invalid date', currentShift);
		}
	};
	const handleDateChange = (value: string) => {
		try {
			const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
			if (isValid(parsedDate)) {
				setCurrentShift(prev => ({ ...prev, date: parsedDate }));
			} else {
				console.error('Invalid date selected', { value });
			}
		} catch (error) {
			console.error('Error parsing selected date', { value, error });
		}
	};

	const formatDate = (date: Date): string => {
		try {
			if (isValid(date)) {
				return format(date, 'yyyy-MM-dd');
			} else {
				console.error('Attempted to format invalid date', { date });
				return '';
			}
		} catch (error) {
			console.error('Error formatting date', { date, error });
			return '';
		}
	};
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Add Shifts</h3>
					<FormItem>
						<FormLabel>Shift Name</FormLabel>
						<FormControl>
							<Input
								name="shift_name"
								value={currentShift.shift_name}
								onChange={e => handleShiftChange('shift_name', e.target.value)}
								className="w-full"
							/>
						</FormControl>
					</FormItem>
					<FormItem>
						<FormLabel>Shift Type</FormLabel>
						<Select
							onValueChange={value => handleShiftChange('shift_type', parseInt(value, 10))}
							value={currentShift.shift_type.toString()}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select shift type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Morning</SelectItem>
								<SelectItem value="2">Afternoon</SelectItem>
								<SelectItem value="3">Night</SelectItem>
							</SelectContent>
						</Select>
					</FormItem>
					<div className="grid grid-cols-2 gap-4">
						<FormItem>
							<FormLabel>Shift Date</FormLabel>
							<Select
								onValueChange={handleDateChange}
								defaultValue={formatDate(currentShift.date)}
								value={formatDate(currentShift.date)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select date" />
								</SelectTrigger>
								<SelectContent>
									{dateOptions.map((date) => (
										<SelectItem key={date} value={date}>
											{formatDate(parse(date, 'yyyy-MM-dd', new Date()))}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormItem>
						<FormItem>
							<FormLabel>Required Count</FormLabel>
							<FormControl>
								<Input
									type="number"
									name="required_count"
									value={currentShift.required_count}
									onChange={e => handleShiftChange('required_count', parseInt(e.target.value, 10) || 1)}
									className="w-full"
								/>
							</FormControl>
						</FormItem>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<TimePicker
							label="Start Time"
							selected={currentShift.start_time}
							onChange={(time: Date | null) => handleShiftChange('start_time', time)}
							className="w-full"
						/>
						<TimePicker
							label="End Time"
							selected={currentShift.end_time}
							onChange={(time: Date | null) => handleShiftChange('end_time', time)}
							className="w-full"
						/>
					</div>
					<Button onClick={addShift} type="button" className="w-full bg-sky-900">
						<Plus className="mr-2 h-4 w-4" /> Add Shift
					</Button>
				</div>

				<div className="flex justify-between mt-6">
					<Button onClick={onBack} type="button" variant="outline">
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button type="submit" className='bg-sky-700'>
						Next <ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ShiftForm;
