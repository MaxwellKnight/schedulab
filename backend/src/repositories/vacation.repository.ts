import { Vacation } from "../models";
import { IDatabase, IVacationRepository } from "../interfaces";

export class VacationRepository implements IVacationRepository {
	private readonly db: IDatabase;
	constructor(db: IDatabase) {
		this.db = db;
	}

	async create(vacation: Vacation): Promise<number> {
		const result = await this.db.execute("INSERT INTO vacations SET ?", [vacation]);
		return result.insertId;
	}

	async getOne(id: number): Promise<Vacation[]> {
		const result = await this.db.execute("SELECT * FROM vacations WHERE id = ?", [id]);
		return result;
	}

	async getMany(): Promise<Vacation[]> {
		return await this.db.execute("SELECT * FROM vacations");
	}

	async update(vacation: Vacation): Promise<number> {
		const result = await this.db.execute("UPDATE vacations SET ? WHERE id = ?", [vacation, vacation.id]);
		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM vacations WHERE id = ?", [id]);
		return result.affectedRows;
	}

	async getByDate(date: Date): Promise<Vacation[]> {
		return await this.db.execute("SELECT * FROM vacations WHERE start_date <= ? AND end_date >= ?", [date, date]);
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Vacation[]> {
		return await this.db.execute("SELECT * FROM vacations WHERE start_date BETWEEN ? AND ?", [start_date, end_date]);
	}

	async getByUserId(id: number): Promise<Vacation[]> {
		return await this.db.execute("SELECT * FROM vacations WHERE id = ?", [id]);
	}

	async deleteByUserId(id: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM vacations WHERE id = ?", [id]);
		return result.affectedRows;
	}
}