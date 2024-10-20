import { IRemarkRepository, IDatabase, Remark } from '../interfaces';

export class RemarkRepository implements IRemarkRepository {
	private readonly db: IDatabase;

	constructor(db: IDatabase) {
		this.db = db;
	}

	async create(remark: Remark): Promise<number> {
		const result = await this.db.execute("INSERT INTO remarks SET ?", [remark]);
		return result.insertId;
	}

	async getOne(id: number): Promise<Remark | null> {
		const result = await this.db.execute("SELECT * FROM remarks WHERE id = ?", [id]);
		return result.length > 0 ? result[0] : null;
	}

	async getMany(): Promise<Remark[]> {
		return await this.db.execute("SELECT * FROM remarks");
	}

	async getByScheduleId(scheduleId: number): Promise<Remark[]> {
		return await this.db.execute("SELECT * FROM remarks WHERE schedule_id = ?", [scheduleId]);
	}

	async update(remark: Remark): Promise<number> {
		const result = await this.db.execute("UPDATE remarks SET ? WHERE id = ?", [remark, remark.id]);
		return result.affectedRows;
	}

	async delete(id: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM remarks WHERE id = ?", [id]);
		return result.affectedRows;
	}

	async deleteByScheduleId(scheduleId: number): Promise<number> {
		const result = await this.db.execute("DELETE FROM remarks WHERE schedule_id = ?", [scheduleId]);
		return result.affectedRows;
	}
}
