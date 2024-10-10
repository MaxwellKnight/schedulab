import { createPool, OkPacketParams, Pool, QueryError, QueryResult, RowDataPacket } from "mysql2";
import * as dotenv from 'dotenv';
import { IDatabase } from "../interfaces/db.interface";

dotenv.config();

class DB implements IDatabase {
	private static _instance: DB;
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

	static get instance(): DB {
		if(!DB._instance) {
			DB._instance = new DB();
		}
		return DB._instance;
	}

	public execute<T = RowDataPacket | OkPacketParams>(sql: string, params: unknown[] = []): Promise<T> {
		return new Promise((resolve, reject) => {
			this._connection.query<(T extends QueryResult ? T : never)>(sql, params, (error, results: T) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}
}

export const makeSQL = (): IDatabase => {
	return DB.instance;
}
