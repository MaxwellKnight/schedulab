import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { eachDayOfInterval, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}



export const createDateArray = (startDate: Date, endDate: Date): string[] => {
	if (startDate > endDate) {
		[startDate, endDate] = [endDate, startDate];
	}
	return eachDayOfInterval({ start: startDate, end: endDate })
		.map(date => format(date, 'yyyy-MM-dd'));
};

