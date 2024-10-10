export interface Schedule {
	id: number;
	start_date: Date;
	end_date: Date;
	shifts?: string;
	rating?: number,
	remarks?: string;
	likes: number;
	notes: string;
	created_at: Date;
}

export interface Remark{
	id: number;
	schedule_id: number;
	content: string;
	created_at: Date;
}