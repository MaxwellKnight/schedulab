import { DailyPreference, Preference } from "../models";
import { IDatabase, IPreferenceRepository } from "../interfaces";

export class PreferenceRepository implements IPreferenceRepository {
	private readonly db: IDatabase;

	constructor(db: IDatabase) {
		this.db = db;
	}

	public async create(preference: Preference): Promise<number> {
		const result = await this.db.execute("INSERT INTO preferences SET ?", [preference]);
		return result.insertId;
	}

	public async getOne(id: number): Promise<Preference[]> {
		const result = await this.db.execute<Preference[]>(`
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
		return result;
	}

	public async getMany(): Promise<Preference[]> {
		return await this.db.execute(`
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
	}

	async getByDates(start_date: Date, end_date: Date): Promise<Preference[]> {
		return await this.db.execute(`
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
	}

	public async getByUserId(id: number): Promise<Preference[]> {
		return await this.db.execute(`
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
	}

	public getDailyByPreferenceId(id: number): Promise<DailyPreference[]> {
		return this.db.execute(`
            SELECT dp.*, st.name as shift_type_name
            FROM daily_preferences dp
            JOIN shift_types st ON dp.shift_type_id = st.id
            WHERE dp.preference_id = ?
            ORDER BY dp.date, dp.shift_type_id
        `, [id]);
	}

	public async update(preference: Preference): Promise<number> {
		const result = await this.db.execute("UPDATE preferences SET ? WHERE id = ?", [preference, preference.id]);
		return result.affectedRows;
	}

	public async delete(id: number): Promise<number> {
		let result = await this.db.execute(`
            DELETE FROM 
                daily_preferences 
            WHERE preference_id = ?`, [id]);
		if (result.affectedRows === 0) return 0;
		result = await this.db.execute("DELETE FROM preferences WHERE id = ?", [id]);
		return result.affectedRows;
	}

	public async deleteByUserId(id: number): Promise<number> {
		let result = await this.db.execute(`
            DELETE FROM 
                daily_preferences 
            WHERE preference_id IN (SELECT id FROM preferences WHERE user_id = ?)`
			, [id]
		);
		if (result.affectedRows === 0) return 0;
		result = await this.db.execute("DELETE FROM preferences WHERE user_id = ?", [id]);
		return result.affectedRows;
	}
}
