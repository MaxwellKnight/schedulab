import { UserData } from "./users.dto";

export interface ShiftData {
	id: number;
	schedule_id: number;
	shift_type_id: number;  // Changed from shift_type to shift_type_id
	shift_type_name?: string;  // Added to store the name of the shift type
	required_count: number;
	actual_count: number;  // Added to match the database schema
	users: UserData[] | number[];
	likes: number;
	shift_name: string;
	time_ranges: TimeRange[];  // Changed to support multiple time ranges
	date: Date;
	created_at: Date;
}

export interface TimeRange {
	id?: number;  // Optional as it might not be set when creating a new time range
	start_time: Date;
	end_time: Date;
}
