// preferences.dto.ts
import { PreferenceTimeRange } from "../../models";

export interface PreferenceTemplateData {
	id: number;
	team_id: number;
	name: string;
	start_date: Date;
	end_date: Date;
	status: 'draft' | 'published' | 'closed';
	creator: number;
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
	time_range?: TimeRangeData;
}

export interface TimeRangeData extends Omit<PreferenceTimeRange, "preference_id" | "id"> {
	id?: number;
	preference_id?: number;
}

export interface MemberPreferenceData {
	id: number;
	template_id: number;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at?: Date | null;  // Using undefined instead of null
	notes?: string | null;      // Using undefined instead of null
	created_at: Date;
	updated_at: Date;
}
