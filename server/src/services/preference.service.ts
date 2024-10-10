import { Preference } from "../models";
import { IPreferenceService, IPreferenceRepository, PreferenceData } from "../interfaces";

export class PreferenceService implements IPreferenceService {

	private readonly repo: IPreferenceRepository;
	constructor(repo: IPreferenceRepository) {
		this.repo = repo;
	}

	public async transform({ id, ...rest }: Preference): Promise<PreferenceData> {
		return {
			id,
			...rest,
			daily_preferences: await this.repo.getDailyByPreferenceId(id)
		}
	}

	public async create({ user_id, start_date, end_date, notes }: PreferenceData): Promise<number> {
		const pref = {
			user_id,
			start_date,
			end_date,
			notes: notes || null,
			created_at: new Date()
		} as Preference;
		return await this.repo.create(pref);
	}

	public async getOne(id: number): Promise<PreferenceData | null> {
		const pref = await this.repo.getOne(id);
		if(pref.length === 0) return null;

		return this.transform(pref[0]);
	}

	public async getMany(): Promise<PreferenceData[]> {
		const result = await this.repo.getMany() as Preference[];

		return Promise.all(result.map(pref => this.transform(pref)));
	}

	
	public async getByDates(start_date: Date, end_date: Date): Promise<PreferenceData[]> {
		const result = await this.repo.getByDates(start_date, end_date);
		
		return Promise.all(result.map(pref => this.transform(pref)));
	}
		
	public async getByUserId(id: number): Promise<PreferenceData[]> {
		const result =  await this.repo.getByUserId(id);
		
		return Promise.all(result.map(pref => this.transform(pref)));
	}

	public async update({ id, user_id, start_date, end_date, notes }: PreferenceData): Promise<number> {
		return await this.repo.update({
			id,
			user_id,
			start_date,
			end_date,
			notes: notes || null,
			created_at: new Date()
		});
	}

	public async delete(id: number): Promise<number> {
		return await this.repo.delete(id);
	}
}