
export interface Shift {
	id: number;
	schedule_id: number;
	shift_type: number;
	required_count: number;
	shift_name: string;
	start_time: Date; 
	users?: string;
	likes: number;
	end_time: Date; 
	date: Date;
	created_at: Date;
}

export interface UserShifts {
	id: number;
	user_id: number;
	shift_id: number;
	created_at: Date;
}