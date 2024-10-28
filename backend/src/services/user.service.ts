import { User } from "../models";
import { IUserService, IUserRepository, UserData } from "../interfaces";
import { ParsedRecentShift, ParsedRecentVacation } from "../models/user.model";

export class UserService implements IUserService {
	private readonly repo: IUserRepository;

	constructor(repo: IUserRepository) {
		this.repo = repo;
	}

	public transform({ recent_shifts, recent_vacations, ...rest }: User): UserData {
		const shifts = recent_shifts ? this.parseRecentShifts(recent_shifts) : [];
		const vacs = recent_vacations ? this.parseRecentVacations(recent_vacations) : [];
		return {
			...rest,
			recent_shifts: shifts,
			recent_vacations: vacs
		}
	}

	private parseRecentShifts(shiftsString: string): ParsedRecentShift[] {
		return shiftsString.split(',').map(shift => {
			const [id, date, start_time, end_time, shift_type_id, shift_type_name] = shift.split(':');
			return {
				id: parseInt(id, 10),
				date,
				shift_name: shift_type_name,
				start_time,
				end_time,
				shift_type_id: parseInt(shift_type_id, 10),
				shift_type_name
			};
		});
	}

	private parseRecentVacations(vacationsString: string): ParsedRecentVacation[] {
		return vacationsString.split(',').map(vacation => {
			const [id, start_date, end_date] = vacation.split(':');
			return {
				id: parseInt(id, 10),
				start_date,
				end_date
			};
		});
	}

	public async create({ team_id, user_role, first_name, last_name, email, student, password }: UserData): Promise<number> {
		return await this.repo.create({
			team_id,
			user_role,
			first_name,
			last_name,
			email,
			password,
			student,
			created_at: new Date()
		});
	}

	public async getOne(id: number): Promise<UserData | null> {
		const result = await this.repo.getOne(id);
		if (result.length === 0) return null;
		return this.transform(result[0]);
	}

	public async getMany(): Promise<UserData[]> {
		const result = await this.repo.getMany();
		return result.map(user => this.transform(user));
	}

	public async getByShiftId(id: number): Promise<UserData[]> {
		const result = await this.repo.getByShiftId(id);
		if (!result) throw new Error("No users found");
		return Promise.all(result.map(user => this.transform(user)));
	}

	public async getByTeamId(team_id: number): Promise<UserData[]> {
		const result = await this.repo.getByTeamId(team_id);
		if (!result) throw new Error("No users found");
		return Promise.all(result.map(user => this.transform(user)));
	}

	public async getByEmail(email: string): Promise<UserData | null> {
		const result = await this.repo.getByEmail(email);
		if (!result || result.id === null) return null;
		return this.transform(result);
	}

	public async update({ id, team_id, user_role, first_name, last_name, email, student, created_at }: UserData): Promise<number> {
		return await this.repo.update({
			id,
			team_id,
			user_role,
			first_name,
			last_name,
			email,
			student,
			created_at,
		});
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}
