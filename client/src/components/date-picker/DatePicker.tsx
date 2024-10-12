import React from 'react';
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { format, isValid, parseISO } from "date-fns";
import { useForm } from "react-hook-form";

interface DatePickerProps {
	label: string;
	selected: Date;
	onChange: (date: Date) => void;
	className?: string;
}

// Custom DatePicker component
const DatePicker: React.FC<DatePickerProps> = ({ label, selected, onChange, className }) => {
	const form = useForm();

	const formatDate = (date: Date): string => {
		if (date && isValid(date)) {
			return format(date, "yyyy-MM-dd");
		}
		return '';
	};

	return (
		<Form {...form}>
			<FormField
				name="date"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<Input
								type="date"
								value={formatDate(selected)}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									const date = e.target.value ? parseISO(e.target.value) : null;
									onChange(date || new Date());
									field.onChange(e);
								}}
								className={className}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</Form>
	);
};

interface TimePickerProps {
	label: string;
	selected: Date | null;
	onChange: (date: Date | null) => void;
	className?: string;
}

// Custom TimePicker component
const TimePicker: React.FC<TimePickerProps> = ({ label, selected, onChange, className }) => {
	const form = useForm();

	const formatTime = (date: Date | null): string => {
		if (date && isValid(date)) {
			return format(date, "HH:mm");
		}
		return '';
	};

	return (
		<Form {...form}>
			<FormField
				name="time"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<Input
								type="time"
								value={formatTime(selected)}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									if (selected && isValid(selected)) {
										const [hours, minutes] = e.target.value.split(':');
										const newDate = new Date(selected);
										newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
										onChange(newDate);
									} else {
										const now = new Date();
										const [hours, minutes] = e.target.value.split(':');
										now.setHours(parseInt(hours, 10), parseInt(minutes, 10));
										onChange(now);
									}
									field.onChange(e);
								}}
								className={className}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</Form>
	);
};

export { DatePicker, TimePicker };
