import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_USER = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.DATABASE_NAME = 'testdb';

// Mock database
jest.mock('./src/configs/db.config', () => ({
	Database: {
		instance: {
			execute: jest.fn(),
			close: jest.fn(),
		},
	},
}));
