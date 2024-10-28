export interface TemplateSchedule {
	id?: number;
	team_id: number;
	name: string;
	start_date: Date;
	end_date: Date;
	notes?: string;
	shifts: TemplateShift[];
	constraints: TemplateConstraint[][];
	created_at?: Date;
}

export interface TemplateShift {
	id?: number;
	template_schedule_id: number;
	shift_type_id: number;
	shift_name: string;
	required_count: number;
	day_of_week: number;
	ranges: TemplateTimeRange[];
	created_at?: Date;
}

export interface TemplateTimeRange {
	id?: number;
	template_shift_id: number;
	start_time: string;
	end_time: string;
	created_at?: Date;
}

export interface TemplateConstraint {
	id?: number;
	template_schedule_id: number;
	shift_type: string;
	shift_type_id: number;
	next_shift_type_id?: number;
	created_at?: Date;
}
