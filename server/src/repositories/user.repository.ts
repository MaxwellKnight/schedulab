import { User } from "../models";
import { ShiftRepository } from "./shift.repository";
import { VacationRepository } from "./vacation.repository";
import { PreferenceRepository } from "./preferences.repository";
import { IDatabase, IPreferenceRepository, IShiftRepository, IUserRepository, IVacationRepository } from "../interfaces";

export class UserRepository implements IUserRepository {
	private readonly db: IDatabase;
	private readonly shift_repo: IShiftRepository;
	private readonly preference_repo: IPreferenceRepository;
	private readonly vacation_repo: IVacationRepository;
	constructor(db: IDatabase) {
		this.db = db;
		this.shift_repo = new ShiftRepository(db);
		this.preference_repo = new PreferenceRepository(db);
		this.vacation_repo = new VacationRepository(db);
	}

	public async create(user: User): Promise<number> {
		const result = await this.db.execute("INSERT INTO Users SET ?", [user]);
		return result.insertId;
	}

	public async getOne(id: number): Promise<User[]> {
		const result = await this.db.execute(`
			SELECT 
				u.*,
				(
					SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
					FROM (
							SELECT s.id, s.start_time
							FROM shifts s
							JOIN user_shifts us ON s.id = us.shift_id
							WHERE us.user_id = ?
							ORDER BY s.start_time DESC
							LIMIT 5
					) AS limited_shifts
				) AS recent_shifts,
				GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
			FROM 
				users u
			INNER JOIN
				vacations v ON v.user_id = u.id
			WHERE u.id = ?`, 
			[id, id]
		);
		return result;
	}

	public async getMany(): Promise<User[]> {
		return await this.db.execute(`
			SELECT 
				u.*,
				(
					SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
					FROM (
							SELECT s.id, s.start_time
							FROM shifts s
							JOIN user_shifts us ON s.id = us.shift_id
							WHERE us.user_id = u.id
							ORDER BY s.start_time DESC
							LIMIT 5
					) AS limited_shifts
				) AS recent_shifts,
				GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
			FROM 
				users u
			LEFT JOIN
				vacations v ON v.user_id = u.id
			GROUP BY u.id, u.first_name, u.last_name, u.email, u.student, u.created_at`
		);
	}

	public async getByShiftId(id: number): Promise<User[]> {
		return await this.db.execute(`
			SELECT 
				u.*
			FROM 
				users u
			WHERE 
				u.id IN (
					SELECT 
						us.user_id
					FROM 
						user_shifts us
					WHERE us.shift_id = ?
				)`
			, 
			[id]
		);
	}

	public async getByEmail(email: string): Promise<User | null> {
		const result = await this.db.execute(`
			SELECT 
				u.*,
				(
					SELECT GROUP_CONCAT(DISTINCT limited_shifts.id ORDER BY limited_shifts.start_time SEPARATOR ',')
					FROM (
							SELECT 
								s.id, s.start_time
							FROM 
								shifts s
							LEFT JOIN 
								user_shifts us ON s.id = us.shift_id
							LEFT JOIN 
								users ON users.id = us.user_id
							WHERE 
								us.user_id = u.id
							ORDER BY 
								s.start_time DESC
							LIMIT 5
					) AS limited_shifts
				) AS recent_shifts,
				GROUP_CONCAT(DISTINCT v.id SEPARATOR ',') AS recent_vacations
			FROM 
				users u
			LEFT JOIN
				vacations v ON v.user_id = u.id
			WHERE u.email = ?`, 
			[email]
		);
		return result[0] || null;
	}

	public async update(user: User): Promise<number> {
		const result = await this.db.execute("UPDATE Users SET ? WHERE id = ?", [user, user.id]);
		return result.affectedRows;
	}

	public async delete(id: number): Promise<number> {
		await this.vacation_repo.deleteByUserId(id);
		await this.preference_repo.deleteByUserId(id);
		await this.shift_repo.removeUser(id);

		let result = await this.db.execute("DELETE FROM Users WHERE id = ?", [id]);
		return result.affectedRows;
	}
}