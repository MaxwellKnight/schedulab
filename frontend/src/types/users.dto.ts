import { VacationData } from "./vacations.dto";

export interface UserData {
	id: number;
	user_role: string;
	team_id: number;
	first_name: string;
	middle_name?: string,
	last_name: string;
	team_name: string;
	email: string;
	recent_vacations: Omit<VacationData, "user_id">[] | number[];
	student: boolean;
	created_at: Date;
}
