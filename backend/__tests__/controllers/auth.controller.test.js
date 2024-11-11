"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const controllers_1 = require("../../src/controllers");
const db_config_1 = require("../../src/configs/db.config");
// Mock dependencies
jest.mock('../../src/configs/db.config');
jest.mock('../../src/services');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
describe('AuthController', () => {
    let authController;
    let mockUserService;
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Mock environment variables
        process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
        process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
        process.env.FRONTEND_URL = 'http://localhost:3000';
        // Create mock service
        mockUserService = {
            getByEmail: jest.fn(),
            create: jest.fn(),
        };
        // Create controller instance
        authController = new controllers_1.AuthController(mockUserService);
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
        it('should return 400 if email or password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield authController.login(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Email and password are required'
            });
        }));
        it('should return 401 if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123'
            };
            mockUserService.getByEmail.mockResolvedValue(null);
            yield authController.login(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incorrect email or password'
            });
        }));
        it('should return tokens on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
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
            bcrypt_1.default.compare.mockImplementation((_, __, callback) => callback(null, true));
            jsonwebtoken_1.default.sign.mockReturnValueOnce('mock-access-token')
                .mockReturnValueOnce('mock-refresh-token');
            yield authController.login(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
        }));
    });
    describe('authenticate middleware', () => {
        it('should return 401 if no token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            yield authController.authenticate(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Unauthorized access'
            });
        }));
        it('should call next() with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPayload = {
                id: 1,
                email: 'test@example.com',
                display_name: 'Test User',
            };
            mockRequest.headers = {
                authorization: 'Bearer valid-token'
            };
            jsonwebtoken_1.default.verify.mockReturnValue(mockPayload);
            yield authController.authenticate(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRequest.user).toEqual(mockPayload);
        }));
    });
    describe('refresh token', () => {
        it('should return 401 if no refresh token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            yield authController.refresh(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Refresh token required'
            });
        }));
        it('should return new tokens with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                refreshToken: 'valid-refresh-token'
            };
            const mockPayload = {
                id: 1,
                email: 'test@example.com',
                display_name: 'Test User',
            };
            jsonwebtoken_1.default.verify.mockReturnValue(mockPayload);
            jsonwebtoken_1.default.sign
                .mockReturnValueOnce('new-access-token')
                .mockReturnValueOnce('new-refresh-token');
            yield authController.refresh(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            });
        }));
    });
});
describe('Database', () => {
    let database;
    beforeEach(() => {
        // Reset environment variables
        process.env.DATABASE_HOST = 'localhost';
        process.env.DATABASE_USER = 'test';
        process.env.DATABASE_PASSWORD = 'test';
        process.env.DATABASE_NAME = 'testdb';
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (database) {
            yield database.close();
        }
    }));
    it('should create a singleton instance', () => {
        const instance1 = db_config_1.Database.instance;
        const instance2 = db_config_1.Database.instance;
        expect(instance1).toBe(instance2);
    });
    it('should execute queries successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = db_config_1.Database.instance;
        const mockResults = [{ value: 1 }];
        // Mock the execute method
        jest.spyOn(database, 'execute').mockResolvedValue([mockResults]);
        const [results] = yield database.execute('SELECT 1');
        expect(results).toEqual(mockResults);
    }));
    it('should handle connection errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = db_config_1.Database.instance;
        jest.spyOn(database, 'execute').mockRejectedValue(new Error('Connection failed'));
        yield expect(database.execute('SELECT 1')).rejects.toThrow('Connection failed');
    }));
});
