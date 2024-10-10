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
				schedules.id as id,
				schedules.start_date,
				schedules.end_date,
				schedules.notes,
				schedules.created_at,
				GROUP_CONCAT(shifts.id SEPARATOR ', ') AS shifts,
				COUNT(DISTINCT l.id) AS likes
			FROM 
					schedules
			RIGHT JOIN 
					shifts ON shifts.schedule_id = schedules.id
			LEFT JOIN
					schedule_likes l ON l.schedule_id = ?
			WHERE schedules.id = ?
			GROUP BY 
				schedules.id, schedules.start_date, schedules.end_date, schedules.notes, schedules.created_at
			ORDER BY 
					schedules.start_date, schedules.end_date`, 
			[id, id]
		);
		return result;
	}

	async getMany(): Promise<Schedule[]> {
		return await this.db.execute(`
			SELECT 
				schedules.id as id,
				schedules.start_date,
				schedules.end_date,
				schedules.notes,
				schedules.created_at,
				GROUP_CONCAT(DISTINCT shifts.id SEPARATOR ', ') AS shifts,
				COUNT(DISTINCT l.id) AS likes
			FROM 
					schedules
			RIGHT JOIN 
					shifts ON shifts.schedule_id = schedules.id
			LEFT JOIN
					schedule_likes l ON l.schedule_id = schedules.id
			GROUP BY 
				schedules.id, schedules.start_date, schedules.end_date, schedules.notes, schedules.created_at
			ORDER BY 
					schedules.start_date, schedules.end_date;`);
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Schedule[]> {
		return await this.db.execute("SELECT * FROM schedules WHERE start_date BETWEEN ? AND ?", [start_date, end_date]);
	}

	async getByUserId(id: number): Promise<Schedule[]> {
		return await this.db.execute(`
			SELECT 
				schedules.id as id,
				schedules.start_date,
				schedules.end_date,
				schedules.notes,
				schedules.created_at,
				GROUP_CONCAT(DISTINCT shifts.id SEPARATOR ', ') AS shifts,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				schedules
			INNER JOIN 
				shifts ON shifts.schedule_id = schedules.id
			INNER JOIN
				user_shifts ON user_shifts.shift_id = shifts.id
			GROUP BY 
				schedules.id, schedules.start_date, schedules.end_date, schedules.notes, schedules.created_at
			ORDER BY 
					schedules.start_date, schedules.end_date;`, [id]);
	}

	async update(Schedule: Schedule): Promise<number> {
		const result = await this.db.execute("UPDATE schedule SET ? WHERE id = ?", [Schedule, Schedule.id]);
		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		let shiftResult = await this.shift_repo.deleteByScheduleId(id);
		if(shiftResult === 0) return 0;
		let result = await this.db.execute("DELETE FROM schedules WHERE id = ?", [id]);
		return result.affectedRows;
	}
}