import Joi from 'joi';
import { TeamData } from '../interfaces';

const schema = Joi.object<TeamData>({
	id: Joi.number()
		.integer()
		.optional(),

	creator_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Creator ID must be a number',
			'any.required': 'Creator ID is required'
		}),

	name: Joi.string()
		.min(1)
		.max(255)
		.required()
		.trim()
		.messages({
			'string.empty': 'Team name is required',
			'string.min': 'Team name must be at least 1 character long',
			'string.max': 'Team name must be at most 255 characters long',
		}),

	notes: Joi.string()
		.max(1024)
		.allow('')
		.optional()
		.trim()
		.messages({
			'string.max': 'Notes must be at most 1024 characters long',
		}),

	member_count: Joi.number()
		.integer()
		.min(1)
		.optional()
		.messages({
			'number.min': 'Member count must be at least 1',
		}),

	created_at: Joi.date()
		.optional(),

});

// Additional schemas for specific operations
const addMemberSchema = Joi.object({
	userId: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'User ID must be a number',
			'any.required': 'User ID is required'
		})
});

const addRoleSchema = Joi.object({
	roleName: Joi.string()
		.min(1)
		.max(255)
		.required()
		.custom((value, helpers) => {
			if (['admin', 'member'].includes(value.toLowerCase())) {
				return helpers.error('any.invalid');
			}
			return value;
		})
		.messages({
			'string.empty': 'Role name is required',
			'string.min': 'Role name must be at least 1 character long',
			'string.max': 'Role name must be at most 255 characters long',
			'any.invalid': 'Cannot create default role names (admin/member)'
		})
});

const updateRoleSchema = Joi.object({
	roleName: Joi.string()
		.min(1)
		.max(255)
		.required()
		.messages({
			'string.empty': 'Role name is required',
			'string.min': 'Role name must be at least 1 character long',
			'string.max': 'Role name must be at most 255 characters long',
		})
});

const joinTeamSchema = Joi.object({
	teamCode: Joi.string()
		.pattern(/^([A-Za-z]{4}|[0-9]{3})-[A-Z0-9]{5,6}$/)
		.required()
		.messages({
			'string.empty': 'Team code is required',
			'string.pattern.base': 'Team code must be in format XXXX-YYYYY or NNN-YYYYY (e.g., Card-NBFX2Z or 700-SUL5K)',
			'string.base': 'Team code must be a string',
		})
});

export {
	schema as teamSchema,
	addMemberSchema,
	addRoleSchema,
	updateRoleSchema,
	joinTeamSchema
};
