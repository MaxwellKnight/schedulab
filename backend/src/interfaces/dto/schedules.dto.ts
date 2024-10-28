import { ShiftData } from "./shifts.dto";

export interface ScheduleData {
	id: number;
	team_id: number;  // New field to associate schedule with a team
	start_date: Date;
	end_date: Date;
	shifts: ShiftData[];
	remarks: RemarkData[];
	likes: number;
	notes: string | null;  // Changed to allow null values
	created_at: Date;
	published: boolean;  // New field to indicate if the schedule is published
	team_name?: string;  // Optional field for when joined with teams table
	rating?: number;  // Added rating field
}

export interface RemarkData {
	id: number;
	schedule_id: number;  // Added to explicitly show the relationship with Schedule
	content: string;
	created_at: Date;
}
