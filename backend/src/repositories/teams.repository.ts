import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Team, TeamRole } from "../models/user.model";

interface TeamRow extends RowDataPacket, Omit<Team, 'created_at'> {
	created_at: string;
}

interface TeamRoleRow extends RowDataPacket, Omit<TeamRole, 'created_at'> {
	created_at: string;
}

export class TeamRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	public async create(team: Omit<Team, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO teams SET ?",
			[team]
		);
		return result[0].insertId;
	}

	public async getOne(id: number, userId?: number): Promise<Team | null> {
		const [rows] = await this.db.execute<TeamRow[]>(`
            SELECT t.*
            FROM teams t
            ${userId ? 'INNER JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = ?' : ''}
            WHERE t.id = ?`,
			userId ? [userId, id] : [id]
		);

		return rows.length ? this.mapToTeam(rows[0]) : null;
	}

	public async getMany(userId?: number): Promise<Team[]> {
		const [rows] = await this.db.execute<TeamRow[]>(`
            SELECT t.*
            FROM teams t
            ${userId ? 'INNER JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = ?' : ''}`,
			userId ? [userId] : []
		);

		return rows.map(row => this.mapToTeam(row));
	}

	public async getByTeamCode(teamCode: string): Promise<Team | null> {
		const [rows] = await this.db.execute<TeamRow[]>(
			"SELECT * FROM teams WHERE team_code = ?",
			[teamCode]
		);

		return rows.length ? this.mapToTeam(rows[0]) : null;
	}

	public async getByCreatorId(creatorId: number): Promise<Team[]> {
		const [rows] = await this.db.execute<TeamRow[]>(
			"SELECT * FROM teams WHERE creator_id = ?",
			[creatorId]
		);

		return rows.map(row => this.mapToTeam(row));
	}

	public async addMember(teamId: number, userId: number): Promise<boolean> {
		try {
			await this.db.execute<ResultSetHeader>(
				"INSERT INTO team_members (team_id, user_id) VALUES (?, ?)",
				[teamId, userId]
			);
			return true;
		} catch (error) {
			// Handle unique constraint violation or other errors
			return false;
		}
	}

	public async removeMember(teamId: number, userId: number): Promise<boolean> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
			[teamId, userId]
		);
		return result[0].affectedRows > 0;
	}

	public async update(team: Partial<Team> & { id: number }, userId?: number): Promise<number> {
		if (userId) {
			// Verify user is a member of the team before updating
			const [rows] = await this.db.execute<RowDataPacket[]>(
				"SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?",
				[team.id, userId]
			);
			if (!rows.length) return 0;
		}

		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE teams SET ? WHERE id = ?",
			[team, team.id]
		);
		return result[0].affectedRows;
	}

	public async delete(id: number, userId?: number): Promise<number> {
		if (userId) {
			// Verify user is a member of the team before deleting
			const [rows] = await this.db.execute<RowDataPacket[]>(
				"SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?",
				[id, userId]
			);
			if (!rows.length) return 0;
		}

		// Delete related records first
		await this.db.execute("DELETE FROM team_members WHERE team_id = ?", [id]);
		await this.db.execute("DELETE FROM member_roles WHERE team_id = ?", [id]);
		await this.db.execute("DELETE FROM team_roles WHERE team_id = ?", [id]);
		await this.db.execute("DELETE FROM shift_types WHERE team_id = ?", [id]);
		await this.db.execute("DELETE FROM constraints WHERE team_id = ?", [id]);
		await this.db.execute("DELETE FROM events WHERE team_id = ?", [id]);

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM teams WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	public async createDefaultRoles(teamId: number): Promise<void> {
		await this.db.execute(
			"INSERT INTO team_roles (team_id, name) VALUES (?, 'admin'), (?, 'member')",
			[teamId, teamId]
		);
	}

	public async getRoles(teamId: number): Promise<TeamRole[]> {
		const [rows] = await this.db.execute<TeamRoleRow[]>(
			"SELECT * FROM team_roles WHERE team_id = ?",
			[teamId]
		);
		return rows.map(row => ({
			...row,
			created_at: new Date(row.created_at)
		}));
	}

	public async getRoleByName(teamId: number, roleName: string): Promise<TeamRole | null> {
		const [rows] = await this.db.execute<TeamRoleRow[]>(
			"SELECT * FROM team_roles WHERE team_id = ? AND name = ?",
			[teamId, roleName]
		);
		return rows.length ? {
			...rows[0],
			created_at: new Date(rows[0].created_at)
		} : null;
	}

	public async getMemberRole(teamId: number, userId: number): Promise<string | null> {
		const [rows] = await this.db.execute<RowDataPacket[]>(
			`SELECT tr.name 
             FROM member_roles mr
             JOIN team_roles tr ON mr.role_id = tr.id
             WHERE mr.team_id = ? AND mr.user_id = ?`,
			[teamId, userId]
		);
		return rows.length ? rows[0].name : null;
	}

	public async setMemberRole(teamId: number, userId: number, roleName: string): Promise<boolean> {
		try {
			const role = await this.getRoleByName(teamId, roleName);
			if (!role) return false;

			await this.db.execute<ResultSetHeader>(
				`INSERT INTO member_roles (team_id, user_id, role_id) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
				[teamId, userId, role.id]
			);
			return true;
		} catch (error) {
			return false;
		}
	}

	public async addRole(teamId: number, roleName: string): Promise<number | null> {
		try {
			const result = await this.db.execute<ResultSetHeader>(
				"INSERT INTO team_roles (team_id, name) VALUES (?, ?)",
				[teamId, roleName]
			);
			return result[0].insertId;
		} catch (error) {
			return null;
		}
	}

	public async deleteRole(teamId: number, roleId: number): Promise<boolean> {
		// First check if it's not a default role
		const [roleCheck] = await this.db.execute<RowDataPacket[]>(
			"SELECT name FROM team_roles WHERE id = ? AND team_id = ?",
			[roleId, teamId]
		);

		if (!roleCheck.length || ['admin', 'member'].includes(roleCheck[0].name)) {
			return false;
		}

		// Move users with this role to 'member' role
		const memberRole = await this.getRoleByName(teamId, 'member');
		if (memberRole) {
			await this.db.execute(
				"UPDATE member_roles SET role_id = ? WHERE team_id = ? AND role_id = ?",
				[memberRole.id, teamId, roleId]
			);
		}

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM team_roles WHERE id = ? AND team_id = ?",
			[roleId, teamId]
		);

		return result[0].affectedRows > 0;
	}

	public async getMemberCount(teamId: number): Promise<number> {
		const [rows] = await this.db.execute<RowDataPacket[]>(
			"SELECT COUNT(*) as count FROM team_members WHERE team_id = ?",
			[teamId]
		);
		return rows[0].count;
	}

	private mapToTeam(row: TeamRow): Team {
		return {
			...row,
			created_at: new Date(row.created_at)
		};
	}

	public async getAdminCount(teamId: number): Promise<number> {
		const [rows] = await this.db.execute<RowDataPacket[]>(
			`SELECT COUNT(*) as count 
             FROM member_roles mr
             JOIN team_roles tr ON mr.role_id = tr.id
             WHERE mr.team_id = ? AND tr.name = 'admin'`,
			[teamId]
		);
		return rows[0].count;
	}
}
