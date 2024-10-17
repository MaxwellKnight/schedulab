import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from '@/components/date-picker/DatePicker';
import { UseFormReturn } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import { Schedule, ScheduleAction } from './ScheduleBuilder';

interface ScheduleFormProps {
	form: UseFormReturn<Schedule>;
	schedule: Schedule;
	dispatch: React.Dispatch<ScheduleAction>;
	onNext: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ form, dispatch, onNext }) => {
	const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({ type: 'UPDATE_SCHEDULE', payload: { [e.target.name]: e.target.value } });
	};

	return (
		<div className='max-w-md'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
					<FormField
						control={form.control}
						name="start_date"
						rules={{ required: "Start date is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Date</FormLabel>
								<FormControl>
									<DatePicker
										label=''
										selected={field.value}
										onChange={(date: Date) => {
											field.onChange(date);
											dispatch({ type: 'UPDATE_SCHEDULE', payload: { start_date: date } });
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
						name="end_date"
						rules={{
							required: "End date is required",
							validate: (value) =>
								value > new Date() || "End date must be in the future"
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>End Date</FormLabel>
								<FormControl>
									<DatePicker
										label=''
										selected={field.value}
										onChange={(date: Date) => {
											field.onChange(date);
											dispatch({ type: 'UPDATE_SCHEDULE', payload: { end_date: date } });
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
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notes (Optional)</FormLabel>
								<FormControl>
									<Input
										{...field}
										onChange={(e) => {
											field.onChange(e);
											handleScheduleChange(e);
										}}
										className="w-full"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full bg-sky-700">
						Next <ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default ScheduleForm;
