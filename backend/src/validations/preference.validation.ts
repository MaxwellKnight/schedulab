import Joi from 'joi';
import { MemberPreferenceData, PreferenceTemplateData, TimeSlotData } from '../interfaces/dto/preferences.dto';
import { TimeSlot } from '../models';
import { PreferenceSubmissionSlotData } from '../models/preference.model';

// Base time range schema
const timeRangeSchema = Joi.object({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'Time range ID must be an integer'
		}),
	preference_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Preference ID must be an integer',
			'any.required': 'Preference ID is required'
		}),
	start_time: Joi.string()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.required()
		.messages({
			'string.pattern.base': 'Start time must be in HH:mm:ss format',
			'any.required': 'Start time is required'
		}),
	end_time: Joi.string()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.required()
		.messages({
			'string.pattern.base': 'End time must be in HH:mm:ss format',
			'any.required': 'End time is required'
		}),
	created_at: Joi.date()
		.optional()
})
	.custom((value, helpers) => {
		const { start_time, end_time } = value;
		if (start_time >= end_time) {
			return helpers.error('custom.timeRange', {
				message: 'End time must be after start time'
			});
		}
		return value;
	});

// Base time slot schema
const timeSlotSchema = Joi.object<TimeSlotData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'Time slot ID must be an integer'
		}),
	template_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Template ID must be an integer',
			'any.required': 'Template ID is required'
		}),
	date: Joi.date()
		.required()
		.messages({
			'date.base': 'Date must be a valid date',
			'any.required': 'Date is required'
		}),
	time_range_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Time range ID must be an integer',
			'any.required': 'Time range ID is required'
		}),
	time_range: timeRangeSchema.optional(),
	created_at: Joi.date()
		.optional()
});

// Preference template schema
const preferenceTemplateSchema = Joi.object<PreferenceTemplateData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer'
		}),
	team_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Team ID must be an integer',
			'any.required': 'Team ID is required'
		}),
	name: Joi.string()
		.required()
		.min(3)
		.max(255)
		.messages({
			'string.base': 'Name must be a string',
			'string.min': 'Name must be at least 3 characters long',
			'string.max': 'Name must not exceed 255 characters',
			'any.required': 'Name is required'
		}),
	start_date: Joi.date()
		.required()
		.messages({
			'date.base': 'Start date must be a valid date',
			'any.required': 'Start date is required'
		}),
	end_date: Joi.date()
		.required()
		.greater(Joi.ref('start_date'))
		.messages({
			'date.base': 'End date must be a valid date',
			'date.greater': 'End date must be after start date',
			'any.required': 'End date is required'
		}),
	status: Joi.string()
		.valid('draft', 'published', 'closed')
		.required()
		.messages({
			'string.base': 'Status must be a string',
			'any.only': 'Status must be one of: draft, published, closed',
			'any.required': 'Status is required'
		}),
	creator: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'Created by must be an integer'
		}),
	created_at: Joi.date()
		.optional(),
	updated_at: Joi.date()
		.optional(),
	time_slots: Joi.array()
		.items(timeSlotSchema)
		.optional()
		.messages({
			'array.base': 'Time slots must be an array of time slot objects'
		})
})
	.custom((value, helpers) => {
		const { start_date, end_date, time_slots } = value;
		if (time_slots?.length) {
			const invalidSlots = time_slots.filter((slot: TimeSlot) => {
				const slotDate = new Date(slot.date);
				return slotDate < start_date || slotDate > end_date;
			});
			if (invalidSlots.length) {
				return helpers.error('custom.timeSlots', {
					message: 'All time slots must fall within the template date range'
				});
			}
		}
		return value;
	});

// Bulk time slot creation schema
const bulkTimeSlotSchema = Joi.object({
	slots: Joi.array()
		.items(Joi.object({
			date: Joi.date()
				.required()
				.messages({
					'date.base': 'Date must be a valid date',
					'any.required': 'Date is required'
				}),
			time_range_id: Joi.number()
				.integer()
				.required()
				.messages({
					'number.base': 'Time range ID must be an integer',
					'any.required': 'Time range ID is required'
				})
		}))
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one time slot is required',
			'array.base': 'Slots must be an array of time slot objects',
			'any.required': 'Slots array is required'
		})
})
	.custom((value, helpers) => {
		const { slots } = value;
		// Check for duplicate date/time_range combinations
		const seen = new Set();
		const duplicates = slots.filter((slot: TimeSlot) => {
			const key = `${slot.date}_${slot.time_range_id}`;
			return seen.size === seen.add(key).size;
		});

		if (duplicates.length) {
			return helpers.error('custom.duplicates', {
				message: 'Duplicate date and time range combinations are not allowed'
			});
		}
		return value;
	});

const memberPreferenceSchema = Joi.object<MemberPreferenceData>({
	id: Joi.number()
		.integer()
		.optional()
		.messages({
			'number.base': 'ID must be an integer'
		}),
	template_id: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Template ID must be an integer',
			'any.required': 'Template ID is required'
		}),
	user_id: Joi.number()
		.integer()
		.optional(), // User ID typically comes from authentication
	status: Joi.string()
		.valid('draft', 'submitted')
		.optional()
		.default('draft')
		.messages({
			'any.only': 'Status must be either draft or submitted'
		}),
	submitted_at: Joi.date()
		.optional()
		.messages({
			'date.base': 'Submitted date must be a valid date'
		}),
	notes: Joi.string()
		.allow(null)
		.optional()
		.max(1000)
		.messages({
			'string.max': 'Notes must not exceed 1000 characters'
		})
});

// Member Preference Slot Selection Schema
const memberPreferenceSelectionSchema = Joi.object({
	slots: Joi.array()
		.items(Joi.object<PreferenceSubmissionSlotData>({
			template_time_slot_id: Joi.number()
				.integer()
				.required()
				.messages({
					'number.base': 'Time slot ID must be an integer',
					'any.required': 'Time slot ID is required'
				}),
			preference_level: Joi.number()
				.integer()
				.min(1)
				.max(5)
				.required()
				.messages({
					'number.base': 'Preference level must be an integer',
					'number.min': 'Preference level must be between 1 and 5',
					'number.max': 'Preference level must be between 1 and 5',
					'any.required': 'Preference level is required'
				})
		}))
		.min(1)
		.messages({
			'array.min': 'At least one time slot selection is required'
		})
})
	.custom((value, helpers) => {
		// Check for duplicate time slot selections
		const slotIds = value.slots.map((slot: PreferenceSubmissionSlotData) => slot.template_time_slot_id);
		const uniqueSlotIds = new Set(slotIds);

		if (slotIds.length !== uniqueSlotIds.size) {
			return helpers.error('any.unique', {
				message: 'Duplicate time slot selections are not allowed'
			});
		}

		return value;
	});

export {
	preferenceTemplateSchema,
	timeRangeSchema,
	timeSlotSchema,
	bulkTimeSlotSchema,
	memberPreferenceSchema,
	memberPreferenceSelectionSchema
};
