import { makeSQL } from "../configs/db.config";
import { Schedule } from "../models";
import { ShiftDataWithPublicUsers, ShiftService } from "./shift.service";
import { RemarkRepository, ScheduleRepository, ShiftRepository } from "../repositories";
import { ScheduleData } from "../interfaces";

// Update ScheduleData to use the public version of ShiftData
interface ScheduleDataWithPublicUsers extends Omit<ScheduleData, 'shifts'> {
	shifts: ShiftDataWithPublicUsers[];
}

type CreateScheduleData = Omit<ScheduleData, 'id' | 'created_at' | 'shifts' | 'remarks' | 'likes' | 'rating'>;
type UpdateScheduleData = Partial<ScheduleData> & { id: number };

export class ScheduleService {
	private readonly repo: ScheduleRepository;
	private readonly shift_service: ShiftService;
	private readonly remark_repo: RemarkRepository;

	constructor(repo: ScheduleRepository) {
		this.repo = repo;
		this.shift_service = new ShiftService(
			new ShiftRepository(makeSQL())
		);
		this.remark_repo = new RemarkRepository(makeSQL());
	}

	private async transform(schedule: Schedule): Promise<ScheduleDataWithPublicUsers> {
		const shifts = await this.shift_service.getByScheduleId(schedule.id!);
		const remarks = await this.remark_repo.getByScheduleId(schedule.id!);

		return {
			id: schedule.id!,
			team_id: schedule.team_id,
			start_date: schedule.start_date,
			end_date: schedule.end_date,
			shifts,
			remarks,
			likes: schedule.likes,
			notes: schedule.notes,
			created_at: schedule.created_at,
			published: schedule.published,
			rating: schedule.rating
		};
	}

	public async create(scheduleData: CreateScheduleData): Promise<number> {
		const schedule: Omit<Schedule, 'id' | 'shifts'> = {
			team_id: scheduleData.team_id,
			start_date: scheduleData.start_date,
			end_date: scheduleData.end_date,
			notes: scheduleData.notes,
			likes: 0,
			created_at: new Date(),
			published: scheduleData.published ?? false,
			rating: undefined
		};

		return await this.repo.create(schedule);
	}

	public async getOne(id: number): Promise<ScheduleDataWithPublicUsers | null> {
		const schedule = await this.repo.getOne(id);
		if (!schedule) return null;

		return this.transform(schedule);
	}

	public async getMany(): Promise<ScheduleDataWithPublicUsers[]> {
		const schedules = await this.repo.getMany();
		return Promise.all(schedules.map(schedule => this.transform(schedule)));
	}

	public async update(scheduleData: UpdateScheduleData): Promise<number> {
		if (scheduleData.shifts) {
			await Promise.all(scheduleData.shifts.map(shift =>
				this.shift_service.update({
					...shift,
					users: shift.users.map(user => typeof user === 'number' ? user : user.id)
				})
			));
		}

		const schedule: Partial<Schedule> & { id: number } = {
			id: scheduleData.id,
			...(scheduleData.team_id !== undefined && { team_id: scheduleData.team_id }),
			...(scheduleData.start_date !== undefined && { start_date: scheduleData.start_date }),
			...(scheduleData.end_date !== undefined && { end_date: scheduleData.end_date }),
			...(scheduleData.likes !== undefined && { likes: scheduleData.likes }),
			...(scheduleData.notes !== undefined && { notes: scheduleData.notes }),
			...(scheduleData.created_at !== undefined && { created_at: scheduleData.created_at }),
			...(scheduleData.published !== undefined && { published: scheduleData.published }),
			...(scheduleData.rating !== undefined && { rating: scheduleData.rating })
		};

		return await this.repo.update(schedule);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}

	public async getByUserId(id: number): Promise<ScheduleDataWithPublicUsers[]> {
		const schedules = await this.repo.getByUserId(id);
		return Promise.all(schedules.map(schedule => this.transform(schedule)));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<ScheduleDataWithPublicUsers[]> {
		const schedules = await this.repo.getByDates(start_date, end_date);
		return Promise.all(schedules.map(schedule => this.transform(schedule)));
	}

	public async getByTeamId(team_id: number): Promise<ScheduleDataWithPublicUsers[]> {
		const schedules = await this.repo.getByTeamId(team_id);
		return Promise.all(schedules.map(schedule => this.transform(schedule)));
	}

	public async publish(id: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (!schedule) {
			throw new Error(`Schedule not found with id: ${id}`);
		}

		return await this.repo.update({
			...schedule,
			published: true
		});
	}

	public async unpublish(id: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (!schedule) {
			throw new Error(`Schedule not found with id: ${id}`);
		}

		return await this.repo.update({
			...schedule,
			published: false
		});
	}

	public async rate(id: number, rating: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (!schedule) {
			throw new Error(`Schedule not found with id: ${id}`);
		}

		return await this.repo.update({
			...schedule,
			rating
		});
	}
}
