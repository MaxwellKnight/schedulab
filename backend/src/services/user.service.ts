import { User } from "../models";
import { UserData } from "../interfaces";
import { ParsedRecentShift, ParsedRecentVacation } from "../models/user.model";
import { UserRepository } from "../repositories";

type CreateUserData = Omit<UserData, 'id' | 'created_at' | 'recent_shifts' | 'recent_vacations'> & { password: string };
type UpdateUserData = Partial<UserData> & { id: number };

export class UserService {
	private readonly repo: UserRepository;

	constructor(repo: UserRepository) {
		this.repo = repo;
	}

	private transform(user: User): Omit<UserData, "password"> {
		const shifts = user.recent_shifts ? this.parseRecentShifts(user.recent_shifts.toString()) : [];
		const vacs = user.recent_vacations ? this.parseRecentVacations(user.recent_vacations.toString()) : [];

		return {
			id: user.id!,
			team_id: user.team_id,
			user_role: user.user_role,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			student: user.student,
			created_at: user.created_at,
			team_name: user.team_name,
			recent_shifts: shifts,
			recent_vacations: vacs
		};
	}

	private parseRecentShifts(shiftsString: string): ParsedRecentShift[] {
		if (!shiftsString) return [];

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
		if (!vacationsString) return [];

		return vacationsString.split(',').map(vacation => {
			const [id, start_date, end_date] = vacation.split(':');
			return {
				id: parseInt(id, 10),
				start_date,
				end_date
			};
		});
	}

	public async create(userData: CreateUserData): Promise<number> {
		const user: Omit<User, 'id' | 'recent_shifts' | 'recent_vacations' | 'team_name'> = {
			team_id: userData.team_id,
			user_role: userData.user_role,
			first_name: userData.first_name,
			last_name: userData.last_name,
			email: userData.email,
			password: userData.password,
			student: userData.student,
			created_at: new Date()
		};

		return await this.repo.create(user);
	}

	public async getOne(id: number): Promise<Omit<UserData, "password"> | null> {
		const user = await this.repo.getOne(id);
		if (!user) return null;

		return this.transform(user);
	}

	public async getMany(): Promise<Omit<UserData, "password">[]> {
		const users = await this.repo.getMany();
		return users.map(user => this.transform(user));
	}

	public async getByShiftId(id: number): Promise<Omit<UserData, "password">[]> {
		const users = await this.repo.getByShiftId(id);
		if (!users || users.length === 0) {
			throw new Error(`No users found for shift ${id}`);
		}
		return users.map(user => this.transform(user));
	}

	public async getByTeamId(team_id: number): Promise<Omit<UserData, "password">[]> {
		const users = await this.repo.getByTeamId(team_id);
		if (!users || users.length === 0) {
			throw new Error(`No users found for team ${team_id}`);
		}
		return users.map(user => this.transform(user));
	}

	public async getByEmail(email: string): Promise<UserData | null> {
		const user = await this.repo.getByEmail(email);
		if (!user) return null;
		return { ...this.transform(user), password: user.password };
	}

	public async update(userData: UpdateUserData): Promise<number> {
		const user: Partial<User> & { id: number } = {
			id: userData.id,
			...(userData.team_id !== undefined && { team_id: userData.team_id }),
			...(userData.user_role !== undefined && { user_role: userData.user_role }),
			...(userData.first_name !== undefined && { first_name: userData.first_name }),
			...(userData.last_name !== undefined && { last_name: userData.last_name }),
			...(userData.email !== undefined && { email: userData.email }),
			...(userData.student !== undefined && { student: userData.student }),
			...(userData.created_at !== undefined && { created_at: userData.created_at })
		};

		return await this.repo.update(user);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}
