import { UserData } from "./users.dto";

export interface ShiftData{
	id: number;
	schedule_id: number;
	shift_type: number;
	required_count: number;
	users: UserData[] | number[];
	likes: number;
	shift_name: string;
	start_time: Date; 
	end_time: Date; 
	date: Date;
	created_at: Date;
}