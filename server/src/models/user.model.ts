export interface User {
	id: number;
	user_role: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	recent_shifts?: string;
	recent_vacations?: string;
	password: string;
	email: string;
	student: boolean;
	created_at: Date;
}
