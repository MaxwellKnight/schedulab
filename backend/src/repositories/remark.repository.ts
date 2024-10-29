import { Database } from "../configs/db.config";
import { Remark } from "../models/schedule.model";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface RemarkRow extends RowDataPacket, Omit<Remark, 'created_at'> {
	created_at: string;
}

export class RemarkRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async create(remark: Omit<Remark, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO remarks SET ?",
			[remark]
		);
		return result[0].insertId;
	}

	async getOne(id: number): Promise<Remark | null> {
		const [rows] = await this.db.execute<RemarkRow[]>(
			"SELECT * FROM remarks WHERE id = ?",
			[id]
		);

		if (rows.length === 0) {
			return null;
		}

		return this.mapToRemark(rows[0]);
	}

	async getMany(): Promise<Remark[]> {
		const [rows] = await this.db.execute<RemarkRow[]>("SELECT * FROM remarks");
		return rows.map(row => this.mapToRemark(row));
	}

	async getByScheduleId(scheduleId: number): Promise<Remark[]> {
		const [rows] = await this.db.execute<RemarkRow[]>(
			"SELECT * FROM remarks WHERE schedule_id = ?",
			[scheduleId]
		);
		return rows.map(row => this.mapToRemark(row));
	}

	async update(remark: Partial<Remark> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE remarks SET ? WHERE id = ?",
			[remark, remark.id]
		);
		return result[0].affectedRows;
	}

	async delete(id: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM remarks WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async deleteByScheduleId(scheduleId: number): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM remarks WHERE schedule_id = ?",
			[scheduleId]
		);
		return result[0].affectedRows;
	}

	private mapToRemark(row: RemarkRow): Remark {
		return {
			id: row.id,
			schedule_id: row.schedule_id,
			content: row.content,
			created_at: new Date(row.created_at)
		};
	}
}
