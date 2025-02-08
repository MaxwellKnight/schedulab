import { LucideIcon } from "lucide-react";

export interface PreferenceTemplate {
	id: number;
	team_id: number;
	name: string;
	start_date: string;
	end_date: string;
	status: string;
	time_slots: Array<{
		id: number;
		date: string;
		time_range: {
			start_time: string;
			end_time: string;
		};
	}>;
}

export interface PreferenceRange {
	start_time: string;
	end_time: string;
}

export interface DailyPreference {
	column: Date;
	ranges: PreferenceRange[];
}

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

export interface ScheduleData {
	id: number;
	name: string;
	time_slots: DaySchedule[];
}


export type NavigationItemId = 'view' | 'playground' | 'settings' | 'history'; // Add more options as needed

export interface NavigationItem {
	id: NavigationItemId;
	label: string;
	icon: LucideIcon;
	description: string;
	enabled?: boolean;
	requiresAdmin?: boolean;
}

export interface PreferencesNavigationConfig {
	items: NavigationItem[];
	defaultView: NavigationItemId;
}

export interface Template {
	id: number;
	name: string;
}

export interface Slot {
	id: number;
	submission_id?: number;
	member_preference_id?: number;
	template_time_slot_id: number;
	preference_level: number;
	created_at: string;
	date: string;
	start_time: string;
	end_time: string;
}

export interface SubmissionData {
	id: number;
	template_id: number;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface Submission extends SubmissionData {
	slots?: Slot[];
	template?: {
		id: number;
		name: string;
	};
}

export type SortColumn = 'template_id' | 'status' | 'slots' | 'submitted_at' | 'created_at' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

