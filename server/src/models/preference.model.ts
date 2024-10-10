
export interface Preference {
	id: number;
	user_id: number;
	start_date: Date;
	end_date: Date;
	daily_preferences?: string;
	notes: string | null;
	created_at: Date;
}

export interface DailyPreference {
	id: number;
	date: Date;
	preference_id: number;
	morning: number;
	noon: number;
	night: number;
	created_at: Date;
}
