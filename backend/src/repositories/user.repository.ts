import { User } from "../models";
import { ShiftRepository } from "./shift.repository";
import { VacationRepository } from "./vacation.repository";
import { PreferenceRepository } from "./preferences.repository";
import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Team } from "../models/user.model";

interface UserRow extends RowDataPacket, Omit<User, 'created_at' | 'recent_shifts' | 'recent_vacations'> {
	created_at: string;
	recent_shifts: string | null;
	recent_vacations: string | null;
}

interface TeamRow extends RowDataPacket, Team { }

export class UserRepository {
	private readonly db: Database;
	private readonly shift_repo: ShiftRepository;
	private readonly preference_repo: PreferenceRepository;
	private readonly vacation_repo: VacationRepository;

	constructor(db: Database) {
		this.db = db;
		this.shift_repo = new ShiftRepository(db);
		this.preference_repo = new PreferenceRepository(db);
		this.vacation_repo = new VacationRepository(db);
	}

	public async create(user: Omit<User, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO users SET ?",
			[user]
		);
		return result[0].insertId;
	}

	public async getOne(id: number, teamId?: number): Promise<User | null> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*,
                (
                    SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
                    FROM (
                        SELECT s.id, tr.start_time
                        FROM shifts s
                        JOIN time_ranges tr ON s.id = tr.shift_id
                        JOIN user_shifts us ON s.id = us.shift_id
                        WHERE us.user_id = ?
                        ORDER BY tr.start_time DESC
                        LIMIT 5
                    ) AS limited_shifts
                ) AS recent_shifts,
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
            FROM 
                users u
            ${teamId ? 'INNER JOIN team_members tm ON u.id = tm.user_id AND tm.team_id = ?' : ''}
            LEFT JOIN vacations v ON v.user_id = u.id
            WHERE u.id = ?
            GROUP BY u.id`,
			teamId ? [id, teamId, id] : [id, id]
		);

		return rows.length ? this.mapToUser(rows[0]) : null;
	}

	public async getMany(teamId?: number): Promise<User[]> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*,
                (
                    SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
                    FROM (
                        SELECT s.id, tr.start_time
                        FROM shifts s
                        JOIN time_ranges tr ON s.id = tr.shift_id
                        JOIN user_shifts us ON s.id = us.shift_id
                        WHERE us.user_id = u.id
                        ORDER BY tr.start_time DESC
                        LIMIT 5
                    ) AS limited_shifts
                ) AS recent_shifts,
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
            FROM 
                users u
            ${teamId ? 'INNER JOIN team_members tm ON u.id = tm.user_id AND tm.team_id = ?' : ''}
            LEFT JOIN vacations v ON v.user_id = u.id
            GROUP BY u.id`,
			teamId ? [teamId] : []
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async getByShiftId(id: number, teamId?: number): Promise<User[]> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*,
                (
                    SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
                    FROM (
                        SELECT s.id, tr.start_time
                        FROM shifts s
                        JOIN time_ranges tr ON s.id = tr.shift_id
                        JOIN user_shifts us ON s.id = us.shift_id
                        WHERE us.user_id = u.id
                        ORDER BY tr.start_time DESC
                        LIMIT 5
                    ) AS limited_shifts
                ) AS recent_shifts,
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
            FROM 
                users u
            INNER JOIN user_shifts us ON u.id = us.user_id
            ${teamId ? 'INNER JOIN team_members tm ON u.id = tm.user_id AND tm.team_id = ?' : ''}
            LEFT JOIN vacations v ON v.user_id = u.id
            WHERE us.shift_id = ?
            GROUP BY u.id`,
			teamId ? [teamId, id] : [id]
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async getTeams(userId: number): Promise<Team[]> {
		const [rows] = await this.db.execute<TeamRow[]>(`
		SELECT DISTINCT t.id, t.name, t.creator_id, t.team_code, t.created_at
        FROM teams t 
        INNER JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = ?
		`, [userId]);

		return rows.length ? rows.map(({ id, creator_id, name, team_code, created_at }) => ({
			id,
			name,
			creator_id,
			team_code,
			created_at
		})) : [];
	}

	public async getByEmail(email: string, teamId?: number): Promise<User | null> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*,
                (
                    SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
                    FROM (
                        SELECT s.id, tr.start_time
                        FROM shifts s
                        JOIN time_ranges tr ON s.id = tr.shift_id
                        JOIN user_shifts us ON s.id = us.shift_id
                        WHERE us.user_id = u.id
                        ORDER BY tr.start_time DESC
                        LIMIT 5
                    ) AS limited_shifts
                ) AS recent_shifts,
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
            FROM 
                users u
            ${teamId ? 'INNER JOIN team_members tm ON u.id = tm.user_id AND tm.team_id = ?' : ''}
            LEFT JOIN vacations v ON v.user_id = u.id
            WHERE u.email = ? 
            GROUP BY u.id`,
			teamId ? [teamId, email] : [email]
		);

		return rows.length ? this.mapToUser(rows[0]) : null;
	}

	public async getByTeamId(teamId: number): Promise<User[]> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*,
                (
                    SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
                    FROM (
                        SELECT s.id, tr.start_time
                        FROM shifts s
                        JOIN time_ranges tr ON s.id = tr.shift_id
                        JOIN user_shifts us ON s.id = us.shift_id
                        WHERE us.user_id = u.id
                        ORDER BY tr.start_time DESC
                        LIMIT 5
                    ) AS limited_shifts
                ) AS recent_shifts,
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
            FROM 
                users u
            INNER JOIN team_members tm ON u.id = tm.user_id AND tm.team_id = ?
            LEFT JOIN vacations v ON v.user_id = u.id
            GROUP BY u.id`,
			[teamId]
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async update(user: Partial<User> & { id: number }, teamId?: number): Promise<number> {
		if (teamId) {
			// Verify user belongs to team before updating
			const [rows] = await this.db.execute<RowDataPacket[]>(
				"SELECT 1 FROM team_members WHERE user_id = ? AND team_id = ?",
				[user.id, teamId]
			);
			if (!rows.length) return 0;
		}

		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE users SET ? WHERE id = ?",
			[user, user.id]
		);
		return result[0].affectedRows;
	}

	public async delete(id: number, teamId?: number): Promise<number> {
		if (teamId) {
			// Verify user belongs to team before deleting
			const [rows] = await this.db.execute<RowDataPacket[]>(
				"SELECT 1 FROM team_members WHERE user_id = ? AND team_id = ?",
				[id, teamId]
			);
			if (!rows.length) return 0;
		}

		await this.vacation_repo.deleteByUserId(id);
		await this.preference_repo.deleteByUserId(id);
		await this.shift_repo.removeUser(id);

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM users WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	private mapToUser(row: UserRow): User {
		return {
			...row,
			created_at: new Date(row.created_at),
			recent_shifts: row.recent_shifts ? row.recent_shifts.split(',').map(Number) : [],
			recent_vacations: row.recent_vacations ? row.recent_vacations.split(',').map(Number) : []
		};
	}
}
