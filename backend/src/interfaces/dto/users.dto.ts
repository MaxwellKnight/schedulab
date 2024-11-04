export interface UserData {
	id: number;
	google_id?: string;
	display_name?: string;
	picture?: string;
	user_role: string;
	first_name: string;
	middle_name?: string;
	last_name: string;
	email: string;
	password: string;  // Made optional as it's not always needed (e.g., when fetching user data)
	recent_shifts: ParsedRecentShift[];
	recent_vacations: ParsedRecentVacation[];
	created_at: Date;
}

export interface ParsedRecentShift {
	id: number;
	shift_type_id: number;
	shift_type_name?: string;
	shift_name: string;
	date: string;
	start_time: string;
	end_time: string;
}

export interface ParsedRecentVacation {
	id: number;
	start_date: string;
	end_date: string;
}
