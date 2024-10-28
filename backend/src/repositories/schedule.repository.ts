import { Schedule } from "../models";
import { IScheduleRepository, IDatabase, IShiftRepository } from "../interfaces";
import { ShiftRepository } from "./shift.repository";

export class ScheduleRepository implements IScheduleRepository {
	private readonly db: IDatabase;
	private readonly shift_repo: IShiftRepository;

	constructor(db: IDatabase) {
		this.db = db;
		this.shift_repo = new ShiftRepository(db);
	}

	async create(schedule: Schedule): Promise<number> {
		const result = await this.db.execute("INSERT INTO schedules SET ?", [schedule]);
		return result.insertId;
	}

	async getOne(id: number): Promise<Schedule[]> {
		const result = await this.db.execute(`
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
		return result;
	}

	async getMany(): Promise<Schedule[]> {
		return await this.db.execute(`
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
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Schedule[]> {
		return await this.db.execute(`
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
	}

	async getByUserId(id: number): Promise<Schedule[]> {
		return await this.db.execute(`
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
	}

	async getByTeamId(teamId: number): Promise<Schedule[]> {
		return await this.db.execute(`
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
	}

	async publish(id: number): Promise<number> {
		const result = await this.db.execute(
			"UPDATE schedules SET published = TRUE WHERE id = ?",
			[id]
		);
		return result.affectedRows;
	}

	async unpublish(id: number): Promise<number> {
		const result = await this.db.execute(
			"UPDATE schedules SET published = FALSE WHERE id = ?",
			[id]
		);
		return result.affectedRows;
	}

	async update(schedule: Schedule): Promise<number> {
		const result = await this.db.execute("UPDATE schedules SET ? WHERE id = ?", [schedule, schedule.id]);
		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		let shiftResult = await this.shift_repo.deleteByScheduleId(id);
		if (shiftResult === 0) return 0;
		let result = await this.db.execute("DELETE FROM schedules WHERE id = ?", [id]);
		return result.affectedRows;
	}
}
