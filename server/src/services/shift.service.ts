import { Shift } from "../models";
import { makeSQL } from "../configs/db.config";
import { UserService } from "./user.service";
import { UserRepository } from "../repositories";
import { IShiftService, IShiftRepository, IUserService, ShiftData } from "../interfaces";

export class ShiftService implements IShiftService {
	private readonly repo: IShiftRepository;
	private readonly user_service: IUserService

	constructor(repo: IShiftRepository) {
		this.repo = repo;
		this.user_service = new UserService(
			new UserRepository(makeSQL())
		);
	}

	public async create({ users, ...rest }: ShiftData): Promise<number> {
		const result =  await this.repo.create({...rest});
		return result;
	}

	public async transform(shift: Shift): Promise<ShiftData> {
		const users = await this.user_service.getByShiftId(shift.id);
		return {
			...shift,
			users,
		}
	}

	public async getOne(id: number): Promise<ShiftData | null> {
		const shift = await this.repo.getOne(id);
		if(shift.length === 0) return null;


		return this.transform(shift[0]);
	}

	public async getMany(): Promise<ShiftData[]> {
		const result =  await this.repo.getMany();

		return Promise.all(result.map(shift => this.transform(shift)));
	}

	public async getByDate(date: Date): Promise<ShiftData[]> {
		const result = await this.repo.getByDate(date);

		return Promise.all(result.map(shift => this.transform(shift)));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<ShiftData[]> {
		const result = await this.repo.getByDates(start_date, end_date);

		return Promise.all(result.map(shift => this.transform(shift)));
	}

	public async getByName(name: string): Promise<ShiftData[]>  {
		const result = await this.repo.getByName(name);

		return Promise.all(result.map(shift => this.transform(shift)));
	}
	public async getByUserId (id: number): Promise<ShiftData[]> {
		const result = await this.repo.getByUserId(id);

		return Promise.all(result.map(shift => this.transform(shift)));
	}
	public async getByScheduleId (id: number): Promise<ShiftData[]> {
		const result = await this.repo.getByScheduleId(id);

		return Promise.all(result.map(shift => this.transform(shift)));
	}

	public async update({users, ...rest}: ShiftData): Promise<number> {
		return await this.repo.update({...rest});
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}