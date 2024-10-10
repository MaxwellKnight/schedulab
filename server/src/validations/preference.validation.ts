import Joi from 'joi';
import { PreferenceData, DailyPreferenceData } from '../interfaces';

const dailySchema = Joi.object<DailyPreferenceData>({
	id: Joi.number()
				.integer()
				.optional()
				.messages({
					'number.base': 'ID must be an integer',
				}),
	date: Joi.date()
				.required()
				.messages({
					'date.base': 'Date must be a valid date',
					'any.required': 'Date is required',
				}),
	morning: Joi.number()
					.integer()
					.required()
					.messages({
						'number.base': 'Morning must be an integer',
						'any.required': 'Morning is required',
					}),
	noon: Joi.number()
				.integer()
				.required()
				.messages({
					'number.base': 'Noon must be an integer',
					'any.required': 'Noon is required',
				}),
	night: Joi.number()
				.integer()
				.required()
				.messages({
					'number.base': 'Night must be an integer',
					'any.required': 'Night is required',
				})
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
});

export { schema as preferenceSchema }