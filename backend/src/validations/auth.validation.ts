import Joi from 'joi';

export const loginSchema = Joi.object({
	email: Joi.string()
		.email()
		.required()
		.messages({
			'string.email': 'Please enter a valid email address',
			'string.empty': 'Email is required',
			'any.required': 'Email is required'
		}),
	password: Joi.string()
		.min(6)
		.required()
		.messages({
			'string.min': 'Password must be at least 6 characters long',
			'string.empty': 'Password is required',
			'any.required': 'Password is required'
		})
});

export const registerSchema = Joi.object({
	username: Joi.string()
		.min(3)
		.max(30)
		.required()
		.messages({
			'string.min': 'Username must be at least 3 characters long',
			'string.max': 'Username cannot be longer than 30 characters',
			'string.empty': 'Username is required',
			'any.required': 'Username is required'
		}),
	email: Joi.string()
		.email()
		.required()
		.messages({
			'string.email': 'Please enter a valid email address',
			'string.empty': 'Email is required',
			'any.required': 'Email is required'
		}),
	password: Joi.string()
		.min(6)
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
		.messages({
			'string.min': 'Password must be at least 6 characters long',
			'string.empty': 'Password is required',
			'any.required': 'Password is required',
			'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		})
});

export const refreshTokenSchema = Joi.object({
	refreshToken: Joi.string().required().messages({
		'string.empty': 'Refresh token is required',
		'any.required': 'Refresh token is required'
	})
});
