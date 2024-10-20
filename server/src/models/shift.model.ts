export interface TimeRange {
	id?: number;
	shift_id?: number;
	start_time: Date;
	end_time: Date;
}

export interface Shift {
	id: number;
	schedule_id: number;
	shift_type_id: number;
	shift_type_name?: string;
	required_count: number;
	actual_count: number;
	shift_name: string;
	timeRanges: TimeRange[];
	users?: string;
	likes: number;
	date: Date;
	created_at: Date;
}

export interface UserShifts {
	id: number;
	user_id: number;
	shift_id: number;
	created_at: Date;
}
