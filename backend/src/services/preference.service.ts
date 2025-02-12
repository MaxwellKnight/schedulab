import { PreferenceTemplateData, TimeRangeData, TimeSlotData, MemberPreferenceData, PreferenceStatus } from "../interfaces/dto/preferences.dto";
import { PreferenceTemplate, PreferenceTimeRange, TimeSlot } from "../models";
import { TeamRepository } from "../repositories";
import { PreferenceRepository } from "../repositories/preferences.repository";

export class PreferenceService {
	private readonly repo: PreferenceRepository;
	private readonly teamRepo: TeamRepository;

	constructor(repo: PreferenceRepository, teamRepo: TeamRepository) {
		this.repo = repo;
		this.teamRepo = teamRepo;
	}

	private async transformTimeRange(range: PreferenceTimeRange): Promise<TimeRangeData> {
		return {
			id: range.id,
			preference_id: range.preference_id,
			start_time: range.start_time,
			end_time: range.end_time,
			created_at: range.created_at
		};
	}

	private async transformTimeSlot(slot: TimeSlot): Promise<TimeSlotData> {
		return {
			id: slot.id,
			template_id: slot.template_id,
			date: slot.date,
			time_range_id: slot.time_range_id,
			created_at: slot.created_at,
			time_range: slot.time_range ? await this.transformTimeRange(slot.time_range) : undefined
		};
	}

	private async transformTemplate(template: PreferenceTemplate): Promise<PreferenceTemplateData> {
		return {
			id: template.id,
			team_id: template.team_id,
			name: template.name,
			start_date: template.start_date,
			end_date: template.end_date,
			status: template.status,
			creator: template.creator,
			created_at: template.created_at,
			updated_at: template.updated_at,
			time_slots: await Promise.all((template.time_slots || []).map(slot => this.transformTimeSlot(slot)))
		};
	}


	public async getTimeRangesByTeam(teamId: number, userId: number): Promise<TimeRangeData[]> {
		return await this.repo.getTimeRangesByTeam(teamId, userId);
	}

	public async createTemplate(
		data: Omit<PreferenceTemplateData, 'id' | 'created_at' | 'updated_at' | 'time_slots'>,
		userId: number
	): Promise<number> {
		const template = {
			team_id: data.team_id,
			name: data.name,
			start_date: data.start_date,
			end_date: data.end_date,
			status: 'draft',
			creator: userId
		} as PreferenceTemplate;

		return await this.repo.createTemplate(template, userId);
	}

	public async getOne(id: number, userId: number): Promise<PreferenceTemplateData | null> {
		const template = await this.repo.getTemplatesByTeam(id, userId);
		if (!template.length) return null;
		return this.transformTemplate(template[0]);
	}

	public async updateStatus(templateId: number, teamId: number, userId: number, status: PreferenceStatus) {
		const template = await this.getOne(templateId, userId);
		if (!template || template.team_id !== teamId)
			throw "access violation, this member cannot update this template";

		const role = await this.teamRepo.getMemberRole(teamId, userId);
		if (!role || role !== 'admin')
			throw "access violation, this member is not an admin";

		this.repo.updateStatus(templateId, teamId, status);
	}

	public async getPublished(userId: number): Promise<PreferenceTemplateData | null> {
		const template = await this.repo.getPublished(userId);
		if (!template) return null;
		return this.transformTemplate(template);
	}

	public async getMany(userId: number): Promise<PreferenceTemplateData[]> {
		const templates: PreferenceTemplate[] = await this.repo.getMany(userId);
		return Promise.all(templates.map(template => this.transformTemplate(template)));
	}

	public async getByDateRange(
		start_date: Date,
		end_date: Date,
		userId: number
	): Promise<PreferenceTemplateData[]> {
		const templates = await this.repo.getByDates(start_date, end_date, userId);
		return Promise.all(templates.map(template => this.transformTemplate(template)));
	}

	public async getByTeam(teamId: number, userId: number): Promise<PreferenceTemplateData[]> {
		const templates = await this.repo.getTemplatesByTeam(teamId, userId);
		return Promise.all(templates.map(template => this.transformTemplate(template)));
	}

	public async update(
		data: Partial<PreferenceTemplateData> & { id: number },
		userId: number
	): Promise<void> {
		const updateData: Partial<PreferenceTemplate> & { id: number } = {
			id: data.id,
			...(data.team_id && { team_id: data.team_id }),
			...(data.name && { name: data.name }),
			...(data.start_date && { start_date: data.start_date }),
			...(data.end_date && { end_date: data.end_date }),
			...(data.status && { status: data.status })
		};
		await this.repo.updateTemplate(updateData, userId);
	}

	public async delete(id: number, userId: number): Promise<void> {
		await this.repo.deleteTemplate(id, userId);
	}

	public async createTimeRange(
		data: Omit<TimeRangeData, 'id' | 'created_at'>,
		userId: number
	): Promise<number> {
		return await this.repo.createTimeRange({
			preference_id: data.preference_id!,
			start_time: data.start_time,
			end_time: data.end_time
		}, userId);
	}

	public async updateTimeRange(
		data: Partial<TimeRangeData> & { id: number },
		userId: number
	): Promise<void> {
		await this.repo.updateTimeRange({
			id: data.id,
			...(data.start_time && { start_time: data.start_time }),
			...(data.end_time && { end_time: data.end_time })
		}, userId);
	}

	public async deleteTimeRange(id: number, userId: number): Promise<void> {
		await this.repo.deleteTimeRange(id, userId);
	}

	public async createTimeSlot(
		data: Omit<TimeSlotData, 'id' | 'created_at' | 'time_range'>,
		userId: number
	): Promise<number> {
		return await this.repo.createTimeSlot({
			template_id: data.template_id!,
			date: data.date,
			time_range_id: data.time_range_id!
		}, userId);
	}

	public async createBulkTimeSlots(
		slots: Omit<TimeSlotData, 'id' | 'created_at' | 'time_range'>[],
		userId: number
	): Promise<void> {
		const timeSlots = slots.map(slot => ({
			template_id: slot.template_id,
			date: slot.date,
			time_range_id: slot.time_range_id
		}));
		await this.repo.createBulkTimeSlots(timeSlots, userId);
	}

	public async updateTimeSlot(
		data: Partial<TimeSlotData> & { id: number },
		userId: number
	): Promise<void> {
		await this.repo.updateTimeSlot({
			id: data.id,
			...(data.date && { date: data.date }),
			...(data.time_range_id && { time_range_id: data.time_range_id })
		}, userId);
	}

	public async deleteTimeSlot(id: number, userId: number): Promise<void> {
		await this.repo.deleteTimeSlot(id, userId);
	}

	public async createMemberPreference(
		data: Omit<MemberPreferenceData, 'id' | 'created_at' | 'updated_at' | 'submitted_at'>,
		userId: number
	): Promise<number> {
		return await this.repo.createMemberPreference({
			template_id: data.template_id,
			user_id: userId,
			status: data.status || 'draft',
			notes: data.notes
		}, userId);
	}

	public async updateMemberPreference(
		data: Partial<MemberPreferenceData> & { id: number },
		userId: number
	): Promise<void> {
		const updateData: Partial<MemberPreferenceData> & { id: number } = {
			id: data.id,
			...(data.status !== undefined && { status: data.status }),
			...(data.notes !== undefined && { notes: data.notes || null }),  // Convert undefined to null for DB
			...(data.submitted_at !== undefined && { submitted_at: data.submitted_at || null })
		};

		await this.repo.updateMemberPreference(updateData, userId);
	}

	public async deleteMemberPreference(id: number, userId: number): Promise<void> {
		await this.repo.deleteMemberPreference(id, userId);
	}

	public async getMemberPreferences(templateId: number, userId: number): Promise<MemberPreferenceData[]> {
		return await this.repo.getMemberPreferences(templateId, userId);
	}

	public async publishTemplate(id: number, userId: number): Promise<void> {
		const template = await this.getOne(id, userId);
		if (!template) {
			throw new Error('Template not found or access denied');
		}
		if (template.status !== 'draft') {
			throw new Error('Only draft templates can be published');
		}

		await this.update({
			id,
			status: 'published'
		}, userId);
	}

	public async closeTemplate(id: number, userId: number): Promise<void> {
		const template = await this.getOne(id, userId);
		if (!template) {
			throw new Error('Template not found or access denied');
		}
		if (template.status !== 'published') {
			throw new Error('Only published templates can be closed');
		}

		await this.update({
			id,
			status: 'closed'
		}, userId);
	}

	public async validateTimeSlots(templateId: number, userId: number): Promise<boolean> {
		const template = await this.getOne(templateId, userId);
		if (!template) return false;

		if (!template.time_slots.length) {
			throw new Error('Template must have at least one time slot before publishing');
		}

		return true;
	}
}
