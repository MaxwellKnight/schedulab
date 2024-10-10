import { Vacation } from "../models";
import { IVacationService, IVacationRepository, VacationData } from "../interfaces";

export class VacationService implements IVacationService {
	private readonly repo: IVacationRepository;

	constructor(repo: IVacationRepository) {
		this.repo = repo;
	}

	public async transform({ id, user_id, start_date, end_date, created_at }: Vacation): Promise<VacationData> {
		return {
			id,
			user_id,
			start_date,
			end_date,
			created_at
		}
	}
	public async create(vacation: VacationData): Promise<number> {
		return await this.repo.create(vacation);
	}

	public async getOne(id: number): Promise<VacationData | null> {
		const result = await this.repo.getOne(id);
		if(result.length === 0) return null

		return this.transform(result[0]);
	}

	public async getMany(): Promise<VacationData[]> {
		return await this.repo.getMany();
	}

	public async getByUserId (id: number): Promise<VacationData[]> {
		return await this.repo.getByUserId(id);
	}

	public async getByDates (start_date: Date, end_date: Date): Promise<VacationData[]> {
		return await this.repo.getByDates(start_date, end_date);
	}

	public async getByDate(date: Date): Promise<VacationData[]> {
		return await this.repo.getByDate(date);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}

	public async update(vacation: Vacation): Promise<number> {
		return await this.repo.update(vacation);
	}
}