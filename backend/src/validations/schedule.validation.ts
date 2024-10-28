import Joi from 'joi';
import { ScheduleData, RemarkData } from '../interfaces';

const remarkSchema = Joi.object<RemarkData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer',
		}),
	content: Joi.string()
		.required()
		.messages({
			'string.base': 'Content must be a string',
			'any.required': 'Content is required',
		}),
	created_at: Joi.date()
		.required()
		.messages({
			'date.base': 'Created at must be a valid date',
			'any.required': 'Created at is required',
		}),
});

const schema = Joi.object<ScheduleData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer',
		}),
	notes: Joi.string()
		.required()
		.messages({
			'string.base': 'notes must be a string',
			'any.required': 'notes is required',
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
	remarks: Joi.array().items(remarkSchema)

});

export { schema as scheduleSchema }
