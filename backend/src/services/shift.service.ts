import { Shift } from "../models";
import { makeSQL } from "../configs/db.config";
import { UserService } from "./user.service";
import { ShiftRepository, UserRepository } from "../repositories";
import { ShiftData } from "../interfaces";
import { ShiftType } from "../interfaces/dto/shifts.dto";
import { UserData } from "../interfaces";

// Define a public user type without sensitive data
type PublicUserData = Omit<UserData, 'password'>;

type CreateShiftData = Omit<ShiftData, 'id' | 'created_at' | 'actual_count' | 'likes'>;
type UpdateShiftData = Partial<ShiftData> & { id: number };

// Update ShiftData to use PublicUserData for users
export interface ShiftDataWithPublicUsers extends Omit<ShiftData, 'users'> {
	users: PublicUserData[];
}

export class ShiftService {
	private readonly repo: ShiftRepository;
	private readonly user_service: UserService;

	constructor(repo: ShiftRepository) {
		this.repo = repo;
		this.user_service = new UserService(
			new UserRepository(makeSQL())
		);
	}

	public async create(data: CreateShiftData): Promise<number> {
		const { users, time_ranges, ...rest } = data;
		const shiftToCreate: Omit<Shift, 'id' | 'created_at' | 'users'> = {
			...rest,
			likes: 0,
			timeRanges: time_ranges,
			actual_count: 0
		};

		const result = await this.repo.create(shiftToCreate);

		if (users && users.length > 0) {
			// TODO: Implement user association logic
			// This could involve creating user_shifts records
			// await Promise.all(users.map(user => this.repo.addUser(result, user.id)));
		}

		return result;
	}

	public async transform(shift: Shift): Promise<ShiftDataWithPublicUsers> {
		const users = await this.user_service.getByShiftId(shift.id!);
		return {
			...shift,
			users,
			time_ranges: shift.timeRanges,
		};
	}

	public async getOne(id: number): Promise<ShiftDataWithPublicUsers | null> {
		const shift = await this.repo.getOne(id);
		if (!shift) return null;
		return this.transform(shift);
	}

	public async getMany(): Promise<ShiftDataWithPublicUsers[]> {
		const shifts = await this.repo.getMany();
		return Promise.all(shifts.map(shift => this.transform(shift)));
	}

	public async getByDate(date: Date): Promise<ShiftDataWithPublicUsers[]> {
		const shifts = await this.repo.getByDate(date);
		return Promise.all(shifts.map(shift => this.transform(shift)));
	}

	public async getByName(name: string): Promise<ShiftDataWithPublicUsers[]> {
		const shifts = await this.repo.getByName(name);
		return Promise.all(shifts.map(shift => this.transform(shift)));
	}

	public async getByUserId(id: number): Promise<ShiftDataWithPublicUsers[]> {
		const shifts = await this.repo.getByUserId(id);
		return Promise.all(shifts.map(shift => this.transform(shift)));
	}

	public async getByScheduleId(id: number): Promise<ShiftDataWithPublicUsers[]> {
		const shifts = await this.repo.getByScheduleId(id);
		return Promise.all(shifts.map(shift => this.transform(shift)));
	}

	public async getTypes(team_id: number): Promise<ShiftType[]> {
		const types = await this.repo.getTypes(team_id);
		return types.map(({ id, team_id, name, created_at }) => ({
			id,
			team_id,
			name,
			created_at: new Date(created_at)
		}));
	}

	public async update(data: UpdateShiftData): Promise<number> {
		const { users, time_ranges, ...rest } = data;

		if (users) {
			// TODO: Implement user update logic
			// This could involve updating user_shifts records
			// await this.repo.updateUsers(data.id, users.map(u => u.id));
		}

		const shiftToUpdate: Partial<Shift> & { id: number } = {
			...rest,
			timeRanges: time_ranges
		};

		return await this.repo.update(shiftToUpdate);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}
