import { Schema } from 'joi';
import { IRequest, IResponse } from '../interfaces';

export const makeValidator = (schema: Schema) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		const { error } = schema.validate(req.body.data);
		if (error) {
			res.status(400)
			res.json({ error: error.details.map(err => err.message).join(", ") + " ." });
		}
	};
};

const makeAuthorization = (allowedRoles: string[]) => {
	return async (req: IRequest, res: IResponse): Promise<void> => {
		if (!allowedRoles.includes(req.body.user_role)) {
			req.body.forbidden = true;
			res.status(403).json({ error: "Forbidden" });
		}
	};
};

export const access = {
	USER_ACCESS: 		makeAuthorization(["user", "manager", "supervisor", "chief", "admin"]),
	SUPEVISOR_ACCESS: 	makeAuthorization(["supervisor", "chief", "admin"]),
	CHIEF_ACCESS:		makeAuthorization(["chief", "admin"]),
	ADMIN_ACCESS: 		makeAuthorization(["admin"]),
}
