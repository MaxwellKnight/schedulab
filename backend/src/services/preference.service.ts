import { PreferenceTemplateData } from "../interfaces/dto/preferences.dto";
import { PreferenceTemplate } from "../models";
import { PreferenceTemplateRepository } from "../repositories/preferences.repository";

export class PreferenceTemplateService {
	private readonly repo: PreferenceTemplateRepository;

	constructor(repo: PreferenceTemplateRepository) {
		this.repo = repo;
	}

	public async transform({ id, ...rest }: PreferenceTemplate): Promise<PreferenceTemplateData> {
		return {
			id,
			...rest,
			time_slots: rest.time_slots || []
		};
	}

	public async create(
		data: Omit<PreferenceTemplateData, 'id' | 'created_at' | 'updated_at' | 'time_slots'>,
		userId: number
	): Promise<number> {
		const template = {
			team_id: data.team_id,
			name: data.name,
			start_date: data.start_date,
			end_date: data.end_date,
			status: data.status,
			created_by: userId // Use the authenticated user's ID
		} as PreferenceTemplate;

		return await this.repo.create(template, userId);
	}

	public async getOne(id: number, userId: number): Promise<PreferenceTemplateData | null> {
		const template = await this.repo.getOne(id, userId);
		if (!template) return null;
		return this.transform(template);
	}

	public async getMany(userId: number): Promise<PreferenceTemplateData[]> {
		const result = await this.repo.getMany(userId);
		return Promise.all(result.map(template => this.transform(template)));
	}

	public async getByDates(
		start_date: Date,
		end_date: Date,
		userId: number
	): Promise<PreferenceTemplateData[]> {
		const result = await this.repo.getByDates(start_date, end_date, userId);
		return Promise.all(result.map(template => this.transform(template)));
	}

	public async getByTeamId(teamId: number, userId: number): Promise<PreferenceTemplateData[]> {
		const result = await this.repo.getByTeamId(teamId, userId);
		return Promise.all(result.map(template => this.transform(template)));
	}

	public async update(
		data: Partial<PreferenceTemplateData> & { id: number },
		userId: number
	): Promise<number> {
		const updateData: Partial<PreferenceTemplate> & { id: number } = {
			id: data.id,
			...(data.team_id && { team_id: data.team_id }),
			...(data.name && { name: data.name }),
			...(data.start_date && { start_date: data.start_date }),
			...(data.end_date && { end_date: data.end_date }),
			...(data.status && { status: data.status })
		};

		return await this.repo.update(updateData, userId);
	}

	public async delete(id: number, userId: number): Promise<number> {
		return await this.repo.delete(id, userId);
	}

	public async deleteByTeamId(teamId: number, userId: number): Promise<number> {
		return await this.repo.deleteByTeamId(teamId, userId);
	}

	public async publish(id: number, userId: number): Promise<number> {
		// First verify access
		const template = await this.getOne(id, userId);
		if (!template) {
			throw new Error('Template not found or access denied');
		}

		if (template.status !== 'draft') {
			throw new Error('Only draft templates can be published');
		}

		return await this.repo.update({
			id,
			status: 'published'
		}, userId);
	}

	public async close(id: number, userId: number): Promise<number> {
		// First verify access
		const template = await this.getOne(id, userId);
		if (!template) {
			throw new Error('Template not found or access denied');
		}

		if (template.status !== 'published') {
			throw new Error('Only published templates can be closed');
		}

		return await this.repo.update({
			id,
			status: 'closed'
		}, userId);
	}
}
