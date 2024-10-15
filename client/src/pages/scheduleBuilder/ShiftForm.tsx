import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { ScheduleData, ShiftData } from '@/types';
import { TimePicker } from '@/components/date-picker/DatePicker';
import { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { eachDayOfInterval, format, parse, isValid, startOfDay, isAfter } from 'date-fns';
import { ScheduleAction } from './ScheduleBuilder';

interface ShiftFormProps {
	form: UseFormReturn<ScheduleData>;
	schedule: ScheduleData;
	dispatch: React.Dispatch<ScheduleAction>;
	onBack: () => void;
	onNext: () => void;
	onSubmit: (data: ScheduleData) => void;
}

const createDateArray = (startDate: Date, endDate: Date): string[] => {
	if (startDate > endDate) {
		[startDate, endDate] = [endDate, startDate];
	}

	const dateArray = eachDayOfInterval({ start: startDate, end: endDate });
	return dateArray.map(date => format(date, 'yyyy-MM-dd'));
}

const ShiftForm: React.FC<ShiftFormProps> = ({ form, schedule, dispatch, onBack, onSubmit, onNext }) => {
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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

	const handleShiftChange = (name: keyof ShiftData, value: Date | number | string | null) => {
		if (value !== null) {
			if (name === 'date') {
				try {
					const parsedDate = parse(value as string, 'yyyy-MM-dd', new Date());
					if (isValid(parsedDate)) {
						setCurrentShift(prev => ({ ...prev, [name]: parsedDate }));
					} else {
						console.error('Invalid date parsed', { value });
					}
				} catch (error) {
					console.error('Error parsing date', { value, error });
				}
			} else {
				setCurrentShift(prev => ({ ...prev, [name]: value }));
			}
		}
	};

	const addShift = () => {
		setErrorMessage(null);
		setSuccessMessage(null);

		if (!currentShift.shift_name.trim()) {
			setErrorMessage("Shift name is required");
			return;
		}

		if (!isValid(currentShift.date)) {
			setErrorMessage("Invalid shift date");
			return;
		}

		if (!isValid(currentShift.start_time) || !isValid(currentShift.end_time)) {
			setErrorMessage("Invalid start or end time");
			return;
		}

		if (isAfter(currentShift.start_time, currentShift.end_time)) {
			setErrorMessage("Start time must be before end time");
			return;
		}

		if (currentShift.required_count < 1) {
			setErrorMessage("Required count must be at least 1");
			return;
		}

		if (isValid(currentShift.date)) {
			dispatch({ type: 'ADD_SHIFT', payload: { ...currentShift, date: new Date(currentShift.date) } });

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
			setSuccessMessage("Shift added successfully");
		} else {
			console.error('Attempted to add shift with invalid date', currentShift);
			setErrorMessage("Invalid shift date");
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
					{errorMessage && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
							<strong className="font-bold">Error:</strong>
							<span className="block sm:inline"> {errorMessage}</span>
						</div>
					)}
					{successMessage && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
							<strong className="font-bold">Success:</strong>
							<span className="block sm:inline"> {successMessage}</span>
						</div>
					)}
					<FormField
						control={form.control}
						name="shifts.0.shift_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Shift Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										value={currentShift.shift_name}
										onChange={(e) => {
											field.onChange(e.target.value);
											handleShiftChange('shift_name', e.target.value);
										}}
										className="w-full"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="shifts.0.shift_type"
						rules={{ required: "*Shift type is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Shift Type</FormLabel>
								<Select
									onValueChange={(value) => {
										field.onChange(parseInt(value, 10));
										handleShiftChange('shift_type', parseInt(value, 10));
									}}
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
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<FormItem>
							<FormLabel>Shift Date</FormLabel>
							<Select
								onValueChange={handleDateChange}
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
									value={currentShift.required_count}
									onChange={(e) => handleShiftChange('required_count', parseInt(e.target.value, 10) || 1)}
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
					<Button type="button" onClick={addShift} className="w-full bg-sky-900">
						<Plus className="mr-2 h-4 w-4" /> Add Shift
					</Button>
				</div>

				<div className="flex justify-between mt-6">
					<Button onClick={onBack} type="button" variant="outline">
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button onClick={onNext} type="button" className='cursor-pointer bg-sky-700'>
						Next <ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ShiftForm;
