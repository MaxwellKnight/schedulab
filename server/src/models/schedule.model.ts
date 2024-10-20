export interface Schedule {
	id: number;
	team_id: number;
	start_date: Date;
	end_date: Date;
	shifts?: string;
	rating?: number;
	likes: number;
	notes: string | null;
	created_at: Date;
	published: boolean;
	team_name?: string;
	remarks?: Remark[];
}

export interface Remark {
	id: number;
	schedule_id: number;
	content: string;
	created_at: Date;
}

export interface ParsedShift {
	id: number;
	shift_type_id: number;
	shift_name: string;
	date: string;
	time_ranges: { start_time: string, end_time: string }[];
	required_count: number;
	actual_count: number;
}

export const parseShifts = (shiftsString: string): ParsedShift[] => {
	return shiftsString.split(',').map(shift => {
		const [id, shift_type_id, shift_name, date, time_ranges, required_count, actual_count] = shift.split(':');
		return {
			id: parseInt(id, 10),
			shift_type_id: parseInt(shift_type_id, 10),
			shift_name,
			date,
			time_ranges: time_ranges.split(';').map(range => {
				const [start_time, end_time] = range.split('-');
				return { start_time, end_time };
			}),
			required_count: parseInt(required_count, 10),
			actual_count: parseInt(actual_count, 10)
		};
	});
}
