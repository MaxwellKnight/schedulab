import { VacationData } from "../interfaces/dto";
import { Vacation } from "../models";
import { VacationRepository } from "../repositories";

type CreateVacationData = Omit<VacationData, 'id' | 'created_at'>;
type UpdateVacationData = Partial<VacationData> & { id: number };

export class VacationService {
	private readonly repo: VacationRepository;

	constructor(repo: VacationRepository) {
		this.repo = repo;
	}

	private async transform(vacation: Vacation): Promise<VacationData> {
		return {
			id: vacation.id!,
			user_id: vacation.user_id,
			start_date: vacation.start_date,
			end_date: vacation.end_date,
			created_at: vacation.created_at
		};
	}

	public async create(vacationData: CreateVacationData): Promise<number> {
		const vacation: Omit<Vacation, 'id' | 'created_at'> = {
			user_id: vacationData.user_id,
			start_date: vacationData.start_date,
			end_date: vacationData.end_date
		};

		return await this.repo.create(vacation);
	}

	public async getOne(id: number): Promise<VacationData | null> {
		const vacation = await this.repo.getOne(id);
		if (!vacation) return null;
		return this.transform(vacation);
	}

	public async getMany(): Promise<VacationData[]> {
		const vacations = await this.repo.getMany();
		return Promise.all(vacations.map(vacation => this.transform(vacation)));
	}

	public async getByUserId(id: number): Promise<VacationData[]> {
		const vacations = await this.repo.getByUserId(id);
		return Promise.all(vacations.map(vacation => this.transform(vacation)));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<VacationData[]> {
		const vacations = await this.repo.getByDates(start_date, end_date);
		return Promise.all(vacations.map(vacation => this.transform(vacation)));
	}

	public async getByDate(date: Date): Promise<VacationData[]> {
		const vacations = await this.repo.getByDate(date);
		return Promise.all(vacations.map(vacation => this.transform(vacation)));
	}

	public async update(vacationData: UpdateVacationData): Promise<number> {
		const vacation: Partial<Vacation> & { id: number } = {
			id: vacationData.id,
			...(vacationData.user_id && { user_id: vacationData.user_id }),
			...(vacationData.start_date && { start_date: vacationData.start_date }),
			...(vacationData.end_date && { end_date: vacationData.end_date })
		};

		return await this.repo.update(vacation);
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}
