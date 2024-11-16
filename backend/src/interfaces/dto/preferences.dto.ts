import { PreferenceTimeRange } from "../../models";

export interface PreferenceTemplateData {
	id: number;
	team_id: number;
	name: string;
	start_date: Date;
	end_date: Date;
	status: 'draft' | 'published' | 'closed';
	created_by: number;
	created_at: Date;
	updated_at: Date;
	time_slots: TimeSlotData[];
}

export interface TimeSlotData {
	id: number;
	template_id: number;
	date: Date;
	time_range_id: number;
	created_at: Date;
	time_range?: PreferenceTimeRange;
}
