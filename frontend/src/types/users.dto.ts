import { VacationData } from "./vacations.dto";

export interface UserData {
	id: number;
	user_role: string;
	team_id: number;
	picture?: string;
	first_name: string;
	middle_name?: string,
	last_name: string;
	team_name: string;
	email: string;
	recent_vacations: Omit<VacationData, "user_id">[] | number[];
	student: boolean;
	created_at: Date;
}

export interface TokenPayload {
	id: number;
	email?: string;
	google_id?: string;
	display_name?: string;
	picture?: string;
	exp: number;
	iat: number;
}

export interface Team {
	id: number;
	name: string;
	creator_id: number;
	team_code: string;
	created_at: Date;
}
