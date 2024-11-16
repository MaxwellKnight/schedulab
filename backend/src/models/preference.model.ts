export interface PreferenceTemplate {
	id: number;
	team_id: number;
	name: string;
	start_date: Date;
	end_date: Date;
	status: 'draft' | 'published' | 'closed';
	created_by: number;
	created_at: Date;
	updated_at: Date;
	time_slots?: TimeSlot[];
}

export interface PreferenceTimeRange {
	id: number;
	preference_id: number;
	start_time: string; // Format: "HH:mm:ss"
	end_time: string;   // Format: "HH:mm:ss"
	created_at: Date;
}

export interface TimeSlot {
	id: number;
	template_id: number;
	date: Date;
	time_range_id: number;
	created_at: Date;
	time_range?: PreferenceTimeRange;
}

// Helper type for grouping time slots by date
export interface DailyTimeSlots {
	date: Date;
	time_slots: TimeSlot[];
}
