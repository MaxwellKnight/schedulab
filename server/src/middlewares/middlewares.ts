import { Schema } from 'joi';
import { IRequest, IResponse } from '../interfaces';

export const makeValidator = (schema: Schema) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		const { error } = schema.validate(req.body.user);
		if (error) {
			console.log('Validation error:', error.details);
			return res.status(400).json({ error: error.details.map(err => err.message).join(", ") + "." });
		}
	};
};

const makeAuthorization = (allowedRoles: string[]) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		console.log(req.body.user);
		const { user_role } = req.body.user;
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
