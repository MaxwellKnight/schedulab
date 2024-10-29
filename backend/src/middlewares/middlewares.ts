import { Schema } from 'joi';
import { IRequest, IResponse } from '../interfaces';

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

export const access = {
	USER_ACCESS: makeAuthorization(["user", "manager", "supervisor", "chief", "admin"]),
	SUPEVISOR_ACCESS: makeAuthorization(["supervisor", "chief", "admin"]),
	CHIEF_ACCESS: makeAuthorization(["chief", "admin"]),
	ADMIN_ACCESS: makeAuthorization(["admin"]),
}
