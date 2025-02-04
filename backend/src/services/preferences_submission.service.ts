import {
	PreferenceSubmission,
	PreferenceSubmissionSlot,
	PreferenceSubmissionWithSlots,
	PreferenceTemplate
} from "../models";
import {
	MemberPreferenceData,
	PreferenceSubmissionSlotData,
	CreatePreferenceSubmissionData
} from "../interfaces/dto/preferences.dto";
import { PreferenceRepository } from "../repositories/preferences.repository";
import { PreferenceSubmissionRepository } from "../repositories";

export class PreferenceSubmissionService {
	constructor(
		private readonly submissionRepo: PreferenceSubmissionRepository,
		private readonly preferenceRepo: PreferenceRepository
	) { }

	private transformSubmission(submission: PreferenceSubmission): MemberPreferenceData {
		return {
			id: submission.id,
			template_id: submission.template_id,
			user_id: submission.user_id,
			status: submission.status,
			submitted_at: submission.submitted_at,
			notes: submission.notes,
			created_at: submission.created_at,
			updated_at: submission.updated_at
		};
	}

	private transformSubmissionSlot(slot: PreferenceSubmissionSlot & {
		date?: Date,
		start_time?: string,
		end_time?: string
	}): PreferenceSubmissionSlotData {
		return {
			id: slot.id,
			member_preference_id: slot.member_preference_id,
			template_time_slot_id: slot.template_time_slot_id,
			preference_level: slot.preference_level,
			created_at: slot.created_at,
			date: slot.date,
			start_time: slot.start_time,
			end_time: slot.end_time
		};
	}

	private async validateTemplate(templateId: number, userId: number): Promise<PreferenceTemplate> {
		const template = await this.preferenceRepo.getOne(templateId, userId);
		if (!template) {
			throw new Error('Template not found or access denied');
		}
		if (template.status !== 'published') {
			throw new Error('Template must be published to accept submissions');
		}
		return template;
	}

	private validateSlots(
		slots: Array<{
			template_time_slot_id: number;
			preference_level: number;
		}>,
		validSlotIds: Set<number>,
		member_preference_id: number
	): Omit<PreferenceSubmissionSlot, 'id' | 'created_at' | 'submission_id'>[] {
		return slots
			.filter(slot =>
				validSlotIds.has(slot.template_time_slot_id) &&
				slot.preference_level >= 1 &&
				slot.preference_level <= 5
			)
			.map(slot => ({
				member_preference_id,
				template_time_slot_id: slot.template_time_slot_id,
				preference_level: slot.preference_level
			}));
	}

	public async createSubmission(
		data: CreatePreferenceSubmissionData,
		slots: Array<{
			template_time_slot_id: number;
			preference_level: number;
		}> = [],
		userId: number
	): Promise<number> {
		await this.validateTemplate(data.template_id, userId);

		const templateTimeSlots = await this.preferenceRepo.getTimeSlotsForTemplate(data.template_id, userId);
		const validSlotIds = new Set(templateTimeSlots.map(slot => slot.id));

		// Create submission first
		const submissionData: Omit<PreferenceSubmission, 'id' | 'created_at' | 'updated_at' | 'submitted_at'> = {
			template_id: data.template_id,
			user_id: userId,
			status: data.status || 'draft',
			notes: data.notes ?? null
		};

		// Create submission with empty slots first
		const submissionId = await this.submissionRepo.createSubmission(submissionData, []);

		// If we have valid slots, update the submission with them
		if (slots.length > 0) {
			const validatedSlots = this.validateSlots(slots, validSlotIds, submissionId);
			await this.submissionRepo.updateSubmission(
				{ id: submissionId },
				validatedSlots
			);
		}

		return submissionId;
	}

	public async updateSubmission(
		data: Partial<MemberPreferenceData> & { id: number },
		slots: Array<{
			template_time_slot_id: number;
			preference_level: number;
		}> | undefined,
		userId: number
	): Promise<void> {
		const existingSubmission = await this.submissionRepo.getSubmissionById(data.id, userId);
		if (!existingSubmission) {
			throw new Error('Submission not found or unauthorized');
		}

		await this.validateTemplate(existingSubmission.template_id, userId);

		const updateData: Partial<PreferenceSubmission> & { id: number } = {
			id: data.id,
			...(data.status && { status: data.status }),
			...(data.notes !== undefined && { notes: data.notes ?? null })
		};

		let validatedSlots;
		if (slots) {
			const templateTimeSlots = await this.preferenceRepo.getTimeSlotsForTemplate(
				existingSubmission.template_id,
				userId
			);
			const validSlotIds = new Set(templateTimeSlots.map(slot => slot.id));
			validatedSlots = this.validateSlots(slots, validSlotIds, data.id);
		}

		await this.submissionRepo.updateSubmission(updateData, validatedSlots);
	}

	public async deleteSubmission(id: number, userId: number): Promise<void> {
		const submission = await this.submissionRepo.getSubmissionById(id, userId);
		if (!submission) {
			throw new Error('Submission not found or unauthorized');
		}

		await this.validateTemplate(submission.template_id, userId);
		await this.submissionRepo.deleteSubmission(id, userId);
	}

	public async getSubmissionById(id: number, userId: number): Promise<MemberPreferenceData | null> {
		const submission = await this.submissionRepo.getSubmissionById(id, userId);
		return submission ? this.transformSubmission(submission) : null;
	}

	public async getSubmissionsByTemplate(templateId: number, userId: number): Promise<MemberPreferenceData[]> {
		await this.validateTemplate(templateId, userId);

		const submissions = await this.submissionRepo.getSubmissionsByTemplate(templateId, userId);
		return submissions.map(submission => this.transformSubmission(submission));
	}

	public async getSubmissionDetails(id: number, userId: number): Promise<{
		submission: MemberPreferenceData;
		slots: PreferenceSubmissionSlotData[];
	} | null> {
		const details = await this.submissionRepo.getSubmissionDetails(id, userId);
		if (!details) return null;

		return {
			submission: this.transformSubmission(details.submission),
			slots: details.slots.map(slot => this.transformSubmissionSlot(slot))
		};
	}

	public async getUserSubmissionForTemplate(templateId: number, userId: number): Promise<{
		submission: MemberPreferenceData;
		slots: PreferenceSubmissionSlotData[];
	} | null> {
		const submission = await this.submissionRepo.getUserSubmissionsForTemplate(templateId, userId);
		if (!submission) return null;

		return {
			submission: this.transformSubmission(submission.submission),
			slots: submission.slots.map(slot => this.transformSubmissionSlot(slot))
		};
	}

	public async getSubmissionsByTeam(teamId: number, userId: number): Promise<PreferenceSubmissionWithSlots[]> {
		const submissions = await this.submissionRepo.getPreferencesByTeam(teamId, userId);
		const details = await Promise.all(submissions.map(async sub => {
			const subDetails = await this.submissionRepo.getSubmissionDetails(sub.id, userId);
			return subDetails;
		}));
		const d = details.filter((d): d is NonNullable<typeof d> => d !== null);
		return d;
	}

}

export default PreferenceSubmissionService;
