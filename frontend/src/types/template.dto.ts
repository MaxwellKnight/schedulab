export interface TemplateScheduleData {
	id?: number;
	team_id: number;
	name: string;
	start_date: Date;
	end_date: Date;
	notes?: string;
	shifts: TemplateShiftData[];
	constraints: TemplateConstraintData[][];
	created_at?: Date;
}

export interface TemplateShiftData {
	id?: number;
	template_schedule_id: number;
	shift_type_id: number;
	shift_name: string;
	required_count: number;
	day_of_week: number;
	ranges: TemplateTimeRangeData[];
	created_at?: Date;
}

export interface TemplateTimeRangeData {
	id?: number;
	template_shift_id: number;
	start_time: string;
	end_time: string;
	created_at?: Date;
}

export interface TemplateConstraintData {
	id?: number;
	template_schedule_id: number;
	shift_type_id: number;
	next_shift_type_id?: number;
	created_at?: Date;
}
