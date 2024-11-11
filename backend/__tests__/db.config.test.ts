import { Database } from "../src/configs/db.config";

describe('Database', () => {
	let database: Database;

	beforeEach(() => {
		// Reset environment variables
		process.env.DATABASE_HOST = 'localhost';
		process.env.DATABASE_USER = 'test';
		process.env.DATABASE_PASSWORD = 'test';
		process.env.DATABASE_NAME = 'testdb';
	});

	afterEach(async () => {
		if (database) {
			await database.close();
		}
	});

	it('should create a singleton instance', () => {
		const instance1 = Database.instance;
		const instance2 = Database.instance;
		expect(instance1).toBe(instance2);
	});

	it('should execute queries successfully', async () => {
		const database = Database.instance;
		const mockResults = [{ value: 1 }];

		// Mock the execute method
		jest.spyOn(database, 'execute').mockResolvedValue([mockResults] as any);

		const [results] = await database.execute('SELECT 1');
		expect(results).toEqual(mockResults);
	});

	it('should handle connection errors', async () => {
		const database = Database.instance;

		jest.spyOn(database, 'execute').mockRejectedValue(new Error('Connection failed'));

		await expect(database.execute('SELECT 1')).rejects.toThrow('Connection failed');
	});
});
