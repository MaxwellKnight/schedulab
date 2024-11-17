import { useState, useCallback } from "react"
import { format } from "date-fns"
import axios from "axios"
import { useTeam } from "@/context"
import { DateRange } from "react-day-picker"
import { DailyPreference, PreferenceRange } from "@/components/preferences/types"

interface TemplateResponse {
	id: string;
}

interface TimeRangeResponse {
	range: PreferenceRange;
	id: number;
}

export const usePreferences = (
	timeRanges: DailyPreference[],
	range: DateRange | undefined,
	onSuccess?: () => void
) => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { selectedTeam } = useTeam()

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const handleSubmit = async () => {
		if (!range?.from || !range?.to) {
			setError('Please select a valid date range');
			return;
		}

		if (!selectedTeam?.id) {
			setError('No team selected');
			return;
		}

		setIsSubmitting(true);
		clearError();

		try {
			// 1. Create template
			const { data: templateData } = await axios.post<TemplateResponse>('/preferences', {
				name: `Preferences ${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`,
				team_id: selectedTeam.id,
				status: 'draft',
				start_date: format(range.from, 'yyyy-MM-dd'),
				end_date: format(range.to, 'yyyy-MM-dd')
			});

			if (!templateData.id) {
				throw new Error('Failed to create preference template - no ID returned');
			}

			// 2. Create unique time ranges
			const uniqueRanges = timeRanges
				.flatMap(day => day.ranges.map(range => ({
					start_time: range.start_time,
					end_time: range.end_time,
					preference_id: templateData.id
				})))
				.filter((range, index, self) =>
					index === self.findIndex(r =>
						r.start_time === range.start_time &&
						r.end_time === range.end_time
					)
				);

			const createdRanges: TimeRangeResponse[] = [];

			// Create time ranges sequentially
			for (const rangeData of uniqueRanges) {
				try {
					const { data: response } = await axios.post<TimeRangeResponse>(
						`/preferences/${templateData.id}/time-ranges`,
						rangeData
					);
					createdRanges.push(response);
				} catch (error) {
					if (axios.isAxiosError(error)) {
						console.error('Error creating time range:', error.response?.data || error.message);
						throw new Error(`Failed to create time range: ${error.response?.data?.message || error.message}`);
					}
					throw error;
				}
			}

			// 3. Create range ID map
			const rangeIdMap = new Map<string, number>();
			createdRanges.forEach(response => {
				const { range, id } = response;
				const key = `${range.start_time}-${range.end_time}`;
				rangeIdMap.set(key, id);
			});

			// 4. Create time slots
			const slots = timeRanges.flatMap(day =>
				day.ranges.map(range => {
					const key = `${range.start_time}-${range.end_time}`;
					const timeRangeId = rangeIdMap.get(key);
					if (!timeRangeId) {
						throw new Error(`Could not find time range ID for ${key}`);
					}
					return {
						date: format(day.column, 'yyyy-MM-dd'),
						time_range_id: timeRangeId
					};
				})
			);

			if (slots.length > 0) {
				try {
					await axios.post(`/preferences/${templateData.id}/time-slots/bulk`, { slots });
				} catch (error) {
					if (axios.isAxiosError(error)) {
						console.error('Error creating time slots:', error.response?.data || error.message);
						throw new Error(`Failed to create time slots: ${error.response?.data?.message || error.message}`);
					}
					throw error;
				}
			}

			setIsSuccess(true);
			onSuccess?.();
			setTimeout(() => setIsSuccess(false), 2000);
		} catch (err) {
			let errorMessage: string;
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || err.message;
			} else {
				errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while submitting preferences';
			}
			setError(errorMessage);
			console.error('Preferences submission error:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		isSubmitting,
		isSuccess,
		error,
		handleSubmit,
		clearError
	};
};
