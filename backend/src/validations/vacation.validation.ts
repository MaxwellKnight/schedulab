import Joi from 'joi';
import { VacationData } from '../interfaces';

const schema = Joi.object<VacationData>({
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
});

export { schema as vacationSchema }