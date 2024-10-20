export interface PreferenceData {
	id: number;
	user_id: number;
	start_date: Date;
	end_date: Date;
	daily_preferences: DailyPreferenceData[];
	notes: string | null;
	created_at: Date;
}

export interface DailyPreferenceData {
	id: number;
	preference_id: number;  // Added to explicitly show the relationship with Preference
	date: Date;
	shift_type_id: number;  // Changed from specific shift types to a general shift_type_id
	shift_type_name?: string;  // Optional field for when joined with shift_types table
	preference_level: number;  // Replaces specific shift type fields with a general preference level
	created_at: Date;
}
