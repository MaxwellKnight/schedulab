import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Team, TeamRole, User } from "../models/user.model";

interface TeamRow extends RowDataPacket, Omit<Team, 'created_at'> {
	created_at: string;
}

interface TeamRoleRow extends RowDataPacket, Omit<TeamRole, 'created_at'> {
	created_at: string;
}

type UserWithoutPassword = Omit<User, 'password'>;

interface TeamMemberRow extends RowDataPacket {
	id: number;
	google_id: string | null;
	picture: string | null;
	display_name: string | null;
	user_role: string;
	first_name: string;
	middle_name: string | null;
	last_name: string;
	email: string | null;
	last_active: string | null;
	created_at: string;
	team_id: number;
	team_name: string;
	role_name: string;
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

	public async getTeamUsers(teamId: number): Promise<UserWithoutPassword[]> {
		const [rows] = await this.db.execute<TeamMemberRow[]>(`
            SELECT 
                u.id,
                u.google_id,
                u.picture,
                u.display_name,
                u.user_role,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.last_active,
                u.created_at,
                tr.name as role_name
            FROM users u
            INNER JOIN team_members tm ON u.id = tm.user_id
            LEFT JOIN member_roles mr ON tm.team_id = mr.team_id AND tm.user_id = mr.user_id
            LEFT JOIN team_roles tr ON mr.role_id = tr.id
            WHERE tm.team_id = ?
            ORDER BY u.first_name, u.last_name
        `, [teamId]);

		return rows.map(row => ({
			id: row.id,
			google_id: row.google_id || undefined,
			picture: row.picture || undefined,
			display_name: row.display_name || undefined,
			user_role: row.user_role,
			first_name: row.first_name,
			middle_name: row.middle_name || undefined,
			last_name: row.last_name,
			email: row.email || "",
			last_active: row.last_active ? new Date(row.last_active) : null,
			created_at: new Date(row.created_at)
		}));
	}

	public async getAllTeamMembers(userId: number): Promise<{
		teamId: number;
		teamName: string;
		members: UserWithoutPassword[];
	}[]> {
		const [teamRows] = await this.db.execute<TeamMemberRow[]>(`
            SELECT DISTINCT t.id as team_id, t.name as team_name
            FROM teams t
            INNER JOIN team_members tm ON t.id = tm.team_id
            WHERE tm.user_id = ?
        `, [userId]);
		const result = await Promise.all(teamRows.map(async (team) => {
			const members = await this.getTeamUsers(team.team_id);
			return {
				teamId: team.team_id,
				teamName: team.team_name,
				members
			};
		}));

		return result;
	}
}
