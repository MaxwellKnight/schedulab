import { Database } from "../configs/db.config";
import { Vacation } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface VacationRow extends RowDataPacket, Omit<Vacation, 'start_date' | 'end_date' | 'created_at'> {
	start_date: string;
	end_date: string;
	created_at: string;
}

export class VacationRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async create(vacation: Omit<Vacation, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO vacations SET ?",
			[vacation]
		);
		return result[0].insertId;
	}

	async getOne(id: number): Promise<Vacation | null> {
		const [rows] = await this.db.execute<VacationRow[]>(
			"SELECT * FROM vacations WHERE id = ?",
			[id]
		);
		return rows.length ? this.mapToVacation(rows[0]) : null;
	}

	async getMany(): Promise<Vacation[]> {
		const [rows] = await this.db.execute<VacationRow[]>(
			"SELECT * FROM vacations"
		);
		return rows.map(row => this.mapToVacation(row));
	}

	async update(vacation: Partial<Vacation> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE vacations SET ? WHERE id = ?",
			[vacation, vacation.id]
		);
		return result[0].affectedRows;
	}

	async delete(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM vacations WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async getByDate(date: Date): Promise<Vacation[]> {
		const [rows] = await this.db.execute<VacationRow[]>(
			"SELECT * FROM vacations WHERE start_date <= ? AND end_date >= ?",
			[date, date]
		);
		return rows.map(row => this.mapToVacation(row));
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Vacation[]> {
		const [rows] = await this.db.execute<VacationRow[]>(
			"SELECT * FROM vacations WHERE start_date BETWEEN ? AND ?",
			[start_date, end_date]
		);
		return rows.map(row => this.mapToVacation(row));
	}

	async getByUserId(id: number): Promise<Vacation[]> {
		const [rows] = await this.db.execute<VacationRow[]>(
			"SELECT * FROM vacations WHERE user_id = ?",  // Fixed: Changed from id to user_id
			[id]
		);
		return rows.map(row => this.mapToVacation(row));
	}

	async deleteByUserId(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM vacations WHERE user_id = ?",  // Fixed: Changed from id to user_id
			[id]
		);
		return result[0].affectedRows;
	}

	private mapToVacation(row: VacationRow): Vacation {
		return {
			...row,
			start_date: new Date(row.start_date),
			end_date: new Date(row.end_date),
			created_at: new Date(row.created_at)
		};
	}
}
