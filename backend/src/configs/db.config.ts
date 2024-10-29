import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2";
import * as dotenv from 'dotenv';
dotenv.config();

export class Database {
	private static _instance: Database;
	private _connection: Pool;

	private constructor() {
		this._connection = createPool({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
		});
	}

	public get connection(): Pool {
		return this._connection;
	}

	static get instance(): Database {
		if (!Database._instance) {
			Database._instance = new Database();
		}
		return Database._instance;
	}

	public execute<T extends RowDataPacket[] | ResultSetHeader>(
		sql: string,
		params: unknown[] = []
	): Promise<[T]> {
		return new Promise((resolve, reject) => {
			this._connection.query<T>(sql, params, (error, results: T, _) => {
				if (error) {
					reject(error);
				} else {
					resolve([results]);
				}
			});
		});
	}
}

export const makeSQL = (): Database => {
	return Database.instance;
}
