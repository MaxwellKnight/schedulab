import Joi from 'joi';
import { userSchema } from './user.validation';
import { ShiftData } from '../interfaces';


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
	shift_type: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Shift type must be an integer',
			'any.required': 'Shift type is required',
		}),
	required_count: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Required count must be an integer',
			'any.required': 'Required count is required',
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
			.required().messages({
				'alternatives.match': 'Users must be either an array of user objects or an array of user IDs',
				'any.required': 'Users field is required',
			}
		),
	shift_name: Joi.string()
		.max(100)
		.required()
		.messages({
			'string.empty': 'Shift name is required',
			'string.max': 'Shift name must be at most 100 characters long',
		}),
	start_time: Joi.date()
		.required()
		.messages({
			'date.base': 'Start time must be a valid date',
			'any.required': 'Start time is required',
		}),
	end_time: Joi.date()
		.required()
		.messages({
			'date.base': 'End time must be a valid date',
			'any.required': 'End time is required',
		}),
	date: Joi.date()
		.required()
		.messages({
			'date.base': 'Date must be a valid date',
			'any.required': 'Date is required',
		})
});

export { schema as shiftSchema }
