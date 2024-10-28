import { Shift } from "../models";
import { IDatabase, IShiftRepository } from "../interfaces";
import { ShiftType } from "../interfaces/dto/shifts.dto";

export class ShiftRepository implements IShiftRepository {
	private readonly db: IDatabase;
	constructor(db: IDatabase) {
		this.db = db;
	}

	async create(shift: Shift): Promise<number> {
		const result = await this.db.execute("INSERT INTO shifts SET ?", [shift]);
		const shiftId = result.insertId;

		// Insert time ranges
		if (shift.timeRanges && shift.timeRanges.length > 0) {
			const timeRangeValues = shift.timeRanges.map(range => [shiftId, range.start_time, range.end_time]);
			await this.db.execute("INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES ?", [timeRangeValues]);
		}

		return shiftId;
	}

	async getOne(id: number): Promise<Shift[]> {
		const result = await this.db.execute(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                shifts s
            JOIN
                shift_types st ON s.shift_type_id = st.id
            LEFT JOIN
                time_ranges tr ON s.id = tr.shift_id
            LEFT JOIN
                shift_likes l ON l.shift_id = s.id
            WHERE s.id = ?
            GROUP BY s.id
            `, [id]
		);
		return result;
	}

	async getMany(): Promise<Shift[]> {
		return await this.db.execute(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                shifts s
            JOIN
                shift_types st ON s.shift_type_id = st.id
            LEFT JOIN
                time_ranges tr ON s.id = tr.shift_id
            LEFT JOIN
                shift_likes l ON l.shift_id = s.id
            GROUP BY
                s.id
            ORDER BY
                s.date, tr.start_time
            `);
	}

	async getByDate(date: Date): Promise<Shift[]> {
		const result = await this.db.execute(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                shifts s
            JOIN
                shift_types st ON s.shift_type_id = st.id
            LEFT JOIN
                time_ranges tr ON s.id = tr.shift_id
            LEFT JOIN
                shift_likes l ON l.shift_id = s.id
            WHERE 
                s.date = ?
            GROUP BY
                s.id
            ORDER BY
                tr.start_time`,
			[date]
		);
		return result;
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Shift[]> {
		return await this.db.execute(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                shifts s
            JOIN
                shift_types st ON s.shift_type_id = st.id
            LEFT JOIN
                time_ranges tr ON s.id = tr.shift_id
            LEFT JOIN
                shift_likes l ON l.shift_id = s.id
            WHERE 
                s.date BETWEEN ? AND ?
            GROUP BY
                s.id
            ORDER BY
                s.date, tr.start_time`,
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

	async getByShiftTypeId(shiftTypeId: number): Promise<Shift[]> {
		return await this.db.execute(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT CONCAT(tr.id, ':', tr.start_time, '-', tr.end_time) ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes
            FROM 
                shifts s
            JOIN
                shift_types st ON s.shift_type_id = st.id
            LEFT JOIN
                time_ranges tr ON s.id = tr.shift_id
            LEFT JOIN
                shift_likes l ON l.shift_id = s.id
            WHERE 
                s.shift_type_id = ?
            GROUP BY
                s.id
            ORDER BY
                s.date, tr.start_time
        `, [shiftTypeId]);
	}

	async getTypes(team_id: number): Promise<ShiftType[]> {
		return await this.db.execute("SELECT * from shift_types WHERE shift_types.team_id = ?", [team_id]);
	}

	async addTimeRange(shiftId: number, startTime: Date, endTime: Date): Promise<number> {
		const result = await this.db.execute(
			"INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES (?, ?, ?)",
			[shiftId, startTime, endTime]
		);
		return result.insertId;
	}

	async removeTimeRange(timeRangeId: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM time_ranges WHERE id = ?", [timeRangeId]);
		return result.affectedRows;
	}

	async update(shift: Shift): Promise<number> {
		const result = await this.db.execute("UPDATE shifts SET ? WHERE id = ?", [shift, shift.id]);

		// Update time ranges
		if (shift.timeRanges && shift.timeRanges.length > 0) {
			await this.db.execute("DELETE FROM time_ranges WHERE shift_id = ?", [shift.id]);
			const timeRangeValues = shift.timeRanges.map(range => [shift.id, range.start_time, range.end_time]);
			await this.db.execute("INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES ?", [timeRangeValues]);
		}

		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		await this.db.execute("DELETE FROM time_ranges WHERE shift_id = ?", [id]);
		await this.db.execute("DELETE FROM user_shifts WHERE shift_id = ?", [id]);
		const result = await this.db.execute("DELETE FROM shifts WHERE id = ?", [id]);
		return result.affectedRows;
	}

	async deleteByScheduleId(id: number): Promise<number> {
		await this.db.execute(`
            DELETE FROM time_ranges 
            WHERE shift_id IN (SELECT id FROM shifts WHERE schedule_id = ?)`, [id]);
		await this.db.execute(`
            DELETE FROM user_shifts 
            WHERE shift_id IN (SELECT id FROM shifts WHERE schedule_id = ?)`, [id]);
		const result = await this.db.execute("DELETE FROM shifts WHERE schedule_id = ?", [id]);
		return result.affectedRows;
	}
	public async removeUser(id: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM user_shifts WHERE user_id = ?", [id]);
		return result.affectedRows;
	}
}
