import { User } from "../models";
import { ShiftRepository } from "./shift.repository";
import { VacationRepository } from "./vacation.repository";
import { PreferenceRepository } from "./preferences.repository";
import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket, Omit<User, 'created_at' | 'recent_shifts' | 'recent_vacations'> {
	created_at: string;
	recent_shifts: string | null;
	recent_vacations: string | null;
	team_name?: string;
}

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

	public async getOne(id: number): Promise<User | null> {
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
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations,
                t.name AS team_name
            FROM 
                users u
            LEFT JOIN
                vacations v ON v.user_id = u.id
            LEFT JOIN
                teams t ON u.team_id = t.id
            WHERE u.id = ?
            GROUP BY u.id`,
			[id, id]
		);

		return rows.length ? this.mapToUser(rows[0]) : null;
	}

	public async getMany(): Promise<User[]> {
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
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations,
                t.name AS team_name
            FROM 
                users u
            LEFT JOIN
                vacations v ON v.user_id = u.id
            LEFT JOIN
                teams t ON u.team_id = t.id
            GROUP BY u.id`
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async getByShiftId(id: number): Promise<User[]> {
		const [rows] = await this.db.execute<UserRow[]>(`
            SELECT 
                u.*, t.name AS team_name
            FROM 
                users u
            JOIN
                user_shifts us ON u.id = us.user_id
            LEFT JOIN
                teams t ON u.team_id = t.id
            WHERE 
                us.shift_id = ?`,
			[id]
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async getByEmail(email: string): Promise<User | null> {
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
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations,
                t.name AS team_name
            FROM 
                users u
            LEFT JOIN
                vacations v ON v.user_id = u.id
            LEFT JOIN
                teams t ON u.team_id = t.id
            WHERE u.email = ?
            GROUP BY u.id`,
			[email]
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
                GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations,
                t.name AS team_name
            FROM 
                users u
            LEFT JOIN
                vacations v ON v.user_id = u.id
            JOIN
                teams t ON u.team_id = t.id
            WHERE u.team_id = ?
            GROUP BY u.id`,
			[teamId]
		);

		return rows.map(row => this.mapToUser(row));
	}

	public async update(user: Partial<User> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE users SET ? WHERE id = ?",
			[user, user.id]
		);
		return result[0].affectedRows;
	}

	public async delete(id: number): Promise<number> {
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
