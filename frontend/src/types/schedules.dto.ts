import { ShiftData } from "./shifts.dto";

export interface ScheduleData {
	start_date: Date;
	end_date: Date;
	shifts: ShiftData[];
	remarks: RemarkData[] | number[];
	likes: number;
	notes: string;
}

export interface RemarkData {
	id: number;
	content: string;
}
