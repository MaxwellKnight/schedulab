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

export interface PreferenceSubmission {
	id: number;
	template_id: number;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at: Date | null;
	notes: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface PreferenceSubmissionSlot {
	id: number;
	member_preference_id: number;
	template_time_slot_id: number;
	preference_level: number; // 1-5 scale
	created_at: Date;

	// additional context (not stored in DB, but useful for processing)
	date?: Date;
	start_time?: string;
	end_time?: string;
}

export interface CreatePreferenceSubmissionData {
	template_id: number;
	user_id: number;
	status?: 'draft' | 'submitted';
	notes?: string | null;
}

export interface CreatePreferenceSubmissionSlotData {
	template_time_slot_id: number;
	preference_level: number;
}

export interface PreferenceSubmissionWithSlots {
	submission: PreferenceSubmission;
	slots: PreferenceSubmissionSlot[];
}

export interface CreatePreferenceSubmissionData {
	template_id: number;
	status?: 'draft' | 'submitted';
	notes?: string | null;
}

export interface PreferenceSubmissionSlotData {
	id: number;
	member_preference_id: number;
	template_time_slot_id: number;
	preference_level: number;
	created_at: Date;
	date?: Date;
	start_time?: string;
	end_time?: string;
}

export const PREFERENCE_LEVEL_MIN = 1;
export const PREFERENCE_LEVEL_MAX = 5;
