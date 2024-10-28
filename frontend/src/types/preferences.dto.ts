export interface PreferenceData {
	id: number;
	user_id: number;
	start_date: Date;
	end_date: Date;
	daily_preferences: DailyPreferenceData[];
	notes?: string | null;
	created_at: Date;
}

export interface DailyPreferenceData {
	id: number;
	date: Date;
	morning: number;
	noon: number;
	night: number;
	created_at: Date;
}