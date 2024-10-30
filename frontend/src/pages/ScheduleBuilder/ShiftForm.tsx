import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { ShiftData, TimeRange } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { Schedule, ScheduleAction } from './ScheduleBuilder';
import { Alert, AlertDescription } from "@/components/ui/alert";
import TimeRangeDialog from './TimeRangeDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createDateArray } from '@/lib/utils';

interface ShiftFormProps {
	form: UseFormReturn<Schedule>;
	schedule: Schedule;
	dispatch: React.Dispatch<ScheduleAction>;
	onBack: () => void;
	onNext: () => void;
	onSubmit: (data: Schedule) => void;
}


const ShiftForm: React.FC<ShiftFormProps> = ({ form, schedule, dispatch, onBack, onSubmit, onNext }) => {
	const [dateOptions, setDateOptions] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [newShiftType, setNewShiftType] = useState('');
	const [currentShift, setCurrentShift] = useState<ShiftData>({
		shift_type: 1,
		required_count: 1,
		users: [],
		likes: 0,
		shift_name: '',
		ranges: [],
		date: new Date(),
	});

	useEffect(() => {
		const startDate = new Date(schedule.start_date);
		const endDate = new Date(schedule.end_date);
		if (isValid(startDate) && isValid(endDate)) {
			setDateOptions(createDateArray(startDate, endDate));
		} else {
			console.error('Invalid start or end date in schedule', { startDate, endDate });
		}
	}, [schedule]);

	const handleShiftChange = (name: keyof ShiftData, value: Date | number | string | null) => {
		if (value !== null) {
			if (name === 'date') {
				const parsedDate = parse(value as string, 'yyyy-MM-dd', new Date());
				if (isValid(parsedDate)) {
					setCurrentShift(prev => ({ ...prev, [name]: parsedDate }));
				} else {
					console.error('Invalid date parsed', { value });
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
		if (currentShift.ranges.length === 0) {
			setErrorMessage("At least one time range is required");
			return;
		}
		if (currentShift.required_count < 1) {
			setErrorMessage("Required count must be at least 1");
			return;
		}

		dispatch({ type: 'ADD_SHIFT', payload: { ...currentShift, date: new Date(currentShift.date) } });

		setCurrentShift({
			shift_type: 1,
			required_count: 1,
			users: [],
			likes: 0,
			shift_name: '',
			ranges: [],
			date: startOfDay(new Date(schedule.start_date)),
		});
		setSuccessMessage("Shift added successfully");
	};

	const handleAddTimeRanges = (newRanges: TimeRange[]) => {
		setCurrentShift(prev => ({
			...prev,
			ranges: [...prev.ranges, ...newRanges]
		}));
	};

	const removeTimeRange = (index: number) => {
		setCurrentShift(prev => ({
			...prev,
			ranges: prev.ranges.filter((_, i) => i !== index)
		}));
	};

	const handleAddShiftType = () => {
		if (newShiftType.trim()) {
			const newId = Math.max(...schedule.types.map(t => t.id)) + 1;
			dispatch({ type: 'ADD_SHIFT_TYPE', payload: { id: newId, name: newShiftType.trim() } });
			setNewShiftType('');
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
					<h3 className="text-xl font-semibold mb-4">Add Shifts</h3>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}

					{successMessage && (
						<Alert variant="default" className="bg-green-50 text-green-800 border-green-300">
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
										<SelectTrigger>
											<SelectValue placeholder="Select shift type" />
										</SelectTrigger>
										<SelectContent>
											{schedule.types.map((type) => (
												<SelectItem key={type.id} value={type.id.toString()}>
													{type.name}
												</SelectItem>
											))}

											<Dialog>
												<DialogTrigger asChild>
													<Button variant="ghost" className="w-full justify-start">
														<Plus className="mr-2 h-4 w-4" /> Add Type
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Add New Shift Type</DialogTitle>
														<DialogDescription>
															Enter a name for the new shift type and click 'Add' to create it.
														</DialogDescription>
													</DialogHeader>
													<div className="flex items-center space-x-2">
														<Input
															value={newShiftType}
															onChange={(e) => setNewShiftType(e.target.value)}
															placeholder="Enter new shift type"
														/>
														<Button onClick={handleAddShiftType}>Add</Button>
													</div>
												</DialogContent>
											</Dialog>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Shift Date</FormLabel>
							<Select
								onValueChange={(value) => handleShiftChange('date', value)}
								value={format(currentShift.date, 'yyyy-MM-dd')}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select date" />
								</SelectTrigger>
								<SelectContent>
									{dateOptions.map((date) => (
										<SelectItem key={date} value={date}>
											{format(parse(date, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}
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
									min={1}
								/>
							</FormControl>
						</FormItem>
					</div>

					<TimeRangeDialog onAddRanges={handleAddTimeRanges} />

					{currentShift.ranges.length > 0 && (
						<div className="space-y-2">
							<FormLabel>Added Time Ranges</FormLabel>
							<ul className="space-y-2">
								{currentShift.ranges.map((range, index) => (
									<li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
										<span>
											{format(range.start_time, 'HH:mm')} - {format(range.end_time, 'HH:mm')}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeTimeRange(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
						</div>
					)}

					<Button type="button" onClick={addShift} className="w-full bg-sky-900 hover:bg-sky-800">
						<Plus className="mr-2 h-4 w-4" /> Add Shift
					</Button>
				</div>

				<div className="flex justify-between mt-6">
					<Button onClick={onBack} type="button" variant="outline">
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button onClick={onNext} type="button" className="bg-sky-700 hover:bg-sky-600">
						Next <ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ShiftForm;
