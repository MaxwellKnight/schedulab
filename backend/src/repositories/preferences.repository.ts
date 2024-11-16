import { Database } from "../configs/db.config";
import { PreferenceTemplate, TimeSlot } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

export class PreferenceTemplateRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	public async validateUserTeamMembership(userId: number, teamId: number): Promise<boolean> {
		const [rows] = await this.db.execute<TeamMembershipRow[]>(`
			SELECT user_id, team_id 
			FROM team_members 
			WHERE user_id = ? AND team_id = ?
		`, [userId, teamId]);

		return rows.length > 0;
	}

	public async validateTemplateAccess(templateId: number, userId: number): Promise<boolean> {
		const [rows] = await this.db.execute<TeamMembershipRow[]>(`
			SELECT tm.user_id, tm.team_id
			FROM team_members tm
			JOIN preference_templates pt ON tm.team_id = pt.team_id
			WHERE pt.id = ? AND tm.user_id = ?
		`, [templateId, userId]);

		return rows.length > 0;
	}

	public async create(template: Omit<PreferenceTemplate, 'id' | 'created_at' | 'updated_at'>, userId: number): Promise<number> {
		const hasAccess = await this.validateUserTeamMembership(userId, template.team_id);
		if (!hasAccess) {
			throw new Error('User does not have access to this team');
		}

		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO preference_templates SET ?",
			[template]
		);
		return result[0].insertId;
	}

	public async getOne(id: number, userId: number): Promise<PreferenceTemplate | null> {
		const hasAccess = await this.validateTemplateAccess(id, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

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
			WHERE pt.id = ?
			ORDER BY ts.date, ptr.start_time
		`, [id]);

		if (!rows.length) return null;

		return this.mapToPreferenceTemplate(rows);
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
		console.log(rows);

		return this.groupTemplates(rows);
	}

	public async getByTeamId(teamId: number, userId: number): Promise<PreferenceTemplate[]> {
		const hasAccess = await this.validateUserTeamMembership(userId, teamId);
		if (!hasAccess) {
			throw new Error('User does not have access to this team');
		}

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

	public async update(template: Partial<PreferenceTemplate> & { id: number }, userId: number): Promise<number> {
		const hasAccess = await this.validateTemplateAccess(template.id, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE preference_templates SET ? WHERE id = ?",
			[template, template.id]
		);
		return result[0].affectedRows;
	}

	public async delete(id: number, userId: number): Promise<number> {
		const hasAccess = await this.validateTemplateAccess(id, userId);
		if (!hasAccess) {
			throw new Error('User does not have access to this template');
		}

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM preference_templates WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	public async deleteByTeamId(teamId: number, userId: number): Promise<number> {
		const hasAccess = await this.validateUserTeamMembership(userId, teamId);
		if (!hasAccess) {
			throw new Error('User does not have access to this team');
		}

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM preference_templates WHERE team_id = ?",
			[teamId]
		);
		return result[0].affectedRows;
	}

	private mapToPreferenceTemplate(rows: TimeSlotRow[]): PreferenceTemplate {
		const firstRow = rows[0];
		const template: PreferenceTemplate = {
			id: firstRow.id,
			team_id: firstRow.team_id,
			name: firstRow.name,
			start_date: new Date(firstRow.start_date),
			end_date: new Date(firstRow.end_date),
			status: firstRow.status,
			created_by: firstRow.created_by,
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
