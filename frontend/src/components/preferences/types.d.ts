import { LucideIcon } from "lucide-react";

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


export type NavigationItemId = 'view' | 'create' | 'settings' | 'history'; // Add more options as needed

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
