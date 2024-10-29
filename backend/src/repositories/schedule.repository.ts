import { Database } from "../configs/db.config";
import { Schedule } from "../models";
import { ShiftRepository } from "./shift.repository";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface ScheduleRow extends RowDataPacket, Omit<Schedule, 'start_date' | 'end_date' | 'created_at'> {
	start_date: string;
	end_date: string;
	created_at: string;
	shifts: number[];  // For GROUP_CONCAT result
	likes: number;   // For COUNT result
}

export class ScheduleRepository {
	private readonly db: Database;
	private readonly shift_repo: ShiftRepository;

	constructor(db: Database) {
		this.db = db;
		this.shift_repo = new ShiftRepository(db);
	}

	async create(schedule: Omit<Schedule, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO schedules SET ?",
			[schedule]
		);
		return result[0].insertId;
	}

	async getOne(id: number): Promise<Schedule | null> {
		const [rows] = await this.db.execute<ScheduleRow[]>(`
            SELECT 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at,
                GROUP_CONCAT(DISTINCT sh.id ORDER BY sh.date, tr.start_time SEPARATOR ',') AS shifts,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                schedules s
            LEFT JOIN 
                shifts sh ON sh.schedule_id = s.id
            LEFT JOIN
                time_ranges tr ON tr.shift_id = sh.id
            LEFT JOIN
                schedule_likes l ON l.schedule_id = s.id
            WHERE s.id = ?
            GROUP BY 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at
        `, [id]);

		return rows.length ? this.mapToSchedule(rows[0]) : null;
	}

	async getMany(): Promise<Schedule[]> {
		const [rows] = await this.db.execute<ScheduleRow[]>(`
            SELECT 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at,
                GROUP_CONCAT(DISTINCT sh.id ORDER BY sh.date, tr.start_time SEPARATOR ',') AS shifts,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                schedules s
            LEFT JOIN 
                shifts sh ON sh.schedule_id = s.id
            LEFT JOIN
                time_ranges tr ON tr.shift_id = sh.id
            LEFT JOIN
                schedule_likes l ON l.schedule_id = s.id
            GROUP BY 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at
            ORDER BY 
                s.start_date, s.end_date
        `);

		return rows.map(row => this.mapToSchedule(row));
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Schedule[]> {
		const [rows] = await this.db.execute<ScheduleRow[]>(`
            SELECT 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at,
                GROUP_CONCAT(DISTINCT sh.id ORDER BY sh.date, tr.start_time SEPARATOR ',') AS shifts,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                schedules s
            LEFT JOIN 
                shifts sh ON sh.schedule_id = s.id
            LEFT JOIN
                time_ranges tr ON tr.shift_id = sh.id
            LEFT JOIN
                schedule_likes l ON l.schedule_id = s.id
            WHERE 
                s.start_date BETWEEN ? AND ?
            GROUP BY 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at
            ORDER BY 
                s.start_date, s.end_date
        `, [start_date, end_date]);

		return rows.map(row => this.mapToSchedule(row));
	}

	async getByUserId(id: number): Promise<Schedule[]> {
		const [rows] = await this.db.execute<ScheduleRow[]>(`
            SELECT 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at,
                GROUP_CONCAT(DISTINCT sh.id ORDER BY sh.date, tr.start_time SEPARATOR ',') AS shifts,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                schedules s
            INNER JOIN 
                shifts sh ON sh.schedule_id = s.id
            INNER JOIN
                user_shifts us ON us.shift_id = sh.id
            LEFT JOIN
                time_ranges tr ON tr.shift_id = sh.id
            LEFT JOIN
                schedule_likes l ON l.schedule_id = s.id
            WHERE 
                us.user_id = ?
            GROUP BY 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at
            ORDER BY 
                s.start_date, s.end_date
        `, [id]);

		return rows.map(row => this.mapToSchedule(row));
	}

	async getByTeamId(teamId: number): Promise<Schedule[]> {
		const [rows] = await this.db.execute<ScheduleRow[]>(`
            SELECT 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at,
                GROUP_CONCAT(DISTINCT sh.id ORDER BY sh.date, tr.start_time SEPARATOR ',') AS shifts,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                schedules s
            LEFT JOIN 
                shifts sh ON sh.schedule_id = s.id
            LEFT JOIN
                time_ranges tr ON tr.shift_id = sh.id
            LEFT JOIN
                schedule_likes l ON l.schedule_id = s.id
            WHERE 
                s.team_id = ?
            GROUP BY 
                s.id, s.team_id, s.start_date, s.end_date, s.published, s.rating, s.notes, s.created_at
            ORDER BY 
                s.start_date, s.end_date
        `, [teamId]);

		return rows.map(row => this.mapToSchedule(row));
	}

	async publish(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE schedules SET published = TRUE WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async unpublish(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE schedules SET published = FALSE WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async update(schedule: Partial<Schedule> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE schedules SET ? WHERE id = ?",
			[schedule, schedule.id]
		);
		return result[0].affectedRows;
	}

	async delete(id: number): Promise<number> {
		const shiftResult = await this.shift_repo.deleteByScheduleId(id);
		if (shiftResult === 0) return 0;

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM schedules WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	private mapToSchedule(row: ScheduleRow): Schedule {
		return {
			id: row.id,
			team_id: row.team_id,
			start_date: new Date(row.start_date),
			end_date: new Date(row.end_date),
			published: row.published,
			rating: row.rating,
			notes: row.notes,
			created_at: new Date(row.created_at),
			shifts: row.shifts,
			likes: row.likes
		};
	}
}
