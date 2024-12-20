export interface TimeRangePreferences {
	id: number;
	preference_id: number;
	start_time: string;
	end_time: string;
	created_at: string;
}

export interface TimeSlot {
	id: number;
	template_id: number;
	date: string;
	time_range_id: number;
	created_at: string;
	time_range: TimeRangePreferences;
}

export interface DaySchedule {
	date: string;
	slots: TimeSlot[];
}

export interface SchedulePreferences {
	id: number;
	name: string;
	time_slots: DaySchedule[];
}
