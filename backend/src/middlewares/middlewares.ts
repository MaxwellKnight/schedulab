import { Schema } from 'joi';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const makeValidator = (schema: Schema) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
				console.log("validator");

				res.status(400).json(validationErrors);
			}
			next();
		} catch (err) {
			res.status(500).json({ message: 'Validation error occurred' });
		}
	};
};

export interface TokenPayload {
	id: number;
	email?: string;
	google_id?: string;
	display_name?: string;
	picture?: string;
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

