import { Shift } from "../models";
import { ShiftType } from "../interfaces/dto/shifts.dto";
import { Database } from "../configs/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface ShiftRow extends RowDataPacket {
	id: number;
	schedule_id: number;
	shift_type_id: number;
	shift_type_name: string;
	shift_name: string;
	required_count: number;
	actual_count: number;
	date: string;
	created_at: string;
	time_ranges: string | null;
	users: string | null;
	likes: number;
}

interface TimeRange {
	id?: number;
	shift_id: number;
	start_time: Date;
	end_time: Date;
}

interface ShiftTypeRow extends RowDataPacket, ShiftType { }

export class ShiftRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async create(shift: Omit<Shift, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO shifts SET ?",
			[shift]
		);
		const shiftId = result[0].insertId;

		if (shift.timeRanges && shift.timeRanges.length > 0) {
			const timeRangeValues = shift.timeRanges.map(range => [
				shiftId,
				range.start_time,
				range.end_time
			]);
			await this.db.execute<ResultSetHeader>(
				"INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES ?",
				[timeRangeValues]
			);
		}

		return shiftId;
	}

	async getOne(id: number): Promise<Shift | null> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes,
                (
                    SELECT COUNT(DISTINCT us2.user_id)
                    FROM user_shifts us2
                    WHERE us2.shift_id = s.id
                ) as actual_count
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
        `, [id]);

		return rows.length ? this.mapToShift(rows[0]) : null;
	}

	async getMany(): Promise<Shift[]> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
            SELECT 
                s.*, st.name as shift_type_name,
                GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
                (
                    SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                    FROM user_shifts us
                    WHERE us.shift_id = s.id
                ) AS users,
                COUNT(DISTINCT l.id) AS likes,
                (
                    SELECT COUNT(DISTINCT us2.user_id)
                    FROM user_shifts us2
                    WHERE us2.shift_id = s.id
                ) as actual_count
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

		return rows.map(row => this.mapToShift(row));
	}

	async getByDate(date: Date): Promise<Shift[]> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
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
                tr.start_time
        `, [date]);

		return rows.map(row => this.mapToShift(row));
	}

	async getByName(name: string): Promise<Shift[]> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
        SELECT 
            s.*, st.name as shift_type_name,
            GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
            (
                SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                FROM user_shifts us
                WHERE us.shift_id = s.id
            ) AS users,
            COUNT(DISTINCT l.id) AS likes,
            (
                SELECT COUNT(DISTINCT us2.user_id)
                FROM user_shifts us2
                WHERE us2.shift_id = s.id
            ) as actual_count
        FROM 
            shifts s
        JOIN
            shift_types st ON s.shift_type_id = st.id
        LEFT JOIN
            time_ranges tr ON s.id = tr.shift_id
        LEFT JOIN
            shift_likes l ON l.shift_id = s.id
        WHERE 
            s.shift_name = ?
        GROUP BY
            s.id
        ORDER BY
            s.date, tr.start_time`,
			[name]
		);

		return rows.map(row => this.mapToShift(row));
	}

	async getByUserId(id: number): Promise<Shift[]> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
        SELECT 
            s.*, st.name as shift_type_name,
            GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
            (
                SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                FROM user_shifts us
                WHERE us.shift_id = s.id
            ) AS users,
            COUNT(DISTINCT l.id) AS likes,
            (
                SELECT COUNT(DISTINCT us2.user_id)
                FROM user_shifts us2
                WHERE us2.shift_id = s.id
            ) as actual_count
        FROM 
            shifts s
        JOIN
            shift_types st ON s.shift_type_id = st.id
        JOIN
            user_shifts us ON s.id = us.shift_id
        LEFT JOIN
            time_ranges tr ON s.id = tr.shift_id
        LEFT JOIN
            shift_likes l ON l.shift_id = s.id
        WHERE 
            us.user_id = ?
        GROUP BY
            s.id
        ORDER BY
            s.date, tr.start_time`,
			[id]
		);

		return rows.map(row => this.mapToShift(row));
	}

	async getByScheduleId(id: number): Promise<Shift[]> {
		const [rows] = await this.db.execute<ShiftRow[]>(`
        SELECT 
            s.*, st.name as shift_type_name,
            GROUP_CONCAT(DISTINCT tr.start_time, '-', tr.end_time ORDER BY tr.start_time SEPARATOR ',') AS time_ranges,
            (
                SELECT GROUP_CONCAT(DISTINCT us.user_id SEPARATOR ',')
                FROM user_shifts us
                WHERE us.shift_id = s.id
            ) AS users,
            COUNT(DISTINCT l.id) AS likes,
            (
                SELECT COUNT(DISTINCT us2.user_id)
                FROM user_shifts us2
                WHERE us2.shift_id = s.id
            ) as actual_count
        FROM 
            shifts s
        JOIN
            shift_types st ON s.shift_type_id = st.id
        LEFT JOIN
            time_ranges tr ON s.id = tr.shift_id
        LEFT JOIN
            shift_likes l ON l.shift_id = s.id
        WHERE 
            s.schedule_id = ?
        GROUP BY
            s.id
        ORDER BY
            s.date, tr.start_time`,
			[id]
		);

		return rows.map(row => this.mapToShift(row));
	}

	async getTypes(team_id: number): Promise<ShiftType[]> {
		const [rows] = await this.db.execute<ShiftTypeRow[]>(
			"SELECT * from shift_types WHERE shift_types.team_id = ?",
			[team_id]
		);
		return rows;
	}

	async addTimeRange(shiftId: number, startTime: Date, endTime: Date): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES (?, ?, ?)",
			[shiftId, startTime, endTime]
		);
		return result[0].insertId;
	}

	async removeTimeRange(timeRangeId: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM time_ranges WHERE id = ?",
			[timeRangeId]
		);
		return result[0].affectedRows;
	}

	async update(shift: Partial<Shift> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE shifts SET ? WHERE id = ?",
			[shift, shift.id]
		);

		// Update time ranges
		if (shift.timeRanges && shift.timeRanges.length > 0) {
			await this.db.execute<ResultSetHeader>(
				"DELETE FROM time_ranges WHERE shift_id = ?",
				[shift.id]
			);
			const timeRangeValues = shift.timeRanges.map(range => [
				shift.id,
				range.start_time,
				range.end_time
			]);
			await this.db.execute<ResultSetHeader>(
				"INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES ?",
				[timeRangeValues]
			);
		}

		return result[0].affectedRows;
	}

	async delete(id: number): Promise<number> {
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM time_ranges WHERE shift_id = ?",
			[id]
		);
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM user_shifts WHERE shift_id = ?",
			[id]
		);
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM shifts WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async deleteByScheduleId(id: number): Promise<number> {
		await this.db.execute<ResultSetHeader>(`
            DELETE FROM time_ranges 
            WHERE shift_id IN (SELECT id FROM shifts WHERE schedule_id = ?)`,
			[id]
		);
		await this.db.execute<ResultSetHeader>(`
            DELETE FROM user_shifts 
            WHERE shift_id IN (SELECT id FROM shifts WHERE schedule_id = ?)`,
			[id]
		);
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM shifts WHERE schedule_id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async removeUser(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM user_shifts WHERE user_id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	private mapToShift(row: ShiftRow): Shift {
		return {
			id: row.id,
			schedule_id: row.schedule_id,
			shift_type_id: row.shift_type_id,
			shift_type_name: row.shift_type_name,
			shift_name: row.shift_name,
			required_count: row.required_count,
			actual_count: row.actual_count,
			date: new Date(row.date),
			created_at: new Date(row.created_at),
			timeRanges: row.time_ranges ? this.parseTimeRanges(row.time_ranges) : [],
			users: row.users ? row.users.split(',').map(Number).filter(id => !isNaN(id)) : [],
			likes: row.likes
		};
	}

	private parseTimeRanges(timeRangesStr: string): TimeRange[] {
		return timeRangesStr.split(',').map(rangeStr => {
			const [startTime, endTime] = rangeStr.split('-');
			return {
				start_time: new Date(startTime),
				end_time: new Date(endTime),
				shift_id: 0 // This will be set when creating/updating
			};
		});
	}
}
