import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2";
import * as dotenv from 'dotenv';

dotenv.config();

export class Database {
	private static _instance: Database;
	private _connection: Pool;

	private constructor() {
		const config = {
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			enableKeepAlive: true,
			keepAliveInitialDelay: 0
		};

		console.log('Database configuration:', {
			host: config.host,
			user: config.user,
			database: config.database
		});

		this._connection = createPool(config);

		this.testConnection();
	}

	private async testConnection(): Promise<void> {
		try {
			const [_] = await this.execute<RowDataPacket[]>('SELECT 1');
			console.log('Database connection successful');
		} catch (error) {
			console.error('Database connection failed:', error);
			console.error('Please check your environment variables:');
			console.error('DATABASE_HOST:', process.env.DATABASE_HOST);
			console.error('DATABASE_USER:', process.env.DATABASE_USER);
			console.error('DATABASE_NAME:', process.env.DATABASE_NAME);
			throw error;
		}
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

	public async execute<T extends RowDataPacket[] | ResultSetHeader>(
		sql: string,
		params: unknown[] = []
	): Promise<[T]> {
		try {
			return new Promise((resolve, reject) => {
				this._connection.query<T>(sql, params, (error, results: T, _) => {
					if (error) {
						console.error('Query execution error:', {
							sql,
							error: error.message
						});
						reject(error);
					} else {
						resolve([results]);
					}
				});
			});
		} catch (error) {
			console.error('Database execution error:', error);
			throw error;
		}
	}

	public async close(): Promise<void> {
		try {
			await this._connection.end();
			console.log('Database connection closed');
		} catch (error) {
			console.error('Error closing database connection:', error);
			throw error;
		}
	}
}

export const makeSQL = (): Database => {
	return Database.instance;
};
