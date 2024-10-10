import { ShiftData } from "./shifts.dto";

export interface ScheduleData {
	id: number;
	start_date: Date;
	end_date: Date;
	shifts: ShiftData[];
	remarks: RemarkData[] | number[];
	likes: number;
	notes: string;
	created_at: Date;
}

export interface RemarkData {
	id: number;
	content: string;
	created_at: Date;
}