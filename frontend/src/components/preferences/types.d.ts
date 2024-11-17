export interface PreferenceRange {
	start_time: string;
	end_time: string;
}

export interface DailyPreference {
	column: Date;
	ranges: PreferenceRange[];
}
