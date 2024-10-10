import { makeSQL } from "../configs/db.config";
import { Schedule } from "../models";
import { ShiftService } from "./shift.service";
import { ShiftRepository } from "../repositories";
import { IScheduleService, IScheduleRepository, IShiftService, ScheduleData } from "../interfaces";

export class ScheduleService implements IScheduleService {
	private readonly repo: IScheduleRepository;
	private readonly shifts_service: IShiftService;

	constructor(repo: IScheduleRepository) {
		this.repo = repo;
		this.shifts_service = new ShiftService(
			new ShiftRepository(makeSQL())
		);
	}
	public async transform({ id, start_date, end_date, notes, likes, created_at }: Schedule): Promise<ScheduleData> {
		return {
			id,
			start_date,
			end_date,
			shifts: await this.shifts_service.getByScheduleId(id),
			remarks: [],
			likes,
			notes,
			created_at
		}
	}
	public async create({ start_date, end_date, notes }: ScheduleData): Promise<number> {
		return await this.repo.create({
			start_date,
			end_date,
			notes,
			likes: 0,
			created_at: new Date()
		});
	}

	public async getOne(id: number): Promise<ScheduleData | null> {
		const result = await this.repo.getOne(id);
		if(result.length === 0) return null

		return this.transform(result[0]);
	}

	public async getMany(): Promise<ScheduleData[]> {
		const res = await this.repo.getMany();

		return await Promise.all(res.map(async (schedule) => {
			return this.transform(schedule);
		}));
	}

	public async update({id, start_date, end_date, created_at, notes, shifts, likes}: ScheduleData): Promise<number> {
		for await(const shift of shifts){
			this.shifts_service.update(shift);
		}
		return await this.repo.update({
			id,
			start_date,
			end_date,
			likes,
			notes,
			created_at
		});
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
	public async getByUserId(id: number): Promise<ScheduleData[]> {
		const result = await this.repo.getByUserId(id);

		return Promise.all(result.map(async (shift) => this.transform(shift)));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<ScheduleData[]> {
		const result = await this.repo.getByDates(start_date, end_date);

		return Promise.all(result.map(async (shift) => this.transform(shift)));
	}
}