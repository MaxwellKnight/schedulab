import { Shift } from "../models";
import { IDatabase, IShiftRepository } from "../interfaces";

export class ShiftRepository implements IShiftRepository {
	private readonly db: IDatabase;
	constructor(db: IDatabase) {
		this.db = db;
	}

	async create(shift: Shift): Promise<number> {
		const result = await this.db.execute("INSERT INTO Shifts SET ?", [shift]);
		return result.insertId;
	}

	async getOne(id: number): Promise<Shift[]> {
		const result = await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = ?
			WHERE s.id = ?
			`, [id, id]
		);
		return result;
	}

	async getMany(): Promise<Shift[]> {
		return await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			GROUP BY
				s.id
			ORDER BY
				s.start_time
			`);
	}

	async getByDate(date: Date): Promise<Shift[]> {
		const result = await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			WHERE 
				DATEDIFF(s.date, ?) = 0
			GROUP BY
				s.id
			ORDER BY
				s.start_time`, 
			[date]
		);
		return result;
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Shift[]> {
		return await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			WHERE 
				s.date BETWEEN ? AND ?
			GROUP BY
				s.id
			ORDER BY
				s.start_time`, 
			[start_date, end_date]
		);
	}

	async getByName(name: string): Promise<Shift[]> {
		const result = await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			WHERE 
				s.name = ?
			GROUP BY
				s.id
			ORDER BY
				s.start_time`, 
			[name]
		);
		return result;
	}

	async getByUserId(id: number): Promise<Shift[]> {
		return await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			WHERE s.id IN (
				SELECT us.shift_id
				FROM user_shifts us
				WHERE us.user_id = ?
			)
			GROUP BY
				s.id
			ORDER BY
				s.start_time`, 
			[id]
		);
	}

	async getByScheduleId(id: number): Promise<Shift[]> {
		return await this.db.execute(`
			SELECT 
				s.*,
				(
					SELECT GROUP_CONCAT(DISTINCT user_ids.user_id SEPARATOR ',')
					FROM (
						SELECT us.user_id
						FROM user_shifts us
						WHERE us.id = s.id
					) AS user_ids
				) AS users,
				COUNT(DISTINCT l.id) AS likes
			FROM 
				shifts s
			LEFT JOIN
				shift_likes l ON l.shift_id = s.id
			WHERE 
			s.schedule_id = ?
			GROUP BY
				s.id
			ORDER BY
				s.start_time`, 
			[id]
		);
	}

	async update(shift: Shift): Promise<number> {
		const result = await this.db.execute("UPDATE Shifts SET ? WHERE id = ?", [shift, shift.id]);
		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		let result = await this.db.execute("DELETE FROM user_shifts us WHERE us.shift_id = ?", [id]);
		if(result.affectedRows === 0) return 0;
		result =  await this.db.execute("DELETE FROM shifts s WHERE s.id = ?", [id]);
		return result.affectedRows;
	}

	async deleteByScheduleId(id: number): Promise<number> {
		let result = await this.db.execute(`
			DELETE FROM 
				user_shifts us 
			WHERE shift_id IN 
				(SELECT s.id FROM shifts s WHERE s.schedule_id = ?)`, [id]);

		if(result.affectedRows === 0) return 0;

		result = await this.db.execute("DELETE FROM shifts s WHERE s.schedule_id = ?", [id]);
		return result.affectedRows;
	}

	public async removeUser(id: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM user_shifts WHERE user_id = ?", [id]);
		return result.affectedRows;
	}
}