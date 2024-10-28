export interface IDatabase {
	execute: <T = any>(sql: string, params?: unknown[]) => Promise<T>;
	connection: unknown;
}
