import { UserData } from "./users.dto";

export interface TimeRange {
	start_time: Date;
	end_time: Date;
}

export interface ShiftData {
	id: number,
	shift_type: number;
	required_count: number;
	users: UserData[] | number[];
	likes: number;
	shift_name: string;
	ranges: TimeRange[];
	date: Date;
}

export interface ShiftType {
	id: number;
	team_id: number;
	name: string;
	created_at: Date;
}
