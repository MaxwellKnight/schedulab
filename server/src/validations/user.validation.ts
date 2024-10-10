import Joi from 'joi';
import { UserData } from '../interfaces';

const schema = Joi.object<UserData>({
	id: Joi.number().integer().optional(),
	user_role: Joi.string()
		.max(10)
		.required()
		.messages({
			'string.empty': 'User role is required',
			'string.max': 'User role must be at most 10 characters long',
		}),
	first_name: Joi.string()
		.min(1)
		.max(50)
		.required()
		.trim()
		.messages({
			'string.empty': 'First name is required',
			'string.min': 'First name must be at least 1 character long',
			'string.max': 'First name must be at most 50 characters long',
		}),
	last_name: Joi.string()
		.min(1)
		.max(50)
		.required()
		.trim()
		.messages({
			'string.empty': 'Last name is required',
			'string.min': 'Last name must be at least 1 character long',
			'string.max': 'Last name must be at most 50 characters long',
		}),
	middle_name: Joi.string()
		.min(1)
		.max(50)
		.optional()
		.trim()
		.allow('')
		.messages({
			'string.max': 'Middle name must be at most 50 characters long',
		}),
	recent_shifts: Joi.string().optional().allow(''),
	recent_vacations: Joi.string().optional().allow(''),
	email: Joi.string()
		.email()
		.required()
		.messages({
			'string.email': 'Email must be a valid email address',
			'string.empty': 'Email is required',
		}),
	password: Joi.string()
		.min(6)
		.required()
		.messages({
			'string.empty': 'Password is required',
			'string.min': 'Password must be at least 6 characters long',
		}),
	student: Joi.boolean().required().messages({
		'boolean.base': 'Student must be a boolean',
		'any.required': 'Student field is required',
	})
});

export { schema as userSchema };
