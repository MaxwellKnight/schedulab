import Joi from 'joi';
import { userSchema } from './user.validation';
import { ShiftData } from '../interfaces';

const timeRangeSchema = Joi.object({
	id: Joi.number().integer().optional(),
	start_time: Joi.date().required().messages({
		'date.base': 'Start time must be a valid date',
		'any.required': 'Start time is required',
	}),
	end_time: Joi.date().required().messages({
		'date.base': 'End time must be a valid date',
		'any.required': 'End time is required',
	}),
});

const schema = Joi.object<ShiftData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer',
		}),
	schedule_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Schedule ID must be an integer',
			'any.required': 'Schedule ID is required',
		}),
	shift_type_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Shift type ID must be an integer',
			'any.required': 'Shift type ID is required',
		}),
	shift_type_name: Joi.string()
		.optional()
		.messages({
			'string.base': 'Shift type name must be a string',
		}),
	required_count: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Required count must be an integer',
			'any.required': 'Required count is required',
		}),
	actual_count: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Actual count must be an integer',
			'any.required': 'Actual count is required',
		}),
	users: Joi.alternatives()
		.try(
			Joi.array()
				.items(userSchema)
				.messages({
					'array.base': 'Users must be an array of user objects',
				}),
			Joi.array()
				.items(Joi.number().integer())
				.messages({
					'array.base': 'Users must be an array of user IDs',
				})
		)
		.required()
		.messages({
			'alternatives.match': 'Users must be either an array of user objects or an array of user IDs',
			'any.required': 'Users field is required',
		}),
	shift_name: Joi.string()
		.max(100)
		.required()
		.messages({
			'string.empty': 'Shift name is required',
			'string.max': 'Shift name must be at most 100 characters long',
		}),
	time_ranges: Joi.array()
		.items(timeRangeSchema)
		.min(1)
		.required()
		.messages({
			'array.base': 'Time ranges must be an array of time range objects',
			'array.min': 'At least one time range is required',
			'any.required': 'Time ranges are required',
		}),
	date: Joi.date()
		.required()
		.messages({
			'date.base': 'Date must be a valid date',
			'any.required': 'Date is required',
		}),
	likes: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'Likes must be an integer',
		}),
	created_at: Joi.date()
		.optional()
		.messages({
			'date.base': 'Created at must be a valid date',
		}),
});

export { schema as shiftSchema };
