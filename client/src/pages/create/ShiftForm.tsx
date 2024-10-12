import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ScheduleData, ShiftData } from '@/types';
import { DatePicker, TimePicker } from '@/components/date-picker/DatePicker';
import { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, Plus } from 'lucide-react';

interface ShiftFormProps {
	form: UseFormReturn<ScheduleData>;
	schedule: ScheduleData;
	setSchedule: React.Dispatch<React.SetStateAction<ScheduleData>>;
	onBack: () => void;
	onSubmit: (data: ScheduleData) => void;
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

	const handleShiftChange = (name: string, value: Date | number | string | null) => {
		if (value !== null)
			setCurrentShift({ ...currentShift, [name]: value });
	};

	const addShift = () => {
		setSchedule(prev => ({
			...prev,
			shifts: [...prev.shifts, { ...currentShift, date: new Date(currentShift.date) }]
		}));
		setCurrentShift({
			shift_type: 1,
			required_count: 1,
			users: [],
			likes: 0,
			shift_name: '',
			start_time: new Date(),
			end_time: new Date(),
			date: new Date(),
		});
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
					<FormItem>
						<FormLabel>Required Count</FormLabel>
						<FormControl>
							<Input
								type="number"
								name="required_count"
								value={currentShift.required_count}
								onChange={e => handleShiftChange('required_count', parseInt(e.target.value, 10))}
								className="w-full"
							/>
						</FormControl>
					</FormItem>
					<DatePicker
						label="Shift Date"
						selected={currentShift.date}
						onChange={(date: Date | null) => handleShiftChange('date', date)}
						className="w-full"
					/>
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
					<Button onClick={addShift} type="button" className="w-full bg-green-600">
						<Plus className="mr-2 h-4 w-4" /> Add Shift
					</Button>
				</div>

				<div className="flex justify-between mt-6">
					<Button onClick={onBack} type="button" variant="outline">
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button type="submit" className='bg-sky-700'>Create Schedule</Button>
				</div>
			</form>
		</Form>
	);
};

export default ShiftForm;
