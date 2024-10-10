import { User } from "../models";
import { IUserService, IUserRepository, UserData } from "../interfaces";


export class UserService implements IUserService {

	private readonly repo: IUserRepository;

	constructor(repo: IUserRepository) {
		this.repo = repo;
	}

	public transform({ recent_shifts, recent_vacations, ...rest }: User): UserData {
		const shifts = recent_shifts?.split(',').map(Number);
		const vacs = recent_vacations?.split(',').map(Number);

		return {
			...rest,
			recent_shifts: shifts|| [],
			recent_vacations: vacs || []
		}
	}

	public async create({ user_role, first_name, last_name, email, student, password }: UserData): Promise<number> {
		return await this.repo.create({
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
		if(result.length === 0) return null;

		return this.transform(result[0]);
  	}
  
	public async getMany(): Promise<UserData[]> {
		const result = await this.repo.getMany();

		return result.map(this.transform);
	}

	public async getByShiftId(id: number): Promise<UserData[]> {
		const result = await this.repo.getByShiftId(id);
		if(!result) throw new Error("No users found");

		return Promise.all(result.map(this.transform));
	}

	public async getByEmail(email: string): Promise<UserData | null> {
		const result = await this.repo.getByEmail(email);
		if(!result || result.id === null) return null;
		return this.transform(result);
	}

	public async update({ id, user_role, first_name, last_name, email, student, created_at }: UserData): Promise<number> {
		return await this.repo.update({
			id,
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