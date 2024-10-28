import Joi from 'joi';
import { PreferenceData, DailyPreferenceData } from '../interfaces';

const dailySchema = Joi.object<DailyPreferenceData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer',
		}),
	preference_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Preference ID must be an integer',
			'any.required': 'Preference ID is required',
		}),
	date: Joi.date()
		.required()
		.messages({
			'date.base': 'Date must be a valid date',
			'any.required': 'Date is required',
		}),
	shift_type_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Shift type ID must be an integer',
			'any.required': 'Shift type ID is required',
		}),
	preference_level: Joi.number()
		.integer()
		.min(1)
		.max(5)
		.required()
		.messages({
			'number.base': 'Preference level must be an integer',
			'number.min': 'Preference level must be at least 1',
			'number.max': 'Preference level must be at most 5',
			'any.required': 'Preference level is required',
		}),
});

const schema = Joi.object<PreferenceData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer',
		}),
	user_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'User ID must be an integer',
			'any.required': 'User ID is required',
		}),
	start_date: Joi.date()
		.required()
		.messages({
			'date.base': 'Start date must be a valid date',
			'any.required': 'Start date is required',
		}),
	end_date: Joi.date()
		.required()
		.messages({
			'date.base': 'End date must be a valid date',
			'any.required': 'End date is required',
		}),
	daily_preferences: Joi.array()
		.items(dailySchema)
		.messages({
			'array.base': 'Daily preferences must be an array of daily preference objects',
		}),
	notes: Joi.string()
		.allow(null)
		.optional()
		.messages({
			'string.base': 'Notes must be a string',
		}),
});

export { schema as preferenceSchema };
