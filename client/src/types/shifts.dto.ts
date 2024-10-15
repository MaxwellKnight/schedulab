import { UserData } from "./users.dto";

export interface TimeRange {
	start_time: Date;
	end_time: Date;
}

export interface ShiftData {
	shift_type: number;
	required_count: number;
	users: UserData[] | number[];
	likes: number;
	shift_name: string;
	ranges: TimeRange[];
	date: Date;
}
