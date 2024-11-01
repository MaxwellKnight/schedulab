import { Schema } from 'joi';
import { IRequest, IResponse } from '../interfaces';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const makeValidator = (schema: Schema) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		try {
			const { error } = schema.validate(req.body, {
				abortEarly: false,
				allowUnknown: true,
				stripUnknown: true
			});

			if (error) {
				const validationErrors = error.details.map((detail) => ({
					message: detail.message,
					path: detail.path,
					type: detail.type,
					context: detail.context
				}));

				return res.status(400).json(validationErrors);
			}
		} catch (err) {
			return res.status(500).json({ message: 'Validation error occurred' });
		}
	};
};

const makeAuthorization = (allowedRoles: string[]) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		const { user_role } = req.query;
		if (!user_role || !allowedRoles.includes(user_role)) {
			console.log('Access forbidden');
			return res.status(403).json({ error: "Forbidden" });
		}
	};
};

export interface TokenPayload {
	id: number;
	email: string;
	user_role: string;
	team_id: number;
}

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ message: 'No authorization header' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}

		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		return res.status(500).json({ message: 'Error verifying token' });
	}
};

export const access = {
	USER_ACCESS: makeAuthorization(["user", "manager", "supervisor", "chief", "admin"]),
	SUPEVISOR_ACCESS: makeAuthorization(["supervisor", "chief", "admin"]),
	CHIEF_ACCESS: makeAuthorization(["chief", "admin"]),
	ADMIN_ACCESS: makeAuthorization(["admin"]),
}
