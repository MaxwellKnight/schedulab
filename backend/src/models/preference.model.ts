export interface Preference {
	id: number;
	user_id: number;
	start_date: Date;
	end_date: Date;
	notes: string | null;
	created_at: Date;
	daily_preferences?: DailyPreference[];
}

export interface DailyPreference {
	id: number;
	preference_id: number;
	date: Date;
	shift_type_id: number;
	shift_type_name?: string; // Optional, for when joined with shift_types
	preference_level: number;
	created_at: Date;
}
