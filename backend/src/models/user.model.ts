export interface User {
	id: number;
	team_id: number;
	google_id?: string;
	picture?: string;
	display_name?: string;
	user_role: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	password: string;
	email: string;
	created_at: Date;
	recent_shifts?: number[];
	recent_vacations?: number[];
	team_name?: string;
}

export interface ParsedRecentShift {
	id: number;
	date: string;
	shift_name: string;
	start_time: string;
	end_time: string;
	shift_type_id: number;
	shift_type_name?: string;
}

export interface ParsedRecentVacation {
	id: number;
	start_date: string;
	end_date: string;
}
