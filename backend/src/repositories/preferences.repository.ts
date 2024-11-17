import { Database } from "../configs/db.config";
import { PreferenceTemplate, TimeSlot, PreferenceTimeRange } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { CreateMemberPreferenceData } from "../models/preference.model";
import { MemberPreferenceData } from "../interfaces/dto/preferences.dto";

interface TimeSlotRow extends RowDataPacket, Omit<TimeSlot, 'date' | 'created_at' | 'time_range'> {
	date: string;
	created_at: string;
	start_time?: string;
	end_time?: string;
}

interface TeamMembershipRow extends RowDataPacket {
	user_id: number;
	team_id: number;
}

interface MemberPreference extends RowDataPacket {
	id: number;
	template_id: number;
	user_id: number;
	status: 'draft' | 'submitted';
	submitted_at: Date | null;
	notes: string | null;
	created_at: Date;
	updated_at: Date;
}

export class PreferenceRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	// Access validation methods
	private async validateUserTeamMembership(userId: number, teamId: number): Promise<boolean> {
		const [rows] = await this.db.execute<TeamMembershipRow[]>(`
            SELECT user_id, team_id 
            FROM team_members 
            WHERE user_id = ? AND team_id = ?
        `, [userId, teamId]);
		return rows.length > 0;
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

	// Template CRUD operations
	public async createTemplate(template: Omit<PreferenceTemplate, 'id' | 'created_at' | 'updated_at'>, userId: number): Promise<number> {
		const hasAccess = await this.validateUserTeamMembership(userId, template.team_id);
		if (!hasAccess) throw new Error('User does not have access to this team');

		const [result] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO preference_templates SET ?",
			[template]
		);
		const templateId = result.insertId;

		return templateId;
	}

	public async getMany(userId: number): Promise<PreferenceTemplate[]> {
		const [rows] = await this.db.execute<TimeSlotRow[]>(`
            SELECT 
                pt.*,
                ts.id as slot_id,
                ts.date,
                ts.time_range_id,
                ts.created_at as slot_created_at,
                ptr.start_time,
                ptr.end_time
            FROM 
                preference_templates pt
            JOIN
                team_members tm ON pt.team_id = tm.team_id
            LEFT JOIN 
                template_time_slots ts ON ts.template_id = pt.id
            LEFT JOIN
                preference_time_ranges ptr ON ptr.id = ts.time_range_id
            WHERE
                tm.user_id = ?
            ORDER BY pt.id, ts.date, ptr.start_time
        `, [userId]);

		return this.groupTemplates(rows);
	}

	public async getByDates(start_date: Date, end_date: Date, userId: number): Promise<PreferenceTemplate[]> {
		const [rows] = await this.db.execute<TimeSlotRow[]>(`
            SELECT 
                pt.*,
                ts.id as slot_id,
                ts.date,
                ts.time_range_id,
                ts.created_at as slot_created_at,
                ptr.start_time,
                ptr.end_time
            FROM 
                preference_templates pt
            JOIN
                team_members tm ON pt.team_id = tm.team_id
            LEFT JOIN 
                template_time_slots ts ON ts.template_id = pt.id
            LEFT JOIN
                preference_time_ranges ptr ON ptr.id = ts.time_range_id
            WHERE
                pt.start_date <= ? 
                AND pt.end_date >= ?
                AND tm.user_id = ?
            ORDER BY pt.id, ts.date, ptr.start_time
        `, [end_date, start_date, userId]);

		return this.groupTemplates(rows);
	}

	public async getOne(id: number, userId: number): Promise<PreferenceTemplate | null> {
		const [rows] = await this.db.execute<TimeSlotRow[]>(`
            SELECT 
                pt.*,
                ts.id as slot_id,
                ts.date,
                ts.time_range_id,
                ts.created_at as slot_created_at,
                ptr.start_time,
                ptr.end_time
            FROM 
                preference_templates pt
            LEFT JOIN 
                template_time_slots ts ON ts.template_id = pt.id
            LEFT JOIN
                preference_time_ranges ptr ON ptr.id = ts.time_range_id
            WHERE 
                pt.id = ?
            ORDER BY ts.date, ptr.start_time
        `, [id]);

		if (!rows.length) return null;

		// Verify access after getting the template
		const hasAccess = await this.validateTemplateAccess(id, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		return this.mapToPreferenceTemplate(rows);
	}

	// Additional helper method to get all time ranges for a template
	public async getTimeRangesForTemplate(templateId: number, userId: number): Promise<PreferenceTimeRange[]> {
		const hasAccess = await this.validateTemplateAccess(templateId, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const [rows] = await this.db.execute<(RowDataPacket & PreferenceTimeRange)[]>(`
            SELECT ptr.*
            FROM preference_time_ranges ptr
            WHERE ptr.preference_id = ?
            ORDER BY ptr.start_time
        `, [templateId]);

		return rows.map(row => ({
			id: row.id,
			preference_id: row.preference_id,
			start_time: row.start_time,
			end_time: row.end_time,
			created_at: new Date(row.created_at)
		}));
	}

	// Method to get all time slots for a template
	public async getTimeSlotsForTemplate(templateId: number, userId: number): Promise<TimeSlot[]> {
		const hasAccess = await this.validateTemplateAccess(templateId, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const [rows] = await this.db.execute<TimeSlotRow[]>(`
            SELECT 
                ts.*,
                ptr.start_time,
                ptr.end_time,
                ptr.created_at as range_created_at
            FROM template_time_slots ts
            LEFT JOIN preference_time_ranges ptr ON ptr.id = ts.time_range_id
            WHERE ts.template_id = ?
            ORDER BY ts.date, ptr.start_time
        `, [templateId]);

		return rows.map(row => ({
			id: row.slot_id,
			template_id: row.template_id,
			date: new Date(row.date),
			time_range_id: row.time_range_id,
			created_at: new Date(row.created_at),
			time_range: row.start_time && row.end_time ? {
				id: row.time_range_id,
				preference_id: row.template_id,
				start_time: row.start_time,
				end_time: row.end_time,
				created_at: new Date(row.range_created_at)
			} : undefined
		}));
	}
	public async updateTemplate(template: Partial<PreferenceTemplate> & { id: number }, userId: number): Promise<void> {
		const hasAccess = await this.validateTemplateAccess(template.id, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		await this.db.execute(
			"UPDATE preference_templates SET ? WHERE id = ?",
			[template, template.id]
		);
	}

	public async deleteTemplate(id: number, userId: number): Promise<void> {
		const hasAccess = await this.validateTemplateAccess(id, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		// Delete related records first (cascade delete will handle time_slots)
		await this.db.execute("DELETE FROM preference_time_ranges WHERE preference_id = ?", [id]);
		await this.db.execute("DELETE FROM member_preferences WHERE template_id = ?", [id]);
		await this.db.execute("DELETE FROM preference_templates WHERE id = ?", [id]);
	}

	// Time Range CRUD operations
	public async createTimeRange(timeRange: Omit<PreferenceTimeRange, 'id' | 'created_at'>, userId: number): Promise<number> {
		const hasAccess = await this.validateTemplateAccess(timeRange.preference_id, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const [result] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO preference_time_ranges SET ?",
			[timeRange]
		);
		return result.insertId;
	}

	public async updateTimeRange(timeRange: Partial<PreferenceTimeRange> & { id: number }, userId: number): Promise<void> {
		const [template] = await this.db.execute<RowDataPacket[]>(
			"SELECT pt.* FROM preference_templates pt JOIN preference_time_ranges ptr ON pt.id = ptr.preference_id WHERE ptr.id = ?",
			[timeRange.id]
		);
		if (!template.length || !(await this.validateTemplateAccess(template[0].id, userId))) {
			throw new Error('User does not have access to this time range');
		}

		await this.db.execute(
			"UPDATE preference_time_ranges SET ? WHERE id = ?",
			[timeRange, timeRange.id]
		);
	}

	public async deleteTimeRange(id: number, userId: number): Promise<void> {
		const [template] = await this.db.execute<RowDataPacket[]>(
			"SELECT pt.* FROM preference_templates pt JOIN preference_time_ranges ptr ON pt.id = ptr.preference_id WHERE ptr.id = ?",
			[id]
		);
		if (!template.length || !(await this.validateTemplateAccess(template[0].id, userId))) {
			throw new Error('User does not have access to this time range');
		}

		await this.db.execute("DELETE FROM preference_time_ranges WHERE id = ?", [id]);
	}

	// Time Slot CRUD operations
	public async createTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'created_at'>, userId: number): Promise<number> {
		const hasAccess = await this.validateTemplateAccess(timeSlot.template_id, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const [result] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO template_time_slots SET ?",
			[timeSlot]
		);
		return result.insertId;
	}

	public async createBulkTimeSlots(timeSlots: Omit<TimeSlot, 'id' | 'created_at'>[], userId: number): Promise<void> {
		if (!timeSlots.length) return;

		const hasAccess = await this.validateTemplateAccess(timeSlots[0].template_id, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const values = timeSlots.map(slot => [
			slot.template_id,
			slot.date,
			slot.time_range_id
		]);

		await this.db.execute(
			"INSERT INTO template_time_slots (template_id, date, time_range_id) VALUES ?",
			[values]
		);
	}

	public async updateTimeSlot(timeSlot: Partial<TimeSlot> & { id: number }, userId: number): Promise<void> {
		const [template] = await this.db.execute<RowDataPacket[]>(
			"SELECT pt.* FROM preference_templates pt JOIN template_time_slots ts ON pt.id = ts.template_id WHERE ts.id = ?",
			[timeSlot.id]
		);
		if (!template.length || !(await this.validateTemplateAccess(template[0].id, userId))) {
			throw new Error('User does not have access to this time slot');
		}

		await this.db.execute(
			"UPDATE template_time_slots SET ? WHERE id = ?",
			[timeSlot, timeSlot.id]
		);
	}

	public async deleteTimeSlot(id: number, userId: number): Promise<void> {
		const [template] = await this.db.execute<RowDataPacket[]>(
			"SELECT pt.* FROM preference_templates pt JOIN template_time_slots ts ON pt.id = ts.template_id WHERE ts.id = ?",
			[id]
		);
		if (!template.length || !(await this.validateTemplateAccess(template[0].id, userId))) {
			throw new Error('User does not have access to this time slot');
		}

		await this.db.execute("DELETE FROM template_time_slots WHERE id = ?", [id]);
	}

	// Member Preference CRUD operations
	public async createMemberPreference(
		data: CreateMemberPreferenceData,
		userId: number
	): Promise<number> {
		if (data.user_id !== userId) {
			throw new Error('Cannot create preferences for other users');
		}

		const hasAccess = await this.validateTemplateAccess(data.template_id, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		const [result] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO member_preferences SET ?",
			[data]
		);
		return result.insertId;
	}

	public async updateMemberPreference(
		preference: Partial<MemberPreferenceData> & { id: number },
		userId: number
	): Promise<void> {
		const [existingPref] = await this.db.execute<MemberPreference[]>(
			"SELECT * FROM member_preferences WHERE id = ?",
			[preference.id]
		);

		if (!existingPref.length || existingPref[0].user_id !== userId) {
			throw new Error('Cannot update preferences of other users');
		}

		if (preference.status === 'submitted') {
			preference.submitted_at = new Date();
		}

		await this.db.execute(
			"UPDATE member_preferences SET ? WHERE id = ?",
			[preference, preference.id]
		);
	}

	public async deleteMemberPreference(id: number, userId: number): Promise<void> {
		const [preference] = await this.db.execute<MemberPreference[]>(
			"SELECT * FROM member_preferences WHERE id = ?",
			[id]
		);

		if (!preference.length || preference[0].user_id !== userId) {
			throw new Error('Cannot delete preferences of other users');
		}

		await this.db.execute("DELETE FROM member_preferences WHERE id = ?", [id]);
	}

	// Query methods
	public async getTemplatesByTeam(teamId: number, userId: number): Promise<PreferenceTemplate[]> {
		const hasAccess = await this.validateUserTeamMembership(userId, teamId);
		if (!hasAccess) throw new Error('User does not have access to this team');

		const [rows] = await this.db.execute<TimeSlotRow[]>(`
            SELECT 
                pt.*,
                ts.id as slot_id,
                ts.date,
                ts.time_range_id,
                ts.created_at as slot_created_at,
                ptr.start_time,
                ptr.end_time
            FROM 
                preference_templates pt
            LEFT JOIN 
                template_time_slots ts ON ts.template_id = pt.id
            LEFT JOIN
                preference_time_ranges ptr ON ptr.id = ts.time_range_id
            WHERE 
                pt.team_id = ?
            ORDER BY pt.id, ts.date, ptr.start_time
        `, [teamId]);

		return this.groupTemplates(rows);
	}

	public async getMemberPreferences(templateId: number, userId: number): Promise<MemberPreferenceData[]> {
		const hasAccess = await this.validateTemplateAccess(templateId, userId);
		if (!hasAccess) throw new Error('User does not have access to this template');

		const [preferences] = await this.db.execute<MemberPreference[]>(
			"SELECT * FROM member_preferences WHERE template_id = ? AND user_id = ?",
			[templateId, userId]
		);

		return preferences;
	}

	// Helper methods
	private mapToPreferenceTemplate(rows: TimeSlotRow[]): PreferenceTemplate {
		const firstRow = rows[0];
		const template: PreferenceTemplate = {
			id: firstRow.id,
			team_id: firstRow.team_id,
			name: firstRow.name,
			start_date: new Date(firstRow.start_date),
			end_date: new Date(firstRow.end_date),
			status: firstRow.status,
			creator: firstRow.creator,
			created_at: new Date(firstRow.created_at),
			updated_at: new Date(firstRow.updated_at),
			time_slots: []
		};

		if (rows[0].slot_id) {
			template.time_slots = rows.map(row => ({
				id: row.slot_id,
				template_id: row.id,
				date: new Date(row.date),
				time_range_id: row.time_range_id,
				created_at: new Date(row.slot_created_at),
				time_range: row.start_time && row.end_time ? {
					id: row.time_range_id,
					preference_id: row.id,
					start_time: row.start_time,
					end_time: row.end_time,
					created_at: new Date(row.created_at)
				} : undefined
			}));
		}

		return template;
	}

	private groupTemplates(rows: TimeSlotRow[]): PreferenceTemplate[] {
		const templateMap = new Map<number, TimeSlotRow[]>();

		rows.forEach(row => {
			if (!templateMap.has(row.id)) {
				templateMap.set(row.id, []);
			}
			templateMap.get(row.id)!.push(row);
		});

		return Array.from(templateMap.values())
			.map(templateRows => this.mapToPreferenceTemplate(templateRows));
	}
}
