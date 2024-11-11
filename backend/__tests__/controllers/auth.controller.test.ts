import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthController } from '../../src/controllers';
import { UserService } from '../../src/services';
import { TokenPayload } from '../../src/middlewares/middlewares';
import { Database } from '../../src/configs/db.config';
import { UserData } from '../../src/interfaces';

// Mock dependencies
jest.mock('../../src/configs/db.config', () => ({
	Database: {
		instance: {
			execute: jest.fn().mockResolvedValue([[]]),
			close: jest.fn(),
		},
	},
}));
jest.mock('../../src/services');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
	let authController: AuthController;
	let mockUserService: jest.Mocked<UserService>;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;
	let mockDatabase: jest.Mocked<Database>;

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();

		// Mock environment variables
		process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
		process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
		process.env.FRONTEND_URL = 'http://localhost:3000';

		// Get mocked database instance
		mockDatabase = Database.instance as jest.Mocked<Database>;

		// Create mock service
		mockUserService = {
			getByEmail: jest.fn(),
			create: jest.fn(),
		} as unknown as jest.Mocked<UserService>;

		// Create controller instance
		authController = new AuthController(mockUserService);

		// Mock request and response
		mockRequest = {
			headers: {},
			body: {},
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			redirect: jest.fn(),
		};

		mockNext = jest.fn();
	});
	describe('login', () => {
		it('should return 400 if email or password is missing', async () => {
			mockRequest.body = {};

			await authController.login(
				mockRequest as Request,
				mockResponse as Response
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Email and password are required'
			});
		});

		it('should return 401 if user is not found', async () => {
			mockRequest.body = {
				email: 'test@example.com',
				password: 'password123'
			};
			mockUserService.getByEmail.mockResolvedValue(null);

			await authController.login(
				mockRequest as Request,
				mockResponse as Response
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Incorrect email or password'
			});
		});

		it('should return tokens on successful login', async () => {
			const mockUser: UserData = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
				google_id: undefined,
				display_name: 'Test User',
				picture: undefined,
				user_role: 'user',
				first_name: 'Test',
				last_name: 'User',
				recent_shifts: [],
				recent_vacations: [],
				created_at: new Date()
			};

			mockRequest.body = {
				email: 'test@example.com',
				password: 'password123'
			};

			mockUserService.getByEmail.mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockImplementation((_, __, callback) =>
				callback(null, true)
			);
			(jwt.sign as jest.Mock).mockReturnValueOnce('mock-access-token')
				.mockReturnValueOnce('mock-refresh-token');

			await authController.login(
				mockRequest as Request,
				mockResponse as Response
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				accessToken: 'mock-access-token',
				refreshToken: 'mock-refresh-token'
			});
		});
	});

	describe('authenticate middleware', () => {
		it('should return 401 if no token is provided', async () => {
			await authController.authenticate(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Unauthorized access'
			});
		});

		it('should call next() with valid token', async () => {
			const mockPayload: TokenPayload = {
				id: 1,
				email: 'test@example.com',
				display_name: 'Test User',
			};

			mockRequest.headers = {
				authorization: 'Bearer valid-token'
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockPayload);

			await authController.authenticate(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalled();
			expect(mockRequest.user).toEqual(mockPayload);
		});
	});

	describe('refresh token', () => {
		it('should return 401 if no refresh token is provided', async () => {
			await authController.refresh(
				mockRequest as Request,
				mockResponse as Response
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Refresh token required'
			});
		});

		it('should return new tokens with valid refresh token', async () => {
			// Mock database to return empty array (token not expired)
			(Database.instance.execute as jest.Mock).mockResolvedValueOnce([[]]);

			mockRequest.body = {
				refreshToken: 'valid-refresh-token'
			};

			const mockPayload: TokenPayload = {
				id: 1,
				email: 'test@example.com',
				display_name: 'Test User',
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockPayload);
			(jwt.sign as jest.Mock)
				.mockReturnValueOnce('new-access-token')
				.mockReturnValueOnce('new-refresh-token');

			await authController.refresh(
				mockRequest as Request,
				mockResponse as Response
			);

			// Verify database was called to check expired tokens
			expect(Database.instance.execute).toHaveBeenCalledWith(
				'SELECT * FROM expired WHERE token = ?',
				['valid-refresh-token']
			);

			// Verify tokens were saved
			expect(Database.instance.execute).toHaveBeenCalledWith(
				'INSERT INTO expired (token, created_at) VALUES (?, NOW())',
				['valid-refresh-token']
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token'
			});
		});

		it('should return 403 if token is expired', async () => {
			// Mock database to return a result (token is expired)
			(Database.instance.execute as jest.Mock).mockResolvedValueOnce([[{ id: 1 }]]);

			mockRequest.body = {
				refreshToken: 'expired-token'
			};

			await authController.refresh(
				mockRequest as Request,
				mockResponse as Response
			);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Refresh token has been revoked'
			});
		});
	});
});
