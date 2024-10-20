import { makeSQL } from "../configs/db.config";
import { Schedule } from "../models";
import { ShiftService } from "./shift.service";
import { RemarkRepository, ShiftRepository, } from "../repositories";
import { IScheduleService, IScheduleRepository, IShiftService, IRemarkRepository, ScheduleData } from "../interfaces";

export class ScheduleService implements IScheduleService {
	private readonly repo: IScheduleRepository;
	private readonly shifts_service: IShiftService;
	private readonly remark_repo: IRemarkRepository;

	constructor(repo: IScheduleRepository) {
		this.repo = repo;
		this.shifts_service = new ShiftService(
			new ShiftRepository(makeSQL())
		);
		this.remark_repo = new RemarkRepository(makeSQL());
	}

	public async transform({ id, team_id, start_date, end_date, notes, likes, created_at, published, rating }: Schedule): Promise<ScheduleData> {
		const shifts = await this.shifts_service.getByScheduleId(id);
		const remarks = await this.remark_repo.getByScheduleId(id);
		return {
			id,
			team_id,
			start_date,
			end_date,
			shifts,
			remarks,
			likes,
			notes,
			created_at,
			published,
			rating
		};
	}

	public async create({ team_id, start_date, end_date, notes, published = false }: ScheduleData): Promise<number> {
		return await this.repo.create({
			team_id,
			start_date,
			end_date,
			notes,
			likes: 0,
			created_at: new Date(),
			published,
			rating: undefined
		});
	}

	public async getOne(id: number): Promise<ScheduleData | null> {
		const result = await this.repo.getOne(id);
		if (result.length === 0) return null;
		return this.transform(result[0]);
	}

	public async getMany(): Promise<ScheduleData[]> {
		const res = await this.repo.getMany();
		return await Promise.all(res.map(async (schedule) => this.transform(schedule)));
	}

	public async update({ id, team_id, start_date, end_date, created_at, notes, shifts, likes, published, rating }: ScheduleData): Promise<number> {
		for await (const shift of shifts) {
			await this.shifts_service.update(shift);
		}
		return await this.repo.update({
			id,
			team_id,
			start_date,
			end_date,
			likes,
			notes,
			created_at,
			published,
			rating
		});
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}

	public async getByUserId(id: number): Promise<ScheduleData[]> {
		const result = await this.repo.getByUserId(id);
		return Promise.all(result.map(async (schedule) => this.transform(schedule)));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<ScheduleData[]> {
		const result = await this.repo.getByDates(start_date, end_date);
		return Promise.all(result.map(async (schedule) => this.transform(schedule)));
	}

	public async getByTeamId(team_id: number): Promise<ScheduleData[]> {
		const result = await this.repo.getByTeamId(team_id);
		return Promise.all(result.map(async (schedule) => this.transform(schedule)));
	}

	public async publish(id: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (schedule.length === 0) {
			throw new Error("Schedule not found");
		}
		return await this.repo.update({ ...schedule[0], published: true });
	}

	public async unpublish(id: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (schedule.length === 0) {
			throw new Error("Schedule not found");
		}
		return await this.repo.update({ ...schedule[0], published: false });
	}

	public async rate(id: number, rating: number): Promise<number> {
		const schedule = await this.repo.getOne(id);
		if (schedule.length === 0) {
			throw new Error("Schedule not found");
		}
		return await this.repo.update({ ...schedule[0], rating });
	}
}
