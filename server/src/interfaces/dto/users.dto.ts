export interface UserData {
	id: number;
	team_id: number;  // New field to associate user with a team
	user_role: string;
	first_name: string;
	middle_name?: string;
	last_name: string;
	email: string;
	password: string;  // Made optional as it's not always needed (e.g., when fetching user data)
	recent_shifts: ParsedRecentShift[];
	recent_vacations: ParsedRecentVacation[];
	student: boolean;
	created_at: Date;
	team_name?: string;  // Optional field for when joined with teams table
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
