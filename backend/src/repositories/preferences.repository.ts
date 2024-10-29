import { Database } from "../configs/db.config";
import { DailyPreference, Preference } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface PreferenceRow extends RowDataPacket, Omit<Preference, 'start_date' | 'end_date' | 'created_at'> {
	start_date: string;
	end_date: string;
	created_at: string;
}

interface DailyPreferenceRow extends RowDataPacket, Omit<DailyPreference, 'date'> {
	date: string;
}

export class PreferenceRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	public async create(preference: Omit<Preference, 'id' | 'created_at'>): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO preferences SET ?",
			[preference]
		);
		return result[0].insertId;
	}

	public async getOne(id: number): Promise<Preference | null> {
		const [rows] = await this.db.execute<PreferenceRow[]>(`
            SELECT 
                p.*, 
                GROUP_CONCAT(DISTINCT CONCAT(dp.date, ':', dp.shift_type_id, ':', dp.preference_level) 
                    ORDER BY dp.date, dp.shift_type_id SEPARATOR ',') AS daily_preferences
            FROM 
                preferences p 
            LEFT JOIN 
                daily_preferences dp ON dp.preference_id = p.id
            WHERE p.id = ?
            GROUP BY
                p.id, p.user_id, p.start_date, p.end_date, p.notes, p.created_at
        `, [id]);

		return rows.length ? this.mapToPreference(rows[0]) : null;
	}

	public async getMany(): Promise<Preference[]> {
		const [rows] = await this.db.execute<PreferenceRow[]>(`
            SELECT 
                p.*, 
                GROUP_CONCAT(DISTINCT CONCAT(dp.date, ':', dp.shift_type_id, ':', dp.preference_level) 
                    ORDER BY dp.date, dp.shift_type_id SEPARATOR ',') AS daily_preferences
            FROM 
                preferences p 
            LEFT JOIN 
                daily_preferences dp ON dp.preference_id = p.id
            GROUP BY
                p.id, p.user_id, p.start_date, p.end_date, p.notes, p.created_at`);

		return rows.map(row => this.mapToPreference(row));
	}

	public async getByDates(start_date: Date, end_date: Date): Promise<Preference[]> {
		const [rows] = await this.db.execute<PreferenceRow[]>(`
            SELECT 
                p.*, 
                GROUP_CONCAT(DISTINCT CONCAT(dp.date, ':', dp.shift_type_id, ':', dp.preference_level) 
                    ORDER BY dp.date, dp.shift_type_id SEPARATOR ',') AS daily_preferences
            FROM 
                preferences p 
            LEFT JOIN 
                daily_preferences dp ON dp.preference_id = p.id
            WHERE
                p.start_date <= ? AND p.end_date >= ?
            GROUP BY
                p.id, p.user_id, p.start_date, p.end_date, p.notes, p.created_at`,
			[end_date, start_date]
		);

		return rows.map(row => this.mapToPreference(row));
	}

	public async getByUserId(id: number): Promise<Preference[]> {
		const [rows] = await this.db.execute<PreferenceRow[]>(`
            SELECT 
                p.*, 
                GROUP_CONCAT(DISTINCT CONCAT(dp.date, ':', dp.shift_type_id, ':', dp.preference_level) 
                    ORDER BY dp.date, dp.shift_type_id SEPARATOR ',') AS daily_preferences
            FROM 
                preferences p 
            LEFT JOIN 
                daily_preferences dp ON dp.preference_id = p.id
            WHERE 
                p.user_id = ?
            GROUP BY
                p.id, p.user_id, p.start_date, p.end_date, p.notes, p.created_at`,
			[id]
		);

		return rows.map(row => this.mapToPreference(row));
	}

	public async getDailyByPreferenceId(id: number): Promise<DailyPreference[]> {
		const [rows] = await this.db.execute<DailyPreferenceRow[]>(`
            SELECT dp.*, st.name as shift_type_name
            FROM daily_preferences dp
            JOIN shift_types st ON dp.shift_type_id = st.id
            WHERE dp.preference_id = ?
            ORDER BY dp.date, dp.shift_type_id
        `, [id]);

		return rows.map(row => this.mapToDailyPreference(row));
	}

	public async update(preference: Partial<Preference> & { id: number }): Promise<number> {
		const result = await this.db.execute<ResultSetHeader>(
			"UPDATE preferences SET ? WHERE id = ?",
			[preference, preference.id]
		);
		return result[0].affectedRows;
	}

	public async delete(id: number): Promise<number> {
		let result = await this.db.execute<ResultSetHeader>(`
            DELETE FROM 
                daily_preferences 
            WHERE preference_id = ?`,
			[id]
		);

		if (result[0].affectedRows === 0) return 0;

		result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM preferences WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	public async deleteByUserId(id: number): Promise<number> {
		let result = await this.db.execute<ResultSetHeader>(`
            DELETE FROM 
                daily_preferences 
            WHERE preference_id IN (SELECT id FROM preferences WHERE user_id = ?)`,
			[id]
		);

		if (result[0].affectedRows === 0) return 0;

		result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM preferences WHERE user_id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	private mapToPreference(row: PreferenceRow): Preference {
		return {
			id: row.id,
			user_id: row.user_id,
			start_date: new Date(row.start_date),
			end_date: new Date(row.end_date),
			notes: row.notes,
			created_at: new Date(row.created_at),
			daily_preferences: row.daily_preferences
		};
	}

	private mapToDailyPreference(row: DailyPreferenceRow): DailyPreference {
		return {
			id: row.id,
			preference_id: row.preference_id,
			date: new Date(row.date),
			shift_type_id: row.shift_type_id,
			preference_level: row.preference_level,
			shift_type_name: row.shift_type_name,
			created_at: row.created_at
		};
	}
}
