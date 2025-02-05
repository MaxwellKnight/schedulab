import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
	PreferenceSubmission,
	PreferenceSubmissionSlot,
} from "../models";

interface SubmissionRow extends RowDataPacket, PreferenceSubmission { }

interface SubmissionSlotRow extends RowDataPacket, PreferenceSubmissionSlot {
	slot_date?: string;
	start_time?: string;
	end_time?: string;
}

interface TeamMembershipRow extends RowDataPacket {
	user_id: number;
	team_id: number;
}

export class PreferenceSubmissionRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	private async validateTemplateAccess(templateId: number, userId: number): Promise<boolean> {
		const [rows] = await this.db.execute<TeamMembershipRow[]>(`
            SELECT tm.user_id, tm.team_id
            FROM team_members tm
            JOIN preference_templates pt ON tm.team_id = pt.team_id
            WHERE pt.id = ? AND tm.user_id = ?
        `, [templateId, userId]);
		return rows.length > 0;
	}

	// Create a new preference submission
	public async createSubmission(
		submission: Omit<PreferenceSubmission, 'id' | 'created_at' | 'updated_at' | 'submitted_at'>,
		slots: Omit<PreferenceSubmissionSlot, 'id' | 'submission_id' | 'created_at'>[]
	): Promise<number> {
		// Validate user access to template
		const hasAccess = await this.validateTemplateAccess(submission.template_id, submission.user_id);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		// Insert submission
		const [submissionResult] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO member_preferences SET ?",
			[submission]
		);
		const submissionId = submissionResult.insertId;

		// Insert slots if any
		if (slots.length > 0) {
			const slotValues = slots.map(slot => [
				submissionId,
				slot.template_time_slot_id,
				slot.preference_level
			]);

			await this.db.execute(
				"INSERT INTO preference_selections (member_preference_id, template_time_slot_id, preference_level) VALUES ?",
				[slotValues]
			);
		}

		return submissionId;
	}

	// Update an existing preference submission
	public async updateSubmission(
		submission: Partial<PreferenceSubmission> & { id: number },
		slots?: Omit<PreferenceSubmissionSlot, 'id' | 'submission_id' | 'created_at'>[]
	): Promise<void> {
		// Verify submission existence
		const [existingSubmissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM member_preferences WHERE id = ?",
			[submission.id]
		);

		if (!existingSubmissions.length) {
			throw new Error('Submission not found');
		}

		// Update submission details
		if (Object.keys(submission).length > 1) {
			// If status is submitted, set submitted_at
			if (submission.status === 'submitted') {
				submission.submitted_at = new Date();
			}

			await this.db.execute(
				"UPDATE member_preferences SET ? WHERE id = ?",
				[submission, submission.id]
			);
		}

		// Update slots if provided
		if (slots) {
			// First, delete existing slots
			await this.db.execute(
				"DELETE FROM preference_selections WHERE member_preference_id = ?",
				[submission.id]
			);

			// Insert new slots if any
			if (slots.length > 0) {
				const slotValues = slots.map(slot => [
					submission.id,
					slot.template_time_slot_id,
					slot.preference_level
				]);

				await this.db.execute(
					"INSERT INTO preference_selections (member_preference_id, template_time_slot_id, preference_level) VALUES ?",
					[slotValues]
				);
			}
		}
	}

	public async deleteSubmission(id: number, userId: number): Promise<void> {
		// First, check if submission exists and belongs to user
		const [submission] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM member_preferences WHERE id = ? AND user_id = ?",
			[id, userId]
		);

		if (!submission.length) {
			throw new Error('Submission not found or user unauthorized');
		}

		// Delete associated preference selections first due to foreign key constraint
		await this.db.execute(
			"DELETE FROM preference_selections WHERE member_preference_id = ?",
			[id]
		);

		// Then delete the submission
		await this.db.execute(
			"DELETE FROM member_preferences WHERE id = ?",
			[id]
		);
	}

	public async getSubmissionById(id: number, userId: number): Promise<PreferenceSubmission | null> {
		const [submissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM member_preferences WHERE id = ? AND user_id = ?",
			[id, userId]
		);

		return submissions.length ? submissions[0] : null;
	}

	public async getSubmissionsByTemplate(templateId: number, userId: number): Promise<PreferenceSubmission[]> {
		// Validate access to template
		const hasAccess = await this.validateTemplateAccess(templateId, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		const [submissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM member_preferences WHERE template_id = ?",
			[templateId]
		);

		return submissions;
	}

	public async getSubmissionDetails(id: number, userId: number): Promise<{
		submission: PreferenceSubmission,
		slots: PreferenceSubmissionSlot[]
	} | null> {
		// Verify submission ownership
		const [submissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM preference_submissions WHERE id = ? AND user_id = ?",
			[id, userId]
		);

		if (!submissions.length) return null;

		// Get associated slots with additional time slot details
		const [slots] = await this.db.execute<SubmissionSlotRow[]>(`
        SELECT 
            pss.*,
            ts.date as slot_date,
            ptr.start_time,
            ptr.end_time
        FROM 
            preference_submission_slots pss
        JOIN 
            template_time_slots ts ON pss.template_time_slot_id = ts.id
        JOIN 
            preference_time_ranges ptr ON ts.time_range_id = ptr.id
        WHERE 
            pss.submission_id = ?
    `, [id]);

		const formattedSlots = slots.map(slot => ({
			id: slot.id,
			submission_id: slot.submission_id,
			member_preference_id: slot.submission_id,
			template_time_slot_id: slot.template_time_slot_id,
			preference_level: slot.preference_level,
			created_at: slot.created_at,
			date: slot.slot_date ? new Date(slot.slot_date) : undefined,
			start_time: slot.start_time,
			end_time: slot.end_time
		}));
		console.log(submissions, formattedSlots);

		return {
			submission: submissions[0],
			slots: formattedSlots
		};
	}

	public async getAllDetailsByTeam(id: number, userId: number): Promise<{
		submission: PreferenceSubmission,
		slots: PreferenceSubmissionSlot[]
	} | null> {
		// Verify submission ownership
		const [submissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM preference_submissions WHERE id = ? AND user_id = ?",
			[id, userId]
		);

		if (!submissions.length) return null;

		// Get associated slots with additional time slot details
		const [slots] = await this.db.execute<SubmissionSlotRow[]>(`
        SELECT 
            pss.*,
            ts.date as slot_date,
            ptr.start_time,
            ptr.end_time
        FROM 
            preference_submission_slots pss
        JOIN 
            template_time_slots ts ON pss.template_time_slot_id = ts.id
        JOIN 
            preference_time_ranges ptr ON ts.time_range_id = ptr.id
        WHERE 
            pss.submission_id = ?
    `, [id]);

		const formattedSlots = slots.map(slot => ({
			id: slot.id,
			submission_id: slot.submission_id,
			member_preference_id: slot.submission_id,
			template_time_slot_id: slot.template_time_slot_id,
			preference_level: slot.preference_level,
			created_at: slot.created_at,
			date: slot.slot_date ? new Date(slot.slot_date) : undefined,
			start_time: slot.start_time,
			end_time: slot.end_time
		}));

		return {
			submission: submissions[0],
			slots: formattedSlots
		};
	}
	public async getUserSubmissionsForTemplate(templateId: number, userId: number): Promise<{
		submission: PreferenceSubmission,
		slots: PreferenceSubmissionSlot[]
	} | null> {
		const [submissions] = await this.db.execute<SubmissionRow[]>(
			"SELECT * FROM member_preferences WHERE template_id = ? AND user_id = ?",
			[templateId, userId]
		);

		if (!submissions.length) return null;

		return this.getSubmissionDetails(submissions[0].id, userId);
	}

	public async getPreferencesByTeam(teamId: number, userId: number): Promise<PreferenceSubmission[]> {
		const [rows] = await this.db.execute<SubmissionRow[]>(`
   SELECT ps.* 
   FROM preference_submissions ps
   JOIN preference_templates pt ON ps.template_id = pt.id 
   JOIN team_members tm ON tm.team_id = pt.team_id
   WHERE pt.team_id = ? AND tm.user_id = ?
 `, [teamId, userId]);

		return rows;
	}

	public async getAllByTeam(teamId: number): Promise<PreferenceSubmission[]> {
		const [rows] = await this.db.execute<SubmissionRow[]>(`
        SELECT ps.* 
        FROM preference_submissions ps
        JOIN preference_templates pt ON ps.template_id = pt.id 
        JOIN team_members tm ON tm.team_id = pt.team_id
        WHERE pt.team_id = ?
        GROUP BY ps.id
    `, [teamId]);
		return rows;
	}

}

export default PreferenceSubmissionRepository;
